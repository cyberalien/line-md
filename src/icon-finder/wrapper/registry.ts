import type { Registry } from '@iconify/search-core';
import type { FullIconFinderConfig } from '@iconify/search-core/lib/data/config';
import type { UIEvent } from '../events/types';
import type { ComponentsConfig } from '../config/wrapper';

/**
 * Add UI to config
 */
export interface WrappedFullIconFinderConfig extends FullIconFinderConfig {
	components: Required<ComponentsConfig>;
}

/**
 * Add custom properties to registry
 */
export interface WrappedRegistry extends Registry {
	callback: (event: UIEvent) => void;
	link: (event: MouseEvent) => void;
	config: WrappedFullIconFinderConfig;
}
