import type {
	CodeSampleMode,
	CodeSampleTab,
	CodeSampleKey,
} from '@iconify/search-core/lib/code-samples/types';
import type { ComponentCodeOutput } from '@iconify/search-core/lib/code-samples/code';
import type { IconsListMode } from '../components/types';
import type { APIProviderError } from '../provider/add-provider';

export interface UITranslationAddForm {
	title?: string;
	placeholder: string;
	submit: string;
	invalid?: string;
}

export interface UITranslation {
	lang: string;
	search: {
		placeholder: Record<string, string>;
		defaultPlaceholder: string;
		button: string;
	};
	errors: {
		noCollections: string;
		noIconsFound: string;
		defaultError: string;
		custom: Record<string, string>;
	};
	icons: {
		header: {
			full: string;
			more: string;
			modes: Record<IconsListMode, string>;
			select: string;
		};
		headerWithCount: Record<number, string>;
		tooltip: {
			size: string;
			colorless: string;
			colorful: string;
			char: string;
			length: string;
		};
		more: string;
		moreAsNumber: boolean;
	};
	pagination: {
		prev: string;
		next: string;
	};
	filters: Record<string, string>;
	collectionInfo: {
		total: string;
		height: string;
		author: string;
		license: string;
		palette: string;
		colorless: string;
		colorful: string;
		link: string;
	};
	parent: Record<string, string>;
	collection: {
		by: string;
	};
	providers: {
		section: string;
		add: string;
		addForm: UITranslationAddForm;
		status: Record<APIProviderError, string>;
	};
	footer: {
		iconName: string;
		iconNamePlaceholder: string;
		inlineSample: {
			before: string;
			after: string;
		};
		remove: string;
		select: string;
		about: string;
	};
	footerButtons: Record<string, string>;
	footerBlocks: Record<string, string>;
	footerOptionButtons: {
		hFlip: string;
		vFlip: string;
		rotate: string;
		rotateTitle: string;
		inline: string;
		block: string;
		inlineHint: string;
		blockHint: string;
	};
	codeSamples: {
		copy: string;
		copied: string;
		heading: string;
		headingHidden: string;
		childTabTitle: string;
		childTabTitles: Partial<Record<CodeSampleTab, string>>;
		docsDefault: string;
		docs: Partial<Record<CodeSampleKey, string>>;
		intro: Partial<Record<CodeSampleMode, string>>;
		component: Record<keyof ComponentCodeOutput, string>;
		iconify: {
			intro1: string;
			intro2: string;
			head: string;
		};
	};
}
