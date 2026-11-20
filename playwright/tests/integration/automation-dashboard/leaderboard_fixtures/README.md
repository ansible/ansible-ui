An AAP 2.7-next instance was filled with data (users, jobs etc).
Then automation dashboard sync was run.
This directory contains recorded API responses from

- /api/metrics/v1/dashboard_reports/leaderboard/
- /api/metrics/v1/dashboard_reports/collection_status/

Responses were recorded for every user on that instance, but only the two
`leaderboards.spec.ts` reads are kept here:

- **alice** — the spec's main fixture. Exercises every region with data: a #1
  ranked organization, an active streak on both the enterprise and
  organization strips, a top-10 placing in one activity level but not the
  others, and a mix of earned and locked achievements. Its
  `collection_status` has `show_dashboard: false`, so the page renders the
  leaderboards as a single untabbed view.
- **admin** — used only to reach the view through the Leaderboards tab. It is
  the one recording with `show_dashboard: true`, which is what makes the page
  render tabs at all.

Add a user here only together with the test that reads it; an unused fixture
drifts out of sync with the API schema without anything failing.
