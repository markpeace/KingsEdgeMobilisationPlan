# Brand and Styling Notes

## Source direction

The current styling direction is informed by the King's Edge Student Advocacy Group slide deck.

The deck uses:

- white space
- black type
- King's red as a structural device
- large confident titles
- vertical red slabs and rails
- simple journey logic
- numbered steps
- simple line diagrams

The website should translate these tendencies into a web-native mobilisation tool rather than copy the slides directly.

## Current web treatment

The first brand pass shifts the site away from a soft dashboard feel and towards a sharper King's Edge visual language:

- white background
- black typography
- King's red accent
- square cards and panels
- red structural bars
- stronger page hierarchy
- more restrained status badges
- clearer Gantt contrast

## Typeface

The intended brand typeface is:

```css
font-family: "KingsBureauGrot", "Bureau Grot", Arial, Helvetica, sans-serif;
```

The site now defines `KingsBureauGrot` through an `@font-face` declaration in:

```text
public/status.css
```

It references the webfont file placed in:

```text
public/KingsBureauGrot-ThreeSeven-Regular.woff2
```

Because `status.css` is loaded from the public root, the font reference is relative:

```css
@font-face {
  font-family: "KingsBureauGrot";
  src: url("./KingsBureauGrot-ThreeSeven-Regular.woff2") format("woff2");
  font-weight: 400 900;
  font-style: normal;
  font-display: swap;
}
```

## Licence note

Only serve this font if the licence permits use on this GitHub Pages site. If a more official King's-hosted webfont route becomes available, replace the local file reference with that source.

## Fallback behaviour

If the webfont fails to load, the site falls back to:

```css
"Bureau Grot", Arial, Helvetica, sans-serif
```

The styling also relies on the wider visual grammar:

- red rails
- black and white contrast
- uppercase hierarchy
- square blocks
- simple line-based structure

## Next styling tasks

- Review the homepage visually against the slide deck.
- Adjust Gantt density and row height if it feels too crowded.
- Consider adding numbered project or deliverable markers inspired by the slide journey treatment.
- Consider a print / meeting view once the visual style settles.
