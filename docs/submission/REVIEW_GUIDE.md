# Judge walkthrough

The entry for review is **Head-to-Head, arena edition**. Earlier games remain in `lab.html` as development history; they are not the current proposal.

## Try the public demo

Open these three links in tabs in the **same browser profile**:

1. [Fan view](https://quentin-gigon.github.io/thinksport-hackathon/#play)
2. [Scoreboard](https://quentin-gigon.github.io/thinksport-hackathon/#screen)
3. [Host controls](https://quentin-gigon.github.io/thinksport-hackathon/#host)

The public demo starts with the first break open. If it has already been played, use **Start a fresh rehearsal**, then **Confirm** in the host tab. That resets this browser's rehearsal.

In the fan tab, tap **Play the five calls**, choose a jersey and lock the call. Read the numbers and **Why it matters**. Continue through all five. Try the optional **Power Play** once: correct calls award 200 points instead of 100, while misses stay at zero.

In the host tab, choose **Close round 1 & show leaders**, then **Confirm**. Look at the scoreboard. Next choose **Open second intermission**, then **Confirm**. Return to the fan tab: the same entry continues into five period-two calls.

After the fan finishes, the host chooses **Close round 2 & show leaders**, then **Confirm**. Inspect the combined standings. Choose **Show final winners**, then **Confirm**. The final board includes only fans who completed both breaks.

Choose **Draw prize winner**, then **Confirm**. The winning phone shows a private code. Enter that in the host's verification form and choose **Check code**. A one-person rehearsal naturally selects that sole eligible finisher.

**Other devices do not share this public rehearsal.** To compare multiple fans on a common board, use the shared server below. The QR always opens the fan view; scanning the static GitHub Pages QR on a second device starts that device's independent demo.

## Run the source

For a local static rehearsal, with Python 3:

```sh
git clone https://github.com/Quentin-Gigon/thinksport-hackathon.git
cd thinksport-hackathon
python3 -m http.server 4173 --directory dist
```

Open `http://localhost:4173/#play`. The source files in `dist/` are readable JavaScript modules; there is no frontend build or npm dependency install required.

For a shared LAN event, with Node 22 or later:

```sh
npm run arena
```

Keep the server running. Open the printed scoreboard URL on the shared Wi-Fi, and scan its QR from phones. Use the separate loopback host URL and private operator key for controls. Never publish the key. The server stores its event in ignored `.arena-local/`. Network isolation on guest Wi-Fi can prevent phone access.

For public HTTPS hosting on separate networks, follow the [Cloudflare deployment guide](../../arena-server/README.md). That backend is implemented but not deployed as the public demo.

## Verify the rules

```sh
npm test
npm run test:arena
```

The first command covers the arena and archived experiments. The second starts a temporary shared server and drives three separate clients through both rounds, restart recovery and final claim verification.

## Source map

| Path | Purpose |
| --- | --- |
| `dist/index.html`, `dist/arena-app.js` | Current app entry and routes |
| `dist/arena-fan.js`, `dist/arena-fan.css` | Phone journey and learning reveals |
| `dist/arena-screen.js`, `dist/arena-screen.css` | Arena QR, standings and winner |
| `dist/arena-host.js` | Host stages and private period upload |
| `dist/arena-engine.js` | Shared rules, synthetic fixture and prize draw |
| `dist/arena-client.js` | Static rehearsal and server API client |
| `dist/arena-worker.js` | Cloudflare endpoint and SQLite event storage |
| `arena-server/lan.mjs` | Persistent local shared-event server |
| `arena-server/examples/period-pack.json` | Synthetic period upload example |
| `tests/arena-*.test.js` | Current arena rules and screen tests |
| `arena-server/lan.integration.mjs` | Shared-event integration test |

## Known limits

Public stats are synthetic. A real event needs verified period values authorised for display, shared HTTPS deployment, stadium capacity checks, audience testing and confirmed prize arrangements. Browser storage identifies an entry, not a unique person or ticket. No confidential source dataset belongs in the public repository or frontend.
