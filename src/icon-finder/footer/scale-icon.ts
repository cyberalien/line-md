const maxHeight = 26;
const max5Scale = 70;

export function getIconGrid(height: number, width?: number): number {
	// Scale by 2 until size <= maxHeight
	while (height > maxHeight) {
		let newHeight = height / 2;
		if (Math.round(newHeight) !== newHeight) {
			break;
		}

		// Check if width can be scaled as well
		if (typeof width === 'number') {
			let newWidth = width / 2;
			if (Math.round(newWidth) !== newWidth) {
				break;
			}
			width = newWidth;
		}
		height = newHeight;
	}

	// Try to scale down by 5
	if (height > max5Scale) {
		let failed = false;

		let newHeight = height / 5;
		if (Math.round(newHeight) !== newHeight) {
			failed = true;
		}

		if (!failed && typeof width === 'number') {
			let newWidth = width / 5;
			if (Math.round(newWidth) !== newWidth) {
				failed = true;
			}
		}

		if (!failed) {
			height = newHeight;
		}
	}

	return height;
}
