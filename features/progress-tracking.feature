Feature: Progress Tracking
  As a user
  I want to log and track progress toward my goals
  So that I can see how I'm performing against my daily, weekly, and monthly targets

  Background:
    Given I am logged in with email "user@example.com"
    And I have a goal "Read for 30 minutes" with frequency "daily" and targetValue 30

  Scenario: Log progress for a goal
    When I log 20 minutes of progress for the goal "Read for 30 minutes"
    Then the progress should be recorded with timestamp of today
    And the current period progress should show 20 out of 30 minutes
    And the progress bar should display 67% completion

  Scenario: Log multiple progress entries in same day
    When I log 15 minutes of progress in the morning
    And I log 15 minutes of progress in the evening
    Then total progress for today should be 30 minutes
    And the goal status should show "completed for today"
    And I should see a checkmark on today's date

  Scenario: View current period progress for daily goal
    Given I logged 20 minutes today
    When I view the dashboard
    Then the goal "Read for 30 minutes" should show:
      | metric       | value     |
      | current      | 20        |
      | target       | 30        |
      | percentage   | 67%       |
      | period       | Today     |
      | days until reset | 1    |

  Scenario: View yearly progress for daily goal
    Given I have logged progress for 50 days this year:
      | value |
      | 30    |
      | 25    |
      | 30    |
    When I view yearly summary for the goal
    Then yearly progress should show 1500 minutes accumulated
    And yearly progress percentage should be calculated as needed
    And the yearly progress should not reset on any periodic boundary

  Scenario: Weekly goal progress calculation
    Given I have a goal "Exercise 3 times" with frequency "weekly"
    And this week starts on Monday
    When I log exercise on Monday, Wednesday, and Friday
    Then current week progress should show 3 out of 3 completed
    And the goal status should show "completed for this week"

  Scenario: Weekly goal progress resets on new week
    Given I have a goal "Exercise 3 times" with frequency "weekly"
    And I completed the goal last week
    When a new week begins (Monday)
    Then current week progress should reset to 0 out of 3
    And previous week's progress should be retained in yearly total
    And yearly progress should include last week's entries

  Scenario: Monthly goal progress calculation
    Given I have a goal "Write 5000 words" with frequency "monthly"
    When I log 1000 words on the 5th, 1000 on the 10th, 1000 on the 15th
    Then current month progress should show 3000 out of 5000 words
    And the progress percentage should show 60%

  Scenario: Monthly goal progress resets on new month
    Given I have a goal "Write 5000 words" with frequency "monthly"
    And I completed it last month
    When the 1st of the new month arrives
    Then current month progress should reset to 0
    And previous month's progress should be retained in yearly total

  Scenario: Prevent logging negative progress
    When I try to log -5 minutes for "Read for 30 minutes"
    Then an error message should appear "Progress value must be positive"
    And the progress should not be recorded

  Scenario: View progress history for a goal
    Given I have logged progress for "Read for 30 minutes" on multiple days
    When I open the progress history view
    Then I should see a list of all progress entries sorted by date (newest first)
    And each entry should show: value, date, time, and any notes

  Scenario: Add note with progress entry
    When I log 25 minutes with the note "finished chapter 3"
    Then the progress entry should be saved with the note attached
    And the note should be visible when viewing the progress entry

  Scenario: View progress chart for trend analysis
    Given I have logged daily progress for the past 30 days
    When I view the progress chart
    Then I should see a line chart showing daily progress trend
    And the chart should show a 7-day moving average
    And I should see comparative statistics (avg, min, max for the period)

  Scenario: Progress persists across devices
    Given I log progress on Device A
    When I switch to Device B
    Then the progress should be immediately visible on Device B
    And the progress should show the same timestamp and values
