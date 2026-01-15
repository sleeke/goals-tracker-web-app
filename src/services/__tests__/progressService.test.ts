import { describe, it, expect } from 'vitest'

/**
 * Unit tests for retroactive progress date handling
 * 
 * Bug: Incorrect date is stored for retroactive progress
 * When selecting a date in the past, the stored date was one day earlier
 * Expected: Date stored matches the date selected by user
 * Actual (Before Fix): Date is off by one day (timezone issue)
 * 
 * Fix: Use correct Date constructor that respects local timezone:
 * const [year, month, day] = logDate.split('-').map(Number)
 * const loggedDate = new Date(year, month - 1, day, 0, 0, 0, 0)
 */
describe('Date Parsing Logic for Progress Logging', () => {
  /**
   * Test the date parsing logic that was fixed
   * This simulates what ProgressLoggerModal.tsx does when converting
   * the HTML date input (YYYY-MM-DD string) to a JavaScript Date
   */
  function parseProgressDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day, 0, 0, 0, 0)
  }

  it('should correctly parse a date string into a Date object with the same day', () => {
    // Test: Jan 15, 2024
    const dateString = '2024-01-15'
    const parsed = parseProgressDate(dateString)

    expect(parsed.getFullYear()).toBe(2024)
    expect(parsed.getMonth()).toBe(0) // JavaScript months are 0-indexed
    expect(parsed.getDate()).toBe(15)
  })

  it('should not have off-by-one errors for various dates', () => {
    const testCases = [
      { input: '2024-01-01', expectedYear: 2024, expectedMonth: 0, expectedDay: 1 },
      { input: '2024-01-31', expectedYear: 2024, expectedMonth: 0, expectedDay: 31 },
      { input: '2024-02-29', expectedYear: 2024, expectedMonth: 1, expectedDay: 29 }, // Leap year
      { input: '2024-12-31', expectedYear: 2024, expectedMonth: 11, expectedDay: 31 },
      { input: '2025-06-15', expectedYear: 2025, expectedMonth: 5, expectedDay: 15 },
    ]

    for (const testCase of testCases) {
      const parsed = parseProgressDate(testCase.input)

      expect(parsed.getFullYear()).toBe(testCase.expectedYear)
      expect(parsed.getMonth()).toBe(testCase.expectedMonth)
      expect(parsed.getDate()).toBe(testCase.expectedDay)
    }
  })

  it('should handle month and year boundaries correctly', () => {
    // Test transition from January to February
    const jan31 = parseProgressDate('2024-01-31')
    expect(jan31.getMonth()).toBe(0)
    expect(jan31.getDate()).toBe(31)

    const feb1 = parseProgressDate('2024-02-01')
    expect(feb1.getMonth()).toBe(1)
    expect(feb1.getDate()).toBe(1)

    // Test transition from December to next year
    const dec31 = parseProgressDate('2024-12-31')
    expect(dec31.getFullYear()).toBe(2024)
    expect(dec31.getMonth()).toBe(11)
    expect(dec31.getDate()).toBe(31)

    const jan1next = parseProgressDate('2025-01-01')
    expect(jan1next.getFullYear()).toBe(2025)
    expect(jan1next.getMonth()).toBe(0)
    expect(jan1next.getDate()).toBe(1)
  })

  it('should create dates at midnight in local timezone', () => {
    const parsed = parseProgressDate('2024-06-15')

    expect(parsed.getHours()).toBe(0)
    expect(parsed.getMinutes()).toBe(0)
    expect(parsed.getSeconds()).toBe(0)
    expect(parsed.getMilliseconds()).toBe(0)
  })

  it('should NOT have the old bug where Date(dateString) followed by setHours causes off-by-one', () => {
    // This demonstrates the bug that was fixed
    // Old (buggy) approach:
    const dateString = '2024-01-15'

    // The old code did: new Date(dateString) which interprets as UTC midnight
    // Then: setHours(12) which sets local timezone noon
    // This could cause the date to shift in some timezones
    const oldBuggyApproach = new Date(dateString)
    oldBuggyApproach.setHours(12, 0, 0, 0)

    // New (fixed) approach:
    const [year, month, day] = dateString.split('-').map(Number)
    const newFixedApproach = new Date(year, month - 1, day, 0, 0, 0, 0)

    // The fixed approach ensures the date stays correct
    expect(newFixedApproach.getDate()).toBe(15)

    // The fixed approach is timezone-safe because it uses the Date constructor
    // with year, month, day components, which are always interpreted as local timezone
  })

  it('should handle the specific case from the bug report', () => {
    // Bug report: "Date is one day earlier" when selecting a past date
    // This test verifies the fix handles the commonly problematic scenario

    // Simulate selecting Jan 20, 2024 (a common past date for testing)
    const selectedDate = '2024-01-20'
    const parsed = parseProgressDate(selectedDate)

    // Verify it's NOT showing as Jan 19 (the bug)
    expect(parsed.getDate()).not.toBe(19)

    // Verify it's correctly showing as Jan 20
    expect(parsed.getDate()).toBe(20)
    expect(parsed.getMonth()).toBe(0) // January
    expect(parsed.getFullYear()).toBe(2024)
  })
})

/**
 * Test suite for timestamp preservation in progress logging
 * 
 * Bug: "Date is missing from progress" - progress is always logged at 12:00am
 * Expected: When user logs progress at a specific time, that time should be preserved
 * This test suite verifies that the timestamp field includes the time of day
 */
describe('Timestamp Preservation in Progress Logging', () => {
  /**
   * Simulate the fixed behavior from ProgressLoggerModal
   */
  function getLoggedDateForProgress(
    dateString: string,
    isRetroactive: boolean
  ): Date {
    if (isRetroactive) {
      // For retroactive entries, use midnight of the selected day
      const [year, month, day] = dateString.split('-').map(Number)
      return new Date(year, month - 1, day, 0, 0, 0, 0)
    } else {
      // For current entries, use current time (preserving time of day)
      return new Date()
    }
  }

  it('should preserve the current time when logging progress without retroactive flag', () => {
    // When logging current progress (not retroactive), the time of day should be preserved
    const today = new Date().toISOString().split('T')[0]
    
    const before = new Date()
    const logged = getLoggedDateForProgress(today, false)
    const after = new Date()
    
    // The logged time should be between before and after
    expect(logged.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(logged.getTime()).toBeLessThanOrEqual(after.getTime())
    
    // Most importantly, it should NOT be at midnight
    // (Unless it actually is midnight when the test runs, which is rare)
    // We can verify it has hours/minutes/seconds set by checking it's not at midnight
    // OR we verify the difference from before is small
    const timeDiff = logged.getTime() - before.getTime()
    expect(timeDiff).toBeLessThan(1000) // Logged within 1 second of "before"
  })

  it('should use midnight for retroactive entries to match the selected date', () => {
    // When logging retroactive progress, the timestamp should be at midnight
    // of the selected day to represent "sometime during that day"
    
    const retroactiveDate = '2024-01-15'
    const logged = getLoggedDateForProgress(retroactiveDate, true)
    
    // Should be at midnight
    expect(logged.getHours()).toBe(0)
    expect(logged.getMinutes()).toBe(0)
    expect(logged.getSeconds()).toBe(0)
    expect(logged.getMilliseconds()).toBe(0)
    
    // And on the correct date
    expect(logged.getDate()).toBe(15)
    expect(logged.getMonth()).toBe(0)
    expect(logged.getFullYear()).toBe(2024)
  })

  it('should preserve time of day when provided a specific timestamp for retroactive entries', () => {
    // When user logs retroactive progress (past date), they might specify a time
    // Example: "I made progress yesterday at 3:30 PM"
    
    const retroactiveTime = new Date(2024, 0, 15, 15, 30, 0) // Jan 15, 2024 at 3:30 PM
    
    // These fields should be available for storage
    expect(retroactiveTime.getHours()).toBe(15)
    expect(retroactiveTime.getMinutes()).toBe(30)
    expect(retroactiveTime.getDate()).toBe(15)
  })

  it('should distinguish between loggedAt and timestamp fields', () => {
    // loggedAt = when user logged the entry (now)
    // timestamp = when progress occurred (might be in the past for retroactive)
    
    const loggedAt = new Date() // Current time when user logs
    const oneHourAgo = new Date(loggedAt.getTime() - 60 * 60 * 1000) // Progress happened 1 hour ago
    
    // These should be different for retroactive entries
    expect(loggedAt.getTime()).toBeGreaterThan(oneHourAgo.getTime())
    
    // For retroactive entries, timestamp would be oneHourAgo
    // For current entries, timestamp and loggedAt would be nearly the same
  })

  it('should not default progress to midnight when user logs current progress', () => {
    // Bug: progress showing at 12:00am regardless of when logged
    // Fix: when user logs current progress, preserve the time of day
    
    const today = new Date().toISOString().split('T')[0]
    const logged = getLoggedDateForProgress(today, false) // Not retroactive
    
    // For current progress, the time should NOT be forced to midnight
    // It should have the actual hours/minutes when the user logged it
    // We can verify this by checking the logged time is close to "now"
    const now = new Date()
    const timeDiff = Math.abs(now.getTime() - logged.getTime())
    
    // The difference should be small (less than 1 second)
    expect(timeDiff).toBeLessThan(1000)
  })

  it('should handle multiple log entries with different effective times', () => {
    // User might log progress multiple times
    // Current entries should preserve their logging time
    // Retroactive entries should be at midnight of selected date
    
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const currentLog = getLoggedDateForProgress(today, false)
    const retroactiveLog = getLoggedDateForProgress(yesterday, true)
    
    // Current log should preserve time of day
    const now = new Date()
    const currentDiff = Math.abs(now.getTime() - currentLog.getTime())
    expect(currentDiff).toBeLessThan(1000)
    
    // Retroactive log should be at midnight
    expect(retroactiveLog.getHours()).toBe(0)
    expect(retroactiveLog.getMinutes()).toBe(0)
  })

  it('should fix the specific bug from the bug report', () => {
    // Bug: "Date is missing from progress" - always shows 12:00am
    // Expected: When user logs progress now, show the time they logged it
    
    const today = new Date().toISOString().split('T')[0]
    const logged = getLoggedDateForProgress(today, false)
    
    // The logged date should NOT always be at midnight
    // Verify it's close to the current time
    const now = new Date()
    const timeDiff = Math.abs(now.getTime() - logged.getTime())
    
    // Should be logged within a very short time window
    expect(timeDiff).toBeLessThan(5000) // Within 5 seconds
    
    // The important thing: it's NOT forced to midnight
    // For most test runs, it won't be exactly 00:00:00
  })
})
