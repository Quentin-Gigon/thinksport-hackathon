# Head-to-Head — the arena edition

[Fan game](https://quentin-gigon.github.io/thinksport-hackathon/#play) · [Projector scoreboard and QR](https://quentin-gigon.github.io/thinksport-hackathon/#screen) · [Private operator / public rehearsal controls](https://quentin-gigon.github.io/thinksport-hackathon/#host).

**One QR, two breaks, one draw.** At the first horn a fan joins with a tap and gets a generated scoreboard name. Five blind picks, 100 points each; one optional Power Play doubles a correct pick. The operator closes the round and shows the leaders. At the second horn the same QR restores that phone's entry for five different period-two calls. Combined standings follow. At the final horn the operator draws once from the highest-scoring fans who finished both breaks. Tied leaders are equally likely to win; the winner alone sees a private claim code.

## Rehearse or play with a group

- **GitHub Pages** hosts a same-browser rehearsal with fictional stats. Use three tabs in the same browser profile: phone, scoreboard, host. The rehearsal opens at break one; change stages on the host tab. Scanning it from another device creates a separate rehearsal.
- **Team phones on one Wi-Fi:** run **Start Arena.command** on this Mac or `npm run arena` in this repository with Node 22+. The terminal prints a scoreboard URL for the projector, a separate loopback operator URL and a private operator key. Keep the terminal running. Open the scoreboard from the Wi-Fi address, then scan its QR with real phones. If several network interfaces are listed, choose the one reachable by the phones. Guest Wi-Fi must allow clients to reach the laptop. Set `ARENA_PUBLIC_URL` to override the QR destination. This is the small-group host, not a capacity-tested stadium deployment.
- **Public HTTPS / separate networks:** follow [the Worker deployment guide](arena-server/README.md). Serve frontend and event API together. No shared public backend or sponsor prize has been activated. For the actual match, use **Load verified period data** in the operator console: supply the first period at the first horn, then load the second period at the next horn before opening its calls. The built-in fixture is fictional.

**Operator cue sheet:** open break one → close and show first leaders → open break two → close and show cumulative leaders → final standings → draw → verify the winning phone's code. Fans must use the same browser without clearing its data. No fan account or identity verification is included. Confirm the actual prize, entry and fulfilment arrangements with the event operator before announcing them. A pass is a browser entry, not proof of one person per seat.

The LAN event persists in ignored `.arena-local/`; use a fresh `ARENA_STORE` and `ARENA_EVENT_ID` for a new match. See `ARENA_FIXTURE_FILE` (validated private fixture outside dist), `ARENA_PRIZE` (confirmed display label), `ARENA_PORT`. `npm test` runs the rules tests; `npm run test:arena` runs three independent clients through both rounds, a restart and the prize claim. Before building Pages, run `python3 scripts/pack-offline.py` to version the static modules.

---

# Overtime — ThinkSport prototype lab

**[Open the archived six-game lab](https://quentin-gigon.github.io/thinksport-hackathon/lab.html)**

Six working browser games to compare at the team's 11 November 2026 meeting. No install, account, API key or backend is needed. Public fixtures contain **fictional players and synthetic statistics**, not the supplied confidential hockey records.

## Play locally

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173. ES modules require an HTTP server; double-clicking index.html is not supported. Any static host can serve `dist/`. External Google Fonts are optional; system font fallbacks work without internet.

## The six experiments

| Prototype | Core action | Learning | Hypothesis |
| --- | --- | --- | --- |
| Read the game | Answer five multiple-choice questions; reveal stats and explanations | Speed, passing, blocked shots, distance and ice time describe different contributions | Immediate explanation makes a short intermission quiz worth finishing |
| Unsung heroes | Draft any three skaters within 50 credits; compare against the best affordable lineup | Contributions beyond goals and the trade-offs of a composite score | Building a lineup creates more ownership and replay than trivia |
| Mystery skater | Use a roster and three progressively unlocked clues to identify a player in four guesses | Player identity can emerge from performance characteristics | A daily deduction puzzle creates a simple return habit |
| Head-to-Head | Lock five blind two-player period-one stat comparisons | Observations help estimate hidden speed, distance, blocks, passes and usage | A close numerical reveal rewards attentive watching |
| Against the Crowd | 2–8 fans pass one device and lock three private picks before any reveal | Popularity does not establish the correct answer | A capped minority bonus creates discussion without rewarding incorrect contrarian picks |
| Next-Period Draft | Choose three skaters under 50 credits, then simulate period-two settlement | Blocks, completed passes and distance contribute beyond goals | A future-period lineup gives fans players to follow |

All games include completion, score, replay and local feedback. Games 1–3 follow the team brainstorming ideas; games 4–6 are additional experiments. See [the matchday guide](docs/MATCHDAY.md) for the replacement games and production requirements. The earlier concept scorecard describes retired experiments. Mystery uses the Europe/Zurich calendar date for the initial puzzle; practice rotates through players. Quiz is full-game recall, **not** a live prediction. Fantasy uses visible full-game stats, **not** forecasts or a validated ranking. The scoring formula and prices are shown in the game. Mystery has no AI or fabricated crowd popularity score.

## Tonight's test

Follow [docs/MEETING_TEST.md](docs/MEETING_TEST.md). Each person should play all six before discussing. Rate fun, clarity and desire to replay on the result screen. The test notebook stores responses in this browser only and exports JSON. Devices do not synchronize; there are no real-time rooms, accounts or shared leaderboards.

## Data and confidentiality

See [docs/DATA.md](docs/DATA.md) and [docs/SOURCES.md](docs/SOURCES.md). The organisers' supplied match data is confidential. Do not commit or deploy original files or private derived match records. The ignored `private-data/` directory is a place for team-only local files.

For private testing, open **Data & rules**, then import a JSON array matching [docs/player-template.json](docs/player-template.json). Imported data changes games 1–3 only, stays in this tab's memory, resets on refresh and is never sent to a server. Games 4–6 use separate fictional period-one/period-two fixtures. Crowd votes are real inputs from people sharing one device. The public JavaScript still downloads normally, and the optional Google Fonts request is independent of imported content. Keep browser extensions and screen sharing in mind when handling confidential material. Feedback exports include tester-entered notes, so check those before sharing.

## Verification

With Node.js installed:

```sh
node --test tests/*.test.js
node --check dist/app.js
```

Tests verify quiz answers, an independently enumerated fantasy optimum, mystery scoring, Zurich daily selection, import validation, period-one duels, minority bonuses, draft budget enforcement and future-period scoring. Legacy play-engine tests remain as regression coverage. Browser verification results are in [docs/QA.md](docs/QA.md).

## Scope after selection

Replace the synthetic fixture with an authorised private data service, use verified per-period snapshots for predictions, set pre-match fantasy prices, and add server-validated scoring and rooms only after choosing the concept. Preserve plain-language explanations and verify official event units before using event tracking. No submission deck or video is included in this prototype repository.
