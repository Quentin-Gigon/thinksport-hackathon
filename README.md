# Head-to-Head — the arena edition

**SIC Data-hack Challenge 2026 submission** · [Proposal](docs/submission/PROPOSAL.md) · [Judge walkthrough](docs/submission/REVIEW_GUIDE.md) · [Submission scope and evidence](docs/submission/README.md)

This repository contains **Head-to-Head only**: the fan game, arena scoreboard, host controls and shared event server.

[Fan game](https://quentin-gigon.github.io/thinksport-hackathon/#play) · [Projector scoreboard and QR](https://quentin-gigon.github.io/thinksport-hackathon/#screen) · [Private operator / public rehearsal controls](https://quentin-gigon.github.io/thinksport-hackathon/#host).

**One QR, two breaks, one draw.** At the first horn a fan joins with a tap and gets a generated scoreboard name. Five blind picks, 100 points each; one optional Power Play doubles a correct pick. The operator closes the round and shows the leaders. At the second horn the same QR restores that phone's entry for five different period-two calls. Combined standings follow. At the final horn the operator draws once from the highest-scoring fans who finished both breaks. Tied leaders are equally likely to win; the winner alone sees a private claim code.

## Rehearse or play with a group

- **GitHub Pages** hosts a same-browser rehearsal with fictional stats. Use three tabs in the same browser profile: phone, scoreboard, host. The rehearsal opens at break one; change stages on the host tab. Scanning it from another device creates a separate rehearsal.
- **Team phones on one Wi-Fi:** run **Start Arena.command** on this Mac or `npm run arena` in this repository with Node 22+. The terminal prints a scoreboard URL for the projector, a separate loopback operator URL and a private operator key. Keep the terminal running. Open the scoreboard from the Wi-Fi address, then scan its QR with real phones. If several network interfaces are listed, choose the one reachable by the phones. Guest Wi-Fi must allow clients to reach the laptop. Set `ARENA_PUBLIC_URL` to override the QR destination. This is the small-group host, not a capacity-tested stadium deployment.
- **Public HTTPS / separate networks:** follow [the Worker deployment guide](arena-server/README.md). Serve frontend and event API together. No shared public backend or sponsor prize has been activated. For the actual match, use **Load verified period data** in the operator console: supply the first period at the first horn, then load the second period at the next horn before opening its calls. The built-in fixture is fictional.

**Operator cue sheet:** open break one → close and show first leaders → open break two → close and show cumulative leaders → final standings → draw → verify the winning phone's code. Fans must use the same browser without clearing its data. No fan account or identity verification is included. Confirm the actual prize, entry and fulfilment arrangements with the event operator before announcing them. A pass is a browser entry, not proof of one person per seat.

The LAN event persists in ignored `.arena-local/`; use a fresh `ARENA_STORE` and `ARENA_EVENT_ID` for a new match. See `ARENA_FIXTURE_FILE` (validated private fixture outside dist), `ARENA_PRIZE` (confirmed display label), `ARENA_PORT`. `npm test` runs the rules tests; `npm run test:arena` runs three independent clients through both rounds, a restart and the prize claim. Before building Pages, run `python3 scripts/pack-offline.py` to version the static modules.


## Run locally

```sh
git clone https://github.com/Quentin-Gigon/thinksport-hackathon.git
cd thinksport-hackathon
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173/#play. No frontend build or dependency install is needed. For shared play, use Node 22+ and `npm run arena`.

## Source and data

The readable browser modules live in `dist/`; shared hosting code is in `arena-server/`. See the [source map and walkthrough](docs/submission/REVIEW_GUIDE.md), [proposal](docs/submission/PROPOSAL.md) and [source notes](docs/SOURCES.md).

Public players and statistics are fictional. Supplied match records are confidential and must never be committed or deployed. The operator can load authorised per-period comparisons using the [documented private upload flow](arena-server/README.md).
