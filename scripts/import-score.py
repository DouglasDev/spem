"""Rebuild the runtime score from the checked-in public-domain MusicXML source.

Uses only the Python standard library. Durations are expressed in half-note beats.
Rejects polyphony inside a part, broken ties, unequal measures, and unexpected parts.
"""

from fractions import Fraction
from pathlib import Path
import hashlib
import json
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/score/tallis.mxl"
OUT = ROOT / "public/score/tallis.json"
STEPS = dict(C=0, D=2, E=4, F=5, G=7, A=9, B=11)
NAMES = ["Soprano", "Alto", "Tenor", "Baritone", "Bass"]


def import_score():
    with zipfile.ZipFile(SOURCE) as archive:
        name = next(name for name in archive.namelist() if name.endswith(".xml") and not name.startswith("META-INF"))
        root = ET.fromstring(archive.read(name))

    parts = []
    tie_count = 0
    note_count = 0
    for index, part in enumerate(root.findall("part")):
        expected = f"{NAMES[index % 5]} {index // 5 + 1}"
        label = root.find(f"part-list/score-part[@id='{part.attrib['id']}']/part-name").text
        assert label == expected, (label, expected)
        notes = []
        divisions = 1
        cursor = Fraction(0)
        tie_pitch = None
        measures = part.findall("measure")
        assert len(measures) == 138

        for measure in measures:
            divisions = int(measure.findtext("attributes/divisions", str(divisions)))
            start = cursor
            assert measure.find("backup") is None, "Unexpected polyphonic part"
            assert measure.find("forward") is None, "Unexpected implicit rest"
            for note in measure.findall("note"):
                assert note.find("chord") is None
                assert note.find("grace") is None
                duration = Fraction(int(note.findtext("duration")), divisions * 2)
                assert duration > 0
                pitch = note.find("pitch")
                if pitch is not None:
                    note_count += 1
                    midi = (int(pitch.findtext("octave")) + 1) * 12 + STEPS[pitch.findtext("step")] + int(pitch.findtext("alter", "0"))
                    ties = {tie.attrib["type"] for tie in note.findall("tie")}
                    if "stop" in ties:
                        assert tie_pitch == midi, (label, measure.attrib, "Broken tie")
                        assert notes[-1]["beat"] + notes[-1]["duration"] == float(cursor)
                        notes[-1]["duration"] += float(duration)
                        tie_count += 1
                    else:
                        assert tie_pitch is None, (label, "Unclosed tie")
                        notes.append(dict(beat=float(cursor), duration=float(duration), midi=midi))
                    tie_pitch = midi if "start" in ties else None
                else:
                    assert tie_pitch is None, "Rest inside tie"
                cursor += duration

            assert cursor - start == 4, (label, measure.attrib, cursor - start)

        assert tie_pitch is None
        assert cursor == 552
        parts.append(dict(id=index, choir=index // 5 + 1, name=NAMES[index % 5], notes=notes))

    assert len(parts) == 40
    # Structural changes and major textural handoffs, with four-bar subdivisions
    # to keep automatic players from waiting through long rests.
    phrase_bars = sorted(set(range(1, 139, 4)) | {25, 26, 40, 46, 65, 69, 76, 81, 85, 88, 91, 93, 96, 100, 104, 110, 118, 122, 124, 125, 130, 137})
    score = dict(
        version="tallis-pdmx-1010121-v1",
        title="Spem in alium",
        attribution="Thomas Tallis; public-domain transcription, MuseScore score 1010121, via PDMX (Long et al., 2025).",
        source="https://zenodo.org/records/15571083",
        license="Public Domain Mark 1.0",
        sourceSha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        epoch=1767225600000,
        bpm=56,
        beats=552,
        barBeats=4,
        phrases=[(bar - 1) * 4 for bar in phrase_bars],
        parts=parts,
    )
    OUT.write_text(json.dumps(score, separators=(",", ":")) + "\n")
    report = dict(parts=40, measuresPerPart=138, totalMeasures=5520, beatUnit="half note", beats=552, sourceNoteheads=note_count, mergedTieContinuations=tie_count, runtimeNotes=sum(len(part["notes"]) for part in parts), sourceSha256=score["sourceSha256"])
    (OUT.parent / "validation.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    import_score()
