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

The site references this font family name, but the font file is not committed to the repository.

Do not commit or redistribute font files unless the licence explicitly permits that use. If an authorised King's-hosted webfont becomes available, add an approved `@font-face` declaration or hosted stylesheet reference.

## Current limitation

Without an authorised webfont being served, the site will fall back to Arial / Helvetica. The styling is therefore designed to rely on the wider visual grammar as well as the typeface:

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
