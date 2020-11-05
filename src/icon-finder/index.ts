import { Wrapper } from './wrapper';

const container = document.getElementById('container');
if (container) {
	const wrapper = new Wrapper({
		container,
		callback: (event) => {
			console.log('Event:', event);
		},
	});
}
