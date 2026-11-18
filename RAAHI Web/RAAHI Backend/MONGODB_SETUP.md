# MongoDB storage

The ignored backend .env holds MONGODB_URI and JWT_SECRET. Never commit it. The configured database is raahi.

Accounts, hashed passwords, traveler profiles and latest GPS positions are stored in the users collection. Authenticated police/admin/department roles can read the traveler list and latest positions; travelers can update only their own GPS position. Public unauthenticated requests cannot read personal traveler records. Only masked Aadhaar numbers are returned by the API. Aadhaar format acceptance is not official identity verification.

Frontend local account fallback, plaintext-password caching and browser-local traveler/GPS ledgers are removed. Only the bearer session token is held in sessionStorage. Other non-data preferences such as theme are unchanged. Previously browser-only accounts are not automatically trusted or imported: register them in MongoDB. Existing local browser records are left untouched.

The two pre-existing police demo identities are migrated to MongoDB when the database first connects. INITIAL_POLICE_PASSWORD can set their initial password; otherwise their existing demo password is retained. Existing DB accounts are not overwritten. MongoDB unique email and traveler ID indexes prevent duplicate registration races; existing DB records without traveler IDs receive stable server IDs.

Police traveler records and GPS refresh every 10 seconds. The list currently returns the latest 1000 active traveler accounts. Map scoring and zone rendering are unchanged.

Run backend with node server.js or npm run dev. Atlas must allow the backend machine's current IP. The code keeps TLS certificate verification enabled. If connection fails, APIs return unavailable; data is never silently saved locally.

Tests: node --test tests/signup.test.js tests/mongo-data.test.js
Frontend tests: node --test tests/signup.test.cjs tests/predictionZones.test.mjs
