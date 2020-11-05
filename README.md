# Material Line Icons

There are many icon sets that are designed to Material Design guidelines. You can find icons for anything you need.

This icon set is different:

-   Icons are animated using CSS animations for stroke.
-   It follows guidelines that are used for 'Round' and 'TwoTone' icons in the official Material Design Icons set.
-   Sometimes 1px thin lines are used where it makes sense.

Preview is available at https://cyberalien.github.io/line-md/

Icon set is in development. It contains only few icons so far. Icons can change any time.

# CSS stroke animations

Icons use stroke that can be animated on first render. All you have to do is add class "iconify--line-md" to SVG element (Iconify SVG framework 2.0 does it automatically) and include stylesheet from `https://code.iconify.design/css/line-md.css`.

To refresh animation you can either re-render icon or use display to hide and show it.

# Usage in HTML

1. Add stylesheet for CSS animations:

```html
<link rel="stylesheet" href="https://code.iconify.design/css/line-md.css" />
```

2. Include Iconify SVG framework:

```html
<script src="https://code.iconify.design/2/2.0.0-rc.2/iconify.min.js"></script>
```

3. Add placeholder for icon, using "line-md" prefix:

```html
<span class="iconify" data-icon="line-md:home"></span>
```

See [Iconify SVG framework documentation](https://docs.iconify.design/implementations/svg-framework/) for details.

# Components

React, Vue and Svelte components are available. See [Iconify components documentation](https://docs.iconify.design/implementations/components/) for details.

# Icon requests

You can [open an issue on GitHub repository](https://github.com/cyberalien/line-md/issues) to request icons.

Icons are currently designed in Figma and exported using custom Figma plug-in. Plug-in calculates lengths of all shapes, order of animations and assigns appropriate classes to shapes within exported SVG.

At moment of writing this, Figma has a bug with exporting shapes that require masking (it replaces stroke with fill and merges shape with mask), which means complex shapes cannot be animated, so icons that require masks cannot be added yet.

# Licence

MIT
