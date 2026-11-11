# Stadium test: the two finalists
Use the six judging dimensions as questions, not invented weights.
- Engagement: does someone voluntarily draft after their fifth duel? Observe the handoff; ask whether they follow one of their picks next period.
- Education: after the reveal, can they explain why the fastest skater might not cover the most ice?
- Creativity: the distinctive idea is turning a retrospective eye test into a personal watchlist for the next period. The individual trivia and fantasy mechanics are familiar.
- Clarity and feasibility: hand an unbriefed fan a phone. Can they lock a pick, swap a skater and understand which period scores?
- Technical quality: mute by default; try in bright light, one-handed, with sound off. Close and reopen the draft after lock and check that the same three jerseys return.
- Use of data: verify period boundaries, units and fixed prices against an authorised feed before a live trial. Synthetic figures test the interactions but cannot validate inference from watching.
Try with a younger and older fan independently before claiming either finds it easy. Record observed issues, not a predicted jury score.

## Current finalist build

Fans can optionally study three fictional illustrated shifts before choosing. Head-to-Head now offers one Power Play per five calls and returns a personal evidence card. Following the draft link carries the card's suggested jersey into the scouting bench for the same browser tab. The draft asks which selected skater will lead the line in blocks, passing or distance. Tied leaders earn the badge; the prediction never changes lineup scoring. Both result screens offer a local PNG download. To prepare for a venue with poor reception, use Data & rules → Save games for offline play on the same device first.

For maintainers: after editing public assets, run `python3 scripts/pack-offline.py` and include the new worker in the release. It precaches only public static files.


## Rematches and friendly challenges

Head-to-Head cycles through 12 sets from the same demo first period. Shared links identify both the five-call card and a self-reported points target. There is no account or official leaderboard. The end-of-round evidence and next-period watch note come from the matchups actually played.

The draft's optional Coach Challenge opens after the final horn. The same fictional period becomes a constrained replay puzzle: spend at most 46 credits, include a forward, and predict the passing leader. Compare the lineup only with the optimum under those rules. Neither game claims new live data on replay.
