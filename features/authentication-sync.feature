Feature: Authentication and Cross-Device Sync
  As a user
  I want to sign in securely and access my goals from multiple devices
  So that I can track progress seamlessly wherever I am

  Background:
    Given the app is loaded and no user is logged in

  Scenario: Sign up with email and password
    When I click "Sign Up"
    And I enter the following credentials:
      | field    | value                     |
      | email    | newuser@example.com       |
      | password | SecurePass123!            |
      | confirm  | SecurePass123!            |
    And I accept the terms and conditions
    And I click "Create Account"
    Then I should be logged in as "newuser@example.com"
    And a welcome message should appear
    And I should be navigated to the goal creation screen

  Scenario: Sign in with email and password
    Given I have an account with email "user@example.com"
    When I click "Sign In"
    And I enter the following credentials:
      | field    | value           |
      | email    | user@example.com|
      | password | SecurePass123!  |
    And I click "Sign In"
    Then I should be logged in
    And my goals should be loaded and visible
    And I should see the dashboard

  Scenario: Sign in with Google
    Given I have an account linked to Google
    When I click "Sign in with Google"
    And I authenticate with my Google account
    Then I should be logged in
    And my goals should be loaded from Firebase
    And I should see the dashboard

  Scenario: Sign in with Apple
    Given I have an account linked to Apple ID
    When I click "Sign in with Apple"
    And I authenticate with my Apple ID
    Then I should be logged in
    And my goals should be loaded from Firebase
    And I should see the dashboard

  Scenario: Password reset flow
    Given I have an account with email "user@example.com"
    When I click "Forgot password?" on the sign-in page
    And I enter "user@example.com"
    And I click "Send reset email"
    Then I should see "Check your email for reset instructions"
    And a reset email should be sent to "user@example.com"
    And clicking the reset link should allow me to set a new password

  Scenario: Log out from the app
    Given I am logged in
    When I click the user menu and select "Log out"
    Then I should be logged out
    And I should be redirected to the sign-in page
    And local data should be cleared from the device

  Scenario: Data syncs automatically to Device B
    Given I am logged in on Device A with email "user@example.com"
    And I have created a goal "Read daily" on Device A
    When I log in on Device B with the same email
    Then the goal "Read daily" should be immediately visible on Device B
    And all metadata should be identical on both devices

  Scenario: Progress logged on Device A appears on Device B
    Given I am logged in on both Device A and Device B
    And the dashboard is open on both devices
    When I log 30 minutes on Device A for "Read daily"
    Then within 2 seconds, the progress should appear on Device B
    And the timestamp should be identical on both devices
    And the progress bar should update on Device B automatically

  Scenario: Offline on Device A, then sync when back online
    Given I am on Device A without internet connection
    And I log 20 minutes for "Read daily"
    And I add a note "finished chapter 5"
    Then the progress should be saved locally with "pending" sync status
    And when internet is restored
    Then the progress should sync to Firestore
    And the sync status should change to "synced"
    And Device B should receive the progress within 2 seconds

  Scenario: Handle network interruption gracefully
    Given I am on Device A with poor connectivity
    When I try to log progress
    Then the progress should be saved locally immediately (optimistic update)
    And a loading indicator should appear
    And once the connection improves, sync should attempt in background
    And if sync fails, I should see a "Retry" option

  Scenario: Edit on Device A while offline, then sync
    Given I am offline on Device A
    And I edit a goal title from "Read daily" to "Read 30 min daily"
    Then the change should be saved locally
    And when online again, the change should sync to Firestore
    And Device B should receive the updated goal name within 2 seconds

  Scenario: Conflict resolution when both devices edit simultaneously
    Given Device A and Device B both lose internet connection
    And on Device A I update a goal to "target: 40 minutes"
    And on Device B I update the same goal to "target: 50 minutes"
    When both devices come back online
    Then the last-write-wins rule applies (most recent timestamp wins)
    And both devices eventually show the same value
    And the losing change is logged in the audit trail for reference

  Scenario: Session persists across page reloads
    Given I am logged in and viewing my dashboard
    When I close the browser tab and reopen the app
    Then I should be automatically logged in
    And my dashboard should load with all goals visible
    And no re-authentication should be required

  Scenario: Cannot access authenticated pages without login
    Given I am not logged in
    When I try to navigate directly to "/dashboard"
    Then I should be redirected to the sign-in page
    And the dashboard should not load until I authenticate
