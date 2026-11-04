# Spem in alium phone ensemble

A static React/TypeScript instrument: each phone synthesizes one line of Thomas
Tallis’s complete 40-part _Spem in alium_. All devices follow a repeating UTC
timeline. The score lasts 9:51.43 at half note = 56.

## Run locally

Requires Node 24, pnpm 10.12.4, and Python 3 for rebuilding the score.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the printed local address and tap **Join performance**. For real phones,
use an HTTPS deployment: a plain HTTP LAN URL does not provide all the secure
browser features needed for reliable audio startup and wake lock.

## Perform

- **Auto** independently favors active, distinctive lines, gives outer registers
  some extra weight, and prefers keeping a useful current part. Selection changes
  at annotated phrase boundaries, including four-bar subdivisions.
- **Fixed part** selects exactly one of eight choirs × five voice types. Tap a
  cell in the choir grid or use the dropdown. The cells show activity in the
  written score, **not connected phones**.
- Adjust volume, brightness, harmonic richness, vowel resonance and vibrato.
  **Edit harmonics** exposes eight upper-partial levels, starting with the
  fundamental. Sound settings and fixed part selection persist on the device.
- Six ornament buttons queue one figure on the next unscheduled beat. A later
  press replaces an unfinished queued figure. The amount controls its duration;
  EDM gates also use it for depth. Written rests remain silent and the original
  line resumes within one beat. No second part is layered onto the phone.
- **Calibration pulse** temporarily replaces the voice with beat pulses. Compare
  nearby phones and adjust **Timing offset** (negative = earlier, positive =
  later). Return to the voice when aligned.
- **Mute** stops this phone, not the global timeline. After hiding the page,
  locking the phone, or another audio interruption, tap **Rejoin performance**.

There is no server, user account, microphone permission, or precise location
access. The region label uses the browser’s IANA time zone. It can be inaccurate
and does not establish proximity or membership in an ensemble.

## Synchronization and its limits

The app calls `https://utctime.app/api/now` with unique request parameters and
`cache: no-store`. Three startup samples estimate UTC relative to the monotonic
`performance.now()` clock; low round-trip delay is favored. Time is refreshed
every 60–120 seconds. Failures retain a prior estimate; rate limiting triggers
backoff. An initial failure offers explicit **unsynchronized** phone-clock
playback. Network service availability is an external dependency.

Web Audio events are scheduled ahead on the audio clock. Available output
timestamps/latency estimates and a manual offset compensate for output delays.
Clock corrections, fixed-part changes, and interruptions flush pending events.

The displayed uncertainty estimates request delay and clock drift. It excludes
speaker processing, Bluetooth buffering, sound travel, and unknown server clock
error. Network asymmetry can bias estimates. This is approximate synchronization,
not a guarantee of phase-aligned audio or measured physical-phone accuracy.

GitHub Pages cannot count other participants. Independent weighted selection can
produce duplicates and missing lines, even with 40 phones. For full coverage,
organize fixed parts manually. Regional automatic coordination and detecting a
40-phone threshold would require a separate service; neither is simulated here.

## Score and source

The full community transcription is included as MusicXML and a compact runtime
JSON file. It has 40 monophonic parts and 138 measures per part. PDMX identifies
it as public domain with no license conflict. See
[score attribution](public/score/ATTRIBUTION.md) and the retained dataset row.

```sh
pnpm score:import
```

The importer verifies every measure duration, part label/order, pitch and
monophonic event stream, and all explicit ties. It merges 570 tie continuations
from 9,713 source noteheads into 9,143 sounding events. Rests are retained as gaps.
It is not a newly proofread critical edition. Phrase divisions, fixed tempo,
equal temperament, and ornament figures are application choices.

The shared epoch is 2026-01-01 00:00:00 UTC. Changing the tempo, epoch or score
duration changes the worldwide position. Keep these values consistent across
published versions; the runtime score carries a version identifier.

## Checks and architecture

```sh
pnpm format
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

The precommit hook checks both formatting and TypeScript. ESLint Stylistic
enforces blank-line spacing; Oxfmt handles the remaining formatting.

- `src/music`: score types, timeline lookup, weighted assignment, ornaments.
- `src/sync`: external clock estimation and approximate region label.
- `src/audio`: monophonic additive voice and lookahead scheduler.
- `src/components`: accessible controls and small Linaria styled components.
- `src/state`: persisted Zustand sound/performance settings.

Tests include source hashes, complete part structure, representative entrances,
cross-bar ties, rests, global loop boundaries, assignment distributions over
20,000 simulated devices, clock failures and cached responses, interruption and
part-change recovery, ornament return, and offline audio rendering/clipping.

## GitHub Pages

The app targets `https://DouglasDev.github.io/spem-in-alium/`. No secrets or
backend are needed. A GitHub account with repository administration and Pages
access is needed to publish.

1. Create an empty **public** repository named `spem-in-alium` under `DouglasDev`.
2. Push this project’s `main` branch:

   ```sh
   git remote add origin git@github.com:DouglasDev/spem-in-alium.git
   git push -u origin main
   ```

   If the remote is already configured, omit `git remote add`.

3. In the repository, open **Settings → Pages** and select **GitHub Actions** as
   the source.
4. Run **Verify and deploy GitHub Pages** from the Actions tab if the first push
   occurred before Pages was enabled.

The workflow installs from the pnpm lockfile, checks formatting and TypeScript,
runs tests, rebuilds and verifies the score, builds with the repository base
path, and deploys the generated static artifact. Pull requests run checks
without deployment.

To preview the production subpath locally:

```sh
GITHUB_ACTIONS=true pnpm build
GITHUB_ACTIONS=true pnpm preview
```

Open the printed preview host with `/spem-in-alium/` appended.

## Verification still requiring physical devices

Desktop Chromium browser checks and simulated phone viewport checks do not
replace testing real iPhone Safari and Android Chrome. Before a live event:

1. Use at least three phones on the published HTTPS URL, using built-in speakers.
2. Verify first-tap audio, part selection, sliders, all ornaments and calibration.
3. Record their calibration pulses together for ten minutes, including muted
   periods, screen locking, interruptions and rejoining.
4. Measure pulse onset differences at the beginning and end and after each
   rejoin. Report median, 95th percentile and maximum inter-phone spread, with
   phone models, browser versions and measurement geometry.
5. Report these measured acoustic results separately from the clock uncertainty
   shown by the interface. Repeat with Bluetooth only if that output is needed.

No physical-phone measurements are claimed by this implementation.
