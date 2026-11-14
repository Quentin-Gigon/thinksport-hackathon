# Head-to-Head — proposal and code

**SIC Data-hack Challenge 2026 · 14 November 2026**

Head-to-Head turns the two hockey intermissions into a short mobile game about the match fans just watched. Pick which of two players had the higher hidden statistic, lock the answer, then discover the numbers and why that contribution matters on the ice.

## Review links

- [Play the public prototype](https://quentin-gigon.github.io/thinksport-hackathon/#play)
- [Public code repository](https://github.com/Quentin-Gigon/thinksport-hackathon)
- [Full proposal in text](PROPOSAL.md)
- [Reviewer walkthrough](REVIEW_GUIDE.md)
- [Shared-event setup and deployment](../../arena-server/README.md)

The accompanying editable presentation contains ten pitch slides plus one judging-criteria appendix, with speaker notes for a pitch under five minutes. Its text counterpart is maintained here so the proposal remains accessible alongside the code. Export the presentation from its viewer for the Agorize upload.

## Submission scope

This package covers the **proposal deck and public code repository**, as requested by the team. The playable prototype remains available at the link above. No video is included; the team explicitly excluded it from this work.

The organiser's Deliverables text supplied on 14 November lists a presentation deck, working prototype, public repository and a video of at most three minutes, with first submission on **15 November 2026**, and finalist submission on **2 December 2026**. This repository does not claim that all four official deliverables have been submitted or that a video waiver exists. No Agorize submission has been made by this work.

## What judges can verify

The public GitHub Pages app is a **same-browser rehearsal** with fictional players and synthetic period statistics. Separate devices open independent rehearsals. The source includes the shared LAN event server and a deployable Cloudflare backend; a shared public HTTPS event is not yet provisioned.

The learning explanations connect metrics to hockey actions while stating their limits. Confidential supplied match records are not included in the source, screenshots or public demo. A real match requires authorised period data and permission to show selected values.

## Verification on 14 November 2026

- `node --test tests/*.test.js`: 10 Head-to-Head tests passed.
- `node arena-server/lan.integration.mjs`: three independent fan clients completed both breaks, published both leaderboards, resumed after a server restart and verified one final winner's private claim.
- Browser captures at 390 × 844 show the current mobile choice and blocked-shot explanation. These are prototype screenshots, not evidence of an audience trial.
- Public repository visibility and the live demo's HTTP response were checked.

No stadium-capacity test, cross-age user study or measured engagement impact is claimed.
