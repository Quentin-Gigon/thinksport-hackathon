# Matchday games — replacement set, 11 November 2026

The new routes are `#duel`, `#crowd`, `#draft`. Old shared URLs `#spot`, `#chain`, `#chance` redirect to these replacements. Original games 1–3 remain, with the quiz pre-answer stats table removed.

## Head-to-Head
Five two-player comparisons from the same fictional first period. Pick, explicitly lock, then reveal both actual numbers and a short interpretation. 100 points per correct answer; no timer, no pre-answer stats table. The pair order varies by question, not by answer correctness.

## Against the Crowd
Choose 2–8 fans. Pass one phone; each fan answers three questions privately before passing. Previous picks and statistics are absent from the voting screen. After all fans finish, reveal actual period-one stats, real vote counts and per-question scores. Correct answer: 100 + round(50 × (1 − fraction choosing that answer)), capped at 50 bonus. Wrong answers get zero. Ties in total score are acknowledged. The completion passport records the room's best score, not an individual identity. No synthetic crowd, network room or shared-device authentication. People must honour the handoff.

## Next-Period Draft
Select exactly three distinct skaters for at most 50 credits. Prices are fixed fixture inputs, independent of period-two score. No period-two stats are displayed before lock. The explicit demo advances through blocks, completed passes and distance. Score per player = blocks × 10 + completed passes + floor(distance metres / 100). Uses period two only. Show best feasible lineup score at completion. No timer or automatic simulated-live updates.

## Boundaries
All match records are fictional. The two periods are separately authored; period totals are not estimated by dividing full-game records. Original private import applies only to games 1–3. Votes, game state and picks are in this tab's memory and reset on refresh/navigation to another game; only completed scores and feedback persist locally. The fixtures are public JavaScript, so this is not cheat-proof. No official Spengler Cup logo or affiliation is claimed; visual design uses hockey and alpine-night motifs.

## Production integration
Obtain authorised period snapshots with verified units, completed-pass counts and period boundaries. Freeze period-one recall questions at the break. Freeze draft prices before predictions; accept picks until a server-enforced period-two deadline; settle only against period-two records. Host correct answers and future stats server-side. Real cross-device crowd play requires rooms, server-side vote locks and a defined reveal deadline. Do not invent a live feed from unavailable tracking data.

## Meeting test
For the demo, explain that the fictional fixture was not a match participants actually watched; test interface clarity and group enjoyment, not inference accuracy. For a valid inference test, show an authorised full period first and use its verified statistics. Test with both younger and older viewers, without explaining controls. Record completion, understanding of recall versus prediction, and desire to replay.
