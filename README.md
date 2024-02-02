# Material Line Icons

There are many icon sets that are designed to Material Design guidelines. You can find icons for anything you need.

This icon set is different:

-   Icons are animated using SVG animations. No CSS or JavaScript.
-   It follows guidelines that are used for 'Round' and 'TwoTone' icons in the official Material Design Icons set.
-   Sometimes 1px thin lines are used where it makes sense.

You can browse all icons at https://icon-sets.iconify.design/line-md/

Click any icon to get code you can use in your project.

## Icon requests

If you like this icon set, but it is missing icons that you need, [please open an issue at repository](https://github.com/cyberalien/line-md/issues).

## SVG animations level 2

Icons use [SVG animations](https://svgwg.org/specs/animations/), which are contained in icon code and do not require external stylesheet or script.

No, these are not outdated SMIL animations. Icons are animated using modern SVG spec, supported by all browsers.

## Animation types

Most icons use "fade-in" animation. Animation shows icon appearing from nothing.

Other icons:
- Icons that end with `-loop` use infinite animtions.
- Icons that end with `-out` disappear icon. It is the opposite of same icon without `-out` suffix.
- Icons that end with `-transition` transition between two icons.

## Usage in HTML

1. Include IconifyIcon component, [see `iconify-icon` package for latest code](https://www.npmjs.com/package/iconify-icon).

2. Add icon, using "line-md" prefix:

```html
<iconify-icon icon="line-md:home"></iconify-icon>
```

## Usage without web component

There are few issues with SVG animations.

[Iconify icon web component](https://iconify.design/docs/iconify-icon/) solves those issues, but if you are using icons without it, see [article that explains known SVG issues and solutions](https://iconify.design/docs/articles/svg-animation-issues/).

## Licence

MIT
