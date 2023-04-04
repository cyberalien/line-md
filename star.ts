/**
 * Angle to radians
 */
function toRadians(angle: number): number {
	return angle * (Math.PI / 180);
}

/**
 * [x,y] of angle
 */
function rotate(angle: number, y = 1): [number, number] {
	const rad = toRadians(angle);
	return [Math.sin(rad) * y, Math.cos(rad) * y];
}

/**
 * Floating number to string
 */
function floatToString(value: number): string {
	const negative = value < 0;
	const rounded = Math.round(Math.abs(value) * 100);
	let str = rounded.toString().split('.').shift() as string;
	while (str.length < 3) {
		str = '0' + str;
	}
	const part1 = str.slice(0, str.length - 2);
	let part2 = str.slice(str.length - 2);
	while (part2.slice(-1) === '0') {
		part2 = part2.slice(0, part2.length - 1);
	}

	const result = (negative ? '-' : '') + part1 + (part2.length ? '.' + part2 : '');
	return result === '-0' ? '0' : result;
}

/**
 * Create star
 */
interface StarOptions {
	edges?: number;
	start?: number; // 0 <= start < 360
	reverse?: boolean;
	xMultiplier?: number;
	yMultiplier?: number;
	xOffset?: number;
	yOffset?: number;
}
function star(size1: number, size2: number, options: StarOptions = {}) {
	const defaults: Required<StarOptions> = {
		edges: 5,
		start: 0,
		reverse: false,
		xMultiplier: 1,
		yMultiplier: -1,
		xOffset: 12,
		yOffset: 12,
	};
	const { edges, start, reverse, xMultiplier, yMultiplier, xOffset, yOffset } = {
		...defaults,
		...options,
	};

	let points: [number, number, number][] = [];
	const angle = 360 / edges;
	for (let i = 0; i < edges; i++) {
		const angle1 = angle * i;
		const [x1, y1] = rotate(angle1, size1);
		points.push([angle1, x1 * xMultiplier, y1 * yMultiplier]);

		const angle2 = angle * (i + 0.5);
		const [x2, y2] = rotate(angle2, size2);
		points.push([angle2, x2 * xMultiplier, y2 * yMultiplier]);
	}

	// Sort points
	if (start) {
		points.forEach((item) => {
			const angle = item[0];
			if (angle < start) {
				item[0] = angle + 360;
			}
		});
	}
	points.sort((a, b) => a[0] - b[0]);
	if (reverse) {
		points = points.reverse();
	}

	// Convert to line
	return points.map(([angle, x, y], index) => `${index ? 'L' : 'M'}${floatToString(xOffset + x)} ${floatToString(yOffset + y)}`).join('') + 'Z';
}

// 2 sides of same star
console.log(star(9, 4, {}));
console.log(
	star(9, 4, {
		xMultiplier: -1,
	})
);

// Pulsating star
/*
console.log(star(5, 2, {}));
console.log(
	star(5, 2, {
		xMultiplier: -1,
	})
);
*/
