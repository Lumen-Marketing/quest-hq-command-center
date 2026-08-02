"""Generate every Questbase icon from the one piece of brand artwork.

Run: python scripts/build-brand-icons.py

The source (src/assets/questbase-modular-logo.png) is 1254x1254 on an opaque white field,
with wide margins — the mark occupies roughly the middle 60%. Shipping it untrimmed makes
the logo render small inside its own tile and leaves the favicon mostly empty space at
32px, which is exactly where a mark most needs to fill its box.

So: cut the white to transparency, trim to the ink, re-pad deliberately, then emit each
size. Everything is derived here rather than edited by hand, so changing the artwork means
re-running this rather than hunting down a dozen files.

Two things are deliberately NOT transparent, because transparency actively hurts there:

  apple-touch-icon  iOS composites it onto black, so a transparent icon becomes a dark
                    smear. It keeps a white field.
  maskable icon     The launcher crops it to its own shape and fills the rest; the whole
                    canvas is meant to be opaque.

And the tab icon ships in two versions. The mark is orange plus near-black, so on a dark
browser tab bar the black arcs disappear into the background — "transparent" and "visible"
are only compatible if the dark ink is lightened for dark themes.
"""
import base64
import os

from PIL import Image

SOURCE = 'src/assets/questbase-modular-logo.png'
WHITE = (255, 255, 255, 255)
CLEAR = (255, 255, 255, 0)

# Anything at or above this on every channel is background, not ink. The threshold is
# applied at full resolution and the result is then downsampled, so LANCZOS regenerates
# smooth edges from a hard mask — thresholding after resizing is what produces jaggies.
WHITE_CUTOFF = 240

# The near-black ink, and what it becomes for dark backgrounds. Not pure white: a slightly
# warm off-white sits better beside the orange than #fff does.
DARK_INK_MAX = 90
DARK_INK_REPLACEMENT = (242, 240, 237)

src = Image.open(SOURCE).convert('RGBA')
print('source:', src.size)

pixels = src.load()
width, height = src.size
for y in range(height):
    for x in range(width):
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0) if min(r, g, b) >= WHITE_CUTOFF else (r, g, b, 255)

box = src.getbbox()
assert box, 'no ink found in ' + SOURCE
ink = src.crop(box)
w, h = ink.size
side = max(w, h)
print('ink bounds:', box, '->', (w, h))

# 9% margin on the long edge: enough that the mark never touches a rounded corner, tight
# enough that it still reads at 32px.
PAD = round(side * 0.09)
CANVAS = side + PAD * 2


def lighten_dark_ink(image):
    """Swap the near-black arcs for off-white, leaving the orange alone.

    Without this, a transparent favicon loses half its shape on a dark tab bar.
    """
    out = image.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if a and max(r, g, b) <= DARK_INK_MAX:
                px[x, y] = DARK_INK_REPLACEMENT + (a,)
    return out


def render(size, background=CLEAR, canvas_side=CANVAS, art=None):
    """Square canvas, mark centred, resampled once from the full-resolution crop."""
    art = ink if art is None else art
    canvas = Image.new('RGBA', (canvas_side, canvas_side), background)
    canvas.paste(art, ((canvas_side - art.width) // 2, (canvas_side - art.height) // 2), art)
    return canvas.resize((size, size), Image.LANCZOS)


def emit(path, size, note, background=CLEAR, canvas_side=CANVAS, art=None):
    image = render(size, background, canvas_side, art)
    if background[3] == 255:
        image = image.convert('RGB')
    image.save(path, 'PNG', optimize=True)
    print('%-40s %4dpx  %6.1f KB  %s' % (path, size, os.path.getsize(path) / 1024, note))


emit('src/assets/questbase-mark.png', 512, 'shell logo (transparent)')
emit('public/icons/favicon-32.png', 32, 'browser tab, light themes')
emit('public/icons/favicon-16.png', 16, 'browser tab, light themes')
emit('public/icons/icon-192.png', 192, 'PWA')
emit('public/icons/icon-512.png', 512, 'PWA')

dark_art = lighten_dark_ink(ink)
# The in-app logo needs the same treatment as the dark favicon: the mark's ink is near
# black, so on a dark side menu a transparent logo is a mark you cannot see. Emitted as a
# second asset rather than a CSS filter, which would drag the orange along with it.
emit('src/assets/questbase-mark-light.png', 512, 'shell logo for dark surfaces', art=dark_art)
emit('public/icons/favicon-32-dark.png', 32, 'browser tab, dark themes', art=dark_art)
emit('public/icons/favicon-16-dark.png', 16, 'browser tab, dark themes', art=dark_art)

# iOS composites this onto black; a transparent version becomes a dark smear.
emit('public/apple-touch-icon.png', 180, 'iOS home screen (opaque, iOS ignores alpha)',
     background=WHITE)

# A maskable icon is cropped to whatever shape the launcher likes, so the mark has to sit
# inside the middle 80% and the canvas has to be opaque.
emit('public/icons/icon-maskable-512.png', 512, 'PWA maskable (opaque, 80% safe zone)',
     background=WHITE, canvas_side=round(side * 1.6))


def write_favicon(path, art, comment):
    """An SVG wrapper around the real artwork.

    The mark is raster, so it is embedded rather than traced: redrawing a brand mark as
    vector paths by hand produces something *nearly* right, which is worse than something
    exactly right. 96px covers a 32px tab at 3x device pixel ratio; larger only inflates a
    file every page load fetches.
    """
    tmp = 'scripts/.favicon-tmp.png'
    render(96, CLEAR, CANVAS, art).save(tmp, 'PNG', optimize=True)
    with open(tmp, 'rb') as handle:
        encoded = base64.b64encode(handle.read()).decode('ascii')
    os.remove(tmp)
    with open(path, 'w', encoding='utf8') as handle:
        handle.write('\n'.join([
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">',
            '  <!-- ' + comment,
            '       Regenerate with python scripts/build-brand-icons.py. -->',
            '  <image href="data:image/png;base64,' + encoded + '" width="96" height="96"/>',
            '</svg>',
            '',
        ]))
    print('%-40s   96px  %6.1f KB  %s' % (path, os.path.getsize(path) / 1024, comment.split('.')[0]))


write_favicon('favicon.svg', ink,
              'The Questbase mark on a transparent field, embedded rather than traced.')
write_favicon('favicon-dark.svg', dark_art,
              'Dark-theme tab icon: the near-black arcs lightened so they stay visible.')
