Feature: Goal Management
  As a user
  I want to create, view, edit, and delete goals
  So that I can track progress on things that matter to me

  Background:
    Given I am logged in with email "user@example.com"
    And I have no existing goals

  Scenario: Create a new daily goal
    When I create a goal with the following details:
      | field       | value                           |
      | title       | Read for 30 minutes             |
      | description | Build reading habit             |
      | frequency   | daily                           |
      | targetValue | 30                              |
      | unit        | minutes                         |
      | category    | personal-growth                 |
      | priority    | high                            |
    Then the goal "Read for 30 minutes" should be saved in my goals list
    And the goal should have status "active"
    And the goal should be visible on the dashboard

  Scenario: Create a weekly goal
    When I create a goal with the following details:
      | field       | value                    |
      | title       | Exercise 3 times        |
      | frequency   | weekly                   |
      | targetValue | 3                        |
      | unit        | sessions                 |
      | category    | health                   |
    Then the goal "Exercise 3 times" should be saved
    And weekly progress should reset every Monday

  Scenario: Create a monthly goal
    When I create a goal with the following details:
      | field       | value                    |
      | title       | Write 5000 words         |
      | frequency   | monthly                  |
      | targetValue | 5000                     |
      | unit        | words                    |
      | category    | creative                 |
    Then the goal "Write 5000 words" should be saved
    And monthly progress should reset on the 1st of each month

  Scenario: View all active goals
    Given I have created the following goals:
      | title                  | frequency | status |
      | Read for 30 minutes    | daily     | active |
      | Exercise 3 times       | weekly    | active |
      | Meditate daily         | daily     | active |
    When I navigate to the goals dashboard
    Then I should see 3 active goals listed
    And each goal should display its title, frequency, and target value
    And I should see current period progress for each goal

  Scenario: Edit an existing goal
    Given I have created a goal "Learn Spanish" with targetValue 30 minutes daily
    When I edit the goal with the following changes:
      | field       | newValue              |
      | title       | Learn Spanish Advanced |
      | targetValue | 60                    |
    Then the goal should be updated to reflect the new values
    And the updated goal should persist across page reloads
    And existing progress entries should remain associated with the goal

  Scenario: Archive a goal
    Given I have created a goal "Read for 30 minutes" with status "active"
    When I archive the goal
    Then the goal status should change to "archived"
    And the goal should not appear in my active goals list
    And the goal should be accessible in the archived section

  Scenario: Reactivate an archived goal
    Given I have an archived goal "Read for 30 minutes"
    When I reactivate the goal
    Then the goal status should change back to "active"
    And the goal should appear in my active goals list again
    And previous progress history should be preserved

  Scenario: Delete a goal
    Given I have created a goal "Temporary Goal"
    When I delete the goal with confirmation
    Then the goal should be removed from my goals list
    And I should be prompted to confirm the deletion
    And all associated progress entries should be deleted

  Scenario: Goal creation fails with missing required fields
    When I try to create a goal without a title
    Then I should see an error message "Goal title is required"
    And the goal should not be saved

  Scenario: Goal persists across device sessions
    Given I have created a goal "Read for 30 minutes" on Device A
    When I log in on Device B with the same account
    Then the goal "Read for 30 minutes" should be visible on Device B
    And any progress logged on Device A should be reflected on Device B

  Scenario: Set yearly target for a goal
    Given I have a goal "Read books" with frequency "daily"
    When I set a custom yearly target of 500 pages
    Then the goal should calculate yearly progress against 500 pages
    And the yearly progress should not reset monthly or weekly
    And the current period should still show daily progress
