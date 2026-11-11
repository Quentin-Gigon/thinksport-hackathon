# Data contract and limits

`dist/engine.js` supplies eight entirely fictional skaters. Team names, names and values are made up independently, not anonymised copies of supplied rows.

## Local import

Export a **single full-game skater snapshot** to a JSON array. Do not combine multiple periods or games into one ranking. For each player provide:

| Key | Type and units |
| --- | --- |
| id | Unique non-empty string; include team/game scope when needed |
| name | Non-empty string |
| team | Non-empty string |
| jersey | Integer 0–99 |
| speed | Top skating speed, km/h, 0–60 |
| passes | Pass completion, percentage points 0–100; convert fractions such as 0.95 to 95 |
| blocks | Integer blocked shots, 0–50 |
| distance | Total skating distance in metres, 0–30000 |
| toi | Total time on ice in seconds, 0–7200 |
| goals | Integer goals, 0–30 |

Missing, unknown or nonparticipating player values should be handled before import; do not replace a missing statistic with zero unless zero is known. At least four and at most 100 players are accepted, with at least one affordable three-player combination. Ties in quiz leaders are accepted by the engine; displayed answer options use one tied leader and lower-valued distractors when available.

Mapping from the supplied aggregate schema: `SPD TOP (km/h)` → speed; `Pass-%` → passes × 100 when encoded as a fraction; `BKS` → blocks; `Dist (m)` → distance; `TOI (s)` → toi; `G` → goals. Use FirstName + LastName for name and a stable team-aware ID. The sample is full-game totals, so it cannot validate a claim about an individual period. No event reconstruction is attempted here.

The goalkeeper CSVs use different fields and scopes and are not suitable skater inputs. No saved or deployed fixture is derived from those records.

## Game formulas

- Quiz: 100 points per correct answer, maximum 500; no speed bonus.
- Fantasy: round(blocks × 8 + pass completion percentage points ÷ 5 + distance metres ÷ 250 + speed km/h ÷ 2), per player; sum three players. Price = 7 + round(player points ÷ 8), budget 50. These weights test a game mechanic, not sporting importance. Total distance favours longer ice time; passing percentage alone ignores volume and risk.
- Mystery: a win earns max(20, 100 − 20 × previous wrong guesses − 15 × extra clues). A loss earns zero. Four guesses; at most three clues. The answer is a deterministic daily choice in Zurich time, with manually advanced practice rounds.

Scores are computed in the browser and are inspectable and modifiable. They are not suitable for prizes or a trusted competition.
