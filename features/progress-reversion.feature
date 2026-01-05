Feature: Progress Reversion
  As a user
  I want to revert accidentally added progress
  So that I can correct mistakes without data loss

  Background:
    Given I am logged in with email "user@example.com"
    And I have a goal "Read for 30 minutes" with frequency "daily"

  Scenario: Revert the most recent progress entry
    Given I logged 20 minutes today
    And I then logged 10 minutes a few minutes later
    When I click "Revert" on the most recent entry (10 minutes)
    Then the entry should be marked as reverted
    And the current period progress should show only 20 minutes
    And a note should appear "10 minutes entry reverted at HH:MM"

  Scenario: Reverted entry remains in history for audit
    Given I logged 30 minutes and then reverted it
    When I view the complete progress history
    Then the reverted entry should appear with a "reverted" or "crossed out" indicator
    And the original timestamp should be visible
    And the revert timestamp should be shown
    And the entry should not contribute to progress calculations

  Scenario: Cannot revert an entry from a previous period
    Given I logged progress yesterday for "Read for 30 minutes"
    When I try to revert yesterday's entry
    Then a warning message should appear: "Cannot revert entries from previous periods"
    And the revert should not be allowed
    And I should be offered the option to "Add offsetting progress" instead

  Scenario: Revert with offsetting progress
    Given I logged 30 minutes but it was a mistake
    When I click "Add offsetting entry" instead of direct revert
    Then I should be prompted to enter the offsetting amount
    And I enter -30 to negate the previous entry
    Then current progress should show 0 minutes
    And both the original and offsetting entries should be visible in history

  Scenario: View complete revert history
    Given I have made 5 progress entries and reverted 2 of them
    When I view the progress audit trail
    Then I should see all 7 entries (5 original + 2 reversions)
    And each reversion should link to the original entry it reverted
    And the audit trail should show the chronological order of operations

  Scenario: Undo a revert (restore reverted entry)
    Given I reverted a 30-minute entry earlier today
    When I click "Undo revert" on that entry
    Then the reverted entry should be restored and active again
    And the current period progress should include it again
    And an "undone" note should be added to the entry

  Scenario: Cannot revert progress from a synced previous day
    Given I logged progress yesterday
    And yesterday's progress has been synced to Firestore
    When I try to revert yesterday's entry
    Then the system should show "Cannot revert synced entries from previous periods"
    And the option should be to add an offsetting entry instead

  Scenario: Revert handles device sync conflicts
    Given I logged 20 minutes on Device A
    And I logged 15 minutes on Device B before the first entry synced
    When I revert the 15-minute entry on Device B
    Then both changes should sync to Firestore
    And the final progress should be 20 minutes (only the reverted entry removed)
    And both devices should show consistent data after sync

  Scenario: Bulk revert recent entries
    Given I logged progress 5 times in the current period
    When I select multiple entries and click "Revert selected"
    Then all selected entries should be reverted
    And the current period progress should be recalculated
    And a summary should show "5 entries reverted"

  Scenario: Edit instead of revert
    Given I logged 20 minutes but meant to log 25 minutes
    When I click "Edit" on the entry
    Then I should be able to modify the value to 25
    And this should be a direct edit, not a revert + new entry
    And the edited entry should show an "edited" indicator with the edit timestamp
    And the audit log should show this as a single edit operation

  Scenario: Revert notifies user of impact on metrics
    Given I have completion stats for the week
    When I revert an entry that would affect completion status
    Then a notification should appear showing the impact
    And it should say something like: "This revert will reduce weekly progress to 2/3 (was 3/3)"
    And I should confirm the revert with this knowledge

  Scenario: Cannot revert entries after time limit
    Given I logged progress 30 days ago
    When I try to revert that entry
    Then the system should show "Revert window expired (30-day limit)"
    And the option should be to add an offsetting entry instead
    And the revert option should be disabled

  Scenario: Revert is logged in audit trail
    Given I revert a progress entry
    When I view the full audit log
    Then the revert should appear as an event with:
      | field        | value                    |
      | action       | revert                   |
      | targetId     | [original entry id]      |
      | performedAt  | [revert timestamp]       |
      | performedBy  | [current user id]        |
      | deviceId     | [current device id]      |
