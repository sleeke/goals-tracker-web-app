Feature: Reporting and Analytics
  As a user
  I want to view detailed reports and analytics about my goal progress
  So that I can understand my performance and identify patterns

  Background:
    Given I am logged in with email "user@example.com"
    And I have been tracking goals for at least 30 days

  Scenario: View year-to-date dashboard
    Given it is January 10, 2026
    When I navigate to the main dashboard
    Then I should see a summary card for each of my goals showing:
      | metric              | example      |
      | Goal title          | Read daily   |
      | Current period prog | 20/30 min    |
      | Yearly progress     | 280/10950 min|
      | Year completion %   | 2.5%         |
      | Current streak      | 5 days       |

  Scenario: View weekly summary
    Given today is Sunday, January 10, 2026
    When I view the weekly summary for the week of Jan 5-11
    Then I should see a summary for each goal showing:
      | metric         | description                |
      | goal title     | Exercise                   |
      | weekly target  | 3 sessions                 |
      | weekly actual  | 2 sessions                 |
      | completion %   | 67%                        |
      | days completed | Mon, Wed                   |

  Scenario: View monthly summary
    Given today is January 10, 2026
    When I view the monthly summary for January 2026
    Then I should see:
      | metric             | description           |
      | goals tracked      | 5                     |
      | goals completed    | 2 (40%)               |
      | average completion | 60%                   |
      | most consistent    | Read for 30 minutes   |
      | least consistent   | Learn Spanish         |

  Scenario: View progress trends over time
    Given I have 90 days of progress data
    When I view the trends report with a 90-day window
    Then I should see a line chart for each goal showing:
      | data        | description                    |
      | daily prog  | Line chart of daily entries    |
      | 7-day avg   | Smoothed trend line            |
      | streak info | Current streak length          |

  Scenario: View streak tracking
    Given I have been consistently logging "Read for 30 minutes" daily
    When I view the goal detail page
    Then I should see a streak counter showing "14 days in a row"
    And I should see a visual calendar indicator of which days I completed it
    And I should see the longest streak recorded (e.g., "45 days")

  Scenario: Filter goals by category
    Given I have goals in categories: health, productivity, personal-growth, finance
    When I click "Filter by category: Health"
    Then I should see only the health-related goals
    And the dashboard should recalculate showing only those goals' statistics
    And I should see a "Clear filter" option

  Scenario: Compare goal progress
    Given I have multiple daily goals (Read, Exercise, Meditate)
    When I select "Compare goals"
    Then I should see a side-by-side table showing:
      | metric     | Read  | Exercise | Meditate |
      | This week  | 5/7   | 3/7      | 7/7      |
      | This month | 20/31 | 12/31    | 30/31    |
      | This year  | 280/  | 120/     | 310/     |
      | Streak     | 2 days| 1 day    | 14 days  |

  Scenario: Export progress as CSV
    Given I have 3 months of progress data
    When I click "Export as CSV"
    Then a file should be downloaded containing:
      | columns              |
      | date                 |
      | goal_title           |
      | goal_frequency       |
      | progress_value       |
      | progress_note        |
      | is_retroactive       |
      | logged_timestamp     |

  Scenario: Export progress as PDF report
    Given I have 3 months of progress data
    When I click "Export as PDF"
    Then a PDF file should be generated containing:
      | section              |
      | Summary stats        |
      | Monthly breakdown    |
      | Goal-by-goal detail  |
      | Charts and trends    |
      | Metadata (date, user)|

  Scenario: View annual review
    Given it is January 1, 2027 and I've been tracking for a full year
    When I view "2026 Annual Review"
    Then I should see:
      | section              | example                           |
      | Total goals created  | 12                                |
      | Total completed      | 8 (67%)                           |
      | Most completed goal  | Read for 30 minutes (364/365)     |
      | Longest streak       | 45 days (Exercise, July 2026)     |
      | Average completion   | 68%                               |
      | Top category         | Health (3 goals, 78% avg)         |

  Scenario: View goal insights
    Given I have 30+ days of data for a goal
    When I view the goal's detail page with insights enabled
    Then I should see AI-generated insights like:
      | insight                                |
      | Best day of week: Wednesday (85%)      |
      | Average session: 32 minutes            |
      | Worst performing time: 3-4pm (40%)     |
      | Trend: Slightly improving (+2% week)   |

  Scenario: Export data in JSON format
    Given I want to backup my complete data
    When I click "Export as JSON"
    Then a JSON file should be downloaded containing:
      | data structure         |
      | All goals              |
      | Complete progress hist |
      | All audit logs         |
      | User settings          |
      | Export timestamp       |

  Scenario: Print weekly summary
    Given I'm viewing the weekly summary for Jan 5-11
    When I click "Print"
    Then a printer-friendly version should open
    And the summary should be formatted for A4/Letter paper
    And charts should be rendered in grayscale
    And all data should be visible without scrolling across pages

  Scenario: View historical year comparison
    Given I have tracked goals for 2 full years
    When I view the "Year-over-year comparison"
    Then I should see:
      | metric             | 2025 | 2026 |
      | Goals created      | 8    | 12   |
      | Goals completed    | 5    | 8    |
      | Avg completion %   | 65%  | 68%  |
      | Total progress log | 1240 | 1850 |
