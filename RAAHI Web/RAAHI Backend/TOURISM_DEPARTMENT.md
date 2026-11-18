# Tourism department workspace

New routes: /tourism-department (authenticated department staff) and /tourism-information?state=Goa (public published information). Department login opens the new workspace. Existing tourist and police pages, scoring and map behavior are unchanged.

The eight workspace sections provide overview metrics, destination CRUD, coarse crowd summaries, draft/publish/withdraw advisory workflows, manually logged tourist ratings and complaints with assignments/resolutions, case referral/response tracking, downloadable CSV analytics, and a provider verification directory. Use archived status for reversible record retirement; no destructive delete endpoint is provided.

Storage: tourismrecords collection. Existing department accounts supply their assigned state via location (full state or existing state alias). No accounts, passwords or sample records are created by this feature. All /api/tourism routes require tourist_department role; state comes from the authenticated account and cannot be supplied by clients. Records in other states return not found.

Publication: advisory publishing requires a checked source and verification flag. Approved providers require verification evidence. Only published verified unexpired advisories, approved verified services, and non-archived destination information appear in the public read endpoint. Internal cases, complaints, assignees and creator IDs are not included. There are no outgoing police/medical messages, notifications, or booking integrations.

Metrics: registrations are current travel plans, not observed visits. Jurisdiction matching uses exact canonical state names and a limited fixed list of city aliases (see utils/tourism.js); unmatched/ambiguous destinations are excluded. Staff-created destination names cannot widen jurisdiction. The registration summary reads at most 10000 records and discloses truncation. Crowd data is recent GPS for those state-assigned travel plans, grouped into 0.1-degree cells; cells with fewer than three users are hidden. Counts cover only app users and do not claim total footfall or inferred safety. No individual traveler details or raw GPS are returned to this workspace. Monthly charts use UTC registration months. No data produces empty states, not fabricated metrics.

Response time is measured from the time a case is logged to its first recorded referral/responding/resolved status. It does not measure independent police/medical arrival. CSV reports include aggregate trends and department record titles/statuses, with spreadsheet formula prefixes escaped. Record lists are paginated at 50 rows. Public sections return up to 100 records each. Report record rows are capped at 10000.

Tests: node --test tests/tourism.test.js tests/tourism-access.test.js
Frontend tests: node --test tests/departmentForm.test.mjs

Registered Tourists: GET /api/tourism/tourists reads current matching tourist profiles from MongoDB. State remains server-controlled. The department page refreshes the list and overview every 10 seconds, paginates at 50 records and supports name/ID/destination search. The response includes name, traveler ID, declared destination, duration and timestamps; no email, phone, health, identity-number or precise GPS fields are returned. Goa is entered during the existing post-signup profile step. Updating a destination automatically changes department membership; nothing is copied into a second collection.
