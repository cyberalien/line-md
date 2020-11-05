import {
	baseColorKeywords,
	ColorKeywordValue,
	extendedColorKeywords,
} from './colors-keywords';

export interface RGBColorValue {
	// RGB: 0-255
	r: number;
	g: number;
	b: number;
	// Alpha: 0-1
	a: number;
}

export interface HSLColorValue {
	// Hue: 0-360
	h: number;
	// Saturation 0-100
	s: number;
	// Lightness 0-100
	l: number;
	// Alpha: 0-1
	a: number;
}

/**
 * Attempt to convert color to keyword.
 *
 * Assumes that check for alpha === 1 has been completed
 */
function colorToKeyword(color: RGBColorValue): string | null {
	// Test all keyword lists
	const lists = [baseColorKeywords, extendedColorKeywords];
	for (let i = 0; i < lists.length; i++) {
		const list = lists[i];
		const keys = Object.keys(list);
		let key: string | undefined;
		while ((key = keys.shift()) !== void 0) {
			const rgb = list[key];
			if (
				rgb[0] === color.r &&
				rgb[1] === color.g &&
				rgb[2] === color.b
			) {
				return key;
			}
		}
	}

	return null;
}

/**
 * Convert array to object
 */
function valueToKeyword(value: ColorKeywordValue): RGBColorValue {
	return {
		r: value[0],
		g: value[1],
		b: value[2],
		a: 1,
	};
}

/**
 * Convert hex color to object
 */
function hexToColor(value: string): RGBColorValue | null {
	if (value.slice(0, 1) === '#') {
		value = value.slice(1);
	}
	if (!/^[\da-f]+$/i.test(value)) {
		return null;
	}

	let alphaStr: string = '';
	let redStr: string, greenStr: string, blueStr: string;
	let start = 0;
	switch (value.length) {
		case 4:
			alphaStr = value.slice(0, 1);
			alphaStr += alphaStr;
			start++;
		// no break

		case 3:
			redStr = value.slice(start, ++start);
			redStr += redStr;
			greenStr = value.slice(start, ++start);
			greenStr += greenStr;
			blueStr = value.slice(start, ++start);
			blueStr += blueStr;
			break;

		case 8:
			alphaStr = value.slice(0, 2);
			start += 2;
		// no break

		case 6:
			redStr = value.slice(start++, ++start);
			greenStr = value.slice(start++, ++start);
			blueStr = value.slice(start++, ++start);
			break;

		default:
			return null;
	}

	return {
		r: parseInt(redStr, 16),
		g: parseInt(greenStr, 16),
		b: parseInt(blueStr, 16),
		a: alphaStr === '' ? 1 : parseInt(alphaStr, 16) / 255,
	};
}

/**
 * Convert string to color
 */
export function stringToColor(
	value: string
): RGBColorValue | HSLColorValue | null {
	value = value.toLowerCase();

	// Test keywords
	if (baseColorKeywords[value] !== void 0) {
		return valueToKeyword(baseColorKeywords[value]);
	}
	if (extendedColorKeywords[value] !== void 0) {
		return valueToKeyword(extendedColorKeywords[value]);
	}

	// Test for function
	if (value.indexOf('(') === -1) {
		// Not a function: test hex string
		return hexToColor(value);
	}

	// Remove whitespace
	value = value.replace(/\s+/g, '');
	if (value.slice(-1) !== ')') {
		return null;
	}

	// Remove ')' at the end
	value = value.slice(0, value.length - 1);

	// Split by '('
	const parts = value.split('(');
	if (parts.length !== 2 || /[^\d.,%-]/.test(parts[1])) {
		return null;
	}

	const keyword = parts[0];
	const colors = parts[1].split(',');
	let alpha = 1;

	// Test for alpha and get alpha
	if (keyword.slice(-1) === 'a') {
		// with alpha
		if (colors.length !== 4) {
			return null;
		}
		alpha = parseFloat(colors.pop()!);
		if (isNaN(alpha)) {
			alpha = 0;
		} else {
			alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
		}
	} else if (colors.length !== 3) {
		return null;
	}

	// Parse
	switch (keyword) {
		case 'rgb':
		case 'rgba':
			if (colors[0].slice(-1) === '%') {
				// All components must be percentages
				if (
					colors[1].slice(-1) !== '%' ||
					colors[2].slice(-1) !== '%'
				) {
					return null;
				}

				// Convert to numbers and normalize colors
				let r = parseFloat(colors[0]);
				let g = parseFloat(colors[1]);
				let b = parseFloat(colors[2]);

				return {
					r: isNaN(r) || r < 0 ? 0 : r > 100 ? 255 : r * 2.55,
					g: isNaN(g) || g < 0 ? 0 : g > 100 ? 255 : g * 2.55,
					b: isNaN(b) || b < 0 ? 0 : b > 100 ? 255 : b * 2.55,
					a: alpha,
				};
			}

			// None of components must be percentages
			if (parts[1].indexOf('%') !== -1) {
				return null;
			}

			// Double values are not allowed in rgb()
			let r = parseInt(colors[0]);
			let g = parseInt(colors[1]);
			let b = parseInt(colors[2]);

			return {
				r: isNaN(r) || r < 0 ? 0 : r > 255 ? 255 : r,
				g: isNaN(g) || g < 0 ? 0 : g > 255 ? 255 : g,
				b: isNaN(b) || b < 0 ? 0 : b > 255 ? 255 : b,
				a: alpha,
			};

		case 'hsl':
		case 'hsla':
			if (
				colors[0].indexOf('%') !== -1 ||
				colors[1].slice(-1) !== '%' ||
				colors[2].slice(-1) !== '%'
			) {
				// Hue cannot be percentage, saturation and lightness must be percentage
				return null;
			}

			// All values could be double numbers
			let h = parseFloat(colors[0]);
			let s = parseFloat(colors[1]);
			let l = parseFloat(colors[2]);

			return {
				h: isNaN(h)
					? 0
					: h < 0
					? (h % 360) + 360
					: h >= 360
					? h % 360
					: h,
				s: isNaN(s) || s < 0 ? 0 : s > 100 ? 100 : s,
				l: isNaN(l) || l < 0 ? 0 : l > 100 ? 100 : l,
				a: alpha,
			};
	}

	return null;
}

/**
 * Convert HSL to RGB
 */
function hslToRGB(value: HSLColorValue, round = false): RGBColorValue {
	function valore(n1: number, n2: number, hue: number): number {
		hue = hue < 0 ? (hue % 360) + 360 : hue >= 360 ? hue % 360 : hue;

		if (hue >= 240) {
			return n1;
		}
		if (hue < 60) {
			return n1 + ((n2 - n1) * hue) / 60;
		}
		if (hue < 180) {
			return n2;
		}
		return n1 + ((n2 - n1) * (240 - hue)) / 60;
	}

	let hue =
		value.h < 0
			? (value.h % 360) + 360
			: value.h >= 360
			? value.h % 360
			: value.h;
	let sat = value.s < 0 ? 0 : value.s > 100 ? 1 : value.s / 100;
	let lum = value.l < 0 ? 0 : value.l > 100 ? 1 : value.l / 100;

	let m2: number;
	if (lum <= 0.5) {
		m2 = lum * (1 + sat);
	} else {
		m2 = lum + sat * (1 - lum);
	}

	let m1 = 2 * lum - m2;

	let c1, c2, c3: number;
	if (sat === 0 && hue === 0) {
		c1 = lum;
		c2 = lum;
		c3 = lum;
	} else {
		c1 = valore(m1, m2, hue + 120);
		c2 = valore(m1, m2, hue);
		c3 = valore(m1, m2, hue - 120);
	}

	return {
		r: round ? Math.round(c1 * 255) : c1 * 255,
		g: round ? Math.round(c2 * 255) : c2 * 255,
		b: round ? Math.round(c3 * 255) : c3 * 255,
		a: value.a,
	};
}

/**
 * Convert color to string
 */
export function colorToString(color: RGBColorValue | HSLColorValue): string {
	// Attempt to convert to RGB
	let rgbColor: RGBColorValue;
	try {
		rgbColor =
			(color as RGBColorValue).r !== void 0
				? (color as RGBColorValue)
				: hslToRGB(color as HSLColorValue);
	} catch (err) {
		return '';
	}

	// Check for floats
	const rgbRounded =
		rgbColor.r === Math.round(rgbColor.r) &&
		rgbColor.g === Math.round(rgbColor.g) &&
		rgbColor.b === Math.round(rgbColor.b);

	// Check for keyword and hexadecimal color
	if (rgbRounded && color.a === 1) {
		// Keyword?
		const keyword = colorToKeyword(rgbColor);
		if (typeof keyword === 'string') {
			return keyword;
		}

		// Hex color
		let result = '';
		let canShorten = true;
		try {
			(['r', 'g', 'b'] as (keyof RGBColorValue)[]).forEach((attr) => {
				const value = rgbColor[attr];
				if (value < 0 || value > 255) {
					throw new Error('Invalid color');
				}
				const str = (value < 16 ? '0' : '') + value.toString(16);
				result += str;
				canShorten = canShorten && str[0] === str[1];
			});
		} catch (err) {
			return '';
		}
		return '#' + (canShorten ? result[0] + result[2] + result[4] : result);
	}

	// RGB(A) or HSL(A)
	if (!rgbRounded && (color as HSLColorValue).h !== void 0) {
		// HSL(A)
		const hslColor = color as HSLColorValue;
		const list: string[] = [];
		try {
			// Hue
			let hue = hslColor.h % 360;
			while (hue < 0) {
				hue += 360;
			}
			list.push(hue + '');

			// Saturation, lightness
			(['s', 'l'] as (keyof HSLColorValue)[]).forEach((attr) => {
				const value = hslColor[attr];
				if (value < 0 || value > 100) {
					throw new Error('Invalid color');
				}
				list.push(value + '%');
			});
		} catch (err) {
			return '';
		}
		if (hslColor.a !== 1) {
			list.push(hslColor.a + '');
		}
		return (hslColor.a === 1 ? 'hsl(' : 'hsla(') + list.join(', ') + ')';
	}

	// RGB(A)
	const list: string[] = [];
	try {
		(['r', 'g', 'b'] as (keyof RGBColorValue)[]).forEach((attr) => {
			const value = rgbColor[attr];
			if (value < 0 || value > 255) {
				throw new Error('Invalid color');
			}
			list.push(value + '');
		});
	} catch (err) {
		return '';
	}
	if (rgbColor.a !== 1) {
		list.push(rgbColor.a + '');
	}
	return (rgbColor.a === 1 ? 'rgb(' : 'rgba(') + list.join(', ') + ')';
}
