"""Subset the Tabler icon TTF to a given set of codepoints and emit woff2.

Called by scripts/build-icon-subset.mjs. Not meant to be run directly.

We drop GSUB/GPOS/GDEF before subsetting: the upstream Tabler TTF ships a
malformed GSUB ligature table that makes fontTools' `pyftsubset` CLI blow up with
`assert len(input) == len(ligSets)` while reading it. An icon font addressed
purely by codepoint has no use for OpenType layout, so removing those tables is
both safe and what lets the subset run at all.

usage: subset-font.py <src.ttf> <codepoints-file> <out.woff2>
"""

import sys
from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options

src, cp_file, out = sys.argv[1], sys.argv[2], sys.argv[3]

with open(cp_file, encoding="utf-8") as fh:
    codepoints = {int(line, 16) for line in fh.read().split() if line.strip()}

font = TTFont(src, lazy=True)

# Must happen before Subsetter touches the font — see module docstring.
for tag in ("GSUB", "GPOS", "GDEF"):
    if tag in font:
        del font[tag]

options = Options()
options.flavor = "woff2"
options.notdef_outline = True          # keep .notdef so a missing glyph is visible, not invisible
options.drop_tables += ["DSIG"]
options.name_IDs = []                  # icon font needs no name records
options.recalc_bounds = True

subsetter = Subsetter(options=options)
subsetter.populate(unicodes=codepoints)
subsetter.subset(font)

font.flavor = "woff2"
font.save(out)

kept = len(font.getGlyphOrder())
print(f"subset-font.py: requested {len(codepoints)} codepoints, font now has {kept} glyphs")
