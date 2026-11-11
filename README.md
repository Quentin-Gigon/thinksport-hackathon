# Overtime — ThinkSport prototype lab

**[Play all three prototypes](https://quentin-gigon.github.io/thinksport-hackathon/)**

Three working browser games to compare at the team's 11 November 2026 meeting. No install, account, API key or backend is needed. Public fixtures contain **fictional players and synthetic statistics**, not the supplied confidential hockey records.

## Play locally

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173. ES modules require an HTTP server; double-clicking index.html is not supported. Any static host can serve `dist/`. External Google Fonts are optional; system font fallbacks work without internet.

## The three experiments

| Prototype | Core action | Learning | Hypothesis |
| --- | --- | --- | --- |
| Read the game | Answer five multiple-choice questions; reveal stats and explanations | Speed, passing, blocked shots, distance and ice time describe different contributions | Immediate explanation makes a short intermission quiz worth finishing |
| Unsung heroes | Draft any three skaters within 50 credits; compare against the best affordable lineup | Contributions beyond goals and the trade-offs of a composite score | Building a lineup creates more ownership and replay than trivia |
| Mystery skater | Use a roster and three progressively unlocked clues to identify a player in four guesses | Player identity can emerge from performance characteristics | A daily deduction puzzle creates a simple return habit |

All games include completion, score, replay and local feedback. Mystery uses the Europe/Zurich calendar date for the initial puzzle; practice rotates through players. Quiz is full-game recall, **not** a live prediction. Fantasy uses visible full-game stats, **not** forecasts or a validated ranking. The scoring formula and prices are shown in the game. Mystery has no AI or fabricated crowd popularity score.

## Tonight's test

Follow [docs/MEETING_TEST.md](docs/MEETING_TEST.md). Each person should play all three before discussing. Rate fun, clarity and desire to replay on the result screen. The test notebook stores responses in this browser only and exports JSON. Devices do not synchronize; there are no real-time rooms, accounts or shared leaderboards.

## Data and confidentiality

See [docs/DATA.md](docs/DATA.md) and [docs/SOURCES.md](docs/SOURCES.md). The organisers' supplied match data is confidential. Do not commit or deploy original files or private derived match records. The ignored `private-data/` directory is a place for team-only local files.

For private testing, open **Data & rules**, then import a JSON array matching [docs/player-template.json](docs/player-template.json). Imported data stays in this tab's memory, resets on refresh and is never sent to a server. The public JavaScript still downloads normally, and the optional Google Fonts request is independent of imported content. Keep browser extensions and screen sharing in mind when handling confidential material. Feedback exports include tester-entered notes, so check those before sharing.

## Verification

With Node.js installed:

```sh
node --test tests/*.test.js
node --check dist/app.js
```

Tests verify quiz answers, an independently enumerated fantasy optimum, mystery scoring, Zurich daily selection and import validation. Browser verification results are in [docs/QA.md](docs/QA.md).

## Scope after selection

Replace the synthetic fixture with an authorised private data service, use verified per-period snapshots for predictions, set pre-match fantasy prices, and add server-validated scoring and rooms only after choosing the concept. Preserve plain-language explanations and verify official event units before using event tracking. No submission deck or video is included in this prototype repository.
