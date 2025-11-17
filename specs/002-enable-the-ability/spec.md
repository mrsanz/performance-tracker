# Feature Specification: [FEATURE NAME]
# Feature Specification: Individual Performance Review: Weekly Likert Scores, Summaries, and PR Activity Metrics

**Feature Branch**: `002-enable-the-ability`  
**Created**: 2025-10-27  
**Status**: Draft  
**Input**: User description: "Enable the ability to review an individual over a period of time.  This means that managers would have the abliity to add a likert score with a dimesnion label (e.g. architecure, design etc...)   and provide a weekly summary for reviewing direct reports.   Finally there shuold be the ability to pull a basic set of metrics around pull requests - frequency - length they stay open, contributions to other pull requests (reviews/comments), stalled pull requests (open for more than 2 sprints).  In general this is about providing enough inputs to get a general performance sense for an indivdiual contributor."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record a weekly review for a direct report (Priority: P1)

A manager selects a direct report and records the week’s review by adding one or more Likert scores, each tagged with a dimension label (e.g., Architecture, Design), and writes a short weekly summary.

Why this priority: This is the core value—capturing a structured pulse on an individual each week enables trend analysis and actionable conversations.

Independent Test: Can be fully tested by completing a weekly review for one report and verifying it’s visible in that person’s timeline without configuring any integrations.

Acceptance Scenarios:

1. Given a manager has at least one direct report, When the manager selects a specific week and submits a set of dimension-tagged Likert scores with a summary, Then the system saves the entry and shows it in the person’s weekly timeline.
2. Given a saved weekly review, When the manager re-opens it within the allowed edit window, Then the manager can update scores and summary and the system records who changed what and when.

---

### User Story 2 - Review trends and insights over a selected period (Priority: P2)

A manager views a single person’s performance over a chosen period (e.g., last 12 weeks), seeing trends per dimension and a roll-up, alongside basic code contribution metrics.

Why this priority: Managers need longitudinal signal to guide coaching, performance check-ins, and calibration.

Independent Test: Can be tested by selecting a time window and verifying charts/tables correctly reflect the saved weekly entries and PR metrics for that period.

Acceptance Scenarios:

1. Given at least four weeks of saved reviews, When the manager selects a 4–12 week window, Then the system displays trends per dimension and overall, with the weekly summaries accessible for that window.
2. Given PR activity exists for the person in the selected period, When viewing insights, Then the system displays: number of PRs opened, typical time PRs remain open (median/average), number of reviews/comments on others’ PRs, and count of stalled PRs as defined.

---

### User Story 3 - Identify stalled and low-signal periods quickly (Priority: P3)

A manager scans a person’s timeline to spot weeks with missing reviews, low activity, or stalled PRs to prompt follow-ups.

Why this priority: Early detection of gaps or blockers supports timely intervention and better outcomes.

Independent Test: Can be tested by creating a period with missing reviews and a stalled PR and verifying the UI flags both conditions.

Acceptance Scenarios:

1. Given the selected period includes weeks without a recorded review, When the manager views the timeline, Then missing weeks are clearly indicated with prompts to backfill.
2. Given at least one PR has been open longer than the stalled threshold, When the manager views the metrics, Then the PR appears in the stalled count with clear definition/tooltip of the threshold.

---

### Edge Cases

- No PR activity exists for the selected period → metrics area shows “No activity” and definitions remain visible.
- Weeks without a review → visually indicated; period aggregates exclude missing weeks but show the count of missing entries.
- Multiple managers share the same report → only the report’s current manager(s) can add/edit weekly entries; others have read-only access.
- Person on leave for an extended period → missing weeks can be marked as “not applicable” and excluded from averages.
- Very long periods (e.g., > 26 weeks) → summaries and charts remain readable; provide pagination/zoom and period presets.

## Requirements *(mandatory)*

### Functional Requirements

- FR-001: The system MUST allow a manager to select a direct report and week and submit one or more Likert scores, each tagged with a dimension label (e.g., Architecture, Design), plus a free-text weekly summary.
- FR-002: The Likert scale MUST be an integer 1–5 where 1 = Needs Improvement and 5 = Exceptional; dimension labels are displayed alongside scores in timelines and trends.
- FR-003: The weekly summary MUST support free text up to 1,000 characters and preserve line breaks for readability.
- FR-004: The system MUST allow selecting a period (start/end or preset like last 4, 8, 12 weeks) and display trends per dimension and an overall roll-up.
- FR-005: For a selected person and period, the system MUST display PR activity metrics: total PRs opened, typical time PRs remain open (median and average), total reviews submitted, total comments on others’ PRs, and count of stalled PRs.
- FR-006: “Stalled PR” MUST be defined as a PR open longer than two sprints; the default sprint length is assumed to be 14 days (stalled = open > 28 days). Assumption may be overridden by organization configuration.
- FR-007: Only a person’s current manager(s) MUST be able to create or edit weekly reviews for that person; edits MUST be allowed for 7 days after submission, after which entries become read-only.
- FR-008: The system MUST record who created and edited weekly reviews and when, including before/after values for scores and summary.
- FR-009: The set of available dimension labels MUST be managed via [NEEDS CLARIFICATION: Are labels global (org-wide), team-specific, or manager-defined?]; managers MUST be able to pick from the approved set when scoring.
- FR-010: The period insights view MUST present both a graphical trend and a tabular summary and include tooltips that define each metric in plain language.
- FR-011: The system MUST ensure data privacy so that individual contributors cannot view other individuals’ reviews; [NEEDS CLARIFICATION: Can individuals view their own weekly scores and manager summaries?]
- FR-012: When PR data for a person or period is unavailable, the system MUST clearly indicate “Data unavailable” and continue to show review data without error.
- FR-013: The system SHOULD allow managers to copy a formatted period summary to the clipboard for sharing in 1:1s or performance docs.
- FR-014: The default period preset MUST be “Last 4 weeks,” with quick selections for 8 and 12 weeks.
- FR-015: The system MUST display definitions for “stalled PR,” “review,” and “comment” metrics via inline help.

### Key Entities *(include if feature involves data)*

- Person: An individual contributor subject to reviews and whose PR activity is measured.
- ManagerRelationship: Association indicating current manager(s) for a person.
- WeeklyReview: A weekly entry containing one or more Likert scores and a free-text summary for a person.
- LikertScore: A dimension-labeled, integer score (1–5) for a given week and person.
- DimensionLabel: The catalog of allowed dimension names used when scoring (governance model TBD).
- PRAggregates: Aggregated PR metrics for a person over a selected period (counts, durations, stalled count).

### Assumptions

- Sprint length defaults to 14 days; “two sprints” = 28 days for stalled PRs.
- Likert scale uses 1–5 with labels as defined in FR-002.
- Managers can edit weekly reviews for 7 days after submission; past-period backfilling is allowed but audited.
- PR metrics come from the organization’s primary code hosting platform; exact provider(s) to be clarified during planning.
- This feature is for individual-level insights, not team or org rollups; team views may be considered separately.

### Out of Scope

- Compensation, ratings calibration, or formal performance ratings workflows.
- 360° feedback collection from peers (beyond counting reviews/comments on PRs).
- Cross-person comparisons or ranking lists.
- Automated scoring/labeling beyond manager-entered Likert scores.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- SC-001: Managers can record a weekly review (scores + summary) for one report in under 2 minutes (median) after initial setup.
- SC-002: 90% of active direct reports have at least 3 of the last 4 weeks reviewed within 6 weeks of feature launch.
- SC-003: For a 12-week window, trends and metrics render instantly from a user perspective for 95% of cases (perceived load under 1 second).
- SC-004: PR activity metrics displayed for a 30-day window match source-of-truth counts within 95% accuracy when spot-checked.
- SC-005: At least 80% of PRs flagged as stalled receive a documented follow-up action within 7 days, as reflected in manager notes.
- SC-006: Manager satisfaction with the feature’s usefulness averages ≥ 4.0/5.0 in post-rollout survey.
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
