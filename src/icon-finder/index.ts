import { Wrapper } from './wrapper';
import type { IconFinderEvent } from './wrapper/events';

// Load icon set
fetch('./line-md.json')
	.then((data) => {
		return data.json();
	})
	.then((iconSet) => {
		const container = document.getElementById('container')!;
		const prefix = 'line-md';
		container.innerHTML = '';

		// Create instance
		const wrapper = new Wrapper({
			container,
			callback: (event: IconFinderEvent) => {
				// console.log('Event:', event);
				switch (event.type) {
					case 'selection': {
						if (event.icons.length === 1) {
							// Scroll to icon
							setTimeout(() => {
								try {
									const footer = container.querySelector(
										'div.iif-footer-full'
									);
									footer?.scrollIntoView({
										behavior: 'smooth',
									});
								} catch (err) {
									//
								}
							});
						}
					}
				}
			},
			iconSets: {
				iconSets: [iconSet],
				merge: 'only-custom',
				info: {
					[prefix]: {
						name: 'Material Line Icons',
						author: 'Iconify',
						url: 'https://github.com/iconify',
						license: 'Apache 2.0',
						height: 24,
						samples: ['home', 'image-twotone', 'edit-twotone'],
						palette: false,
						category: 'General',
					},
				},
			},
			state: {
				route: {
					type: 'collection',
					params: {
						prefix,
					},
				},
				config: {
					ui: {
						itemsPerPage: 15 * 4,
					},
					components: {
						list: false,
					},
				},
			},
		});
	})
	.catch((err) => {
		document.getElementById('container')!.innerHTML =
			'Error fetching icon sets';
	});
