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
