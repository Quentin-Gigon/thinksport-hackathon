# Shared arena event on Cloudflare

This is the shared-device backend for the two Head-to-Head intermissions. The Worker serves the files in ../dist and provides the same-origin /api/arena endpoint; one SQLite-backed Durable Object maintains scores and host state for one event. This is a deployment recipe, not a claim that a public arena event is already provisioned. GitHub Pages remains a static rehearsal unless it uses an available shared API.

## Deploy and rehearse

Use an account with Workers, Durable Objects (SQLite), Workers Static Assets and Wrangler 4. From the repository root:

1. Set a confirmed ARENA_PRIZE_LABEL only if the organiser has actually approved that prize. ARENA_FIXTURE_LABEL can describe the source shown to fans. Set a distinct ARENA_EVENT_ID in arena-server/wrangler.jsonc for this match. The same ID resumes the same event after deploys. Rehearse with a separate ID; never reset an event in progress.
2. From arena-server, run `npx wrangler login`, then `npx wrangler secret put ARENA_ADMIN_SECRET` and paste a long, randomly generated operator passphrase at the hidden prompt. Never commit it, put it in a QR code or append it to a URL.
3. Run `npx wrangler deploy`. Open the returned HTTPS Worker URL on two unrelated devices, both on the same event. The Worker returns `{"mode":"live","eventId":"…"}` at /arena-config.json. Use the host and scoreboard views from that same origin; the big screen's QR points back to the fan view. Admin mutations require the host secret in an HTTP Bearer header.
4. For local Worker testing, put ARENA_ADMIN_SECRET in untracked arena-server/.dev.vars and use `npx wrangler dev`. Unit tests need no Workers account: `node --test tests/arena-engine.test.js` from repo root. Tests cover scoring, stale picks, auth, privacy, ties, one-time draw and no eligible finishers. On Node releases with node:sqlite, one test also runs the actual SQL queries against SQLite.
5. For an authorised private event, set ARENA_FIXTURE_JSON using the Wrangler secret prompt, and test it before opening. A fixture has players [{id,name,number,team}], and rounds [firstPeriod,secondPeriod]. Each round must have exactly 5 records [prompt,unit,leftPlayerId,leftValue,rightPlayerId,rightValue,shortStory]. Only the higher numeric value wins, ties are rejected. All questions and aggregate numbers must come from that period. Embedding all future values in a public frontend file would spoil the game. Public fallback packs are deliberately fictional and inspectable. The Worker is not a live sports data feed. For real-time integration, period-scoped ingestion/release must be wired in separately; do not change an in-progress fixture between picks.

## Event semantics

Lobby → break1 → leaders1 → break2 → leaders2 → final. Each horn opens/closes all authenticated clients together. Lock 5 picks per period. A correct answer earns 100 points; one optional Power Play per break earns 200 on a correct call, still 0 on a miss. Replaying a locked request cannot score twice or change the prediction. Answers are returned for locked calls only; spectator responses never contain secrets or unrevealed statistics.

The first break board contains period-one scores. Break two continues showing the last closed standings until the host closes the second break. The second board ranks combined points, including late or incomplete entrants. The final board ranks finishers of all ten calls only. Ties share a rank. Up to ten visible rows are shown; every tied top finisher, including those beyond row ten, enters the draw. A host may trigger one uniform cryptographic draw after final. Retrying the command returns the same winner. Without a finisher, no draw is possible.

A private code appears only for the winning fan's token. Staff can verify the presented code against the final record with the authenticated host view. Verification is a check, not a ticketing system or an inventory/redemption record. Fan passes are device tokens with generated scoreboard names; a browser reload resumes a pass, but loss of browser storage loses it. A bearer token is not proof of a unique person. For an actual high-value prize, integrate one-entry-per-ticket and verified collection before announcing it; supply an organiser-approved prize and rules. No real tickets or jerseys are awarded by the demo.

POST JSON: `status {token?}`, `join {}`, `pick {token,id,playerId,power?}`, `advance {to}`, `draw {}`, `verifyClaim {code}`. Each payload includes `action`. Last three actions require operator authentication at the Worker boundary. Keep the service same-origin; do not open credentialed CORS. Origin checks and server validation do not replace ticket verification, infrastructure rate controls or stadium-scale load testing. The database stores one row per fan plus public-safe generated names; there is no public API to export player tokens or unplayed questions.

## Load verified numbers at each horn

P2 data need not exist before puck drop. After P1 ends (host still in lobby), load a verified P1 pack; after P2 ends (host still showing first-break leaders), load P2. Post an authenticated action with this envelope:

    { "action": "loadPeriod", "period": 1, "fixture": { "players": [...], "round": [...] } }

The host UI's selected file is just the fixture object. See [the fictional example](examples/period-pack.json). Each period can use a different roster or even different team assignments for the same player IDs. Each file must contain exactly five comparisons, with distinct player IDs in each pair and distinct, nonnegative numerical results. The operator can correct the pack until its break opens. The horn freezes a deep copy for scoring and reveals, whether the pack was uploaded, provided through the deployment environment, or inherited from the public rehearsal. Data updates after opening are rejected.

`loadedPeriods` in a public snapshot contains just the period numbers explicitly loaded by the host. The staff upload response does not return raw player values, unplayed prompts, stories or the pack itself. Worker host requests support up to 64 KiB (including the JSON envelope); ordinary public requests are capped at 4 KiB. Only use verified data authorised for display when fans reveal a call.
