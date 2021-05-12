const fs = require('fs');
const { dirname } = require('path');

/**
 * Generate stylesheet
 */
function buildStylesheet() {
	// @supports test
	const supports =
		'@supports (animation: foo 1s) and (not (-ms-ime-align: auto)) and (not (overflow: -webkit-marquee))';

	// Container class
	const container = 'iconify--line-md';

	// Prefix for classes and animations
	const prefix = 'il-md';

	// Length breakpoints
	const breakpoints = [15, 25, 40, 70, 100, 150];

	// Timers
	const maxDelay = 19;
	const maxDuration = 9;

	// Generate output
	const styles = [];
	const animations = [];

	/**
	 * Round number
	 */
	function round(value) {
		let str = value + '';
		let parts = str.split('.');
		if (parts.length !== 2) {
			return str;
		}

		let float = parts.pop();
		if (float.length < 3) {
			return str;
		}

		// Remove everything after first '0'
		let index = float.indexOf('0', 1);
		if (index !== -1) {
			float = float.slice(0, index);
			parts.push(float);
			return parts.join('.');
		}
		return str;
	}

	/**
	 * Add code
	 */
	function addCode(name, code) {
		styles.push(`.${container} .${prefix}-${name} { ${code} }`);
	}

	/**
	 * Add style
	 *
	 * Style object: [selector] = value
	 */
	function addStyle(name, style) {
		addCode(
			name,
			Object.keys(style)
				.map((item) => {
					return `${item}: ${style[item]};`;
				})
				.join(' ')
		);
	}

	/**
	 * Animation style
	 */
	function animationStyle(name, duration) {
		return `${prefix}-${name} ${duration}s linear forwards`;
	}

	/**
	 * Add keyframes
	 *
	 * Frames object: [frame][selector] = value
	 */
	function addKeyframes(name, frames) {
		let code = `@keyframes ${prefix}-${name} { ${Object.keys(frames)
			.map((frame) => {
				const item = frames[frame];
				return `${frame} { ${Object.keys(item)
					.map((selector) => {
						return `${selector}: ${item[selector]};`;
					})
					.join(' ')} }`;
			})
			.join(' ')} }`;
		animations.push(code);
	}

	// Add fill
	addStyle('fill', {
		animation: animationStyle('fill', 0.5),
		opacity: 0,
	});
	addKeyframes('fill', {
		from: {
			opacity: 0,
		},
		to: {
			opacity: 1,
		},
	});

	// Add stroke
	breakpoints.forEach((bp) => {
		const name = 'length-' + bp;
		addStyle(name, {
			'animation': animationStyle(name, 0),
			'stroke-dasharray': bp,
			'stroke-dashoffset': bp,
			'opacity': 0,
		});
		addKeyframes(name, {
			'0%': {
				'stroke-dashoffset': bp,
				'opacity': 0,
			},
			'1%': {
				'stroke-dashoffset': bp,
				'opacity': 1,
			},
			'100%': {
				'stroke-dashoffset': 0,
				'opacity': 1,
			},
		});
	});

	// Add delay
	for (let i = 0; i <= maxDelay; i++) {
		addStyle('delay-' + i, {
			'animation-delay': round(i * 0.1) + 's',
		});
	}

	// Add duration
	for (let i = 0; i <= maxDuration; i++) {
		addStyle('duration-' + i, {
			'animation-duration': round(0.2 + i * 0.1) + 's',
		});
	}

	// Generate code
	const code = `${supports} {\n\t${styles.join('\n\t')}\n\t${animations.join(
		'\n\t'
	)}\n}`;

	fs.writeFileSync(dirname(__dirname) + '/line-md.css', code, 'utf8');
	// console.log(code);
}

/**
 * Copy assets
 */
function copyModules() {
	// Copy Iconify
	// No longer used: switched to Svelte component
	/*
	const iconify = require.resolve('@iconify/iconify');
	const data = fs.readFileSync(iconify);
	fs.writeFileSync(dirname(__dirname) + '/assets/iconify.min.js', data);
	*/
}

function build() {
	buildStylesheet();
	copyModules();
}

/**
 * Export or build
 */
if (!module.parent) {
	build();
} else {
	module.exports = build;
}
