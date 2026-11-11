# Verification — 11 November 2026

Passed five Node test groups: quiz options/answers, independently enumerated fantasy budget optimum, mystery scoring, Zurich calendar selection and import validation. JavaScript syntax checks pass.

In-app browser exercised:

- Hub navigation and narrow 585px layout; screenshot inspected.
- Five correct quiz answers produced 500/500 and plain-language reveals.
- Feedback saved locally and appeared with correct averages in the notebook.
- Fantasy rejected an over-budget selection, allowed deselect/reselect, and produced the independently verified optimal score of 232 at 50 credits.
- Mystery wrong guess plus one extra clue reduced potential points from 100 to 65; correct second guess finished at 65. A practice round could start.
- Notebook clear removed the disposable QA response.
- File-picker JSON import accepted the synthetic template, and restoring the demo worked.
- The narrow viewport had no horizontal document overflow; browser error logs were empty.

The private imported fixture was validated as 40 skaters with the same data contract; source files are Git-ignored. Public fixtures and deployment contain synthetic data only.

Limitations: no physical phone, screen reader or multiplayer testing. A narrow browser viewport was checked, not every device size. No live data ingestion, trusted competitive scoring or server persistence is implemented.

## Six-game update

Nine automated test groups passed after adding games 4–6. New checks cover all animation frames and player coordinates, interpolation/clamping, exact event ordering, retry score floors, and probability-based answers independent of scripted outcomes. JavaScript syntax checks passed.

Browser verification on the updated hub:

- All six entries appeared, with the original three marked as team ideas and the additions as new experiments.
- Spot the Difference animated to its freeze automatically, accepted a player choice and continued to a reveal. Three correct rounds completed at 300/300. Skip-to-freeze and full-reveal controls worked.
- Chain Reaction rejected an incorrect ordering, offered a reveal after two failed checks, awarded 20 for that reveal and 100 on each subsequent correct round. It completed at 220/300. Starting another round stopped the prior animation.
- Chance or Luck revealed 30/100 versus 6/100 with a miss versus goal respectively, while still awarding points for the higher probability. Three rounds with one incorrect choice completed at 200/300.
- The final phone-sized viewport had no horizontal document overflow, choice targets were at least 58px tall, and browser error logs were empty.

These are functional checks, not evidence of appeal across ages. Reduced-motion behavior is implemented but was not tested with a physical assistive-device setup. Synthetic scenarios are not a verified reconstruction of supplied match events. Importing real player rows supports games 1–3 only.
