# Spem in alium — score provenance

Music: Thomas Tallis (c.1505–1585), _Spem in alium nunquam habui_, complete
40-part motet, eight choirs of soprano, alto, tenor, baritone and bass.

The bundled MusicXML (`tallis.mxl`) is the public-domain transcription identified
as MuseScore score **1010121**, distributed in **PDMX v1.1**:

- Dataset: https://zenodo.org/records/15571083
- Original score identifier: https://musescore.com/score/1010121
- Dataset filename: `mxl/5/24/QmfHT2G9JnrpUZi3R3uMTDfwgP7ZkJVrmVXSMfuRzsriDz.mxl`
- Source classification: **Public Domain**, with `license_conflict=False` and
  `subset:no_license_conflict=True` in the published dataset index.
- Public Domain Mark: https://creativecommons.org/publicdomain/mark/1.0/
- The exact dataset index row is retained in `pdmx-provenance.json`.

PDMX attribution: Phillip Long, Zachary Novack, Taylor Berg-Kirkpatrick and Julian
McAuley, “PDMX: A Large-Scale Public Domain MusicXML Dataset for Symbolic Music
Processing,” ICASSP 2025, DOI: 10.1109/ICASSP49660.2025.10890217.
See also Weihan Xu, Julian McAuley, Taylor Berg-Kirkpatrick, Shlomo Dubnov and
Hao-Wen Dong, “Generating Symbolic Music from Natural Language Prompts using an
LLM-Enhanced Dataset,” arXiv:2410.02084.

## App adaptation

The app extracts pitches, note onsets, durations and explicit rests, merges tied
continuations, and preserves all 138 measures in each of the 40 parts. It uses a
fixed tempo of **half note = 56**, A440, equal temperament, and an epoch of
2026-01-01 00:00:00 UTC. The loop lasts 591.428571 seconds. Phrase divisions for
automatic part selection and all synthesis/ornament behavior are app additions,
not claims about historically prescribed performance.

`scripts/import-score.py` rebuilds the runtime JSON from the bundled MXL with no
network access. `validation.json` records structural checks and the source hash.
The app contains no recordings and imports no source or editorial material from
Spem Player, the Hugh Keyte edition, or the Philip Brett edition.

Public-domain status is the dataset’s classification. This is an attributed
community transcription, not a newly prepared critical edition.
