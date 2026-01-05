Feature: Retroactive Progress Logging
  As a user
  I want to add progress entries for past periods
  So that I can catch up on tracking goals I forgot to log during those periods

  Background:
    Given I am logged in with email "user@example.com"
    And I have a goal "Read for 30 minutes" with frequency "daily"

  Scenario: Log progress for a previous day
    Given today is January 10, 2026
    When I add 25 minutes of progress for January 8 at 14:30
    Then the progress should be recorded with the specified date and time
    And the progress should be attributed to January 8 in the yearly total
    And the progress should not affect today's current period progress

  Scenario: Log progress for multiple past days
    Given today is January 10, 2026
    When I log the following retroactive progress:
      | date       | value | time  |
      | 2026-01-07 | 30    | 18:00 |
      | 2026-01-08 | 25    | 19:00 |
      | 2026-01-09 | 20    | 20:00 |
    Then all three entries should be recorded with their respective dates
    And the yearly total should include all three entries
    And each day should show its own progress independently

  Scenario: Add retroactive progress for a weekly goal
    Given today is January 10, 2026
    And I have a goal "Exercise 3 times" with frequency "weekly"
    When I log a retroactive exercise session for January 5 at 16:00
    Then the progress should be attributed to the week of January 5-11
    And the weekly progress for that week should include this entry
    And the yearly total should be updated

  Scenario: Add retroactive progress for a monthly goal
    Given today is January 10, 2026
    And I have a goal "Write 5000 words" with frequency "monthly"
    When I log 1000 words retroactively for December 28 at 15:00
    Then the progress should be attributed to December 2025
    And the December monthly progress should be updated
    And the yearly 2025 total should be updated

  Scenario: Cannot log progress for future dates
    Given today is January 10, 2026
    When I try to log progress for January 11 at 10:00
    Then an error should appear "Cannot log progress for future dates"
    And the progress should not be recorded

  Scenario: Cannot log progress after goal completion date
    Given I have a goal "Complete project" with completedDate of January 5, 2026
    When I try to log progress for January 6
    Then an error should appear "Cannot log progress after goal completion date"
    And the progress should not be recorded

  Scenario: Retroactive entry appears in progress history with indicator
    Given I add retroactive progress for January 8
    When I view the progress history
    Then the entry should show the actual occurrence date (January 8)
    And the entry should show a "retroactive" or "backdated" indicator
    And the logged timestamp should show when I actually recorded it

  Scenario: Edit retroactive progress entry
    Given I have logged retroactive progress for January 8
    When I edit the entry and change the value to 35 minutes
    Then the updated value should replace the previous entry
    And the edit timestamp should be recorded
    And the yearly progress should reflect the new value

  Scenario: Delete retroactive progress entry
    Given I have logged retroactive progress for January 8
    When I delete this retroactive entry
    Then the entry should be removed from the progress history
    And the yearly total should be recalculated without this entry
    And the deletion should be recorded in the audit log

  Scenario: Batch import multiple retroactive entries
    Given I have a spreadsheet with 10 days of past progress data
    When I import the spreadsheet with the following columns: date, value, note
    Then all 10 entries should be imported and recorded
    And each entry should have its respective date and note
    And the yearly progress should be updated to include all imports
    And I should see a confirmation showing "10 entries imported"

  Scenario: Retroactive progress respects goal frequency
    Given I have a goal "Read for 30 minutes" with frequency "daily"
    When I try to log 60 minutes for a single day retroactively
    Then the system should accept the value (no artificial daily limit)
    And the value should be recorded as-is for that day
    And the progress should contribute to yearly total

  Scenario: Fill gaps in progress history
    Given I logged progress for Jan 1 and Jan 3 but missed Jan 2
    When I navigate to Jan 2 in the calendar view
    Then I should see an option to "add progress for this date"
    And clicking it should open the retroactive entry form pre-filled with Jan 2
    And I can enter the progress value and save

  Scenario: Retroactive entries sync across devices
    Given I add retroactive progress for January 8 on Device A
    When I log in on Device B
    Then the retroactive entry should be visible on Device B
    And the timestamp should be consistent
    And the yearly progress should reflect the entry on both devices
