# Material Line Icons

There are many icon sets that are designed to Material Design guidelines. You can find icons for anything you need.

This icon set is different:

-   Icons are animated using SVG animations. No CSS or JavaScript.
-   It follows guidelines that are used for 'Round' and 'TwoTone' icons in the official Material Design Icons set.
-   Sometimes 1px thin lines are used where it makes sense.

Preview is available at https://cyberalien.github.io/line-md/

Icon set is in development. It contains only few icons so far. Icons can change any time.

# SVG 2 animations

Icons use SVG 2 animations, which are contained in icon code and do not require external stylesheet or script.

# Usage in HTML

1. Include IconifyIcon component, [see `iconify-icon` package for latest code](https://www.npmjs.com/package/iconify-icon).

2. Add icon, using "line-md" prefix:

```html
<iconify-icon icon="line-md:home"></iconify-icon>
```

# Icon requests

You can [open an issue on GitHub repository](https://github.com/cyberalien/line-md/issues) to request icons.

Icons are currently designed in Figma and exported using custom Figma plug-in. Plug-in calculates lengths of all shapes, order of animations and assigns appropriate classes to shapes within exported SVG.

At moment of writing this, Figma has a bug with exporting shapes that require masking (it replaces stroke with fill and merges shape with mask), which means complex shapes cannot be animated, so icons that require masks cannot be added yet.

# Licence

MIT
