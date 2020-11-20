(function (Iconify) {
	'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var Iconify__default = /*#__PURE__*/_interopDefaultLegacy(Iconify);

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, basedir, module) {
		return module = {
			path: basedir,
			exports: {},
			require: function (path, base) {
				return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
			}
		}, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	var objects = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.match = exports.compareObjects = exports.cloneObject = void 0;
	/**
	 * Deep clone simple object.
	 *
	 * This function does not handle anything other than primitive types + Arrays.
	 * This function is on average 10 times faster than JSON.parse(JSON.stringify(obj)) on small objects, several times faster on big objects
	 */
	function cloneObject(obj) {
	    if (typeof obj !== 'object' || obj === null) {
	        return obj;
	    }
	    if (obj instanceof Array) {
	        return obj.map((item) => {
	            if (typeof item === 'object') {
	                return cloneObject(item);
	            }
	            else {
	                return item;
	            }
	        });
	    }
	    const result = {};
	    let key;
	    for (key in obj) {
	        if (typeof obj[key] !== 'object') {
	            result[key] = obj[key];
	        }
	        else {
	            result[key] = cloneObject(obj[key]);
	        }
	    }
	    return result;
	}
	exports.cloneObject = cloneObject;
	/**
	 * Compare two objects.
	 *
	 * This function does not handle anything other than primitive types + Arrays.
	 */
	function compareObjects(obj1, obj2) {
	    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
	        return obj1 === obj2;
	    }
	    if (obj1 === obj2) {
	        // Same object or both are null
	        return true;
	    }
	    if (obj1 === null || obj2 === null) {
	        // One of objects is null
	        return false;
	    }
	    // Check for arrays
	    if (obj1 instanceof Array) {
	        if (!(obj2 instanceof Array)) {
	            return false;
	        }
	        if (obj1.length !== obj2.length) {
	            return false;
	        }
	        for (let i = 0; i < obj1.length; i++) {
	            const value1 = obj1[i];
	            const value2 = obj2[i];
	            if (value1 !== value2) {
	                // Different values. If both are objects, do deep comparison, otherwise return false
	                if (typeof value1 !== 'object' ||
	                    typeof value2 !== 'object' ||
	                    !compareObjects(value1, value2)) {
	                    return false;
	                }
	            }
	        }
	        return true;
	    }
	    else if (obj2 instanceof Array) {
	        return false;
	    }
	    // Not array
	    const keys1 = Object.keys(obj1);
	    const keys2 = Object.keys(obj2);
	    if (keys1.length !== keys2.length) {
	        return false;
	    }
	    for (let i = 0; i < keys1.length; i++) {
	        const key = keys1[i];
	        if (typeof obj1[key] !==
	            typeof obj2[key]) {
	            return false;
	        }
	        if (typeof obj1[key] === 'object') {
	            if (!compareObjects(obj1[key], obj2[key])) {
	                return false;
	            }
	        }
	        else if (obj1[key] !==
	            obj2[key]) {
	            return false;
	        }
	    }
	    return true;
	}
	exports.compareObjects = compareObjects;
	/**
	 * Find match of keyword in data.
	 *
	 * Comparison is case insensitive.
	 */
	function match(data, keyword) {
	    if (typeof data === 'number') {
	        data = '' + data;
	    }
	    if (typeof data === 'string') {
	        return data.toLowerCase().indexOf(keyword) !== -1;
	    }
	    if (typeof data !== 'object' || data === null) {
	        return false;
	    }
	    if (data instanceof Array) {
	        for (let i = 0; i < data.length; i++) {
	            if (match(data[i], keyword)) {
	                return true;
	            }
	        }
	        return false;
	    }
	    for (const key in data) {
	        if (match(data[key], keyword)) {
	            return true;
	        }
	    }
	    return false;
	}
	exports.match = match;

	});

	var config = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.customisedConfig = exports.createConfig = exports.mergeConfig = exports.setComponentsConfig = void 0;

	/**
	 * Default UI config
	 */
	const defaultUIConfig = {
	    // Number of icons per page.
	    itemsPerPage: 52,
	    // Maximum delay between changing current view and updating visible view.
	    // This delay is used to avoid "loading" page when changing views.
	    viewUpdateDelay: 300,
	    // Number of sibling collections to show when collection view is child view of collections list.
	    showSiblingCollections: 2,
	};
	/**
	 * Router config
	 */
	const defaultRouterConfig = {
	    // Home route as string, empty to automatically detect route
	    home: '',
	};
	/**
	 * Default configuration.
	 *
	 * 2 levels deep object:
	 * object[key][key2] = value
	 */
	const defaultConfig = {
	    // UI
	    ui: defaultUIConfig,
	    // Router
	    router: defaultRouterConfig,
	    // Components
	    components: {},
	};
	/**
	 * Set default components config
	 */
	function setComponentsConfig(config) {
	    defaultConfig.components = Object.assign(config);
	}
	exports.setComponentsConfig = setComponentsConfig;
	/**
	 * Merge data
	 */
	function mergeConfig(config, custom) {
	    for (const key in custom) {
	        const attr = key;
	        const configSource = config[attr];
	        if (configSource === void 0) {
	            continue;
	        }
	        // Merge objects
	        const customSource = custom[attr];
	        for (const key2 in customSource) {
	            const attr2 = key2;
	            if (configSource[attr2] !== void 0) {
	                // Overwrite entry
	                configSource[attr2] = customSource[attr2];
	            }
	        }
	    }
	}
	exports.mergeConfig = mergeConfig;
	/**
	 * Create configuration object
	 */
	function createConfig(customValues = {}) {
	    const config = objects.cloneObject(defaultConfig);
	    if (customValues) {
	        mergeConfig(config, customValues);
	    }
	    return config;
	}
	exports.createConfig = createConfig;
	/**
	 * Get customised configuration values
	 */
	function customisedConfig(config) {
	    const customised = {};
	    for (const key in config) {
	        const attr = key;
	        const defaultSource = defaultConfig[attr];
	        const configSource = config[attr];
	        const child = {};
	        let found = false;
	        for (const key2 in configSource) {
	            const attr2 = key2;
	            if (configSource[attr2] !== defaultSource[attr2]) {
	                child[attr2] = configSource[attr2];
	                found = true;
	            }
	        }
	        if (found) {
	            customised[attr] = child;
	        }
	    }
	    return customised;
	}
	exports.customisedConfig = customisedConfig;

	});

	var events = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Events = void 0;
	/**
	 * Events class
	 */
	class Events {
	    constructor() {
	        this._subscribers = Object.create(null);
	    }
	    /**
	     * Subscribe to event
	     *
	     * @param event Event name
	     * @param callback Callback function
	     * @param key Optional unique key for unsubscribe. If key is set, any other event listener with same key will be removed
	     */
	    subscribe(event, callback, key) {
	        if (this._subscribers[event] === void 0) {
	            // Create new array
	            this._subscribers[event] = [];
	        }
	        else if (typeof key === 'string') {
	            // Remove previous subscribers with same key
	            this._subscribers[event] = this._subscribers[event].filter((item) => item.key !== key);
	        }
	        // Add new subscriber
	        this._subscribers[event].push({
	            callback,
	            key,
	        });
	    }
	    /**
	     * Unsubscribe from event
	     *
	     * @param event Event name
	     * @param value Callback or key
	     */
	    unsubscribe(event, value) {
	        if (this._subscribers[event] === void 0) {
	            return;
	        }
	        let key;
	        switch (typeof value) {
	            case 'function':
	                key = 'callback';
	                break;
	            case 'string':
	                key = 'key';
	                break;
	            default:
	                return;
	        }
	        this._subscribers[event] = this._subscribers[event].filter((item) => item[key] !== value);
	    }
	    /**
	     * Check if event has listeners
	     *
	     * @param event Event name
	     */
	    hasListeners(event) {
	        return (this._subscribers[event] !== void 0 &&
	            this._subscribers[event].length > 0);
	    }
	    /**
	     * Fire event
	     *
	     * @param event Event name
	     * @param data Payload
	     * @param delay True if event should fire on next tick
	     */
	    fire(event, data, delay = false) {
	        if (!this.hasListeners(event)) {
	            return;
	        }
	        if (delay) {
	            setTimeout(() => {
	                this._fire(event, data);
	            });
	        }
	        else {
	            this._fire(event, data);
	        }
	    }
	    /**
	     * Fire event
	     *
	     * @param event
	     * @param data
	     */
	    _fire(event, data) {
	        this._subscribers[event].forEach((item) => {
	            item.callback(data, event);
	        });
	    }
	}
	exports.Events = Events;

	});

	var icon = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.iconToString = exports.compareIcons = exports.validateIcon = exports.stringToIcon = exports.match = void 0;
	/**
	 * Expression to test part of icon name.
	 */
	exports.match = /^[a-z0-9]+(-[a-z0-9]+)*$/;
	/**
	 * Convert string to Icon object.
	 */
	exports.stringToIcon = (value, provider = '') => {
	    const colonSeparated = value.split(':');
	    // Check for provider with correct '@' at start
	    if (value.slice(0, 1) === '@') {
	        // First part is provider
	        if (colonSeparated.length < 2 || colonSeparated.length > 3) {
	            // "@provider:prefix:name" or "@provider:prefix-name"
	            return null;
	        }
	        provider = colonSeparated.shift().slice(1);
	    }
	    // Check split by colon: "prefix:name", "provider:prefix:name"
	    if (colonSeparated.length > 3 || !colonSeparated.length) {
	        return null;
	    }
	    if (colonSeparated.length > 1) {
	        // "prefix:name"
	        const name = colonSeparated.pop();
	        const prefix = colonSeparated.pop();
	        return {
	            // Allow provider without '@': "provider:prefix:name"
	            provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
	            prefix,
	            name,
	        };
	    }
	    // Attempt to split by dash: "prefix-name"
	    const dashSeparated = colonSeparated[0].split('-');
	    if (dashSeparated.length > 1) {
	        return {
	            provider: provider,
	            prefix: dashSeparated.shift(),
	            name: dashSeparated.join('-'),
	        };
	    }
	    return null;
	};
	/**
	 * Check if icon is valid.
	 *
	 * This function is not part of stringToIcon because validation is not needed for most code.
	 */
	exports.validateIcon = (icon) => {
	    if (!icon) {
	        return false;
	    }
	    return !!((icon.provider === '' || icon.provider.match(exports.match)) &&
	        icon.prefix.match(exports.match) &&
	        icon.name.match(exports.match));
	};
	/**
	 * Compare Icon objects.
	 *
	 * Note: null means icon is invalid, so null to null comparison = false.
	 */
	exports.compareIcons = (icon1, icon2) => {
	    return (icon1 !== null &&
	        icon2 !== null &&
	        icon1.provider === icon2.provider &&
	        icon1.name === icon2.name &&
	        icon1.prefix === icon2.prefix);
	};
	/**
	 * Convert icon to string.
	 */
	exports.iconToString = (icon) => {
	    return ((icon.provider === '' ? '' : '@' + icon.provider + ':') +
	        icon.prefix +
	        ':' +
	        icon.name);
	};

	});

	var providers = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.listProviders = exports.addProvider = exports.getProvider = exports.convertProviderData = void 0;
	const iconify_1 = __importDefault(Iconify__default['default']);
	/**
	 * Default values
	 */
	const defaultAPIDataLinks = {
	    home: '',
	    collection: '',
	    icon: '',
	};
	const defaultAPIDataNPM = {
	    package: '',
	    icon: '',
	};
	const defaultAPIData = {
	    // These variables will be automatically set if empty
	    provider: '',
	    title: '',
	    api: '',
	    // Optional
	    links: defaultAPIDataLinks,
	    npm: defaultAPIDataNPM,
	};
	/**
	 * Local cache
	 */
	const sourceCache = Object.create(null);
	const configuredCache = Object.create(null);
	// Add default provider
	const iconifyRoot = 'https://iconify.design/icon-sets/';
	const iconifyPackage = '@iconify/icons-{prefix}';
	sourceCache[''] = {
	    config: {},
	    title: 'Iconify',
	    links: {
	        home: iconifyRoot,
	        collection: iconifyRoot + '{prefix}/',
	        icon: iconifyRoot + '{prefix}/{name}.html',
	    },
	    npm: {
	        package: iconifyPackage,
	        icon: iconifyPackage + '/{name}',
	    },
	};
	/**
	 * Defaults
	 */
	const defaults = {
	    title: '',
	    links: defaultAPIDataLinks,
	    npm: defaultAPIDataNPM,
	};
	/**
	 * Convert data returned from API
	 */
	function convertProviderData(host, raw) {
	    const provider = raw.provider;
	    if (typeof provider !== 'string' ||
	        // Allow empty string
	        (provider !== '' && !provider.match(icon.match))) {
	        return null;
	    }
	    // Clean up raw data
	    const data = {};
	    for (const key in defaultAPIData) {
	        const attr = key;
	        // Vars for npm/links
	        let defaultValue;
	        let resultValue;
	        switch (attr) {
	            case 'title':
	                data.title =
	                    typeof raw.title === 'string' ? raw.title : provider;
	                break;
	            case 'provider':
	                data.provider = provider;
	                break;
	            case 'api':
	                if (typeof raw.api === 'string' && raw.api !== '') {
	                    data.api = [raw.api];
	                }
	                else if (raw.api instanceof Array) {
	                    data.api = raw.api;
	                }
	                else if (host === '') {
	                    // Missing host
	                    return null;
	                }
	                else {
	                    data.api = [host];
	                }
	                break;
	            case 'npm':
	            case 'links':
	                defaultValue = defaultAPIData[attr];
	                if (typeof raw[attr] !== 'object' || !raw[attr]) {
	                    // Copy default value
	                    resultValue = defaultValue;
	                }
	                else {
	                    const rawValue = raw[attr];
	                    // Merge values
	                    resultValue = {};
	                    for (const nestedKey in defaultValue) {
	                        const nestedAttr = nestedKey;
	                        if (typeof rawValue[nestedAttr] === 'string') {
	                            resultValue[nestedAttr] = rawValue[nestedAttr];
	                        }
	                        else {
	                            resultValue[nestedAttr] = defaultValue[nestedAttr];
	                        }
	                    }
	                }
	                data[attr] = resultValue;
	                break;
	        }
	    }
	    const fullData = data;
	    // Create API config
	    const config = {
	        resources: fullData.api,
	    };
	    // Create data
	    const result = {
	        config,
	        title: fullData.title,
	        links: fullData.links,
	        npm: fullData.npm,
	    };
	    return result;
	}
	exports.convertProviderData = convertProviderData;
	/**
	 * Get API provider
	 */
	function getProvider(provider) {
	    if (configuredCache[provider] === void 0) {
	        if (sourceCache[provider] === void 0) {
	            // Missing provider
	            return null;
	        }
	        const source = sourceCache[provider];
	        // Get Redundancy instance from Iconify
	        const data = iconify_1.default._internal.getAPI(provider);
	        if (data === void 0) {
	            // Failed again - something is wrong with config
	            configuredCache[provider] = null;
	        }
	        else {
	            configuredCache[provider] = {
	                config: data.config,
	                redundancy: data.redundancy,
	            };
	            // Add missing fields
	            const cache = configuredCache[provider];
	            const src = source;
	            for (const key in defaults) {
	                if (src[key] !== void 0) {
	                    cache[key] = src[key];
	                }
	                else {
	                    cache[key] = defaults[key];
	                }
	            }
	        }
	    }
	    return configuredCache[provider];
	}
	exports.getProvider = getProvider;
	/**
	 * Add provider
	 */
	function addProvider(provider, config) {
	    if (sourceCache[provider] !== void 0) {
	        // Cannot overwrite provider
	        return;
	    }
	    if (config.title === void 0) {
	        // Use provider as name
	        config.title = provider;
	    }
	    sourceCache[provider] = config;
	    iconify_1.default.addAPIProvider(provider, config.config);
	}
	exports.addProvider = addProvider;
	/**
	 * Get all providers
	 */
	function listProviders() {
	    return Object.keys(sourceCache).sort();
	}
	exports.listProviders = listProviders;

	});

	var base = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BaseAPI = exports.mergeQuery = void 0;

	/**
	 * Add parameters to query
	 */
	function mergeQuery(base, params) {
	    let result = base, hasParams = result.indexOf('?') !== -1;
	    /**
	     * Convertion of parameters to string, only allows simple types used by Iconify API
	     */
	    function paramToString(value, nested) {
	        switch (typeof value) {
	            case 'boolean':
	                if (nested) {
	                    throw new Error('Nested boolean items are not allowed');
	                }
	                return value ? 'true' : 'false';
	            case 'number':
	                return encodeURIComponent(value);
	            case 'string':
	                return encodeURIComponent(value);
	            case 'object':
	                if (nested) {
	                    throw new Error('Nested objects are not allowed');
	                }
	                if (value instanceof Array) {
	                    return value
	                        .map((item) => paramToString(item, true))
	                        .join(',');
	                }
	                throw new Error('Objects are not allowed');
	            default:
	                throw new Error('Invalid type');
	        }
	    }
	    Object.keys(params).forEach((key) => {
	        let value;
	        try {
	            value = paramToString(params[key], false);
	        }
	        catch (err) {
	            return;
	        }
	        result +=
	            (hasParams ? '&' : '?') + encodeURIComponent(key) + '=' + value;
	        hasParams = true;
	    });
	    return result;
	}
	exports.mergeQuery = mergeQuery;
	/**
	 * Base API class
	 */
	class BaseAPI {
	    /**
	     * Constructor
	     *
	     * @param registry
	     */
	    constructor(registry) {
	        // Provider specific cache
	        this._cache = Object.create(null);
	        this._registry = registry;
	        this._query = this._query.bind(this);
	    }
	    /**
	     * Send query
	     *
	     * @param provider Provider
	     * @param endpoint End point string
	     * @param params Query parameters as object
	     * @param callback Callback to call when data is available
	     */
	    query(provider, endpoint, params, callback, ignoreCache = false) {
	        const uri = mergeQuery(endpoint, params);
	        // Check for cache
	        if (this._cache[provider] === void 0) {
	            this._cache[provider] = Object.create(null);
	        }
	        const providerCache = this._cache[provider];
	        if (!ignoreCache && providerCache[uri] !== void 0) {
	            // Return cached data on next tick
	            setTimeout(() => {
	                const cached = providerCache[uri];
	                callback(cached === null ? null : JSON.parse(cached), true);
	            });
	            return;
	        }
	        // Init redundancy
	        const redundancy = this._getRedundancy(provider);
	        if (!redundancy) {
	            // Error
	            setTimeout(() => {
	                callback(null, false);
	            });
	            return;
	        }
	        // Send query
	        const query = redundancy.find((item) => {
	            const status = item();
	            return status.status === 'pending' && status.payload === uri;
	        });
	        if (query !== null) {
	            // Attach callback to existing query
	            query().subscribe((data) => {
	                callback(data, false);
	            });
	            return;
	        }
	        // Create new query. Query will start on next tick, so no need to set timeout
	        redundancy.query(uri, this._query.bind(this, provider), (data) => {
	            callback(data, false);
	        });
	    }
	    /**
	     * Check if query is cached
	     */
	    isCached(provider, endpoint, params) {
	        const uri = mergeQuery(endpoint, params);
	        return (this._cache[provider] !== void 0 &&
	            this._cache[provider][uri] !== void 0);
	    }
	    /**
	     * Check if query is pending
	     */
	    isPending(provider, endpoint, params) {
	        // Init redundancy
	        const redundancy = this._getRedundancy(provider);
	        if (!redundancy) {
	            // Error
	            return false;
	        }
	        const uri = mergeQuery(endpoint, params);
	        const query = redundancy.find((item) => {
	            const status = item();
	            return status.status === 'pending' && status.payload === uri;
	        });
	        return query !== null;
	    }
	    /**
	     * Send query, callback from Redundancy
	     */
	    _query(provider, host, params, status) {
	        // Should be implemented by child classes
	        throw new Error('_query() should not be called on base API class');
	    }
	    /**
	     * Store cached data
	     */
	    _storeCache(provider, params, data) {
	        if (this._cache[provider] === void 0) {
	            this._cache[provider] = Object.create(null);
	        }
	        this._cache[provider][params] =
	            data === null ? null : JSON.stringify(data);
	    }
	    /**
	     * Clear all cache
	     */
	    clearCache() {
	        this._cache = Object.create(null);
	    }
	    /**
	     * Get Redundancy instance
	     */
	    _getRedundancy(provider) {
	        // Init redundancy
	        const providerData = providers.getProvider(provider);
	        if (!providerData) {
	            // Error
	            return null;
	        }
	        return providerData.redundancy;
	    }
	}
	exports.BaseAPI = BaseAPI;

	});

	var fetch_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.API = void 0;

	/**
	 * API class
	 */
	class API extends base.BaseAPI {
	    /**
	     * Send API query without provider
	     *
	     * @param host Host string
	     * @param params End point and parameters as string
	     * @param callback Callback
	     */
	    sendQuery(host, params, callback) {
	        fetch(host + params)
	            .then((response) => {
	            if (response.status === 404) {
	                // Not found. Should be called in error handler
	                callback('not_found', null);
	                return;
	            }
	            if (response.status !== 200) {
	                callback('error', null);
	                return;
	            }
	            return response.json();
	        })
	            .then((data) => {
	            if (typeof data !== 'object' || data === null) {
	                callback('error', null);
	                return;
	            }
	            // Store cache and complete
	            callback('success', data);
	        })
	            .catch(() => {
	            callback('error', null);
	        });
	    }
	    /**
	     * Send query, callback from Redundancy
	     *
	     * @param provider Provider string
	     * @param host Host string
	     * @param params End point and parameters as string
	     * @param status Query status
	     */
	    _query(provider, host, params, status) {
	        // console.log('API request: ' + host + params);
	        this.sendQuery(host, params, (response, data) => {
	            switch (response) {
	                case 'success':
	                case 'not_found':
	                    this._storeCache(provider, params, data);
	                    status.done(data);
	            }
	        });
	    }
	}
	exports.API = API;

	});

	var storage = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getRegistry = exports.destroyRegistry = exports.getSharedData = exports.saveRegistry = exports.addRegistry = exports.uniqueId = void 0;
	const namespaces = Object.create(null);
	const registry = Object.create(null);
	/**
	 * Get unique id
	 */
	function uniqueId(namespace) {
	    let counter = 0, id;
	    while (registry[(id = namespace + counter)] !== void 0) {
	        counter++;
	    }
	    return id;
	}
	exports.uniqueId = uniqueId;
	/**
	 * Add registry to storage
	 */
	function addRegistry(registry) {
	    const namespace = registry.namespace, id = registry.id;
	    if (namespaces[namespace] === void 0) {
	        namespaces[namespace] = {
	            ids: [id],
	            data: Object.create(null),
	        };
	        return true;
	    }
	    namespaces[namespace].ids.push(id);
	    return false;
	}
	exports.addRegistry = addRegistry;
	/**
	 * Save registry
	 */
	function saveRegistry(item) {
	    registry[item.id] = item;
	}
	exports.saveRegistry = saveRegistry;
	/**
	 * Get shared data
	 */
	function getSharedData(namespace) {
	    return namespaces[namespace].data;
	}
	exports.getSharedData = getSharedData;
	/**
	 * Delete registry entries
	 */
	function destroyRegistry(item) {
	    if (registry[item.id] === void 0) {
	        return;
	    }
	    // Delete registry from index
	    delete registry[item.id];
	    // Remove id from shared namespaces
	    namespaces[item.namespace].ids = namespaces[item.namespace].ids.filter((id) => id !== item.id);
	}
	exports.destroyRegistry = destroyRegistry;
	/**
	 * Get Registry instance for id.
	 *
	 * This is used to pass registry as constant string in React/Svelte, so changes in Registry instance won't trigger refresh of entire UI.
	 */
	exports.getRegistry = (id) => registry[id];

	});

	var defaults = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.emptyRouteMinimum = exports.customRouteMinimum = exports.searchRouteMinimum = exports.collectionRouteMinimum = exports.collectionsRouteMinimum = exports.emptyRouteDefaults = exports.customRouteDefaults = exports.searchRouteDefaults = exports.collectionRouteDefaults = exports.collectionsRouteDefaults = void 0;
	/**
	 * Default values for route parameters
	 */
	exports.collectionsRouteDefaults = {
	    provider: '',
	    filter: '',
	    category: null,
	};
	exports.collectionRouteDefaults = {
	    provider: '',
	    prefix: '',
	    filter: '',
	    page: 0,
	    tag: null,
	    themePrefix: null,
	    themeSuffix: null,
	};
	exports.searchRouteDefaults = {
	    provider: '',
	    search: '',
	    short: true,
	    page: 0,
	};
	exports.customRouteDefaults = {
	    customType: '',
	    filter: '',
	    page: 0,
	};
	exports.emptyRouteDefaults = {};
	/**
	 * Partial default values, used to validate parameters in partial routes
	 */
	exports.collectionsRouteMinimum = {};
	exports.collectionRouteMinimum = {
	    prefix: '',
	};
	exports.searchRouteMinimum = {
	    search: '',
	};
	exports.customRouteMinimum = {
	    customType: '',
	};
	exports.emptyRouteMinimum = {};

	});

	var convert = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.objectToRoute = exports.objectToRouteParams = exports.routeToObject = exports.routeParamsToObject = void 0;
	/**
	 * Get required and default values
	 */
	function getValues(type) {
	    let defaults$1;
	    let required;
	    switch (type) {
	        case 'collections':
	            defaults$1 = defaults.collectionsRouteDefaults;
	            required = defaults.collectionsRouteMinimum;
	            break;
	        case 'collection':
	            defaults$1 = defaults.collectionRouteDefaults;
	            required = defaults.collectionRouteMinimum;
	            break;
	        case 'search':
	            defaults$1 = defaults.searchRouteDefaults;
	            required = defaults.searchRouteMinimum;
	            break;
	        case 'custom':
	            defaults$1 = defaults.customRouteDefaults;
	            required = defaults.customRouteMinimum;
	            break;
	        case 'empty':
	            defaults$1 = defaults.emptyRouteDefaults;
	            required = defaults.emptyRouteMinimum;
	            break;
	        default:
	            throw new Error(`Unknown route type: ${type}`);
	    }
	    return {
	        defaults: defaults$1,
	        required,
	    };
	}
	/**
	 * Remove default values from route
	 */
	exports.routeParamsToObject = (type, params) => {
	    const result = {};
	    const { defaults, required } = getValues(type);
	    for (const key in defaults) {
	        const value = params[key];
	        if (
	        // Save value if it is required
	        required[key] !== void 0 ||
	            // Save value if it is different
	            value !== defaults[key]) {
	            result[key] = value;
	        }
	    }
	    return result;
	};
	/**
	 * Convert route to object for export, ignoring default values
	 */
	exports.routeToObject = (route) => {
	    const result = {
	        type: route.type,
	    };
	    const params = exports.routeParamsToObject(route.type, route.params);
	    if (Object.keys(params).length > 0) {
	        result.params = params;
	    }
	    if (route.parent) {
	        const parent = exports.routeToObject(route.parent);
	        if (parent) {
	            result.parent = parent;
	        }
	    }
	    return result;
	};
	/**
	 * List of parameters to change to lower case
	 */
	const toLowerCaseStrings = ['filter', 'search', 'provider'];
	/**
	 * Convert object to RouteParams
	 */
	exports.objectToRouteParams = (type, params) => {
	    const result = {};
	    const { defaults, required } = getValues(type);
	    // Check for required properties
	    for (const key in required) {
	        if (typeof params[key] !== typeof required[key] ||
	            params[key] === required[key]) {
	            // Cannot have different type or empty value
	            throw new Error(`Missing required route parameter "${key}" in objectToRouteParams()`);
	        }
	    }
	    // Copy all values
	    for (const key in defaults) {
	        const defaultValue = defaults[key];
	        if (params[key] === void 0) {
	            // Use default
	            result[key] = defaultValue;
	            continue;
	        }
	        let value = params[key];
	        const allowedType = defaultValue === null ? 'string' : typeof defaultValue;
	        if (typeof value === allowedType) {
	            // Matching type
	            if (allowedType === 'string' &&
	                toLowerCaseStrings.indexOf(key) !== -1) {
	                // Change to lower case
	                value = value.toLowerCase();
	            }
	            result[key] = value;
	            continue;
	        }
	        // Invalid value
	        result[key] = defaultValue;
	    }
	    return result;
	};
	/**
	 * Convert object to Route, adding missing values
	 */
	exports.objectToRoute = (data, defaultRoute = null) => {
	    // Check for valid object
	    if (data === null ||
	        typeof data !== 'object' ||
	        typeof data.type !== 'string') {
	        return defaultRoute;
	    }
	    // Check if route is valid
	    const type = data.type;
	    switch (type) {
	        case 'collections':
	        case 'collection':
	        case 'custom':
	        case 'search':
	        case 'empty':
	            break;
	        default:
	            return defaultRoute;
	    }
	    // Get parameters
	    let params;
	    try {
	        params = exports.objectToRouteParams(type, typeof data.params === 'object'
	            ? data.params
	            : {});
	    }
	    catch (err) {
	        return defaultRoute;
	    }
	    // Get parent
	    let parent = null;
	    if (typeof data.parent === 'object' && data.parent !== null) {
	        parent = exports.objectToRoute(data.parent, null);
	        if (parent === null) {
	            // Error in child route
	            return defaultRoute;
	        }
	    }
	    // Return result
	    return {
	        type,
	        params,
	        parent,
	    };
	};

	});

	var base$1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BaseView = void 0;


	/**
	 * Base view class
	 */
	class BaseView {
	    constructor() {
	        this.type = '';
	        this.parent = null;
	        this.updating = false;
	        this.error = '';
	        this.blocksRequireUpdate = true;
	        // Loading status
	        this.loading = true;
	        this._loadingTimer = null;
	        this._alreadyLoaded = false;
	        this._startedLoading = false;
	        // Loading control: waiting for parent view
	        this.onLoad = null;
	        this._mustWaitForParent = false;
	    }
	    /**
	     * Change parent view
	     */
	    _parentAction(value) {
	        if (this.parent === null) {
	            return;
	        }
	        const levels = typeof value === 'number' && value > 0 ? value : 1;
	        const registry = storage.getRegistry(this._instance);
	        const router = registry.router;
	        router.setParentView(levels);
	    }
	    /**
	     * Change provider
	     */
	    _providerAction(value) {
	        if (typeof value !== 'string') {
	            return;
	        }
	        const providerData = providers.getProvider(value);
	        if (!providerData) {
	            return;
	        }
	        const registry = storage.getRegistry(this._instance);
	        const router = registry.router;
	        router.home(value);
	    }
	    /**
	     * Start loading
	     */
	    startLoading() {
	        if (this._startedLoading) {
	            return;
	        }
	        // Already loaded somehow (by setting data directly)
	        if (!this.loading) {
	            this._startedLoading = true;
	            return;
	        }
	        // Start loading
	        if (this._mustWaitForParent && this.parent !== null) {
	            this.parent.startLoading();
	        }
	        this._startLoading();
	    }
	    _startLoading() {
	        throw new Error('startLoading should not be called on base view');
	    }
	    /**
	     * Search action
	     */
	    _searchAction(provider, value) {
	        if (typeof value !== 'string' || value.trim() === '') {
	            return;
	        }
	        const keyword = value.trim().toLowerCase();
	        // Check for collections
	        let view = this;
	        let levels = 0;
	        while (view.type !== 'collections') {
	            if (view.parent === null) {
	                return;
	            }
	            view = view.parent;
	            levels++;
	        }
	        // Apply action to collections
	        const registry = storage.getRegistry(this._instance);
	        const router = registry.router;
	        router.createChildView({
	            type: 'search',
	            params: {
	                provider,
	                search: keyword,
	            },
	        }, levels);
	    }
	    /**
	     * Load data from API
	     */
	    _loadAPI(provider, query, params) {
	        const registry = storage.getRegistry(this._instance);
	        const providerData = providers.getProvider(provider);
	        const configAPIData = providerData ? providerData.config : null;
	        const api = registry.api;
	        // Calculate and create timer
	        let timeout = 0;
	        if (configAPIData &&
	            typeof configAPIData.rotate === 'number' &&
	            typeof configAPIData.timeout === 'number' &&
	            typeof configAPIData.limit === 'number' &&
	            configAPIData.limit > 0) {
	            // Calculate maximum possible timeout per one rotation
	            timeout =
	                configAPIData.timeout +
	                    configAPIData.rotate *
	                        (configAPIData.resources.length - 1);
	            timeout *= configAPIData.limit;
	        }
	        if (timeout > 0) {
	            this._loadingTimer = setTimeout(() => {
	                if (this._loadingTimer !== null) {
	                    clearTimeout(this._loadingTimer);
	                    this._loadingTimer = null;
	                }
	                if (this.loading && this.error === '') {
	                    this.error = 'timeout';
	                    this.loading = false;
	                    this._triggerLoaded();
	                }
	            }, timeout);
	        }
	        // Send query
	        api.query(provider, query, params, (data) => {
	            // Clear timeout
	            if (this._loadingTimer !== null) {
	                clearTimeout(this._loadingTimer);
	                this._loadingTimer = null;
	            }
	            if (data === null || !this._mustWaitForParent) {
	                // Parse immediately
	                this._parseAPIData(data);
	                return;
	            }
	            // Parse data after parent view has finished loading
	            this._waitForParent(() => {
	                this._parseAPIData(data);
	            });
	        });
	    }
	    /**
	     * Wait for parent view to load
	     */
	    _waitForParent(callback) {
	        if (!this._mustWaitForParent ||
	            this.parent === null ||
	            !this.parent.loading) {
	            callback();
	            return;
	        }
	        // Wait for parent
	        this.parent.onLoad = callback;
	    }
	    /**
	     * Parse data from API
	     *
	     * Should be overwritten by child classes
	     */
	    // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-unused-vars
	    _parseAPIData(data) {
	        throw new Error('_parseAPIData should not be called on base view');
	    }
	    /**
	     * Send event when view has been loaded
	     *
	     * Can be sent synchronously
	     */
	    _triggerLoaded() {
	        if (this._alreadyLoaded) {
	            // Do not trigger event twice
	            this._triggerUpdated();
	            return;
	        }
	        this._alreadyLoaded = true;
	        const registry = storage.getRegistry(this._instance);
	        const events = registry.events;
	        events.fire('view-loaded', this);
	        // Trigger onLoad event for child view
	        if (this.onLoad !== null) {
	            const onLoad = this.onLoad;
	            this.onLoad = null;
	            onLoad();
	        }
	    }
	    /**
	     * Send event when view has been updated
	     *
	     * Must be sent asynchronously to consume multiple updates
	     */
	    _triggerUpdated() {
	        if (!this.updating) {
	            this.updating = true;
	            setTimeout(() => {
	                this.updating = false;
	                const registry = storage.getRegistry(this._instance);
	                const events = registry.events;
	                events.fire('view-updated', this);
	            });
	        }
	    }
	}
	exports.BaseView = BaseView;

	});

	var collectionsFilter = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isCollectionsFilterBlockEmpty = exports.defaultCollectionsFilterBlock = void 0;
	/**
	 * Default block values
	 */
	exports.defaultCollectionsFilterBlock = () => {
	    return {
	        type: 'collections-filter',
	        keyword: '',
	    };
	};
	/**
	 * Check if block is empty
	 */
	function isCollectionsFilterBlockEmpty(block) {
	    return block === void 0 || block === null || block.keyword.trim() === '';
	}
	exports.isCollectionsFilterBlockEmpty = isCollectionsFilterBlockEmpty;

	});

	var collection = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.rawDataToCollection = exports.dataToCollection = exports.dataToCollectionInfo = void 0;
	const minDisplayHeight = 16;
	const maxDisplayHeight = 24;
	/**
	 * Convert data from API to CollectionInfo
	 */
	function dataToCollectionInfo(data, expectedPrefix = '') {
	    if (typeof data !== 'object' || data === null) {
	        return null;
	    }
	    const source = data;
	    const getSourceNestedString = (field, key, defaultValue = '') => {
	        if (typeof source[field] !== 'object') {
	            return defaultValue;
	        }
	        const obj = source[field];
	        return typeof obj[key] === 'string' ? obj[key] : defaultValue;
	    };
	    // Get name
	    let name;
	    if (typeof source.name === 'string') {
	        name = source.name;
	    }
	    else if (typeof source.title === 'string') {
	        name = source.title;
	    }
	    else {
	        return null;
	    }
	    // Get prefix
	    let prefix;
	    if (expectedPrefix === '') {
	        if (typeof source.prefix !== 'string') {
	            return null;
	        }
	        prefix = source.prefix;
	    }
	    else {
	        if (typeof source.prefix === 'string' &&
	            source.prefix !== expectedPrefix) {
	            // Prefixes do not match
	            return null;
	        }
	        prefix = expectedPrefix;
	    }
	    // Generate data
	    const result = {
	        prefix: prefix,
	        name: name,
	        total: typeof source.total === 'number' ? source.total : 0,
	        version: typeof source.version === 'string' ? source.version : '',
	        author: {
	            name: getSourceNestedString('author', 'name', typeof source.author === 'string' ? source.author : 'Unknown'),
	            url: getSourceNestedString('author', 'url', ''),
	        },
	        license: {
	            title: getSourceNestedString('license', 'title', typeof source.license === 'string' ? source.license : 'Unknown'),
	            spdx: getSourceNestedString('license', 'spdx', ''),
	            url: getSourceNestedString('license', 'url', ''),
	        },
	        samples: [],
	        category: typeof source.category === 'string' ? source.category : '',
	        palette: typeof source.palette === 'boolean' ? source.palette : false,
	    };
	    // Total as string
	    if (typeof source.total === 'string') {
	        const num = parseInt(source.total);
	        if (num > 0) {
	            result.total = num;
	        }
	    }
	    // Add samples
	    if (source.samples instanceof Array) {
	        source.samples.forEach((item) => {
	            if (result.samples.length < 3 && typeof item === 'string') {
	                result.samples.push(item);
	            }
	        });
	    }
	    // Add height
	    if (typeof source.height === 'number' ||
	        typeof source.height === 'string') {
	        const num = parseInt(source.height);
	        if (num > 0) {
	            result.height = num;
	        }
	    }
	    if (source.height instanceof Array) {
	        source.height.forEach((item) => {
	            const num = parseInt(item);
	            if (num > 0) {
	                if (!(result.height instanceof Array)) {
	                    result.height = [];
	                }
	                result.height.push(num);
	            }
	        });
	        switch (result.height.length) {
	            case 0:
	                delete result.height;
	                break;
	            case 1:
	                result.height = result.height[0];
	        }
	    }
	    // Add display height
	    if (typeof result.height === 'number') {
	        // Convert from height
	        result.displayHeight = result.height;
	        while (result.displayHeight < minDisplayHeight) {
	            result.displayHeight *= 2;
	        }
	        while (result.displayHeight > maxDisplayHeight) {
	            result.displayHeight /= 2;
	        }
	        if (result.displayHeight !== Math.round(result.displayHeight) ||
	            result.displayHeight < minDisplayHeight ||
	            result.displayHeight > maxDisplayHeight) {
	            delete result.displayHeight;
	        }
	    }
	    if (typeof source.displayHeight === 'number' ||
	        typeof source.displayHeight === 'string') {
	        // Convert from source.displayHeight
	        const num = parseInt(source.displayHeight);
	        if (num >= minDisplayHeight &&
	            num <= maxDisplayHeight &&
	            Math.round(num) === num) {
	            result.displayHeight = num;
	        }
	    }
	    // Convert palette from string value
	    if (typeof source.palette === 'string') {
	        switch (source.palette.toLowerCase()) {
	            case 'colorless': // Iconify v1
	            case 'false': // Boolean as string
	                result.palette = false;
	                break;
	            case 'colorful': // Iconify v1
	            case 'true': // Boolean as string
	                result.palette = true;
	        }
	    }
	    // Parse all old keys
	    Object.keys(source).forEach((key) => {
	        const value = source[key];
	        if (typeof value !== 'string') {
	            return;
	        }
	        switch (key) {
	            case 'url':
	            case 'uri':
	                result.author.url = value;
	                break;
	            case 'licenseURL':
	            case 'licenseURI':
	                result.license.url = value;
	                break;
	            case 'licenseID':
	            case 'licenseSPDX':
	                result.license.spdx = value;
	                break;
	        }
	    });
	    return result;
	}
	exports.dataToCollectionInfo = dataToCollectionInfo;
	/**
	 * Parse themes
	 */
	function parseThemes(iconSet, sortedIcons, result) {
	    const data = {
	        prefix: {
	            hasEmpty: false,
	            hasUncategorized: false,
	            values: [],
	            titles: Object.create(null),
	            found: Object.create(null),
	            test: (name, test) => name.slice(0, test.length) === test,
	        },
	        suffix: {
	            hasEmpty: false,
	            hasUncategorized: false,
	            values: [],
	            titles: Object.create(null),
	            found: Object.create(null),
	            test: (name, test) => name.slice(0 - test.length) === test,
	        },
	    };
	    const keys = ['prefix', 'suffix'];
	    // Converted icon set data, using ThemeType as key, new theme format as value
	    const iconSetData = {
	        prefix: null,
	        suffix: null,
	    };
	    // Convert legacy format
	    if (typeof iconSet.themes === 'object' && iconSet.themes) {
	        const themes = iconSet.themes;
	        Object.keys(themes).forEach((key) => {
	            const theme = themes[key];
	            keys.forEach((attr) => {
	                const prop = attr;
	                if (typeof theme[prop] === 'string') {
	                    // Has prefix or suffix
	                    const value = theme[prop];
	                    if (iconSetData[attr] === null) {
	                        iconSetData[attr] = Object.create(null);
	                    }
	                    iconSetData[attr][value] = theme.title;
	                }
	            });
	        });
	    }
	    // Check themes
	    keys.forEach((key) => {
	        const attr = (key + 'es');
	        if (typeof iconSet[attr] === 'object' && iconSet[attr] !== null) {
	            // Prefixes or suffixes exist: overwrite old entry
	            iconSetData[key] = iconSet[attr];
	        }
	        if (!iconSetData[key]) {
	            // No prefix or suffix? Delete entry in data
	            delete data[key];
	            return;
	        }
	        // Validate themes
	        const dataItem = data[key];
	        const theme = iconSetData[key];
	        Object.keys(theme).forEach((value) => {
	            const title = theme[value];
	            if (value !== '') {
	                // Check for '-' at start or end
	                switch (key) {
	                    case 'prefix':
	                        if (value.slice(-1) !== '-') {
	                            value += '-';
	                        }
	                        break;
	                    case 'suffix':
	                        if (value.slice(0, 1) !== '-') {
	                            value = '-' + value;
	                        }
	                        break;
	                }
	            }
	            if (dataItem.titles[value] !== void 0) {
	                // Duplicate entry
	                return;
	            }
	            // Add value
	            if (value === '') {
	                dataItem.hasEmpty = true;
	            }
	            else {
	                dataItem.values.push(value);
	            }
	            // Set data
	            dataItem.titles[value] = title;
	            dataItem.found[value] = 0;
	        });
	        // Check if theme is empty
	        if (!Object.keys(dataItem.titles).length) {
	            delete data[key];
	        }
	    });
	    // Check stuff
	    Object.keys(data).forEach((attr) => {
	        const dataItem = data[attr];
	        const matches = dataItem.values;
	        const iconKey = attr === 'prefix' ? 'themePrefixes' : 'themeSuffixes';
	        // Sort matches by length, then alphabetically
	        matches.sort((a, b) => a.length === b.length ? a.localeCompare(b) : b.length - a.length);
	        // Check all icons
	        sortedIcons.forEach((icon) => {
	            // Check icon
	            (icon.aliases
	                ? [icon.name].concat(icon.aliases)
	                : [icon.name]).forEach((name, index) => {
	                // Find match
	                let theme = null;
	                for (let i = 0; i < matches.length; i++) {
	                    const match = matches[i];
	                    if (dataItem.test(name, match)) {
	                        // Found matching theme
	                        dataItem.found[match]++;
	                        theme = match;
	                        break;
	                    }
	                }
	                if (theme === null && dataItem.hasEmpty && !index) {
	                    // Empty prefix/suffix, but do not test aliases
	                    theme = '';
	                    dataItem.found['']++;
	                }
	                // Get title
	                const title = theme === null ? '' : dataItem.titles[theme];
	                // Not found
	                if (theme === null) {
	                    if (index > 0) {
	                        return;
	                    }
	                    // Uncategorized
	                    dataItem.hasUncategorized = true;
	                    theme = '';
	                }
	                // Found
	                if (icon[iconKey] === void 0) {
	                    icon[iconKey] = [title];
	                    return;
	                }
	                const titles = icon[iconKey];
	                if (titles.indexOf(title) === -1) {
	                    titles.push(title);
	                }
	            });
	        });
	        // Add result
	        const titles = [];
	        Object.keys(dataItem.titles).forEach((match) => {
	            if (dataItem.found[match]) {
	                titles.push(dataItem.titles[match]);
	            }
	        });
	        if (dataItem.hasUncategorized) {
	            titles.push('');
	        }
	        switch (titles.length) {
	            case 0:
	                // Nothing to do
	                break;
	            case 1:
	                // 1 theme: remove all entries
	                sortedIcons.forEach((icon) => {
	                    delete icon[iconKey];
	                });
	                break;
	            default:
	                // Many entries
	                result[iconKey] = titles;
	        }
	    });
	}
	/**
	 * Parse characters map
	 */
	function parseChars(chars, icons) {
	    Object.keys(chars).forEach((char) => {
	        const name = chars[char];
	        if (icons[name] !== void 0) {
	            const icon = icons[name];
	            if (icon.chars === void 0) {
	                icon.chars = [];
	            }
	            icon.chars.push(char);
	        }
	    });
	}
	/**
	 * Convert icons to sorted array
	 */
	function sortIcons(icons) {
	    const sortedIcons = [];
	    Object.keys(icons)
	        .sort((a, b) => a.localeCompare(b))
	        .forEach((name) => {
	        sortedIcons.push(icons[name]);
	    });
	    return sortedIcons;
	}
	/**
	 * Convert collection data
	 */
	function dataToCollection(provider, data) {
	    if (typeof data !== 'object' || data === null) {
	        return null;
	    }
	    const source = data;
	    // Check required fields
	    if (typeof source.prefix !== 'string') {
	        return null;
	    }
	    // Create result
	    const result = {
	        provider,
	        prefix: source.prefix,
	        name: '',
	        total: 0,
	        icons: [],
	    };
	    // Get info
	    if (typeof source.info === 'object' && source.info !== null) {
	        const info = dataToCollectionInfo(source.info, result.prefix);
	        if (info === null) {
	            // Invalid info block, so something is wrong
	            return null;
	        }
	        result.info = info;
	    }
	    // Get collection name
	    if (typeof source.name === 'string') {
	        result.name = source.name;
	    }
	    else if (typeof source.title === 'string') {
	        // Correct API response
	        result.name = source.title;
	    }
	    else if (result.info !== void 0) {
	        result.name = result.info.name;
	    }
	    else {
	        return null;
	    }
	    // Check for categories
	    let tags = typeof source.categories === 'object' && source.categories !== null
	        ? Object.keys(source.categories)
	        : [];
	    let hasUncategorised = false, uncategorisedKey = 'uncategorized';
	    ['uncategorized', 'uncategorised'].forEach((attr) => {
	        if (typeof source[attr] === 'object' &&
	            source[attr] instanceof Array &&
	            source[attr].length > 0) {
	            uncategorisedKey = attr;
	            hasUncategorised = true;
	        }
	    });
	    // Find all icons
	    const icons = Object.create(null);
	    function addCategory(iconsList, category) {
	        let added = false;
	        iconsList.forEach((name) => {
	            if (typeof name !== 'string') {
	                return;
	            }
	            added = true;
	            if (icons[name] === void 0) {
	                // Add new icon
	                const icon = {
	                    provider,
	                    prefix: result.prefix,
	                    name,
	                    tags: [category],
	                };
	                icons[name] = icon;
	                return;
	            }
	            // Add tag to existing icon
	            if (icons[name].tags === void 0) {
	                icons[name].tags = [];
	            }
	            if (icons[name].tags.indexOf(category) === -1) {
	                icons[name].tags.push(category);
	            }
	        });
	        return added;
	    }
	    tags = tags.filter((category) => {
	        let added = false;
	        const categoryItems = source.categories[category];
	        if (categoryItems instanceof Array) {
	            added = addCategory(categoryItems, category);
	        }
	        else {
	            Object.keys(categoryItems).forEach((subcategory) => {
	                const subcategoryItems = categoryItems[subcategory];
	                if (subcategoryItems instanceof Array) {
	                    added = addCategory(subcategoryItems, category) || added;
	                }
	            });
	        }
	        return added;
	    });
	    const hasTags = tags.length > 0;
	    // Add uncategorised icons
	    if (hasUncategorised) {
	        const list = source[uncategorisedKey];
	        list.forEach((name) => {
	            if (typeof name !== 'string') {
	                return;
	            }
	            if (icons[name] === void 0) {
	                // Add new icon
	                const icon = {
	                    provider,
	                    prefix: result.prefix,
	                    name: name,
	                };
	                if (hasTags) {
	                    icon.tags = [''];
	                }
	                icons[name] = icon;
	                return;
	            }
	        });
	        if (hasTags) {
	            tags.push('');
	        }
	    }
	    // Add characters
	    if (typeof source.chars === 'object') {
	        parseChars(source.chars, icons);
	    }
	    // Add aliases
	    if (typeof source.aliases === 'object') {
	        const aliases = source.aliases;
	        Object.keys(aliases).forEach((alias) => {
	            const name = aliases[alias];
	            if (icons[name] !== void 0) {
	                const icon = icons[name];
	                if (icon.aliases === void 0) {
	                    icon.aliases = [];
	                }
	                icon.aliases.push(alias);
	            }
	        });
	    }
	    // Convert to sorted array
	    const sortedIcons = sortIcons(icons);
	    // Check tags
	    if (tags.length > 1) {
	        result.tags = tags.sort(sortTags);
	    }
	    else if (hasTags) {
	        // Only one tag - delete tags
	        sortedIcons.forEach((icon) => {
	            delete icon.tags;
	        });
	    }
	    // Add themes
	    parseThemes(source, sortedIcons, result);
	    // Add icons
	    result.icons = sortedIcons;
	    result.total = result.icons.length;
	    if (result.info) {
	        result.info.total = result.total;
	    }
	    return result;
	}
	exports.dataToCollection = dataToCollection;
	/**
	 * Convert raw data from icon set
	 */
	function rawDataToCollection(source) {
	    /**
	     * Add icon
	     */
	    function addIcon(name, depth = 0) {
	        if (depth > 3) {
	            // Alias recursion is too high. Do not make aliases of aliases.
	            return null;
	        }
	        if (icons[name] !== void 0) {
	            // Already added
	            return name;
	        }
	        // Add icon
	        if (source.icons[name] !== void 0) {
	            if (!source.icons[name].hidden) {
	                icons[name] = {
	                    provider: result.provider,
	                    prefix: result.prefix,
	                    name,
	                    tags: [],
	                };
	                return name;
	            }
	            return null;
	        }
	        // Add alias
	        if (source.aliases &&
	            source.aliases[name] !== void 0 &&
	            !source.aliases[name].hidden) {
	            // Resolve alias
	            const item = source.aliases[name];
	            const parent = item.parent;
	            // Add parent icon
	            const added = addIcon(parent, depth + 1);
	            if (added !== null) {
	                // Icon was added, which means parent icon is a viable icon
	                // Check if new icon is an alias or full icon
	                if (!(item.rotate || item.hFlip || item.vFlip)) {
	                    // Alias
	                    const parentIcon = icons[added];
	                    if (!parentIcon.aliases) {
	                        parentIcon.aliases = [name];
	                    }
	                    else if (parentIcon.aliases.indexOf(name) === -1) {
	                        parentIcon.aliases.push(name);
	                    }
	                    return added;
	                }
	                else {
	                    // New icon
	                    icons[name] = {
	                        provider: result.provider,
	                        prefix: result.prefix,
	                        name,
	                        tags: [],
	                    };
	                    return name;
	                }
	            }
	        }
	        return null;
	    }
	    /**
	     * Add tag to icons
	     */
	    function addTag(iconsList, tag) {
	        let added = false;
	        iconsList.forEach((name) => {
	            if (icons[name] !== void 0 &&
	                icons[name].tags.indexOf(tag) === -1) {
	                icons[name].tags.push(tag);
	                added = true;
	            }
	        });
	        return added;
	    }
	    // Check required fields
	    if (typeof source.prefix !== 'string') {
	        return null;
	    }
	    const result = {
	        provider: typeof source.provider === 'string' ? source.provider : '',
	        prefix: source.prefix,
	        name: '',
	        total: 0,
	        icons: [],
	    };
	    // Get required info
	    if (typeof source.info !== 'object' || source.info === null) {
	        return null;
	    }
	    const info = dataToCollectionInfo(source.info, result.prefix);
	    if (info === null) {
	        // Invalid info block, so something is wrong
	        return null;
	    }
	    result.info = info;
	    // Get collection name
	    result.name = result.info.name;
	    // Find all icons
	    const icons = Object.create(null);
	    Object.keys(source.icons).forEach((name) => addIcon(name));
	    if (typeof source.aliases === 'object') {
	        Object.keys(source.aliases).forEach((name) => addIcon(name));
	    }
	    const iconNames = Object.keys(icons);
	    // Check for categories
	    const tags = [];
	    if (typeof source.categories === 'object' && source.categories !== null) {
	        let hasUncategorised = false;
	        const categories = source.categories;
	        Object.keys(categories).forEach((category) => {
	            const categoryItems = categories[category];
	            // Array
	            if (categoryItems instanceof Array) {
	                if (addTag(categoryItems, category)) {
	                    tags.push(category);
	                }
	            }
	            else if (typeof categoryItems === 'object') {
	                // Sub-categories. No longer used, but can be found in some older icon sets
	                Object.keys(categoryItems).forEach((subcategory) => {
	                    const subcategoryItems = categoryItems[subcategory];
	                    if (subcategoryItems instanceof Array) {
	                        if (addTag(subcategoryItems, category) &&
	                            tags.indexOf(category) === -1) {
	                            tags.push(category);
	                        }
	                    }
	                });
	            }
	        });
	        // Check if icons without categories exist
	        iconNames.forEach((name) => {
	            if (!icons[name].tags.length) {
	                icons[name].tags.push('');
	                hasUncategorised = true;
	            }
	        });
	        if (hasUncategorised) {
	            tags.push('');
	        }
	    }
	    // Remove tags if there are less than 2 categories
	    if (tags.length < 2) {
	        Object.keys(icons).forEach((name) => {
	            delete icons[name].tags;
	        });
	    }
	    else {
	        result.tags = tags.sort(sortTags);
	    }
	    // Add characters
	    if (typeof source.chars === 'object') {
	        parseChars(source.chars, icons);
	    }
	    // Sort icons
	    const sortedIcons = sortIcons(icons);
	    // Add themes
	    parseThemes(source, sortedIcons, result);
	    // Add icons
	    result.icons = sortedIcons;
	    result.total = result.info.total = result.icons.length;
	    return result;
	}
	exports.rawDataToCollection = rawDataToCollection;
	/**
	 * Sort categories
	 */
	function sortTags(a, b) {
	    if (a === '') {
	        return 1;
	    }
	    if (b === '') {
	        return -1;
	    }
	    return a.localeCompare(b);
	}

	});

	var collections = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.autoIndexCollections = exports.filterCollections = exports.collectionsPrefixes = exports.dataToCollections = void 0;

	/**
	 * Convert data from API to CollectionsList
	 */
	function dataToCollections(data) {
	    const result = Object.create(null);
	    const uncategorised = Object.create(null);
	    if (typeof data !== 'object' || data === null) {
	        return result;
	    }
	    // Assume Record<prefix, item> structure
	    Object.keys(data).forEach((prefix) => {
	        const row = data[prefix];
	        if (typeof row !== 'object' ||
	            row === null ||
	            typeof row.category !== 'string') {
	            return;
	        }
	        // Convert item
	        const item = collection.dataToCollectionInfo(row, prefix);
	        if (item === null) {
	            return;
	        }
	        // Add category and item
	        const category = row.category;
	        if (category !== '') {
	            if (result[category] === void 0) {
	                result[category] = Object.create(null);
	            }
	            result[category][prefix] = item;
	        }
	        else {
	            uncategorised[prefix] = item;
	        }
	    });
	    // Add uncategorised at the end
	    if (Object.keys(uncategorised).length > 0) {
	        result[''] = uncategorised;
	    }
	    return result;
	}
	exports.dataToCollections = dataToCollections;
	/**
	 * Get collection prefixes from converted collections list
	 */
	function collectionsPrefixes(collections) {
	    let prefixes = [];
	    Object.keys(collections).forEach((category) => {
	        prefixes = prefixes.concat(Object.keys(collections[category]));
	    });
	    return prefixes;
	}
	exports.collectionsPrefixes = collectionsPrefixes;
	/**
	 * Filter collections
	 */
	function filterCollections(collections, callback, keepEmptyCategories = false) {
	    const result = Object.create(null);
	    // Parse each category
	    Object.keys(collections).forEach((category) => {
	        if (keepEmptyCategories) {
	            result[category] = Object.create(null);
	        }
	        // Parse each item in category
	        Object.keys(collections[category]).forEach((prefix) => {
	            const item = collections[category][prefix];
	            if (!callback(item, category, prefix)) {
	                return;
	            }
	            // Passed filter
	            if (result[category] === void 0) {
	                result[category] = Object.create(null);
	            }
	            result[category][prefix] = item;
	        });
	    });
	    return result;
	}
	exports.filterCollections = filterCollections;
	/**
	 * Add indexes to all collections
	 */
	function autoIndexCollections(collections, start = 0) {
	    let index = start;
	    Object.keys(collections).forEach((category) => {
	        const items = collections[category];
	        Object.keys(items).forEach((prefix) => {
	            items[prefix].index = index++;
	        });
	    });
	}
	exports.autoIndexCollections = autoIndexCollections;

	});

	var filters = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.autoIndexFilters = exports.enableFilters = exports.isFiltersBlockEmpty = exports.defaultFiltersBlock = exports.defaultFilter = void 0;
	/**
	 * Default values for filter
	 */
	exports.defaultFilter = (title) => {
	    return {
	        title,
	        index: 0,
	        disabled: false,
	    };
	};
	/**
	 * Default value
	 */
	exports.defaultFiltersBlock = () => {
	    return {
	        type: 'filters',
	        filterType: '',
	        active: null,
	        filters: Object.create(null),
	    };
	};
	/**
	 * Check if block is empty
	 */
	function isFiltersBlockEmpty(block) {
	    return (block === void 0 ||
	        block === null ||
	        Object.keys(block.filters).length < 2);
	}
	exports.isFiltersBlockEmpty = isFiltersBlockEmpty;
	/**
	 * Enable or disable all filters in block
	 */
	function enableFilters(block, enable = true) {
	    Object.keys(block.filters).forEach((filter) => {
	        block.filters[filter].disabled = !enable;
	    });
	}
	exports.enableFilters = enableFilters;
	/**
	 * Set indexes to all filters
	 *
	 * Returns next start index to chain index multiple sets of filters
	 */
	function autoIndexFilters(block, start = 0) {
	    let index = start;
	    Object.keys(block.filters).forEach((filter) => {
	        block.filters[filter].index = index++;
	    });
	    return index;
	}
	exports.autoIndexFilters = autoIndexFilters;

	});

	var collectionsList = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.applyCollectionsFilter = exports.disableInactiveCategories = exports.filterCollectionsBlock = exports.iterateCollectionsBlock = exports.collectionsPrefixesWithInfo = exports.getCollectionsBlockPrefixes = exports.getCollectionsBlockCategories = exports.isCollectionsBlockEmpty = exports.defaultCollectionsListBlock = void 0;



	/**
	 * Default values
	 */
	exports.defaultCollectionsListBlock = () => {
	    return {
	        type: 'collections-list',
	        showCategories: true,
	        collections: Object.create(null),
	    };
	};
	/**
	 * Check if block is empty
	 */
	function isCollectionsBlockEmpty(block) {
	    if (block === void 0 || block === null) {
	        return true;
	    }
	    const categories = Object.keys(block.collections);
	    for (let i = 0; i < categories.length; i++) {
	        if (Object.keys(block.collections[categories[i]]).length > 0) {
	            return false;
	        }
	    }
	    return true;
	}
	exports.isCollectionsBlockEmpty = isCollectionsBlockEmpty;
	/**
	 * Get categories
	 */
	function getCollectionsBlockCategories(block, ignoreEmpty = false) {
	    let categories = Object.keys(block.collections);
	    if (ignoreEmpty) {
	        categories = categories.filter((category) => Object.keys(block.collections[category]).length > 0);
	    }
	    return categories;
	}
	exports.getCollectionsBlockCategories = getCollectionsBlockCategories;
	/**
	 * Get all prefixes
	 */
	function getCollectionsBlockPrefixes(block) {
	    return collections.collectionsPrefixes(block.collections);
	}
	exports.getCollectionsBlockPrefixes = getCollectionsBlockPrefixes;
	/**
	 * Get all collections info as array
	 */
	function collectionsPrefixesWithInfo(block) {
	    const info = [];
	    Object.keys(block.collections).forEach((category) => {
	        const items = block.collections[category];
	        Object.keys(items).forEach((prefix) => {
	            if (items[prefix] !== null) {
	                info.push(items[prefix]);
	            }
	        });
	    });
	    return info;
	}
	exports.collectionsPrefixesWithInfo = collectionsPrefixesWithInfo;
	/**
	 * Iterate collections block
	 */
	function iterateCollectionsBlock(block, callback) {
	    Object.keys(block.collections).forEach((category) => {
	        const items = block.collections[category];
	        Object.keys(items).forEach((prefix) => {
	            callback(items[prefix], prefix, category);
	        });
	    });
	}
	exports.iterateCollectionsBlock = iterateCollectionsBlock;
	/**
	 * Filter collections list (creates new block)
	 */
	function filterCollectionsBlock(block, callback, keepEmptyCategories = false) {
	    const result = {
	        type: 'collections-list',
	        showCategories: block.showCategories,
	        collections: collections.filterCollections(block.collections, callback, keepEmptyCategories),
	    };
	    return result;
	}
	exports.filterCollectionsBlock = filterCollectionsBlock;
	/**
	 * Remove all inactive categories
	 */
	function disableInactiveCategories(block, category) {
	    if (category === null) {
	        return block;
	    }
	    const result = {
	        type: 'collections-list',
	        showCategories: block.showCategories,
	        collections: Object.create(null),
	    };
	    if (block.collections[category] !== void 0) {
	        result.collections[category] = block.collections[category];
	    }
	    return result;
	}
	exports.disableInactiveCategories = disableInactiveCategories;
	/**
	 * List of keys to apply filter to
	 */
	const filterKeys = [
	    'prefix',
	    'name',
	    'author',
	    'license',
	    'category',
	    'palette',
	    'height',
	];
	/**
	 * Apply filter to collections list and to collections filters
	 */
	function applyCollectionsFilter(block, filter, filters$1) {
	    const keyword = filter.keyword.trim();
	    const hasFilters = filters$1 !== null && filters$1.filterType === 'categories';
	    const filtersList = filters$1;
	    if (keyword === '') {
	        // Empty
	        if (hasFilters) {
	            // Enable all filters
	            filters.enableFilters(filtersList, true);
	        }
	        return block;
	    }
	    // Disable all filters, will re-enable them again during filter process
	    const activeCategories = {};
	    if (hasFilters) {
	        filters.enableFilters(filtersList, false);
	    }
	    // Filter collections block
	    return filterCollectionsBlock(block, (item, category) => {
	        for (let i = filterKeys.length - 1; i >= 0; i--) {
	            // Get key
	            const key = filterKeys[i];
	            if (item[key] === void 0) {
	                continue;
	            }
	            // Test value
	            if (objects.match(item[key], keyword)) {
	                // Enable category in category filters
	                if (hasFilters) {
	                    if (activeCategories[category] !== true) {
	                        activeCategories[category] = true;
	                        if (filtersList.filters[category] !== void 0) {
	                            filtersList.filters[category].disabled = false;
	                        }
	                    }
	                }
	                return true;
	            }
	        }
	        return false;
	    }, false);
	}
	exports.applyCollectionsFilter = applyCollectionsFilter;

	});

	var collections$1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getCollectionTitle = exports.getCollectionInfo = exports.setCollectionInfo = void 0;
	/**
	 * Set data
	 */
	function setCollectionInfo(storage, provider, prefix, data) {
	    if (storage[provider] === void 0) {
	        storage[provider] = Object.create(null);
	    }
	    const providerData = storage[provider];
	    if (providerData[prefix] === void 0 || data.index) {
	        // Overwrite previous entry only if index is set
	        providerData[prefix] = data;
	    }
	}
	exports.setCollectionInfo = setCollectionInfo;
	/**
	 * Get data
	 */
	function getCollectionInfo(storage, provider, prefix) {
	    return storage[provider] !== void 0 && storage[provider][prefix] === void 0
	        ? null
	        : storage[provider][prefix];
	}
	exports.getCollectionInfo = getCollectionInfo;
	/**
	 * Get collection title (or prefix if not available)
	 */
	function getCollectionTitle(storage, provider, prefix) {
	    if (storage[provider] === void 0 || storage[provider][prefix] === void 0) {
	        return prefix;
	    }
	    return storage[provider][prefix].name;
	}
	exports.getCollectionTitle = getCollectionTitle;

	});

	var collections$2 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CollectionsView = void 0;







	/**
	 * Class
	 */
	class CollectionsView extends base$1.BaseView {
	    /**
	     * Create view
	     */
	    constructor(instance, route, parent = null) {
	        super();
	        this._data = null;
	        this._blocks = null;
	        this.type = 'collections';
	        this._instance = instance;
	        this.route = route;
	        this.provider = route.params.provider;
	        this.parent = parent;
	        // Check if custom icon set is used
	        const registry = storage.getRegistry(this._instance);
	        const customSets = registry.customIconSets;
	        if (customSets.providers[this.provider] !== void 0) {
	            this._sources = {
	                custom: true,
	                api: customSets.merge !== 'only-custom',
	                merge: customSets.merge,
	            };
	        }
	        else {
	            this._sources = {
	                custom: false,
	                api: true,
	            };
	        }
	    }
	    /**
	     * Start loading
	     */
	    _startLoading() {
	        this._startedLoading = true;
	        if (!this._sources.api) {
	            setTimeout(() => {
	                this._parseAPIData(null);
	            });
	            return;
	        }
	        this._loadAPI(this.provider, '/collections', {});
	    }
	    /**
	     * Run action on view
	     */
	    action(action, value) {
	        switch (action) {
	            // Parent view
	            case 'parent':
	                this._parentAction(value);
	                return;
	            // Change provider
	            case 'provider':
	                if (value !== this.provider) {
	                    this._providerAction(value);
	                }
	                return;
	            // Global search
	            case 'search':
	                if (this._sources.api) {
	                    this._searchAction(this.provider, value);
	                }
	                return;
	            // Filter collections
	            case 'filter':
	                if (typeof value !== 'string') {
	                    return;
	                }
	                value = value.trim().toLowerCase();
	                if (this.route.params.filter !== value) {
	                    this.route.params.filter = value;
	                    this.blocksRequireUpdate = true;
	                }
	                else {
	                    return;
	                }
	                break;
	            // Filter categories
	            case 'categories':
	                if ((value === null || typeof value === 'string') &&
	                    value !== this.route.params.category) {
	                    this.route.params.category = value;
	                    this.blocksRequireUpdate = true;
	                }
	                else {
	                    return;
	                }
	                break;
	            // Select collection, called from child view
	            case 'collections-internal':
	                if (typeof value !== 'string' || value === '') {
	                    return;
	                }
	                this._triggerCollectionAction(value, 1);
	                return;
	            // Select collection
	            case 'collections':
	                if (typeof value !== 'string' || value === '') {
	                    return;
	                }
	                this._triggerCollectionAction(value, 0);
	                return;
	            default:
	                return;
	        }
	        // Action has changed something - trigger update event
	        this._triggerUpdated();
	    }
	    /**
	     * Create child view for prefix
	     */
	    _triggerCollectionAction(prefix, levels) {
	        // Try to find prefix in collections list
	        if (!this.loading && this._data !== null && this.error === '') {
	            // Find matching prefix
	            const categories = Object.keys(this._data);
	            let found = false;
	            for (let i = 0; i < categories.length; i++) {
	                if (this._data[categories[i]][prefix] !== void 0) {
	                    found = true;
	                    break;
	                }
	            }
	            if (!found) {
	                return;
	            }
	        }
	        // Create child view
	        const registry = storage.getRegistry(this._instance);
	        const router = registry.router;
	        router.createChildView({
	            type: 'collection',
	            params: {
	                provider: this.provider,
	                prefix: prefix,
	            },
	        }, levels);
	    }
	    /**
	     * Render blocks
	     */
	    render() {
	        if (this.loading || this._blocks === null || this._data === null) {
	            return null;
	        }
	        // Check if blocks have been cached or if there is a error
	        if (!this.blocksRequireUpdate || this.error !== '') {
	            return this._blocks;
	        }
	        this.blocksRequireUpdate = false;
	        // Apply route to blocks
	        const blocks = this._blocks;
	        const keyword = typeof this.route.params.filter === 'string'
	            ? this.route.params.filter
	            : '';
	        const category = typeof this.route.params.category === 'string'
	            ? this.route.params.category
	            : null;
	        // Set keyword and active category
	        blocks.filter.keyword = keyword;
	        blocks.categories.active = category;
	        // Set collections
	        blocks.collections.collections = this._data;
	        // Apply search filter and change disabled categories in categories filter
	        blocks.collections = collectionsList.applyCollectionsFilter(blocks.collections, blocks.filter, blocks.categories);
	        // Apply category filter
	        if (category !== null) {
	            blocks.collections = collectionsList.disableInactiveCategories(blocks.collections, category);
	        }
	        return blocks;
	    }
	    /**
	     * Get collections block.
	     *
	     * Used by child view.
	     */
	    getCollectionsBlock() {
	        if (this.loading || this.error !== '') {
	            return null;
	        }
	        const blocks = this.render();
	        return blocks !== null && blocks.collections !== null
	            ? blocks.collections
	            : null;
	    }
	    /**
	     * Parse data from API
	     *
	     * Should be overwritten by child classes
	     */
	    _parseAPIData(data) {
	        if (this._sources.api && !data) {
	            // Error
	            this._data = null;
	        }
	        else {
	            // Get list of parsed data
	            const parsedData = [];
	            if (this._sources.api) {
	                parsedData.push({
	                    isCustom: false,
	                    categories: collections.dataToCollections(data),
	                });
	            }
	            if (this._sources.custom) {
	                // Get data
	                const registry = storage.getRegistry(this._instance);
	                const customSets = registry.customIconSets;
	                const customCollections = customSets.providers[this.route.params.provider]
	                    .collections;
	                // Unshift or push it, depending on merge order
	                parsedData[this._sources.merge === 'custom-first' ? 'unshift' : 'push']({
	                    isCustom: true,
	                    categories: customCollections,
	                });
	            }
	            // Setup result as empty object
	            this._data = Object.create(null);
	            const dataItem = this._data;
	            // Store prefixes map to avoid duplicates
	            const usedPrefixes = Object.create(null);
	            // Parse all data
	            parsedData.forEach((item) => {
	                // Parse all categories
	                const collectionsList = item.categories;
	                Object.keys(collectionsList).forEach((category) => {
	                    const categoryItems = collectionsList[category];
	                    Object.keys(categoryItems).forEach((prefix) => {
	                        if (usedPrefixes[prefix] !== void 0) {
	                            // Prefix has already been parsed
	                            if (item.isCustom) {
	                                // Remove previous entry
	                                delete dataItem[usedPrefixes[prefix]][prefix];
	                            }
	                            else {
	                                // Do not overwrite: always show set from API in case of duplicate entries
	                                return;
	                            }
	                        }
	                        // Add item
	                        usedPrefixes[prefix] = category;
	                        if (dataItem[category] === void 0) {
	                            dataItem[category] = Object.create(null);
	                        }
	                        dataItem[category][prefix] = categoryItems[prefix];
	                    });
	                });
	            });
	        }
	        // Mark as loaded and mark blocks for re-render
	        this.loading = false;
	        this.blocksRequireUpdate = true;
	        this.error = '';
	        // Create blocks
	        this._blocks = {
	            filter: collectionsFilter.defaultCollectionsFilterBlock(),
	            categories: filters.defaultFiltersBlock(),
	            collections: collectionsList.defaultCollectionsListBlock(),
	        };
	        this._blocks.categories.filterType = 'categories';
	        // Parse data
	        if (this._data === null) {
	            this.error = data === null ? 'not_found' : 'invalid_data';
	        }
	        else {
	            // Add indexes to collections
	            collections.autoIndexCollections(this._data);
	            // Set collections
	            this._blocks.collections.collections = this._data;
	            // Get categories
	            const categories = collectionsList.getCollectionsBlockCategories(this._blocks.collections, true);
	            if (categories.length === 0) {
	                this.error = 'empty';
	            }
	            else {
	                if (categories.length > 1) {
	                    // Set category filters
	                    this._blocks.collections.showCategories = true;
	                    const filters$1 = this._blocks.categories.filters;
	                    categories.forEach((category) => {
	                        filters$1[category] = filters.defaultFilter(category);
	                    });
	                    filters.autoIndexFilters(this._blocks.categories);
	                }
	                else {
	                    // Disable category filters
	                    this._blocks.collections.showCategories = false;
	                }
	                // Store collections in global data
	                const registry = storage.getRegistry(this._instance);
	                const collections = registry.collections;
	                collectionsList.iterateCollectionsBlock(this._blocks.collections, (item, prefix) => {
	                    collections$1.setCollectionInfo(collections, this.provider, prefix, item);
	                });
	            }
	        }
	        // Send event
	        this._triggerLoaded();
	    }
	}
	exports.CollectionsView = CollectionsView;

	});

	var collectionInfo = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isCollectionInfoBlockEmpty = exports.defaultCollectionInfoBlock = void 0;
	/**
	 * Default block values
	 */
	exports.defaultCollectionInfoBlock = () => {
	    return {
	        type: 'collection-info',
	        prefix: '',
	        info: null,
	    };
	};
	/**
	 * Check if block is empty
	 */
	function isCollectionInfoBlockEmpty(block) {
	    return block === void 0 || block === null || block.info === null;
	}
	exports.isCollectionInfoBlockEmpty = isCollectionInfoBlockEmpty;

	});

	var iconsList = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.applyIconFilters = exports.isIconsListBlockEmpty = exports.defaultIconsListBlock = void 0;

	/**
	 * Default block values
	 */
	exports.defaultIconsListBlock = () => {
	    return {
	        type: 'icons-list',
	        icons: [],
	    };
	};
	/**
	 * Check if block is empty
	 */
	function isIconsListBlockEmpty(block) {
	    return block === void 0 || block === null || block.icons.length < 1;
	}
	exports.isIconsListBlockEmpty = isIconsListBlockEmpty;
	/**
	 * Icon attributes to search
	 */
	const searchableIconAttributes = ['name', 'chars', 'aliases'];
	const searchableIconAttributesWithPrefixes = [
	    'prefix',
	    'name',
	    'chars',
	    'aliases',
	];
	/**
	 * Apply filters to icons list
	 */
	function applyIconFilters(block, search, filters$1 = [], searchPrefixes = false) {
	    let icons = block.icons.slice(0);
	    const searchableAttributes = searchPrefixes
	        ? searchableIconAttributesWithPrefixes
	        : searchableIconAttributes;
	    // Get Icon attribute matching filter (legacy from when attributes didn't match, but kept in case things change again)
	    function iconAttr(key) {
	        return key;
	    }
	    // Search
	    const keyword = search ? search.keyword.trim() : '';
	    if (keyword !== '') {
	        // Find all icons that match keyword
	        const keywords = keyword
	            .toLowerCase()
	            .split(/[\s:]/)
	            .map((keyword) => keyword.trim())
	            .filter((keyword) => keyword.length > 0);
	        if (keywords.length) {
	            const searches = searchableAttributes.slice(0);
	            keywords.forEach((keyword) => {
	                let exclude = false;
	                if (keyword.slice(0, 1) === '-') {
	                    exclude = true;
	                    keyword = keyword.slice(1);
	                    if (!keyword.length) {
	                        return;
	                    }
	                }
	                icons = icons.filter((item) => {
	                    const icon = item;
	                    let match = false;
	                    searches.forEach((attr) => {
	                        if (match || icon[attr] === void 0) {
	                            return;
	                        }
	                        if (typeof icon[attr] === 'string') {
	                            match =
	                                icon[attr].indexOf(keyword) !== -1;
	                            return;
	                        }
	                        if (icon[attr] instanceof Array) {
	                            icon[attr].forEach((value) => {
	                                match = match || value.indexOf(keyword) !== -1;
	                            });
	                        }
	                    });
	                    return exclude ? !match : match;
	                });
	            });
	        }
	    }
	    // Toggle filter visibility
	    const isSearched = icons.length !== block.icons.length;
	    filters$1.forEach((filter) => {
	        filters.enableFilters(filter, true);
	        if (!isSearched) {
	            return;
	        }
	        const attr = iconAttr(filter.filterType);
	        if (attr === null) {
	            return;
	        }
	        Object.keys(filter.filters).forEach((match) => {
	            for (let i = icons.length - 1; i >= 0; i--) {
	                const value = icons[i][attr];
	                if (value === void 0 || value === null) {
	                    continue;
	                }
	                if (typeof value === 'string') {
	                    if (value === match) {
	                        return;
	                    }
	                    continue;
	                }
	                if (value instanceof Array && value.indexOf(match) !== -1) {
	                    return;
	                }
	            }
	            // No matches
	            filter.filters[match].disabled = true;
	        });
	    });
	    // Apply filters
	    filters$1.forEach((filter) => {
	        if (filter.active === null) {
	            return;
	        }
	        const match = filter.active;
	        const attr = iconAttr(filter.filterType);
	        if (attr === null) {
	            return;
	        }
	        icons = icons.filter((icon) => {
	            const value = icon[attr];
	            if (value === void 0 || value === null) {
	                return false;
	            }
	            if (typeof value === 'string') {
	                return value === match;
	            }
	            if (value instanceof Array) {
	                return value.indexOf(match) !== -1;
	            }
	            return false;
	        });
	    });
	    block.icons = icons;
	    return block;
	}
	exports.applyIconFilters = applyIconFilters;

	});

	var pagination = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.showPagination = exports.getPageForIndex = exports.maxPage = exports.isPaginationEmpty = exports.defaultPaginationBlock = void 0;
	/**
	 * Default values
	 */
	exports.defaultPaginationBlock = () => {
	    return {
	        type: 'pagination',
	        page: 0,
	        length: 0,
	        perPage: 24,
	        more: false,
	    };
	};
	/**
	 * Check if pagination is empty
	 */
	function isPaginationEmpty(block) {
	    return block === void 0 || block === null || block.length <= block.perPage;
	}
	exports.isPaginationEmpty = isPaginationEmpty;
	/**
	 * Get maximum page number
	 */
	function maxPage(block) {
	    return block.perPage && block.length > 0
	        ? Math.floor((block.length - 1) / block.perPage)
	        : 0;
	}
	exports.maxPage = maxPage;
	/**
	 * Calculate page where item at index "index" is located
	 */
	function getPageForIndex(perPage, index) {
	    return perPage && index > 0 ? Math.floor(index / perPage) : 0;
	}
	exports.getPageForIndex = getPageForIndex;
	/**
	 * Get list of pages to show
	 */
	function showPagination(block) {
	    const total = block.length ? maxPage(block) + 1 : 0;
	    const pagination = [];
	    let i, min;
	    // Less than 2 pages
	    if (total < 2) {
	        return pagination;
	    }
	    // Show all pages
	    // 3 first + total+-2 + 3 last + 2 spacers = 13
	    if (total < 14) {
	        for (i = 0; i < total; i++) {
	            pagination.push(i);
	        }
	        return pagination;
	    }
	    // First 3 pages
	    for (i = 0; i < Math.min(total, 3); i++) {
	        pagination.push(i);
	    }
	    if ((min = i) >= total) {
	        return pagination;
	    }
	    // Current +- 2 (or - 3 if only 1 page is skipped)
	    for (i = min === block.page - 3 ? min : Math.max(block.page - 2, min); i < Math.min(block.page + 3, total); i++) {
	        pagination.push(i);
	    }
	    if ((min = i) >= total) {
	        return pagination;
	    }
	    // Last 3 (or 4 if only 1 page is skipped)
	    for (i = min === total - 4 ? total - 4 : Math.max(total - 3, min); i < total; i++) {
	        pagination.push(i);
	    }
	    return pagination;
	}
	exports.showPagination = showPagination;

	});

	var search = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isSearchBlockEmpty = exports.defaultSearchBlock = void 0;
	/**
	 * Default block values
	 */
	exports.defaultSearchBlock = () => {
	    return {
	        type: 'search',
	        keyword: '',
	    };
	};
	/**
	 * Check if block is empty
	 */
	function isSearchBlockEmpty(block) {
	    return block === void 0 || block === null || block.keyword.trim() === '';
	}
	exports.isSearchBlockEmpty = isSearchBlockEmpty;

	});

	var collection$1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CollectionView = void 0;










	const filterKeys = [
	    'tags',
	    'themePrefixes',
	    'themeSuffixes',
	];
	/**
	 * Class
	 */
	class CollectionView extends base$1.BaseView {
	    /**
	     * Create view
	     */
	    constructor(instance, route, parent = null) {
	        super();
	        this._data = null;
	        this._blocks = null;
	        this.type = 'collection';
	        this._instance = instance;
	        this.route = route;
	        this.provider = route.params.provider;
	        this.parent = parent;
	        this.prefix = route.params.prefix;
	        // Check if custom icon set is used
	        const registry = storage.getRegistry(this._instance);
	        const customSets = registry.customIconSets;
	        if (customSets.providers[this.provider] !== void 0 &&
	            customSets.providers[this.provider].data[this.prefix] !== void 0) {
	            this._isCustom = true;
	            this._data = customSets.providers[this.provider].data[this.prefix];
	        }
	        else {
	            this._isCustom = false;
	        }
	        // Wait for parent to load if parent view is search or collections list
	        this._mustWaitForParent =
	            parent !== null &&
	                (parent.type === 'search' || parent.type === 'collections');
	    }
	    /**
	     * Start loading
	     */
	    _startLoading() {
	        this._startedLoading = true;
	        if (!this._isCustom) {
	            this._loadAPI(this.provider, '/collection', {
	                prefix: this.prefix,
	                info: 'true',
	                chars: 'true',
	                aliases: 'true',
	            });
	        }
	        else {
	            setTimeout(() => {
	                this._parseAPIData(null);
	            });
	        }
	    }
	    /**
	     * Run action on view
	     */
	    action(action, value) {
	        switch (action) {
	            // Select parent view
	            case 'parent':
	                this._parentAction(value);
	                return;
	            // Change provider
	            case 'provider':
	                if (value !== this.provider) {
	                    this._providerAction(value);
	                }
	                return;
	            // Global search
	            case 'search':
	                this._searchAction(this.provider, value);
	                return;
	            // Search icons
	            case 'filter':
	                if (typeof value !== 'string') {
	                    return;
	                }
	                value = value.trim().toLowerCase();
	                if (value === this.route.params.filter) {
	                    return;
	                }
	                this.route.params.filter = value;
	                this.blocksRequireUpdate = true;
	                break;
	            // Change current page
	            case 'pagination':
	                if (typeof value === 'string') {
	                    value = parseInt(value);
	                }
	                // Check number
	                if (typeof value !== 'number' ||
	                    isNaN(value) ||
	                    value < 0 ||
	                    value === this.route.params.page) {
	                    return;
	                }
	                // Change page
	                this.route.params.page = value;
	                this.blocksRequireUpdate = true;
	                break;
	            // Filters
	            case 'tags':
	                this._filterAction('tag', value);
	                return;
	            case 'themePrefixes':
	                this._filterAction('themePrefix', value);
	                return;
	            case 'themeSuffixes':
	                this._filterAction('themeSuffix', value);
	                return;
	            // Parent view's filter
	            case 'collections':
	                this._collectionsAction(value);
	                return;
	            default:
	                return;
	        }
	        // Action has changed something - trigger update event
	        this._triggerUpdated();
	    }
	    /**
	     * Filter action
	     */
	    _filterAction(key, value) {
	        if (value !== null && typeof value !== 'string') {
	            return;
	        }
	        if (this.route.params[key] === value) {
	            return;
	        }
	        this.route.params[key] = value;
	        this.blocksRequireUpdate = true;
	        this._triggerUpdated();
	    }
	    /**
	     * Change active collection
	     */
	    _collectionsAction(value) {
	        if (this.parent === null ||
	            (this.parent.type !== 'search' &&
	                this.parent.type !== 'collections')) {
	            return;
	        }
	        // If value matches this collection, navigate to parent view
	        if (value === this.prefix || value === null) {
	            this._parentAction(1);
	            return;
	        }
	        // Run action on parent view
	        if (typeof value === 'string') {
	            this.parent.action('collections-internal', value);
	        }
	    }
	    /**
	     * Render blocks
	     */
	    render() {
	        if (this.loading || this._blocks === null || this._data === null) {
	            return null;
	        }
	        // Check if blocks have been cached or if there is a error
	        if (!this.blocksRequireUpdate || this.error !== '') {
	            return this._blocks;
	        }
	        this.blocksRequireUpdate = false;
	        // Apply route to blocks
	        const blocks = this._blocks;
	        // Copy icons
	        blocks.icons.icons = this._data.icons.slice(0);
	        // Set active filters
	        blocks.filter.keyword = this.route.params.filter;
	        if (blocks.tags !== null) {
	            blocks.tags.active = this.route.params.tag;
	        }
	        if (blocks.themePrefixes !== null) {
	            blocks.themePrefixes.active = this.route.params.themePrefix;
	        }
	        if (blocks.themeSuffixes !== null) {
	            blocks.themeSuffixes.active = this.route.params.themeSuffix;
	        }
	        // Apply search
	        blocks.icons = iconsList.applyIconFilters(blocks.icons, blocks.filter, filterKeys
	            .filter((key) => blocks[key] !== null)
	            .map((key) => blocks[key]));
	        // Check pagination
	        blocks.pagination.length = blocks.icons.icons.length;
	        blocks.pagination.page = this.route.params.page;
	        const maximumPage = pagination.maxPage(blocks.pagination);
	        if (maximumPage < blocks.pagination.page) {
	            this.route.params.page = blocks.pagination.page = maximumPage;
	        }
	        // Apply pagination
	        const perPage = blocks.pagination.perPage;
	        const startIndex = blocks.pagination.page * perPage;
	        blocks.icons.icons = blocks.icons.icons.slice(startIndex, startIndex + perPage);
	        return this._blocks;
	    }
	    /**
	     * Parse data from API
	     *
	     * Should be overwritten by child classes
	     */
	    _parseAPIData(data) {
	        if (!this._isCustom) {
	            this._data = collection.dataToCollection(this.provider, data);
	        }
	        // Mark as loaded, mark blocks for re-render and reset error
	        this.loading = false;
	        this.blocksRequireUpdate = true;
	        this.error = '';
	        // Create empty blocks
	        this._blocks = {
	            // Info
	            info: collectionInfo.defaultCollectionInfoBlock(),
	            // Search
	            filter: Object.assign(search.defaultSearchBlock(), {
	                keyword: this.route.params.filter,
	                searchType: 'collection',
	                title: this.prefix,
	            }),
	            // Filters
	            collections: null,
	            tags: null,
	            themePrefixes: null,
	            themeSuffixes: null,
	            // Icons and pagination
	            icons: iconsList.defaultIconsListBlock(),
	            pagination: pagination.defaultPaginationBlock(),
	        };
	        const initialisedBlocks = this._blocks;
	        // Check if data was valid
	        if (this._data === null) {
	            this.error = data === null ? 'not_found' : 'invalid_data';
	            this._triggerLoaded();
	            return;
	        }
	        const parsedData = this._data;
	        // Validate prefix
	        if (this.prefix !== parsedData.prefix) {
	            this.error = 'invalid_data';
	            this._triggerLoaded();
	            return;
	        }
	        // Get registry and modules
	        const registry = storage.getRegistry(this._instance);
	        const config = registry.config;
	        const collections = registry.collections;
	        // Set info
	        initialisedBlocks.info.prefix = this.prefix;
	        if (parsedData.info !== void 0) {
	            // Store info in collections storage
	            collections$1.setCollectionInfo(collections, this.provider, this.prefix, parsedData.info);
	        }
	        // Get info from collections storage because it might include index for color scheme
	        initialisedBlocks.info.info = collections$1.getCollectionInfo(collections, this.provider, this.prefix);
	        if (initialisedBlocks.info.info !== null) {
	            initialisedBlocks.filter.title = initialisedBlocks.info.info.name;
	        }
	        // Check if there are any icons
	        if (parsedData.total < 1) {
	            this.error = 'empty';
	        }
	        else {
	            // Create pagination
	            const pagination$1 = initialisedBlocks.pagination;
	            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	            pagination$1.perPage = config.ui.itemsPerPage;
	            pagination$1.fullLength = pagination$1.length = parsedData.icons.length;
	            pagination$1.page = Math.min(this.route.params.page, pagination.maxPage(pagination$1));
	            // Copy collections filter from parent view
	            if (this.parent && !this.parent.loading) {
	                if (this.parent.type === 'search') {
	                    // Get copy of block from parent view
	                    const collectionsBlock = this
	                        .parent.getCollectionsBlock();
	                    if (collectionsBlock !== null) {
	                        // Copy block and set active filter
	                        this._blocks.collections = collectionsBlock;
	                        this._blocks.collections.active = this.prefix;
	                    }
	                }
	                else if (this.parent.type === 'collections') {
	                    // Find previous / next items
	                    this._blocks.collections = this._findSiblingCollections();
	                }
	            }
	            // Icon filters
	            let startIndex = 0;
	            filterKeys.forEach((key) => {
	                const dataKey = key;
	                if (parsedData[dataKey] !== void 0) {
	                    const list = parsedData[dataKey];
	                    if (list instanceof Array && list.length > 1) {
	                        // Create empty filters block
	                        const filter = filters.defaultFiltersBlock();
	                        filter.filterType = key;
	                        initialisedBlocks[key] = filter;
	                        // Copy all filters
	                        list.forEach((tag) => {
	                            filter.filters[tag] = filters.defaultFilter(tag);
	                        });
	                        // Apply index
	                        startIndex = filters.autoIndexFilters(filter, startIndex);
	                    }
	                }
	            });
	        }
	        // Send event
	        this._triggerLoaded();
	    }
	    /**
	     * Find sibling collections from collections list, return them as block
	     */
	    _findSiblingCollections() {
	        const collectionsBlock = this
	            .parent.getCollectionsBlock();
	        if (collectionsBlock === null) {
	            return null;
	        }
	        const collections = collectionsList.collectionsPrefixesWithInfo(collectionsBlock);
	        const match = collections.find((item) => item.prefix === this.prefix);
	        if (match === void 0 || collections.length < 2) {
	            return null;
	        }
	        // Get limit
	        const registry = storage.getRegistry(this._instance);
	        const config = registry.config;
	        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	        const limit = config.ui.showSiblingCollections;
	        // Get items before and after current prefix
	        let display = [];
	        if (collections.length < limit * 2 + 2) {
	            // Display all collections
	            display = collections.slice(0);
	        }
	        else {
	            const index = collections.indexOf(match);
	            // few items before current
	            for (let i = index - limit; i < index; i++) {
	                display.push(collections[(i + collections.length) % collections.length]);
	            }
	            // Current item
	            display.push(match);
	            // few items after current
	            for (let i = index + 1; i <= index + limit; i++) {
	                display.push(collections[i % collections.length]);
	            }
	        }
	        // Create block
	        const block = filters.defaultFiltersBlock();
	        block.filterType = 'collections';
	        block.active = this.prefix;
	        display.forEach((item) => {
	            const filter = filters.defaultFilter(item.name);
	            filter.index = item.index;
	            block.filters[item.prefix] = filter;
	        });
	        return block;
	    }
	}
	exports.CollectionView = CollectionView;

	});

	var search$1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.dataToSearchResults = void 0;


	function dataToSearchResults(provider, data) {
	    if (typeof data !== 'object' || data === null) {
	        return null;
	    }
	    // Get source as object
	    const source = data;
	    if (typeof source.request !== 'object' || source.request === null) {
	        return null;
	    }
	    // Check required attributes
	    const request = source.request;
	    if (typeof request.query !== 'string') {
	        return null;
	    }
	    if (typeof source.total !== 'number' || typeof source.limit !== 'number') {
	        return null;
	    }
	    // Create result
	    const result = {
	        provider,
	        query: request.query,
	        total: source.total,
	        limit: source.limit,
	        icons: [],
	        collections: Object.create(null),
	    };
	    // Parse all icons
	    if (typeof source.collections !== 'object' ||
	        !(source.icons instanceof Array)) {
	        return null;
	    }
	    const sourceIcons = source.icons;
	    const sourceCollections = source.collections;
	    try {
	        sourceIcons.forEach((item) => {
	            const icon$1 = icon.stringToIcon(item, provider);
	            if (!icon.validateIcon(icon$1)) {
	                throw new Error('Invalid icon');
	            }
	            result.icons.push(icon$1);
	            const prefix = icon$1.prefix;
	            if (result.collections[prefix] === void 0) {
	                // Add collection
	                if (sourceCollections[prefix] === void 0) {
	                    throw new Error(`Missing data for prefix ${prefix}`);
	                }
	                const info = collection.dataToCollectionInfo(sourceCollections[prefix], prefix);
	                if (info === null) {
	                    throw new Error(`Invalid data for prefix ${prefix}`);
	                }
	                result.collections[prefix] = info;
	            }
	        });
	    }
	    catch (err) {
	        return null;
	    }
	    // Overwrite total
	    result.total = result.icons.length;
	    return result;
	}
	exports.dataToSearchResults = dataToSearchResults;

	});

	var search$2 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SearchView = void 0;








	/**
	 * Class
	 */
	class SearchView extends base$1.BaseView {
	    /**
	     * Create view
	     */
	    constructor(instance, route, parent = null) {
	        super();
	        this._data = null;
	        this._blocks = null;
	        this.type = 'search';
	        this._instance = instance;
	        this.route = route;
	        this.provider = route.params.provider;
	        this.parent = parent;
	        this.keyword = route.params.search;
	        // Get number of items per page
	        const registry = storage.getRegistry(this._instance);
	        const config = registry.config;
	        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	        this.itemsPerPage = config.ui.itemsPerPage;
	        // Check if full results need to be shown
	        if (this.route.params.page > 1) {
	            this.route.params.short = false;
	        }
	        // Set items limit for query
	        this.itemsLimit = this.route.params.short ? this.itemsPerPage * 2 : 999;
	    }
	    /**
	     * Start loading
	     */
	    _startLoading() {
	        this._startedLoading = true;
	        this._loadAPI(this.provider, '/search', {
	            query: this.keyword,
	            limit: this.itemsLimit,
	        });
	    }
	    /**
	     * Run action on view
	     */
	    action(action, value) {
	        switch (action) {
	            // Change to parent view
	            case 'parent':
	                this._parentAction(value);
	                return;
	            // Change provider
	            case 'provider':
	                if (value !== this.provider) {
	                    this._providerAction(value);
	                }
	                return;
	            // Global search
	            case 'search':
	                if (typeof value !== 'string') {
	                    return;
	                }
	                value = value.trim().toLowerCase();
	                if (value === this.keyword) {
	                    return;
	                }
	                this._searchAction(this.provider, value);
	                return;
	            // Change current page
	            case 'pagination':
	                if (value === 'more' && this._showMoreButton()) {
	                    // Change to current page + 1
	                    value = this.route.params.page + 1;
	                }
	                // Check number
	                if (typeof value === 'string') {
	                    value = parseInt(value);
	                }
	                if (typeof value !== 'number' ||
	                    isNaN(value) ||
	                    value === this.route.params.page ||
	                    value < 0) {
	                    return;
	                }
	                // Check for "more"
	                if (value > 0 && this._showMoreButton()) {
	                    // Create sibling route
	                    this._triggerFullResults(value);
	                    return;
	                }
	                this.route.params.page = value;
	                this.blocksRequireUpdate = true;
	                break;
	            // Collections filter
	            case 'collections':
	                this._collectionsAction(value, 0);
	                return;
	            // Collections filter, called from child view
	            case 'collections-internal':
	                this._collectionsAction(value, 1);
	                return;
	            default:
	                return;
	        }
	        // Action has changed something - trigger update event
	        this._triggerUpdated();
	    }
	    /**
	     * Change active collection
	     */
	    _collectionsAction(value, levels) {
	        if (value !== null && typeof value !== 'string') {
	            return;
	        }
	        if (this.loading ||
	            this._blocks === null ||
	            this._blocks.collections === null) {
	            return;
	        }
	        const registry = storage.getRegistry(this._instance);
	        const router = registry.router;
	        if (value === null) {
	            // Change view to search results
	            router.setParentView(levels);
	            return;
	        }
	        // Create child view
	        const prefix = value;
	        router.createChildView({
	            type: 'collection',
	            params: {
	                provider: this.provider,
	                prefix,
	                filter: this.keyword,
	            },
	        }, levels);
	    }
	    /**
	     * Show full results
	     */
	    _triggerFullResults(page) {
	        // Create sibling view
	        const registry = storage.getRegistry(this._instance);
	        const router = registry.router;
	        router.createChildView({
	            type: 'search',
	            params: Object.assign({}, this.route.params, {
	                page: page,
	                short: false,
	            }),
	        }, 1);
	    }
	    /**
	     * Render blocks
	     */
	    render() {
	        if (this.loading || this._blocks === null || this._data === null) {
	            return null;
	        }
	        // Check if blocks have been cached or if there is a error
	        if (!this.blocksRequireUpdate || this.error !== '') {
	            return this._blocks;
	        }
	        this.blocksRequireUpdate = false;
	        // Apply route to blocks
	        const blocks = this._blocks;
	        // Copy icons
	        blocks.icons.icons = this._data.icons.slice(0);
	        // Set active filters
	        if (blocks.collections !== null) {
	            blocks.collections.active = null;
	        }
	        // Check pagination
	        blocks.pagination.length = blocks.icons.icons.length;
	        blocks.pagination.page = this.route.params.page;
	        const maximumPage = pagination.maxPage(blocks.pagination);
	        if (maximumPage < blocks.pagination.page) {
	            this.route.params.page = blocks.pagination.page = maximumPage;
	        }
	        // Apply pagination
	        const startIndex = blocks.pagination.page * this.itemsPerPage;
	        blocks.icons.icons = blocks.icons.icons.slice(startIndex, startIndex + this.itemsPerPage);
	        return this._blocks;
	    }
	    /**
	     * Get collections block.
	     *
	     * Used by child views. Result is copied, ready to be modified
	     */
	    getCollectionsBlock() {
	        if (this.loading || this.error !== '') {
	            return null;
	        }
	        const blocks = this.render();
	        return blocks !== null && blocks.collections !== null
	            ? objects.cloneObject(blocks.collections)
	            : null;
	    }
	    /**
	     * Check if more results are available
	     */
	    _showMoreButton() {
	        return this._data === null
	            ? false
	            : this.route.params.short && this._data.total === this._data.limit;
	    }
	    /**
	     * Parse data from API
	     *
	     * Should be overwritten by child classes
	     */
	    _parseAPIData(data) {
	        this._data = search$1.dataToSearchResults(this.provider, data);
	        // Mark as loaded, mark blocks for re-render and reset error
	        this.loading = false;
	        this.blocksRequireUpdate = true;
	        this.error = '';
	        // Create empty blocks
	        this._blocks = {
	            // Filters
	            collections: null,
	            // Icons and pagination
	            icons: iconsList.defaultIconsListBlock(),
	            pagination: pagination.defaultPaginationBlock(),
	        };
	        const initialisedBlocks = this._blocks;
	        // Check if data was valid
	        if (this._data === null) {
	            this.error = data === null ? 'not_found' : 'invalid_data';
	            this._triggerLoaded();
	            return;
	        }
	        const parsedData = this._data;
	        // Validate parameters
	        if (this.keyword !== parsedData.query) {
	            this.error = 'invalid_data';
	            this._triggerLoaded();
	            return;
	        }
	        // Overwrite limit
	        if (parsedData.limit) {
	            this.itemsLimit = parsedData.limit;
	        }
	        // Check if there are any icons
	        if (parsedData.total < 1) {
	            this.error = 'empty';
	        }
	        else {
	            // Create pagination
	            const pagination$1 = initialisedBlocks.pagination;
	            pagination$1.perPage = this.itemsPerPage;
	            pagination$1.fullLength = pagination$1.length = parsedData.icons.length;
	            pagination$1.page = Math.min(this.route.params.page, pagination.maxPage(pagination$1));
	            // Check if more results are available
	            pagination$1.more = this._showMoreButton();
	            // Get all collections
	            const prefixes = Object.keys(parsedData.collections);
	            // Store collections in global data
	            const registry = storage.getRegistry(this._instance);
	            const collections = registry.collections;
	            prefixes.forEach((prefix) => {
	                collections$1.setCollectionInfo(collections, this.provider, prefix, parsedData.collections[prefix]);
	            });
	            // Collections filter
	            if (prefixes.length > 1) {
	                const block = filters.defaultFiltersBlock();
	                this._blocks.collections = block;
	                block.filterType = 'collections';
	                prefixes.forEach((prefix) => {
	                    block.filters[prefix] = filters.defaultFilter(parsedData.collections[prefix].name);
	                });
	                filters.autoIndexFilters(block);
	            }
	        }
	        // Send event
	        this._triggerLoaded();
	    }
	}
	exports.SearchView = SearchView;

	});

	var custom = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CustomView = void 0;







	/**
	 * Class
	 */
	class CustomView extends base$1.BaseView {
	    /**
	     * Create view
	     */
	    constructor(instance, route, parent = null) {
	        super();
	        this._data = null;
	        this._blocks = null;
	        this.type = 'custom';
	        this._instance = instance;
	        this.route = route;
	        this.parent = parent;
	        this.customType = route.params.customType;
	        this._mustWaitForParent = true;
	    }
	    /**
	     * Start loading
	     */
	    _startLoading() {
	        this._startedLoading = true;
	        // Send event to load icons on next tick, unless they've been set synchronously after creating instance
	        setTimeout(() => {
	            if (this._data !== null) {
	                return;
	            }
	            const registry = storage.getRegistry(this._instance);
	            const events = registry.events;
	            // Fire public event, exposed to external code
	            events.fire('load-' + this.customType, this.setIcons.bind(this));
	        });
	    }
	    /**
	     * Run action on view
	     */
	    action(action, value) {
	        switch (action) {
	            // Change view
	            case 'parent':
	                this._parentAction(value);
	                return;
	            // Change provider
	            case 'provider':
	                this._providerAction(value);
	                return;
	            // Set icons
	            case 'set':
	                this.setIcons(value);
	                // Returning because setIcons will trigger event
	                return;
	            // Search icons
	            case 'filter':
	                if (typeof value !== 'string') {
	                    return;
	                }
	                value = value.trim().toLowerCase();
	                if (value === this.route.params.filter) {
	                    return;
	                }
	                this.route.params.filter = value;
	                this.blocksRequireUpdate = true;
	                break;
	            // Change current page
	            case 'pagination':
	                if (typeof value === 'string') {
	                    value = parseInt(value);
	                }
	                // Check number
	                if (typeof value !== 'number' ||
	                    isNaN(value) ||
	                    value < 0 ||
	                    value === this.route.params.page) {
	                    return;
	                }
	                // Change page
	                this.route.params.page = value;
	                this.blocksRequireUpdate = true;
	                break;
	            default:
	                return;
	        }
	        // Action has changed something - trigger update event
	        this._triggerUpdated();
	    }
	    /**
	     * Render blocks
	     */
	    render() {
	        if (this.loading || this._blocks === null || this._data === null) {
	            return null;
	        }
	        // Check if blocks have been cached or if there is a error
	        if (!this.blocksRequireUpdate || this.error !== '') {
	            return this._blocks;
	        }
	        this.blocksRequireUpdate = false;
	        // Apply route to blocks
	        const blocks = this._blocks;
	        // Copy icons
	        blocks.icons.icons = this._data.slice(0);
	        // Search icons
	        blocks.filter.keyword = this.route.params.filter;
	        blocks.icons = iconsList.applyIconFilters(blocks.icons, blocks.filter, [], true);
	        // Get items per page
	        const registry = storage.getRegistry(this._instance);
	        const config = registry.config;
	        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	        const itemsPerPage = config.ui.itemsPerPage;
	        // Check pagination
	        blocks.pagination.length = blocks.icons.icons.length;
	        blocks.pagination.page = this.route.params.page;
	        const maximumPage = pagination.maxPage(blocks.pagination);
	        if (maximumPage < blocks.pagination.page) {
	            this.route.params.page = blocks.pagination.page = maximumPage;
	        }
	        // Apply pagination
	        const startIndex = blocks.pagination.page * itemsPerPage;
	        blocks.icons.icons = blocks.icons.icons.slice(startIndex, startIndex + itemsPerPage);
	        return this._blocks;
	    }
	    /**
	     * Set icons
	     */
	    setIcons(data) {
	        this._waitForParent(() => {
	            this._setIcons(data);
	        });
	    }
	    _setIcons(data) {
	        // Check if data is valid
	        let dataArray = data;
	        let invalidData = false;
	        if (!(dataArray instanceof Array)) {
	            invalidData = true;
	            dataArray = [];
	        }
	        // Filter data
	        const parsedData = dataArray
	            .map((item) => {
	            // Convert strings
	            if (typeof item === 'string') {
	                item = icon.stringToIcon(item);
	            }
	            // Validate object
	            if (typeof item === 'object' && icon.validateIcon(item)) {
	                const icon = item;
	                return {
	                    provider: icon.provider,
	                    prefix: icon.prefix,
	                    name: icon.name,
	                };
	            }
	            // Invalid icon
	            return null;
	        })
	            .filter((icon) => icon !== null);
	        // Save data
	        this._data = parsedData;
	        // Mark as loaded, mark blocks for re-render and reset error
	        this.loading = false;
	        this.blocksRequireUpdate = true;
	        this.error = '';
	        // Create empty blocks
	        this._blocks = {
	            // Search
	            filter: Object.assign(search.defaultSearchBlock(), {
	                keyword: this.route.params.filter,
	                searchType: 'custom',
	                title: this.customType,
	            }),
	            // Icons and pagination
	            icons: iconsList.defaultIconsListBlock(),
	            pagination: pagination.defaultPaginationBlock(),
	        };
	        const initialisedBlocks = this._blocks;
	        // Check if data was valid
	        if (invalidData) {
	            this.error = data === null ? 'not_found' : 'invalid_data';
	            this._triggerLoaded();
	            return;
	        }
	        // Check if there are any icons
	        if (parsedData.length < 1) {
	            this.error = 'empty';
	        }
	        else {
	            // Get registry and modules
	            const registry = storage.getRegistry(this._instance);
	            const config = registry.config;
	            // Create pagination
	            const pagination$1 = initialisedBlocks.pagination;
	            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	            pagination$1.perPage = config.ui.itemsPerPage;
	            pagination$1.fullLength = pagination$1.length = parsedData.length;
	            pagination$1.page = Math.min(this.route.params.page, pagination.maxPage(pagination$1));
	        }
	        // Send event
	        this._triggerLoaded();
	    }
	    /**
	     * Get icons list
	     */
	    getIcons() {
	        if (this.loading || this._blocks === null || this._data === null) {
	            return null;
	        }
	        return objects.cloneObject(this._data);
	    }
	}
	exports.CustomView = CustomView;

	});

	var empty = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EmptyView = void 0;

	/**
	 * Class
	 */
	class EmptyView extends base$1.BaseView {
	    /**
	     * Create view
	     */
	    constructor(instance, route, parent = null) {
	        super();
	        this.type = 'empty';
	        this._instance = instance;
	        this.route = route;
	        this.parent = parent;
	    }
	    /**
	     * Start loading
	     */
	    _startLoading() {
	        this._startedLoading = true;
	        // Complete on next tick
	        setTimeout(() => {
	            this.loading = false;
	            this._triggerLoaded();
	        });
	    }
	    /**
	     * Run action on view
	     */
	    action(action, value) {
	        switch (action) {
	            // Navigate to parent view
	            case 'parent':
	                this._parentAction(value);
	                return;
	            // Change provider
	            case 'provider':
	                this._providerAction(value);
	                return;
	        }
	    }
	    /**
	     * Render blocks
	     */
	    render() {
	        return {};
	    }
	}
	exports.EmptyView = EmptyView;

	});

	var router = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Router = void 0;
	/**
	 * Change provider in home route
	 */
	function changeProvider(route, provider) {
	    switch (route.type) {
	        case 'collections':
	        case 'collection':
	        case 'search':
	            if (route.params === void 0) {
	                route.params = {};
	            }
	            route.params.provider = provider;
	    }
	    if (route.parent) {
	        changeProvider(route.parent, provider);
	    }
	}
	/**
	 * Router class
	 */
	class Router {
	    /**
	     * Constructor
	     *
	     * @param instance
	     * @param callback
	     */
	    constructor(instance) {
	        // Current view
	        this._view = null;
	        // Currently visible view, could be different than current view
	        this._visibleView = null;
	        // Timer for replacing view
	        this._timer = null;
	        // Default API provider
	        this.defaultProvider = '';
	        this._instance = instance;
	        const registry = storage.getRegistry(this._instance);
	        // Subscribe to view events, handle them in the same handler
	        const events = registry.events;
	        events.subscribe('view-loaded', (view) => {
	            this._viewEvent(view);
	        });
	        events.subscribe('view-updated', (view) => {
	            this._viewEvent(view);
	        });
	    }
	    /**
	     * Get current error message
	     */
	    error() {
	        return this._visibleView === null || this._visibleView.loading
	            ? 'loading'
	            : this._visibleView.error;
	    }
	    /**
	     * Render currently visible view
	     */
	    render() {
	        return this._visibleView === null ? null : this._visibleView.render();
	    }
	    /**
	     * Set or get current route
	     *
	     * Route cannot be set to null. Setting route to null will result in home route.
	     * Route could be null when reading it for the first time, so value null.
	     */
	    set partialRoute(route) {
	        this._setRoute(route ? convert.objectToRoute(route) : null);
	    }
	    get partialRoute() {
	        return this._visibleView
	            ? convert.routeToObject(this._visibleView.route)
	            : null;
	    }
	    set fullRoute(route) {
	        this._setRoute(route);
	    }
	    get fullRoute() {
	        return this._visibleView ? this._visibleView.route : null;
	    }
	    /**
	     * Navigate to home
	     */
	    home(provider = null) {
	        const registry = storage.getRegistry(this._instance);
	        const config = registry.config;
	        // Generate route
	        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	        const defaultRouteString = config.router.home;
	        let route = null;
	        if (defaultRouteString !== '') {
	            // Use configured route
	            route = convert.objectToRoute(JSON.parse(defaultRouteString));
	        }
	        else {
	            // Detect route. Check custom icon sets first
	            const customIconSets = registry.customIconSets;
	            const currentProvider = typeof provider === 'string' ? provider : this.defaultProvider;
	            if (customIconSets.providers[currentProvider] === void 0) {
	                // No custom icon sets, use collections
	                route = convert.objectToRoute({
	                    type: 'collections',
	                });
	            }
	            else {
	                const customSetsData = customIconSets.providers[currentProvider];
	                // Custom icon set exists
	                let showCollections = customSetsData.total > 1;
	                if (!showCollections &&
	                    customIconSets.merge !== 'only-custom') {
	                    // Show collections if API provider is valid
	                    showCollections = this._checkProvider(currentProvider, false);
	                }
	                route = convert.objectToRoute(showCollections
	                    ? {
	                        type: 'collections',
	                        params: {
	                            provider: currentProvider,
	                        },
	                    }
	                    : {
	                        type: 'collection',
	                        params: {
	                            provider: currentProvider,
	                            prefix: Object.keys(customSetsData.data).shift(),
	                        },
	                    });
	            }
	        }
	        if (route === null) {
	            throw new Error('Error resetting route');
	        }
	        // Change default provider
	        changeProvider(route, provider === null || !this._checkProvider(provider)
	            ? this.defaultProvider
	            : provider);
	        // Generate view
	        const view = this._viewFromRoute(route);
	        if (view === null) {
	            throw new Error('Error resetting route');
	        }
	        // Change view
	        this._setView(view, true);
	    }
	    /**
	     * Apply action to currently visible view
	     */
	    action(action, value) {
	        if (this._visibleView === null) {
	            return;
	        }
	        // If visible view does not match current view, reset pending view. Action overrides previous view change
	        this._changeCurrentView();
	        // Apply action to current view
	        this._visibleView.action(action, value);
	    }
	    /**
	     * Set icons to view with matching customType
	     *
	     * View must be visible or pending
	     */
	    setCustomIcons(customType, icons) {
	        const view = this._getCustomView(customType);
	        if (view !== null) {
	            view.setIcons(icons);
	            return true;
	        }
	        return false;
	    }
	    /**
	     * Get custom icons
	     */
	    getCustomIcons(customType) {
	        const view = this._getCustomView(customType);
	        return view === null ? null : view.getIcons();
	    }
	    /**
	     * Set route
	     */
	    _setRoute(route) {
	        let view;
	        // Check provider
	        if (route && route.params) {
	            const provider = route.params
	                .provider;
	            if (typeof provider === 'string' &&
	                provider !== '' &&
	                !this._checkProvider(provider)) {
	                route = null;
	            }
	        }
	        // Attempt to create view
	        if (route !== null && (view = this._viewFromRoute(route)) !== null) {
	            this._setView(view, true);
	            return;
	        }
	        // Error - navigate to home
	        this.home();
	    }
	    /**
	     * Find custom view
	     */
	    _getCustomView(customType) {
	        if (this._visibleView === null || this._view === null) {
	            return null;
	        }
	        // Check visible view
	        if (this._visibleView.type === 'custom' &&
	            this._visibleView.type === customType) {
	            return this._visibleView;
	        }
	        // Check pending view
	        if (this._view.type === 'custom' &&
	            this._view.type === customType) {
	            return this._view;
	        }
	        return null;
	    }
	    /**
	     * Create child view
	     */
	    createChildView(route, parentLevels = 0) {
	        const cleanRoute = route === null ? null : convert.objectToRoute(route);
	        if (cleanRoute === null) {
	            return;
	        }
	        // Set parent view
	        let parentView = this._visibleView;
	        for (let i = 0; i < parentLevels; i++) {
	            if (parentView !== null) {
	                parentView = parentView.parent;
	            }
	        }
	        // Create view
	        const view = this._viewFromRoute(cleanRoute, parentView);
	        if (view === null) {
	            return;
	        }
	        // Reset pending view
	        this._changeCurrentView();
	        // Set it as new view, but not immediately
	        this._setView(view, false);
	    }
	    /**
	     * Go up in parent views tree by "levels"
	     */
	    setParentView(levels = 1) {
	        let view = this._visibleView;
	        for (let i = 0; i < levels; i++) {
	            if (view === null || view.parent === null) {
	                return;
	            }
	            view = view.parent;
	        }
	        if (view !== this._visibleView) {
	            this._setView(view, true);
	        }
	    }
	    /**
	     * Set view
	     */
	    _setView(view, immediate) {
	        this._view = view;
	        view.startLoading();
	        if ((immediate && this._visibleView !== view) ||
	            !view.loading ||
	            this._visibleView === null) {
	            // Change visible view immediately and trigger event
	            this._visibleView = view;
	            this._triggerChange(true);
	        }
	        else {
	            // Start timer that will change visible view and trigger event after delay
	            this._startTimer();
	        }
	    }
	    /**
	     * Reset current view to visible view
	     */
	    _changeCurrentView() {
	        if (this._view !== this._visibleView) {
	            this._view = this._visibleView;
	            this._stopTimer();
	            return true;
	        }
	        return false;
	    }
	    /**
	     * Change visible view to current view
	     */
	    _changeVisibleView() {
	        if (this._view !== this._visibleView) {
	            this._visibleView = this._view;
	            this._stopTimer();
	            this._triggerChange(true);
	            return true;
	        }
	        return false;
	    }
	    /**
	     * Create view from route
	     */
	    _viewFromRoute(route, parentView = void 0) {
	        // Get parent view
	        let parent = null;
	        if (parentView !== void 0) {
	            parent = parentView;
	            route.parent = parentView === null ? null : parentView.route;
	        }
	        else if (route.parent !== null) {
	            parent = this._viewFromRoute(route.parent);
	            if (parent === null) {
	                return null;
	            }
	        }
	        // Create view
	        switch (route.type) {
	            case 'collections':
	                return new collections$2.CollectionsView(this._instance, route, parent);
	            case 'collection':
	                return new collection$1.CollectionView(this._instance, route, parent);
	            case 'search':
	                return new search$2.SearchView(this._instance, route, parent);
	            case 'custom':
	                return new custom.CustomView(this._instance, route, parent);
	            case 'empty':
	                return new empty.EmptyView(this._instance, route, parent);
	            default:
	                return null;
	        }
	    }
	    /**
	     * Handle event from view
	     */
	    _viewEvent(view) {
	        if (view !== this._view) {
	            // Action for different view - ignore it
	            return;
	        }
	        // Change visible view if it doesn't match view.
	        // Function also calls _triggerChange(true)
	        if (this._changeVisibleView()) {
	            return;
	        }
	        // Something changed in visible view
	        this._triggerChange(false);
	    }
	    /**
	     * Something has changed in visible view
	     */
	    _triggerChange(viewChanged) {
	        const registry = storage.getRegistry(this._instance);
	        const events = registry.events;
	        // Render blocks first, it might change error or route
	        const blocks = this.render();
	        // Create item
	        const item = {
	            viewChanged,
	            error: this.error(),
	            route: this.partialRoute,
	            blocks,
	        };
	        events.fire('render', item);
	    }
	    /**
	     * Start timer to change visible view
	     */
	    _startTimer() {
	        this._stopTimer();
	        const registry = storage.getRegistry(this._instance);
	        const config = registry.config;
	        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	        const timeout = config.ui.viewUpdateDelay;
	        if (!timeout) {
	            this._changeVisibleView();
	        }
	        else {
	            // Store current view, change it on timer
	            const view = this._view;
	            this._timer = setTimeout(() => {
	                if (this._view === view) {
	                    this._changeVisibleView();
	                }
	            }, timeout);
	        }
	    }
	    /**
	     * Stop loading timer
	     */
	    _stopTimer() {
	        if (this._timer !== null) {
	            clearTimeout(this._timer);
	            this._timer = null;
	        }
	    }
	    /**
	     * Check if provider exists
	     */
	    _checkProvider(provider, checkCustom = true) {
	        // Get provider
	        const result = providers.getProvider(provider);
	        if (result !== null) {
	            return true;
	        }
	        // Test custom icon sets. Allow invalid provider if it has custom data
	        if (!checkCustom) {
	            return false;
	        }
	        const registry = storage.getRegistry(this._instance);
	        const customIconSets = registry.customIconSets;
	        return customIconSets.providers[provider] !== void 0;
	    }
	}
	exports.Router = Router;

	});

	var customSets = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.convertCustomSets = exports.emptyConvertedSet = void 0;
	const iconify_1 = __importDefault(Iconify__default['default']);


	/**
	 * TypeScript guard
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-empty-function
	function assertNever(s) { }
	/**
	 * Empty
	 */
	exports.emptyConvertedSet = {
	    merge: 'custom-last',
	    providers: Object.create(null),
	};
	/**
	 * Convert custom icon sets, return empty set on failure
	 */
	function convertCustomSets(data, importIcons = true) {
	    if (!data.iconSets || !data.iconSets.length) {
	        return exports.emptyConvertedSet;
	    }
	    // Merge
	    let merge = 'only-custom';
	    switch (data.merge) {
	        case 'custom-first':
	        case 'custom-last':
	        case 'only-custom':
	            merge = data.merge;
	            break;
	        case void 0:
	            break;
	        default:
	            assertNever(data.merge);
	    }
	    // Set basic data
	    const result = {
	        merge,
	        providers: Object.create(null),
	    };
	    // Info to parse later
	    const rawInfo = Object.create(null);
	    // Get all providers, add icon sets to Iconify.
	    data.iconSets.forEach((item) => {
	        if (typeof item.prefix !== 'string') {
	            return;
	        }
	        // Get/set provider
	        if (typeof data.provider === 'string') {
	            item.provider = data.provider;
	        }
	        const provider = typeof item.provider === 'string' ? item.provider : '';
	        // Custom info block
	        if (!item.info && data.info && data.info[item.prefix]) {
	            item.info = data.info[item.prefix];
	        }
	        // Convert data
	        const convertedData = collection.rawDataToCollection(item);
	        if (!convertedData) {
	            return;
	        }
	        // Add data to result
	        if (result.providers[provider] === void 0) {
	            result.providers[provider] = {
	                total: 0,
	                data: Object.create(null),
	                collections: {},
	            };
	        }
	        const providerData = result.providers[provider];
	        if (providerData.data[convertedData.prefix] !== void 0) {
	            // Already exists
	            return;
	        }
	        // Add data
	        providerData.data[convertedData.prefix] = convertedData;
	        providerData.total++;
	        // Store raw info block to convert to collections list later, overwrite count
	        if (rawInfo[provider] === void 0) {
	            rawInfo[provider] = Object.create(null);
	        }
	        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
	        const rawItemInfo = Object.assign({}, item.info);
	        rawItemInfo.total = convertedData.total;
	        rawInfo[provider][convertedData.prefix] = rawItemInfo;
	        // Add icons to Iconify
	        if (importIcons) {
	            iconify_1.default.addCollection(item);
	        }
	    });
	    // Parse collections lists
	    Object.keys(rawInfo).forEach((provider) => {
	        result.providers[provider].collections = collections.dataToCollections(rawInfo[provider]);
	    });
	    return result;
	}
	exports.convertCustomSets = convertCustomSets;

	});

	var registry = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Registry = void 0;






	/**
	 * Registry class
	 */
	class Registry {
	    constructor(params) {
	        this._data = Object.create(null);
	        const namespace = typeof params === 'string'
	            ? params
	            : typeof params === 'object' &&
	                typeof params.namespace === 'string'
	                ? params.namespace
	                : 'iconify';
	        this.namespace = namespace;
	        // Get unique id based on namespace
	        this.id = storage.uniqueId(namespace);
	        // Add namespace
	        this.initialised = storage.addRegistry(this);
	        // Copy shared data
	        this._sharedData = storage.getSharedData(namespace);
	        // Params
	        this.params = typeof params === 'object' ? params : {};
	        // Add instance
	        this._save();
	    }
	    /**
	     * Save instance in registry list
	     */
	    _save() {
	        storage.saveRegistry(this);
	    }
	    /**
	     * Get/set config
	     */
	    get config() {
	        if (this._sharedData.config === void 0) {
	            this._sharedData.config = config.createConfig(this.params.config);
	        }
	        return this._sharedData.config;
	    }
	    set config(value) {
	        this._sharedData.config = value;
	    }
	    /**
	     * Get/set events
	     */
	    get events() {
	        if (this._data.events === void 0) {
	            this._data.events = new events.Events();
	        }
	        return this._data.events;
	    }
	    set events(value) {
	        this._data.events = value;
	    }
	    /**
	     * Get/set API
	     */
	    get api() {
	        if (this._sharedData.api === void 0) {
	            this._sharedData.api = new fetch_1.API(this);
	        }
	        return this._sharedData.api;
	    }
	    set api(value) {
	        this._sharedData.api = value;
	    }
	    /**
	     * Get/set custom icon sets
	     */
	    get customIconSets() {
	        if (this._data.customIconSets === void 0) {
	            this._data.customIconSets = customSets.emptyConvertedSet;
	        }
	        return this._data.customIconSets;
	    }
	    set customIconSets(value) {
	        this._data.customIconSets = value;
	    }
	    /**
	     * Get/set collections
	     */
	    get collections() {
	        if (this._sharedData.collections === void 0) {
	            this._sharedData.collections = Object.create(null);
	        }
	        return this._sharedData.collections;
	    }
	    set collections(value) {
	        this._sharedData.collections = value;
	    }
	    /**
	     * Set/set router
	     */
	    get router() {
	        if (this._data.router === void 0) {
	            this._data.router = new router.Router(this.id);
	        }
	        return this._data.router;
	    }
	    set router(value) {
	        this._data.router = value;
	    }
	    /**
	     * Set/set route
	     */
	    get fullRoute() {
	        return this.router.fullRoute;
	    }
	    set fullRoute(value) {
	        this.router.fullRoute = value;
	    }
	    get partialRoute() {
	        return this.router.partialRoute;
	    }
	    set partialRoute(value) {
	        this.router.partialRoute = value;
	    }
	    /**
	     * Get/set custom data
	     */
	    getCustom(key, local = true) {
	        const data = local ? this._data : this._sharedData;
	        if (data.custom === void 0) {
	            return void 0;
	        }
	        return data.custom[key];
	    }
	    setCustom(key, value, local = true) {
	        const data = local ? this._data : this._sharedData;
	        if (data.custom === void 0) {
	            data.custom = Object.create(null);
	        }
	        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	        const custom = data.custom;
	        // Create getter and setter for local properties
	        if (local && custom[key] === void 0) {
	            Object.defineProperty(this, key, {
	                get() {
	                    return custom[key];
	                },
	                set(value) {
	                    custom[key] = value;
	                },
	            });
	        }
	        custom[key] = value;
	    }
	    /**
	     * Destroy instance
	     */
	    destroy() {
	        storage.destroyRegistry(this);
	    }
	}
	exports.Registry = Registry;

	});

	var types = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isBlockEmpty = void 0;
	/**
	 * Check if block is empty
	 */
	function isBlockEmpty(block) {
	    if (block === void 0 || block === null) {
	        return true;
	    }
	    const type = block.type;
	    switch (type) {
	        case 'collection-info':
	            return collectionInfo.isCollectionInfoBlockEmpty(block);
	        case 'collections-filter':
	            return collectionsFilter.isCollectionsFilterBlockEmpty(block);
	        case 'collections-list':
	            return collectionsList.isCollectionsBlockEmpty(block);
	        case 'filters':
	            return filters.isFiltersBlockEmpty(block);
	        case 'icons-list':
	            return iconsList.isIconsListBlockEmpty(block);
	        case 'pagination':
	            return pagination.isPaginationEmpty(block);
	        case 'search':
	            return search.isSearchBlockEmpty(block);
	        default:
	            return true;
	    }
	}
	exports.isBlockEmpty = isBlockEmpty;

	});

	var lib = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getCoreInstance = exports.IconFinderCore = exports.cloneObject = exports.compareObjects = exports.stringToIcon = exports.compareIcons = exports.validateIcon = exports.iconToString = exports.setComponentsConfig = exports.mergeConfig = exports.customisedConfig = exports.getCollectionTitle = exports.getCollectionInfo = exports.objectToRoute = exports.listProviders = exports.convertProviderData = exports.getProvider = exports.addProvider = exports.maxPage = exports.showPagination = exports.iterateCollectionsBlock = exports.getCollectionsBlockPrefixes = exports.getCollectionsBlockCategories = exports.isBlockEmpty = void 0;




	Object.defineProperty(exports, "getCollectionInfo", { enumerable: true, get: function () { return collections$1.getCollectionInfo; } });
	/**
	 * Export data for various blocks
	 */

	Object.defineProperty(exports, "isBlockEmpty", { enumerable: true, get: function () { return types.isBlockEmpty; } });

	Object.defineProperty(exports, "getCollectionsBlockCategories", { enumerable: true, get: function () { return collectionsList.getCollectionsBlockCategories; } });
	Object.defineProperty(exports, "getCollectionsBlockPrefixes", { enumerable: true, get: function () { return collectionsList.getCollectionsBlockPrefixes; } });
	Object.defineProperty(exports, "iterateCollectionsBlock", { enumerable: true, get: function () { return collectionsList.iterateCollectionsBlock; } });

	Object.defineProperty(exports, "showPagination", { enumerable: true, get: function () { return pagination.showPagination; } });
	Object.defineProperty(exports, "maxPage", { enumerable: true, get: function () { return pagination.maxPage; } });

	Object.defineProperty(exports, "addProvider", { enumerable: true, get: function () { return providers.addProvider; } });
	Object.defineProperty(exports, "getProvider", { enumerable: true, get: function () { return providers.getProvider; } });
	Object.defineProperty(exports, "convertProviderData", { enumerable: true, get: function () { return providers.convertProviderData; } });
	Object.defineProperty(exports, "listProviders", { enumerable: true, get: function () { return providers.listProviders; } });

	Object.defineProperty(exports, "objectToRoute", { enumerable: true, get: function () { return convert.objectToRoute; } });
	var collections_2 = collections$1;
	Object.defineProperty(exports, "getCollectionTitle", { enumerable: true, get: function () { return collections_2.getCollectionTitle; } });

	Object.defineProperty(exports, "customisedConfig", { enumerable: true, get: function () { return config.customisedConfig; } });
	Object.defineProperty(exports, "mergeConfig", { enumerable: true, get: function () { return config.mergeConfig; } });
	Object.defineProperty(exports, "setComponentsConfig", { enumerable: true, get: function () { return config.setComponentsConfig; } });

	Object.defineProperty(exports, "iconToString", { enumerable: true, get: function () { return icon.iconToString; } });
	Object.defineProperty(exports, "validateIcon", { enumerable: true, get: function () { return icon.validateIcon; } });
	Object.defineProperty(exports, "compareIcons", { enumerable: true, get: function () { return icon.compareIcons; } });
	Object.defineProperty(exports, "stringToIcon", { enumerable: true, get: function () { return icon.stringToIcon; } });
	// Objects

	Object.defineProperty(exports, "compareObjects", { enumerable: true, get: function () { return objects.compareObjects; } });
	Object.defineProperty(exports, "cloneObject", { enumerable: true, get: function () { return objects.cloneObject; } });
	/**
	 * Icon Finder Core class
	 */
	class IconFinderCore {
	    constructor(params) {
	        this.params = params;
	        // Get Registry instance
	        const registry$1 = (this.registry = new registry.Registry(params));
	        this.id = registry$1.id;
	        registry$1.setCustom('core', this, true);
	        // Set custom icon sets
	        if (params.iconSets) {
	            registry$1.customIconSets = customSets.convertCustomSets(params.iconSets);
	            // console.log('Custom sets:', registry.customIconSets);
	        }
	        // Get other required classes from Registry
	        const router = (this.router = registry$1.router);
	        const events = registry$1.events;
	        // Subscribe to events
	        events.subscribe('render', this._routerEvent.bind(this));
	        if (typeof params.custom === 'object' && params.custom !== null) {
	            Object.keys(params.custom).forEach((customType) => {
	                events.subscribe('load-' + customType, this._loadCustomIconsEvent.bind(this, customType));
	            });
	        }
	        // Change route on next tick, so callback would be called asynchronously
	        setTimeout(() => {
	            if (router.fullRoute === null) {
	                if (params.route !== void 0) {
	                    // Set route. On null or failure router will call home()
	                    router.partialRoute = params.route;
	                }
	                else {
	                    router.home();
	                }
	            }
	        });
	    }
	    /**
	     * Get collection information
	     */
	    getCollection(provider, prefix) {
	        return collections$1.getCollectionInfo(this.registry.collections, provider, prefix);
	    }
	    /**
	     * Event was fired by router
	     */
	    _routerEvent(data) {
	        this.params.callback(data, this);
	    }
	    /**
	     * Load data
	     */
	    _loadCustomIconsEvent(customType, callback) {
	        if (this.params.custom === void 0) {
	            return;
	        }
	        this.params.custom[customType](callback);
	    }
	    /**
	     * Destroy instance
	     */
	    destroy() {
	        this.registry.destroy();
	    }
	}
	exports.IconFinderCore = IconFinderCore;
	/**
	 * Find Icon Finder Core instance for id
	 */
	function getCoreInstance(id) {
	    const registry = storage.getRegistry(id);
	    return registry
	        ? registry.getCustom('core', true)
	        : void 0;
	}
	exports.getCoreInstance = getCoreInstance;

	});

	function noop() { }
	function assign(tar, src) {
	    // @ts-ignore
	    for (const k in src)
	        tar[k] = src[k];
	    return tar;
	}
	function run(fn) {
	    return fn();
	}
	function blank_object() {
	    return Object.create(null);
	}
	function run_all(fns) {
	    fns.forEach(run);
	}
	function is_function(thing) {
	    return typeof thing === 'function';
	}
	function safe_not_equal(a, b) {
	    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}
	function is_empty(obj) {
	    return Object.keys(obj).length === 0;
	}
	function create_slot(definition, ctx, $$scope, fn) {
	    if (definition) {
	        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
	        return definition[0](slot_ctx);
	    }
	}
	function get_slot_context(definition, ctx, $$scope, fn) {
	    return definition[1] && fn
	        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
	        : $$scope.ctx;
	}
	function get_slot_changes(definition, $$scope, dirty, fn) {
	    if (definition[2] && fn) {
	        const lets = definition[2](fn(dirty));
	        if ($$scope.dirty === undefined) {
	            return lets;
	        }
	        if (typeof lets === 'object') {
	            const merged = [];
	            const len = Math.max($$scope.dirty.length, lets.length);
	            for (let i = 0; i < len; i += 1) {
	                merged[i] = $$scope.dirty[i] | lets[i];
	            }
	            return merged;
	        }
	        return $$scope.dirty | lets;
	    }
	    return $$scope.dirty;
	}
	function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
	    const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
	    if (slot_changes) {
	        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
	        slot.p(slot_context, slot_changes);
	    }
	}

	function append(target, node) {
	    target.appendChild(node);
	}
	function insert(target, node, anchor) {
	    target.insertBefore(node, anchor || null);
	}
	function detach(node) {
	    node.parentNode.removeChild(node);
	}
	function destroy_each(iterations, detaching) {
	    for (let i = 0; i < iterations.length; i += 1) {
	        if (iterations[i])
	            iterations[i].d(detaching);
	    }
	}
	function element(name) {
	    return document.createElement(name);
	}
	function text(data) {
	    return document.createTextNode(data);
	}
	function space() {
	    return text(' ');
	}
	function empty$1() {
	    return text('');
	}
	function listen(node, event, handler, options) {
	    node.addEventListener(event, handler, options);
	    return () => node.removeEventListener(event, handler, options);
	}
	function prevent_default(fn) {
	    return function (event) {
	        event.preventDefault();
	        // @ts-ignore
	        return fn.call(this, event);
	    };
	}
	function attr(node, attribute, value) {
	    if (value == null)
	        node.removeAttribute(attribute);
	    else if (node.getAttribute(attribute) !== value)
	        node.setAttribute(attribute, value);
	}
	function children(element) {
	    return Array.from(element.childNodes);
	}
	function set_data(text, data) {
	    data = '' + data;
	    if (text.wholeText !== data)
	        text.data = data;
	}
	function set_input_value(input, value) {
	    input.value = value == null ? '' : value;
	}
	class HtmlTag {
	    constructor(anchor = null) {
	        this.a = anchor;
	        this.e = this.n = null;
	    }
	    m(html, target, anchor = null) {
	        if (!this.e) {
	            this.e = element(target.nodeName);
	            this.t = target;
	            this.h(html);
	        }
	        this.i(anchor);
	    }
	    h(html) {
	        this.e.innerHTML = html;
	        this.n = Array.from(this.e.childNodes);
	    }
	    i(anchor) {
	        for (let i = 0; i < this.n.length; i += 1) {
	            insert(this.t, this.n[i], anchor);
	        }
	    }
	    p(html) {
	        this.d();
	        this.h(html);
	        this.i(this.a);
	    }
	    d() {
	        this.n.forEach(detach);
	    }
	}

	let current_component;
	function set_current_component(component) {
	    current_component = component;
	}
	function get_current_component() {
	    if (!current_component)
	        throw new Error('Function called outside component initialization');
	    return current_component;
	}
	function onMount(fn) {
	    get_current_component().$$.on_mount.push(fn);
	}
	function onDestroy(fn) {
	    get_current_component().$$.on_destroy.push(fn);
	}
	function setContext(key, context) {
	    get_current_component().$$.context.set(key, context);
	}
	function getContext(key) {
	    return get_current_component().$$.context.get(key);
	}

	const dirty_components = [];
	const binding_callbacks = [];
	const render_callbacks = [];
	const flush_callbacks = [];
	const resolved_promise = Promise.resolve();
	let update_scheduled = false;
	function schedule_update() {
	    if (!update_scheduled) {
	        update_scheduled = true;
	        resolved_promise.then(flush);
	    }
	}
	function add_render_callback(fn) {
	    render_callbacks.push(fn);
	}
	function add_flush_callback(fn) {
	    flush_callbacks.push(fn);
	}
	let flushing = false;
	const seen_callbacks = new Set();
	function flush() {
	    if (flushing)
	        return;
	    flushing = true;
	    do {
	        // first, call beforeUpdate functions
	        // and update components
	        for (let i = 0; i < dirty_components.length; i += 1) {
	            const component = dirty_components[i];
	            set_current_component(component);
	            update(component.$$);
	        }
	        set_current_component(null);
	        dirty_components.length = 0;
	        while (binding_callbacks.length)
	            binding_callbacks.pop()();
	        // then, once components are updated, call
	        // afterUpdate functions. This may cause
	        // subsequent updates...
	        for (let i = 0; i < render_callbacks.length; i += 1) {
	            const callback = render_callbacks[i];
	            if (!seen_callbacks.has(callback)) {
	                // ...so guard against infinite loops
	                seen_callbacks.add(callback);
	                callback();
	            }
	        }
	        render_callbacks.length = 0;
	    } while (dirty_components.length);
	    while (flush_callbacks.length) {
	        flush_callbacks.pop()();
	    }
	    update_scheduled = false;
	    flushing = false;
	    seen_callbacks.clear();
	}
	function update($$) {
	    if ($$.fragment !== null) {
	        $$.update();
	        run_all($$.before_update);
	        const dirty = $$.dirty;
	        $$.dirty = [-1];
	        $$.fragment && $$.fragment.p($$.ctx, dirty);
	        $$.after_update.forEach(add_render_callback);
	    }
	}
	const outroing = new Set();
	let outros;
	function group_outros() {
	    outros = {
	        r: 0,
	        c: [],
	        p: outros // parent group
	    };
	}
	function check_outros() {
	    if (!outros.r) {
	        run_all(outros.c);
	    }
	    outros = outros.p;
	}
	function transition_in(block, local) {
	    if (block && block.i) {
	        outroing.delete(block);
	        block.i(local);
	    }
	}
	function transition_out(block, local, detach, callback) {
	    if (block && block.o) {
	        if (outroing.has(block))
	            return;
	        outroing.add(block);
	        outros.c.push(() => {
	            outroing.delete(block);
	            if (callback) {
	                if (detach)
	                    block.d(1);
	                callback();
	            }
	        });
	        block.o(local);
	    }
	}

	function destroy_block(block, lookup) {
	    block.d(1);
	    lookup.delete(block.key);
	}
	function outro_and_destroy_block(block, lookup) {
	    transition_out(block, 1, 1, () => {
	        lookup.delete(block.key);
	    });
	}
	function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
	    let o = old_blocks.length;
	    let n = list.length;
	    let i = o;
	    const old_indexes = {};
	    while (i--)
	        old_indexes[old_blocks[i].key] = i;
	    const new_blocks = [];
	    const new_lookup = new Map();
	    const deltas = new Map();
	    i = n;
	    while (i--) {
	        const child_ctx = get_context(ctx, list, i);
	        const key = get_key(child_ctx);
	        let block = lookup.get(key);
	        if (!block) {
	            block = create_each_block(key, child_ctx);
	            block.c();
	        }
	        else if (dynamic) {
	            block.p(child_ctx, dirty);
	        }
	        new_lookup.set(key, new_blocks[i] = block);
	        if (key in old_indexes)
	            deltas.set(key, Math.abs(i - old_indexes[key]));
	    }
	    const will_move = new Set();
	    const did_move = new Set();
	    function insert(block) {
	        transition_in(block, 1);
	        block.m(node, next);
	        lookup.set(block.key, block);
	        next = block.first;
	        n--;
	    }
	    while (o && n) {
	        const new_block = new_blocks[n - 1];
	        const old_block = old_blocks[o - 1];
	        const new_key = new_block.key;
	        const old_key = old_block.key;
	        if (new_block === old_block) {
	            // do nothing
	            next = new_block.first;
	            o--;
	            n--;
	        }
	        else if (!new_lookup.has(old_key)) {
	            // remove old block
	            destroy(old_block, lookup);
	            o--;
	        }
	        else if (!lookup.has(new_key) || will_move.has(new_key)) {
	            insert(new_block);
	        }
	        else if (did_move.has(old_key)) {
	            o--;
	        }
	        else if (deltas.get(new_key) > deltas.get(old_key)) {
	            did_move.add(new_key);
	            insert(new_block);
	        }
	        else {
	            will_move.add(old_key);
	            o--;
	        }
	    }
	    while (o--) {
	        const old_block = old_blocks[o];
	        if (!new_lookup.has(old_block.key))
	            destroy(old_block, lookup);
	    }
	    while (n)
	        insert(new_blocks[n - 1]);
	    return new_blocks;
	}

	function get_spread_update(levels, updates) {
	    const update = {};
	    const to_null_out = {};
	    const accounted_for = { $$scope: 1 };
	    let i = levels.length;
	    while (i--) {
	        const o = levels[i];
	        const n = updates[i];
	        if (n) {
	            for (const key in o) {
	                if (!(key in n))
	                    to_null_out[key] = 1;
	            }
	            for (const key in n) {
	                if (!accounted_for[key]) {
	                    update[key] = n[key];
	                    accounted_for[key] = 1;
	                }
	            }
	            levels[i] = n;
	        }
	        else {
	            for (const key in o) {
	                accounted_for[key] = 1;
	            }
	        }
	    }
	    for (const key in to_null_out) {
	        if (!(key in update))
	            update[key] = undefined;
	    }
	    return update;
	}
	function get_spread_object(spread_props) {
	    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
	}

	function bind(component, name, callback) {
	    const index = component.$$.props[name];
	    if (index !== undefined) {
	        component.$$.bound[index] = callback;
	        callback(component.$$.ctx[index]);
	    }
	}
	function create_component(block) {
	    block && block.c();
	}
	function mount_component(component, target, anchor) {
	    const { fragment, on_mount, on_destroy, after_update } = component.$$;
	    fragment && fragment.m(target, anchor);
	    // onMount happens before the initial afterUpdate
	    add_render_callback(() => {
	        const new_on_destroy = on_mount.map(run).filter(is_function);
	        if (on_destroy) {
	            on_destroy.push(...new_on_destroy);
	        }
	        else {
	            // Edge case - component was destroyed immediately,
	            // most likely as a result of a binding initialising
	            run_all(new_on_destroy);
	        }
	        component.$$.on_mount = [];
	    });
	    after_update.forEach(add_render_callback);
	}
	function destroy_component(component, detaching) {
	    const $$ = component.$$;
	    if ($$.fragment !== null) {
	        run_all($$.on_destroy);
	        $$.fragment && $$.fragment.d(detaching);
	        // TODO null out other refs, including component.$$ (but need to
	        // preserve final state?)
	        $$.on_destroy = $$.fragment = null;
	        $$.ctx = [];
	    }
	}
	function make_dirty(component, i) {
	    if (component.$$.dirty[0] === -1) {
	        dirty_components.push(component);
	        schedule_update();
	        component.$$.dirty.fill(0);
	    }
	    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
	}
	function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
	    const parent_component = current_component;
	    set_current_component(component);
	    const prop_values = options.props || {};
	    const $$ = component.$$ = {
	        fragment: null,
	        ctx: null,
	        // state
	        props,
	        update: noop,
	        not_equal,
	        bound: blank_object(),
	        // lifecycle
	        on_mount: [],
	        on_destroy: [],
	        before_update: [],
	        after_update: [],
	        context: new Map(parent_component ? parent_component.$$.context : []),
	        // everything else
	        callbacks: blank_object(),
	        dirty,
	        skip_bound: false
	    };
	    let ready = false;
	    $$.ctx = instance
	        ? instance(component, prop_values, (i, ret, ...rest) => {
	            const value = rest.length ? rest[0] : ret;
	            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
	                if (!$$.skip_bound && $$.bound[i])
	                    $$.bound[i](value);
	                if (ready)
	                    make_dirty(component, i);
	            }
	            return ret;
	        })
	        : [];
	    $$.update();
	    ready = true;
	    run_all($$.before_update);
	    // `false` as a special case of no DOM component
	    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
	    if (options.target) {
	        if (options.hydrate) {
	            const nodes = children(options.target);
	            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	            $$.fragment && $$.fragment.l(nodes);
	            nodes.forEach(detach);
	        }
	        else {
	            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	            $$.fragment && $$.fragment.c();
	        }
	        if (options.intro)
	            transition_in(component.$$.fragment);
	        mount_component(component, options.target, options.anchor);
	        flush();
	    }
	    set_current_component(parent_component);
	}
	class SvelteComponent {
	    $destroy() {
	        destroy_component(this, 1);
	        this.$destroy = noop;
	    }
	    $on(type, callback) {
	        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
	        callbacks.push(callback);
	        return () => {
	            const index = callbacks.indexOf(callback);
	            if (index !== -1)
	                callbacks.splice(index, 1);
	        };
	    }
	    $set($$props) {
	        if (this.$$set && !is_empty($$props)) {
	            this.$$.skip_bound = true;
	            this.$$set($$props);
	            this.$$.skip_bound = false;
	        }
	    }
	}

	/* src/icon-finder/components/main/Wrapper.svelte generated by Svelte v3.29.4 */

	function create_fragment(ctx) {
		let div;
		let current;
		const default_slot_template = /*#slots*/ ctx[1].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

		return {
			c() {
				div = element("div");
				if (default_slot) default_slot.c();
				attr(div, "class", "iif-wrapper");
			},
			m(target, anchor) {
				insert(target, div, anchor);

				if (default_slot) {
					default_slot.m(div, null);
				}

				current = true;
			},
			p(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 1) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
					}
				}
			},
			i(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				if (default_slot) default_slot.d(detaching);
			}
		};
	}

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;

		$$self.$$set = $$props => {
			if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
		};

		return [$$scope, slots];
	}

	class Wrapper extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance, create_fragment, safe_not_equal, {});
		}
	}

	/**
	 * Can show and add API providers?
	 */
	const canAddProviders = false;
	/**
	 * Automatically focus search
	 */
	const canFocusSearch = true;
	/**
	 * Toggle footer blocks?
	 */
	const canToggleFooterBlocks = false;
	/**
	 * Default values for color, width and height
	 */
	const defaultColor = '#000';
	const defaultWidth = '';
	const defaultHeight = '';
	/**
	 * Limits for sample icon in footer
	 */
	const iconSampleSize = {
	    width: 200,
	    height: 300,
	};
	/**
	 * Footer buttons
	 */
	const showButtons = false;

	/**
	 * Phrases.
	 *
	 * Do not import phrases from this file, use ../config/phrases.ts instead
	 */
	const phrases = {
	    lang: 'English',
	    search: {
	        placeholder: {
	            collection: 'Search {name}',
	            collections: 'Filter collections',
	        },
	        defaultPlaceholder: 'Search all icons',
	        button: 'Search Icons',
	    },
	    errors: {
	        noCollections: 'No matching icon sets found.',
	        noIconsFound: 'No icons found.',
	        defaultError: 'Error loading Iconify Icon Finder.',
	        custom: {
	            loading: 'Loading...',
	            timeout: 'Connection timed out.',
	            invalid_data: 'Invalid response from Iconify API.',
	            empty: 'Nothing to show.',
	            not_found: 'Collection {prefix} does not exist.',
	            bad_route: 'Invalid route.',
	            home: 'Click here to return to main page.',
	        },
	    },
	    icons: {
	        header: {
	            full: 'Displaying {count} icons:',
	            more: 'Displaying {count} icons (click second page to load more results):',
	            modes: {
	                list: 'Display icons as list',
	                grid: 'Display icons as grid',
	            },
	            select: 'Select multiple icons',
	        },
	        headerWithCount: {
	            0: 'No icons to display.',
	            1: 'Displaying 1 icon:',
	        },
	        tooltip: {
	            size: '\nSize: {size}',
	            colorless: '',
	            colorful: '\nHas palette',
	            char: '\nIcon font character: {char}',
	            length: '',
	        },
	        more: 'Find more icons',
	        moreAsNumber: false,
	    },
	    filters: {
	        'uncategorised': 'Uncategorised',
	        'collections': 'Filter search results by icon set:',
	        'collections-collections': '',
	        'tags': 'Filter by category:',
	        'themePrefixes': 'Icon type:',
	        'themeSuffixes': 'Icon type:',
	    },
	    collectionInfo: {
	        total: 'Number of icons:',
	        height: 'Height of icons:',
	        author: 'Author:',
	        license: 'License:',
	        palette: 'Palette:',
	        colorless: 'Colorless',
	        colorful: 'Has colors',
	        link: 'Show all icons',
	    },
	    parent: {
	        default: 'Return to previous page',
	        collections: 'Return to collections list',
	        collection: 'Return to {name}',
	        search: 'Return to search results',
	    },
	    collection: {
	        by: 'by ',
	    },
	    providers: {
	        section: 'Icons source:',
	        add: 'Add Provider',
	        addForm: {
	            title: "Enter API provider's host name:",
	            placeholder: 'https://api.iconify.design',
	            submit: 'Add API Provider',
	            invalid: 'Example of a valid API host name: https://api.iconify.design',
	        },
	        status: {
	            loading: 'Checking {host}...',
	            error: '{host} is not a valid Iconify API.',
	            exists: 'API from {host} is already available or API has wrong configuration.',
	            unsupported: 'API from {host} does not support icon search.',
	        },
	    },
	    footer: {
	        iconName: 'Selected icon:',
	        iconNamePlaceholder: 'Enter icon by name...',
	        inlineSample: {
	            before: 'Text with icon sample',
	            after: 'to show icon alignment in text.',
	        },
	        remove: 'Remove {name}',
	        select: 'Select {name}',
	        about: 'Aboout {title}',
	    },
	    footerButtons: {
	        submit: 'Submit',
	        change: 'Change',
	        select: 'Select',
	        cancel: 'Cancel',
	        close: 'Close',
	    },
	    footerBlocks: {
	        title: 'Customize icon',
	        title2: 'Customize icons',
	        color: 'Color',
	        flip: 'Flip',
	        hFlip: 'Horizontal',
	        vFlip: 'Vertical',
	        rotate: 'Rotate',
	        width: 'Width',
	        height: 'Height',
	        size: 'Size',
	        alignment: 'Alignment',
	        mode: 'Mode',
	        icons: 'Selected icons',
	    },
	    footerOptionButtons: {
	        hFlip: 'Horizontal',
	        vFlip: 'Vertical',
	        rotate: '{num}' + String.fromCharCode(0x00b0),
	        rotateTitle: 'Rotate {num}' + String.fromCharCode(0x00b0),
	        inline: 'Inline',
	        block: 'Block',
	        inlineHint: 'Icon is vertically aligned slightly below baseline, like icon font, fitting perfectly in text.',
	        blockHint: 'Icon is rendered as is, without custom vertical alignment.',
	    },
	    codeSamples: {
	        copy: 'Copy to clipboard',
	        copied: 'Copied to clipboard.',
	        heading: 'How to use "{name}" icon',
	        titles: {
	            'iconify': 'SVG Framework',
	            'svg': 'SVG',
	            'svg-raw': 'SVG',
	            'svg-box': 'SVG with viewBox rectangle',
	            'svg-uri': 'SVG as data: URI',
	            'react-npm': 'React',
	            'react-api': 'React with Iconify API',
	        },
	        childTabTitle: '{key} versions:',
	        childTabTitles: {
	            react: 'React component versions:',
	            svg: 'SVG options:',
	        },
	        docsDefault: 'Click here for more information about {title} component.',
	        docs: {
	            iconify: 'Click here for more information about Iconify SVG framework.',
	        },
	        intro: {
	            'svg-box': 'This SVG contains extra empty rectangle that matches viewBox. It is needed to keep icon dimensions when importing icon in software that ignores viewBox attribute.',
	            'svg-uri': 'You can use this as background image or as content for pseudo element in stylesheet.',
	        },
	        component: {
	            install: 'Install component and icon set:',
	            install1: 'Install component:',
	            import: 'Import component and icon data:',
	            import1: 'Import component:',
	            vue: 'Add icon and component to your component:',
	            use: 'Use it in your code:',
	        },
	        iconify: {
	            intro1: 'Iconify SVG framework makes using icons as easy as icon fonts. To use "{name}" in HTML, add this code to the document:',
	            intro2: 'Iconify SVG framework will load icon data from Iconify API and replace that placeholder with SVG.',
	            head: 'Make sure you import Iconify SVG framework:',
	        },
	    },
	};

	/**
	 * Maximum color index (number of colors in rotation - 1)
	 *
	 * See _rotation.scss in style directory
	 */
	const maxIndex = 11;
	/**
	 * Import custom icons
	 */
	const customIconsPrefix = 'icon-finder-theme';
	Iconify__default['default'].addCollection({
	    prefix: customIconsPrefix,
	    icons: {
	        'error-loading': {
	            body: '<g clip-path="url(#clip0)"><path d="M9.9.2l-.2 1C12.7 2 15 4.7 15 8c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-3.3 2.3-6 5.3-6.8l-.2-1C2.6 1.1 0 4.3 0 8c0 4.4 3.6 8 8 8s8-3.6 8-8c0-3.7-2.6-6.9-6.1-7.8z" fill="currentColor"/></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs>',
	        },
	        'empty': {
	            body: '',
	        },
	    },
	    width: 16,
	    height: 16,
	});
	/**
	 * Icons used by UI
	 */
	const icons = {
	    'reset': 'line-md:close',
	    'search': 'line-md:search',
	    'down': 'line-md:chevron-down',
	    'left': 'line-md:chevron-left',
	    'right': 'line-md:chevron-right',
	    'parent': 'line-md:chevron-small-left',
	    'expand': 'line-md:chevron-small-right',
	    'grid': 'line-md:grid-3-solid',
	    'list': 'line-md:list-3-solid',
	    'check-list': 'line-md:check-list-3-solid',
	    'check-list-checked': 'line-md:check-list-3-twotone',
	    'error-loading': customIconsPrefix + ':error-loading',
	    'icon-width': 'line-md:double-arrow-horizontal',
	    'icon-height': 'line-md:double-arrow-vertical',
	    'color': 'line-md:paint-drop-half-twotone',
	    'color-filled': 'line-md:paint-drop-filled',
	    'rotate0': 'line-md:close',
	    'rotate1': 'line-md:rotate-90',
	    'rotate2': 'line-md:rotate-180',
	    'rotate3': 'line-md:rotate-270',
	    'h-flip': 'line-md:double-arrow-horizontal',
	    'v-flip': 'line-md:double-arrow-vertical',
	    'plus': 'line-md:plus',
	    'link': 'line-md:external-link',
	    'clipboard': 'line-md:clipboard-arrow-twotone',
	    'confirm': 'line-md:confirm',
	    'docs': 'line-md:document-list-twotone',
	    'mode-block': 'line-md:valign-baseline',
	    'mode-inline': 'line-md:valign-middle',
	    'selecting-selected': 'line-md:confirm',
	    'selecting-unselected': customIconsPrefix + ':empty',
	};

	/* src/icon-finder/components/misc/Icon.svelte generated by Svelte v3.29.4 */

	function create_else_block(ctx) {
		let current;
		const default_slot_template = /*#slots*/ ctx[6].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

		return {
			c() {
				if (default_slot) default_slot.c();
			},
			m(target, anchor) {
				if (default_slot) {
					default_slot.m(target, anchor);
				}

				current = true;
			},
			p(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 32) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
					}
				}
			},
			i(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d(detaching) {
				if (default_slot) default_slot.d(detaching);
			}
		};
	}

	// (93:0) {#if loaded}
	function create_if_block(ctx) {
		let html_tag;
		let html_anchor;

		return {
			c() {
				html_anchor = empty$1();
				html_tag = new HtmlTag(html_anchor);
			},
			m(target, anchor) {
				html_tag.m(/*svg*/ ctx[1], target, anchor);
				insert(target, html_anchor, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*svg*/ 2) html_tag.p(/*svg*/ ctx[1]);
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) detach(html_anchor);
				if (detaching) html_tag.d();
			}
		};
	}

	function create_fragment$1(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block, create_else_block];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*loaded*/ ctx[0]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		return {
			c() {
				if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if_blocks[current_block_type_index].d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	function instance$1($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		
		let { icon } = $$props;
		let { props = {} } = $$props;
		let { onLoad = null } = $$props;

		// Local watched variables. Update them only if needed to avoid duplicate re-renders
		// Icon name
		let name = null;

		// Status
		let loaded = false;

		// SVG
		let svg = "";

		// Dummy variable to trigger re-calculation of other variables when icon has been loaded
		let updateCounter = 0;

		// Callback for loading, used to cancel loading when component is destroyed
		let abortLoader = null;

		// Preload icons in component to avoid preloading if component is never used
		Iconify__default['default'].loadIcons(Object.values(icons).filter(name => !!name));

		// Event listener
		const loadingEvent = () => {
			if (name !== null && Iconify__default['default'].iconExists(name) && !loaded) {
				// Force update
				$$invalidate(8, updateCounter++, updateCounter);
			}
		};

		// Remove event listener
		onDestroy(() => {
			if (abortLoader !== null) {
				abortLoader();
				$$invalidate(9, abortLoader = null);
			}
		});

		$$self.$$set = $$props => {
			if ("icon" in $$props) $$invalidate(2, icon = $$props.icon);
			if ("props" in $$props) $$invalidate(3, props = $$props.props);
			if ("onLoad" in $$props) $$invalidate(4, onLoad = $$props.onLoad);
			if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*icon, name*/ 132) {
				// Resolve icon name
				 {
					let newName = typeof icons[icon] === "string"
					? icons[icon]
					: icon.indexOf(":") === -1 ? null : icon;

					// console.log('Rendering icon:', icon);
					if (newName !== name) {
						// Update variable only when changed because it is a watched variable
						$$invalidate(7, name = newName);
					}
				}
			}

			if ($$self.$$.dirty & /*updateCounter, name, loaded, onLoad, abortLoader, props, svg*/ 923) {
				// Check if icon has been loaded
				 {

					if (name !== null) {
						if (loaded !== Iconify__default['default'].iconExists(name)) {
							// Update variable only if it needs to be updated
							$$invalidate(0, loaded = !loaded);

							if (loaded && typeof onLoad === "function") {
								onLoad();
							}
						}

						if (!loaded) {
							// Icon is not loaded
							if (abortLoader !== null) {
								abortLoader();
							}

							$$invalidate(9, abortLoader = Iconify__default['default'].loadIcons([name], loadingEvent));
						} else {
							// Icon is loaded - generate SVG
							const iconProps = Object.assign({ inline: false }, typeof props === "object" ? props : {});

							let newSVG = Iconify__default['default'].renderHTML(name, iconProps);

							// Compare SVG with previous entry to avoid marking 'svg' variable as dirty and causing re-render
							if (newSVG !== svg) {
								$$invalidate(1, svg = newSVG);
							}
						}
					} else if (loaded) {
						// Icon was loaded and is no longer loaded. Icon name changed?
						$$invalidate(0, loaded = false);
					}
				}
			}
		};

		return [loaded, svg, icon, props, onLoad, $$scope, slots];
	}

	class Icon extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$1, create_fragment$1, safe_not_equal, { icon: 2, props: 3, onLoad: 4 });
		}
	}

	/* src/icon-finder/components/forms/Input.svelte generated by Svelte v3.29.4 */

	function create_if_block_2(ctx) {
		let div;
		let uiicon;
		let current;

		uiicon = new Icon({
				props: {
					icon: /*icon*/ ctx[4],
					onLoad: /*iconLoaded*/ ctx[9]
				}
			});

		return {
			c() {
				div = element("div");
				create_component(uiicon.$$.fragment);
				attr(div, "class", "iif-input-icon");
				attr(div, "style", /*iconStyle*/ ctx[7]);
			},
			m(target, anchor) {
				insert(target, div, anchor);
				mount_component(uiicon, div, null);
				current = true;
			},
			p(ctx, dirty) {
				const uiicon_changes = {};
				if (dirty & /*icon*/ 16) uiicon_changes.icon = /*icon*/ ctx[4];
				uiicon.$set(uiicon_changes);

				if (!current || dirty & /*iconStyle*/ 128) {
					attr(div, "style", /*iconStyle*/ ctx[7]);
				}
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				destroy_component(uiicon);
			}
		};
	}

	// (113:2) {#if value === '' && placeholder !== ''}
	function create_if_block_1(ctx) {
		let div;
		let t;

		return {
			c() {
				div = element("div");
				t = text(/*placeholder*/ ctx[1]);
				attr(div, "class", "iif-input-placeholder");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, t);
			},
			p(ctx, dirty) {
				if (dirty & /*placeholder*/ 2) set_data(t, /*placeholder*/ ctx[1]);
			},
			d(detaching) {
				if (detaching) detach(div);
			}
		};
	}

	// (116:2) {#if value !== ''}
	function create_if_block$1(ctx) {
		let a;
		let uiicon;
		let current;
		let mounted;
		let dispose;
		uiicon = new Icon({ props: { icon: "reset" } });

		return {
			c() {
				a = element("a");
				create_component(uiicon.$$.fragment);
				attr(a, "class", "iif-input-reset");
				attr(a, "href", "# ");
			},
			m(target, anchor) {
				insert(target, a, anchor);
				mount_component(uiicon, a, null);
				current = true;

				if (!mounted) {
					dispose = listen(a, "click", prevent_default(/*resetValue*/ ctx[10]));
					mounted = true;
				}
			},
			p: noop,
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(a);
				destroy_component(uiicon);
				mounted = false;
				dispose();
			}
		};
	}

	function create_fragment$2(ctx) {
		let div1;
		let div0;
		let t0;
		let input;
		let input_title_value;
		let input_spellcheck_value;
		let t1;
		let t2;
		let current;
		let mounted;
		let dispose;
		let if_block0 = /*icon*/ ctx[4] !== "" && create_if_block_2(ctx);
		let if_block1 = /*value*/ ctx[0] === "" && /*placeholder*/ ctx[1] !== "" && create_if_block_1(ctx);
		let if_block2 = /*value*/ ctx[0] !== "" && create_if_block$1(ctx);

		return {
			c() {
				div1 = element("div");
				div0 = element("div");
				if (if_block0) if_block0.c();
				t0 = space();
				input = element("input");
				t1 = space();
				if (if_block1) if_block1.c();
				t2 = space();
				if (if_block2) if_block2.c();
				attr(input, "type", "text");

				attr(input, "title", input_title_value = /*title*/ ctx[2]
				? /*title*/ ctx[2]
				: /*placeholder*/ ctx[1]);

				attr(input, "spellcheck", input_spellcheck_value = false);
				attr(input, "autocomplete", "off");
				attr(input, "autocorrect", "off");
				attr(input, "autocapitalize", "off");
				input.disabled = /*disabled*/ ctx[3];
				attr(div0, "class", /*className*/ ctx[6]);
				attr(div1, "class", /*wrapperClassName*/ ctx[5]);
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				if (if_block0) if_block0.m(div0, null);
				append(div0, t0);
				append(div0, input);
				set_input_value(input, /*value*/ ctx[0]);
				/*input_binding*/ ctx[19](input);
				append(div0, t1);
				if (if_block1) if_block1.m(div0, null);
				append(div0, t2);
				if (if_block2) if_block2.m(div0, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen(input, "input", /*input_input_handler*/ ctx[18]),
						listen(input, "input", /*handleInput*/ ctx[11]),
						listen(input, "blur", /*handleBlur*/ ctx[12])
					];

					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (/*icon*/ ctx[4] !== "") {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty & /*icon*/ 16) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_2(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(div0, t0);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if (!current || dirty & /*title, placeholder*/ 6 && input_title_value !== (input_title_value = /*title*/ ctx[2]
				? /*title*/ ctx[2]
				: /*placeholder*/ ctx[1])) {
					attr(input, "title", input_title_value);
				}

				if (!current || dirty & /*disabled*/ 8) {
					input.disabled = /*disabled*/ ctx[3];
				}

				if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
					set_input_value(input, /*value*/ ctx[0]);
				}

				if (/*value*/ ctx[0] === "" && /*placeholder*/ ctx[1] !== "") {
					if (if_block1) {
						if_block1.p(ctx, dirty);
					} else {
						if_block1 = create_if_block_1(ctx);
						if_block1.c();
						if_block1.m(div0, t2);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (/*value*/ ctx[0] !== "") {
					if (if_block2) {
						if_block2.p(ctx, dirty);

						if (dirty & /*value*/ 1) {
							transition_in(if_block2, 1);
						}
					} else {
						if_block2 = create_if_block$1(ctx);
						if_block2.c();
						transition_in(if_block2, 1);
						if_block2.m(div0, null);
					}
				} else if (if_block2) {
					group_outros();

					transition_out(if_block2, 1, 1, () => {
						if_block2 = null;
					});

					check_outros();
				}

				if (!current || dirty & /*className*/ 64) {
					attr(div0, "class", /*className*/ ctx[6]);
				}

				if (!current || dirty & /*wrapperClassName*/ 32) {
					attr(div1, "class", /*wrapperClassName*/ ctx[5]);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block2);
				current = true;
			},
			o(local) {
				transition_out(if_block0);
				transition_out(if_block2);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div1);
				if (if_block0) if_block0.d();
				/*input_binding*/ ctx[19](null);
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				mounted = false;
				run_all(dispose);
			}
		};
	}

	const baseClass = "iif-input";

	function instance$2($$self, $$props, $$invalidate) {
		let { placeholder = "" } = $$props;
		let { title = "" } = $$props;
		let { value = "" } = $$props;
		let { disabled = false } = $$props;
		let { icon = "" } = $$props;
		let { type = "" } = $$props;
		let { extra = "" } = $$props;
		let { onInput = null } = $$props;
		let { onBlur = null } = $$props;
		let { autofocus = false } = $$props;

		// Icon status
		let hasIcon = false;

		function iconLoaded() {
			$$invalidate(20, hasIcon = true);
		}

		// Get wrapper class name
		let wrapperClassName;

		// Get container class name
		let className;

		// Get icon style
		let iconStyle;

		// Reset value
		function resetValue() {
			$$invalidate(0, value = "");
			handleInput();
		}

		// on:input binding as onInput
		function handleInput() {
			if (onInput) {
				onInput(value);
			}
		}

		// on:blur binding as onBlur
		function handleBlur() {
			if (onBlur) {
				onBlur(value);
			}
		}

		// Focus
		let inputRef;

		onMount(() => {
			if (autofocus) {
				inputRef.focus();
			}
		});

		function input_input_handler() {
			value = this.value;
			$$invalidate(0, value);
		}

		function input_binding($$value) {
			binding_callbacks[$$value ? "unshift" : "push"](() => {
				inputRef = $$value;
				$$invalidate(8, inputRef);
			});
		}

		$$self.$$set = $$props => {
			if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
			if ("title" in $$props) $$invalidate(2, title = $$props.title);
			if ("value" in $$props) $$invalidate(0, value = $$props.value);
			if ("disabled" in $$props) $$invalidate(3, disabled = $$props.disabled);
			if ("icon" in $$props) $$invalidate(4, icon = $$props.icon);
			if ("type" in $$props) $$invalidate(13, type = $$props.type);
			if ("extra" in $$props) $$invalidate(14, extra = $$props.extra);
			if ("onInput" in $$props) $$invalidate(15, onInput = $$props.onInput);
			if ("onBlur" in $$props) $$invalidate(16, onBlur = $$props.onBlur);
			if ("autofocus" in $$props) $$invalidate(17, autofocus = $$props.autofocus);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*wrapperClassName, value, disabled*/ 41) {
				 {
					$$invalidate(5, wrapperClassName = baseClass + "-wrapper");

					// Add states
					$$invalidate(5, wrapperClassName += // Content?
					" " + wrapperClassName + (value === "" ? "--empty" : "--has-content") + (// Disabled
					disabled ? " " + wrapperClassName + "--disabled" : ""));
				}
			}

			if ($$self.$$.dirty & /*placeholder, hasIcon, type, disabled*/ 1056778) {
				 {
					$$invalidate(6, className = baseClass + // Placeholder
					" " + baseClass + "--with" + (placeholder === "" ? "out" : "") + "-placeholder" + (// Icon
					hasIcon ? " " + baseClass + "--with-icon" : "") + (// Type
					type !== "" ? " " + baseClass + "--" + type : "") + (// Disabled
					disabled ? " " + baseClass + "--disabled" : ""));
				}
			}

			if ($$self.$$.dirty & /*type, extra*/ 24576) {
				 {
					$$invalidate(7, iconStyle = "");

					if (type === "color" && extra !== "") {
						$$invalidate(7, iconStyle = "opacity: 1; color: " + extra);
					}
				}
			}
		};

		return [
			value,
			placeholder,
			title,
			disabled,
			icon,
			wrapperClassName,
			className,
			iconStyle,
			inputRef,
			iconLoaded,
			resetValue,
			handleInput,
			handleBlur,
			type,
			extra,
			onInput,
			onBlur,
			autofocus,
			input_input_handler,
			input_binding
		];
	}

	class Input extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$2, create_fragment$2, safe_not_equal, {
				placeholder: 1,
				title: 2,
				value: 0,
				disabled: 3,
				icon: 4,
				type: 13,
				extra: 14,
				onInput: 15,
				onBlur: 16,
				autofocus: 17
			});
		}
	}

	/* src/icon-finder/components/blocks/Block.svelte generated by Svelte v3.29.4 */

	function create_fragment$3(ctx) {
		let div;
		let current;
		const default_slot_template = /*#slots*/ ctx[5].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

		return {
			c() {
				div = element("div");
				if (default_slot) default_slot.c();
				attr(div, "class", /*className*/ ctx[0]);
			},
			m(target, anchor) {
				insert(target, div, anchor);

				if (default_slot) {
					default_slot.m(div, null);
				}

				current = true;
			},
			p(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 16) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
					}
				}

				if (!current || dirty & /*className*/ 1) {
					attr(div, "class", /*className*/ ctx[0]);
				}
			},
			i(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				if (default_slot) default_slot.d(detaching);
			}
		};
	}

	const baseClass$1 = "iif-block";

	function instance$3($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		let { type = "" } = $$props;
		let { name = "" } = $$props;
		let { extra = "" } = $$props;
		let className;

		$$self.$$set = $$props => {
			if ("type" in $$props) $$invalidate(1, type = $$props.type);
			if ("name" in $$props) $$invalidate(2, name = $$props.name);
			if ("extra" in $$props) $$invalidate(3, extra = $$props.extra);
			if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*type, className, name, extra*/ 15) {
				 {
					$$invalidate(0, className = baseClass$1);

					if (type !== "") {
						let typeBase = " " + baseClass$1 + "--" + type;
						$$invalidate(0, className += typeBase);

						if (name !== "") {
							$$invalidate(0, className += typeBase + "--" + name);
						}
					}

					if (extra !== "") {
						$$invalidate(0, className += " " + baseClass$1 + "--" + extra);
					}
				} // console.log(`Rendering Block at ${Date.now()}: ${className}`);
			}
		};

		return [className, type, name, extra, $$scope, slots];
	}

	class Block extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$3, create_fragment$3, safe_not_equal, { type: 1, name: 2, extra: 3 });
		}
	}

	/* src/icon-finder/components/blocks/GlobalSearch.svelte generated by Svelte v3.29.4 */

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[10] = list[i];
		child_ctx[12] = i;
		return child_ctx;
	}

	// (73:2) {#each [focusInput] as autofocus, i (autofocus)}
	function create_each_block(key_1, ctx) {
		let first;
		let input;
		let updating_value;
		let current;

		function input_value_binding(value) {
			/*input_value_binding*/ ctx[6].call(null, value);
		}

		let input_props = {
			type: "text",
			placeholder: /*text*/ ctx[2].defaultPlaceholder,
			icon: "search",
			autofocus: /*autofocus*/ ctx[10]
		};

		if (/*keyword*/ ctx[0] !== void 0) {
			input_props.value = /*keyword*/ ctx[0];
		}

		input = new Input({ props: input_props });
		binding_callbacks.push(() => bind(input, "value", input_value_binding));

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				create_component(input.$$.fragment);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				mount_component(input, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const input_changes = {};
				if (dirty & /*focusInput*/ 2) input_changes.autofocus = /*autofocus*/ ctx[10];

				if (!updating_value && dirty & /*keyword*/ 1) {
					updating_value = true;
					input_changes.value = /*keyword*/ ctx[0];
					add_flush_callback(() => updating_value = false);
				}

				input.$set(input_changes);
			},
			i(local) {
				if (current) return;
				transition_in(input.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(input.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(first);
				destroy_component(input, detaching);
			}
		};
	}

	// (71:0) <Block type="search" name="global">
	function create_default_slot(ctx) {
		let form;
		let each_blocks = [];
		let each_1_lookup = new Map();
		let t0;
		let button;
		let current;
		let mounted;
		let dispose;
		let each_value = [/*focusInput*/ ctx[1]];
		const get_key = ctx => /*autofocus*/ ctx[10];

		for (let i = 0; i < 1; i += 1) {
			let child_ctx = get_each_context(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
		}

		return {
			c() {
				form = element("form");

				for (let i = 0; i < 1; i += 1) {
					each_blocks[i].c();
				}

				t0 = space();
				button = element("button");
				button.textContent = `${/*text*/ ctx[2].button}`;
				attr(button, "class", "iif-form-button iif-form-button--primary");
				attr(button, "type", "submit");
				attr(form, "class", "iif-block--search-form");
			},
			m(target, anchor) {
				insert(target, form, anchor);

				for (let i = 0; i < 1; i += 1) {
					each_blocks[i].m(form, null);
				}

				append(form, t0);
				append(form, button);
				current = true;

				if (!mounted) {
					dispose = listen(form, "submit", prevent_default(/*submitForm*/ ctx[3]));
					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*text, focusInput, keyword*/ 7) {
					const each_value = [/*focusInput*/ ctx[1]];
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, form, outro_and_destroy_block, create_each_block, t0, get_each_context);
					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < 1; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < 1; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) detach(form);

				for (let i = 0; i < 1; i += 1) {
					each_blocks[i].d();
				}

				mounted = false;
				dispose();
			}
		};
	}

	function create_fragment$4(ctx) {
		let block;
		let current;

		block = new Block({
				props: {
					type: "search",
					name: "global",
					$$slots: { default: [create_default_slot] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const block_changes = {};

				if (dirty & /*$$scope, focusInput, keyword*/ 8195) {
					block_changes.$$scope = { dirty, ctx };
				}

				block.$set(block_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block, detaching);
			}
		};
	}

	function instance$4($$self, $$props, $$invalidate) {
		
		
		let { viewChanged } = $$props;
		let { route } = $$props;

		// Registry
		const registry = getContext("registry");

		// Phrases
		const text = phrases.search;

		// Current keyword
		let keyword;

		// Variable to store last change to avoid changing keyword multiple times to same value
		let lastChange = "";

		// Check route for keyword
		function checkRoute(route) {
			if (route && route.type === "search" && route.params && (lastChange === "" || lastChange !== route.params.search)) {
				$$invalidate(0, keyword = route.params.search);
				lastChange = keyword;
				return true;
			}

			return false;
		}

		// Submit form
		function submitForm() {
			if (typeof keyword === "string") {
				const value = keyword.trim().toLowerCase();

				if (value !== "") {
					lastChange = value;
					registry.router.action("search", value);
				}
			}
		}

		// Focus input, use "each" to re-mount input when value changes
		let focusInput = false;

		function input_value_binding(value) {
			keyword = value;
			(($$invalidate(0, keyword), $$invalidate(5, route)), $$invalidate(4, viewChanged));
		}

		$$self.$$set = $$props => {
			if ("viewChanged" in $$props) $$invalidate(4, viewChanged = $$props.viewChanged);
			if ("route" in $$props) $$invalidate(5, route = $$props.route);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*keyword, route, viewChanged*/ 49) {
				// Overwrite keyword on first render or when current view changes to search results
				 {
					if (keyword === null) {
						// First render - get keyword from route
						$$invalidate(0, keyword = "");

						if (route !== null) {
							// Get keyword from current route or its parent
							if (!checkRoute(route) && route.parent) {
								checkRoute(route.parent);
							}
						}
					} else if (!viewChanged) {
						lastChange = "";
					} else {
						checkRoute(route);
					}
				}
			}

			if ($$self.$$.dirty & /*route*/ 32) {
				 {
					{
						$$invalidate(1, focusInput = route
						? route.type === "collections" || route.type === "search"
						: false);
					}
				}
			}
		};

		return [keyword, focusInput, text, submitForm, viewChanged, route, input_value_binding];
	}

	class GlobalSearch extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$4, create_fragment$4, safe_not_equal, { viewChanged: 4, route: 5 });
		}
	}

	/* src/icon-finder/components/blocks/parent/Link.svelte generated by Svelte v3.29.4 */

	function create_fragment$5(ctx) {
		let div;
		let uiicon;
		let t0;
		let a;
		let t1;
		let current;
		let mounted;
		let dispose;
		uiicon = new Icon({ props: { icon: "parent" } });

		return {
			c() {
				div = element("div");
				create_component(uiicon.$$.fragment);
				t0 = space();
				a = element("a");
				t1 = text(/*text*/ ctx[0]);
				attr(a, "href", "# ");
				attr(div, "class", "iif-parent-link");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				mount_component(uiicon, div, null);
				append(div, t0);
				append(div, a);
				append(a, t1);
				current = true;

				if (!mounted) {
					dispose = listen(a, "click", prevent_default(function () {
						if (is_function(/*onClick*/ ctx[1])) /*onClick*/ ctx[1].apply(this, arguments);
					}));

					mounted = true;
				}
			},
			p(new_ctx, [dirty]) {
				ctx = new_ctx;
				if (!current || dirty & /*text*/ 1) set_data(t1, /*text*/ ctx[0]);
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				destroy_component(uiicon);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$5($$self, $$props, $$invalidate) {
		let { text } = $$props;
		let { onClick } = $$props;

		$$self.$$set = $$props => {
			if ("text" in $$props) $$invalidate(0, text = $$props.text);
			if ("onClick" in $$props) $$invalidate(1, onClick = $$props.onClick);
		};

		return [text, onClick];
	}

	class Link extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$5, create_fragment$5, safe_not_equal, { text: 0, onClick: 1 });
		}
	}

	/* src/icon-finder/components/blocks/Parent.svelte generated by Svelte v3.29.4 */

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[7] = list[i];
		child_ctx[9] = i;
		return child_ctx;
	}

	// (71:0) {#if entries.length > 0}
	function create_if_block$2(ctx) {
		let block;
		let current;

		block = new Block({
				props: {
					type: "parent",
					$$slots: { default: [create_default_slot$1] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const block_changes = {};

				if (dirty & /*$$scope, entries*/ 1025) {
					block_changes.$$scope = { dirty, ctx };
				}

				block.$set(block_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block, detaching);
			}
		};
	}

	// (73:2) {#each entries as item, i (item.key)}
	function create_each_block$1(key_1, ctx) {
		let first;
		let link;
		let current;

		function func(...args) {
			return /*func*/ ctx[3](/*item*/ ctx[7], ...args);
		}

		link = new Link({
				props: {
					text: /*item*/ ctx[7].text,
					onClick: func
				}
			});

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				create_component(link.$$.fragment);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				mount_component(link, target, anchor);
				current = true;
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				const link_changes = {};
				if (dirty & /*entries*/ 1) link_changes.text = /*item*/ ctx[7].text;
				if (dirty & /*entries*/ 1) link_changes.onClick = func;
				link.$set(link_changes);
			},
			i(local) {
				if (current) return;
				transition_in(link.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(link.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(first);
				destroy_component(link, detaching);
			}
		};
	}

	// (72:1) <Block type="parent">
	function create_default_slot$1(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value = /*entries*/ ctx[0];
		const get_key = ctx => /*item*/ ctx[7].key;

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$1(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
		}

		return {
			c() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty$1();
			},
			m(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_1_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*entries, handleClick*/ 3) {
					const each_value = /*entries*/ ctx[0];
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d(detaching);
				}

				if (detaching) detach(each_1_anchor);
			}
		};
	}

	function create_fragment$6(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*entries*/ ctx[0].length > 0 && create_if_block$2(ctx);

		return {
			c() {
				if (if_block) if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				if (/*entries*/ ctx[0].length > 0) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*entries*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$2(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	function instance$6($$self, $$props, $$invalidate) {
		
		
		
		let { route } = $$props;

		// Registry
		const registry = getContext("registry");

		const parentPhrases = phrases.parent;
		const collections = registry.collections;

		function handleClick(level) {
			registry.router.action("parent", level);
		}

		let entries;
		const func = item => handleClick(item.level);

		$$self.$$set = $$props => {
			if ("route" in $$props) $$invalidate(2, route = $$props.route);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*entries, route*/ 5) {
				 {
					function addEntry(route, level) {
						const routeParams = route.params;

						// Get text
						let text = parentPhrases.default;

						if (route.type === "custom" && parentPhrases[route.params.customType] !== void 0) {
							// Text for custom view
							text = parentPhrases[routeParams.customType];
						} else if (parentPhrases[route.type] !== void 0) {
							// Text by view type
							text = parentPhrases[route.type];

							if (route.type === "collection") {
								// Replace {name} with collection name
								text = text.replace("{name}", lib.getCollectionTitle(collections, routeParams.provider, routeParams.prefix));
							}
						}

						// Generate unique key
						let key = route.type + "-" + level + "-";

						switch (route.type) {
							case "collection":
								key += routeParams.provider + ":" + routeParams.prefix;
								break;
							case "custom":
								key += routeParams.customType;
								break;
						}

						// Add entry
						entries.unshift({ key, level, route, text });

						// Add parent route
						if (route.parent) {
							addEntry(route.parent, level + 1);
						}
					}

					// Find all parent routes
					$$invalidate(0, entries = []);

					if (route.parent) {
						addEntry(route.parent, 1);
					}
				}
			}
		};

		return [entries, handleClick, route, func];
	}

	class Parent extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$6, create_fragment$6, safe_not_equal, { route: 2 });
		}
	}

	/* src/icon-finder/components/misc/Tabs.svelte generated by Svelte v3.29.4 */

	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[7] = list[i];
		child_ctx[9] = i;
		return child_ctx;
	}

	function get_each_context$2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[4] = list[i];
		child_ctx[6] = i;
		return child_ctx;
	}

	// (60:2) {#if !listItem.empty}
	function create_if_block$3(ctx) {
		let div;
		let each_blocks = [];
		let each_1_lookup = new Map();
		let t;
		let div_class_value;
		let current;
		let each_value_1 = /*listItem*/ ctx[4].items;
		const get_key = ctx => /*tab*/ ctx[7].key;

		for (let i = 0; i < each_value_1.length; i += 1) {
			let child_ctx = get_each_context_1(ctx, each_value_1, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
		}

		return {
			c() {
				div = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t = space();
				attr(div, "class", div_class_value = baseClass$2 + "-" + /*listItem*/ ctx[4].side);
			},
			m(target, anchor) {
				insert(target, div, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				append(div, t);
				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*list*/ 1) {
					const each_value_1 = /*listItem*/ ctx[4].items;
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, outro_and_destroy_block, create_each_block_1, t, get_each_context_1);
					check_outros();
				}

				if (!current || dirty & /*list*/ 1 && div_class_value !== (div_class_value = baseClass$2 + "-" + /*listItem*/ ctx[4].side)) {
					attr(div, "class", div_class_value);
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value_1.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}
			}
		};
	}

	// (68:6) {#if tab.icon}
	function create_if_block_2$1(ctx) {
		let uiicon;
		let current;
		uiicon = new Icon({ props: { icon: /*tab*/ ctx[7].icon } });

		return {
			c() {
				create_component(uiicon.$$.fragment);
			},
			m(target, anchor) {
				mount_component(uiicon, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const uiicon_changes = {};
				if (dirty & /*list*/ 1) uiicon_changes.icon = /*tab*/ ctx[7].icon;
				uiicon.$set(uiicon_changes);
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(uiicon, detaching);
			}
		};
	}

	// (71:6) {#if tab.title !== ''}
	function create_if_block_1$1(ctx) {
		let t_value = /*tab*/ ctx[7].title + "";
		let t;

		return {
			c() {
				t = text(t_value);
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*list*/ 1 && t_value !== (t_value = /*tab*/ ctx[7].title + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) detach(t);
			}
		};
	}

	// (62:4) {#each listItem.items as tab, j (tab.key)}
	function create_each_block_1(key_1, ctx) {
		let a;
		let t;
		let a_href_value;
		let a_class_value;
		let a_title_value;
		let current;
		let mounted;
		let dispose;
		let if_block0 = /*tab*/ ctx[7].icon && create_if_block_2$1(ctx);
		let if_block1 = /*tab*/ ctx[7].title !== "" && create_if_block_1$1(ctx);

		return {
			key: key_1,
			first: null,
			c() {
				a = element("a");
				if (if_block0) if_block0.c();
				t = space();
				if (if_block1) if_block1.c();
				attr(a, "href", a_href_value = /*tab*/ ctx[7].href);
				attr(a, "class", a_class_value = /*tab*/ ctx[7].className);
				attr(a, "title", a_title_value = /*tab*/ ctx[7].hint);
				this.first = a;
			},
			m(target, anchor) {
				insert(target, a, anchor);
				if (if_block0) if_block0.m(a, null);
				append(a, t);
				if (if_block1) if_block1.m(a, null);
				current = true;

				if (!mounted) {
					dispose = listen(a, "click", prevent_default(function () {
						if (is_function(/*tab*/ ctx[7].onClick)) /*tab*/ ctx[7].onClick.apply(this, arguments);
					}));

					mounted = true;
				}
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;

				if (/*tab*/ ctx[7].icon) {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty & /*list*/ 1) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_2$1(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(a, t);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if (/*tab*/ ctx[7].title !== "") {
					if (if_block1) {
						if_block1.p(ctx, dirty);
					} else {
						if_block1 = create_if_block_1$1(ctx);
						if_block1.c();
						if_block1.m(a, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (!current || dirty & /*list*/ 1 && a_href_value !== (a_href_value = /*tab*/ ctx[7].href)) {
					attr(a, "href", a_href_value);
				}

				if (!current || dirty & /*list*/ 1 && a_class_value !== (a_class_value = /*tab*/ ctx[7].className)) {
					attr(a, "class", a_class_value);
				}

				if (!current || dirty & /*list*/ 1 && a_title_value !== (a_title_value = /*tab*/ ctx[7].hint)) {
					attr(a, "title", a_title_value);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block0);
				current = true;
			},
			o(local) {
				transition_out(if_block0);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(a);
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				mounted = false;
				dispose();
			}
		};
	}

	// (59:1) {#each list as listItem, i (listItem.side)}
	function create_each_block$2(key_1, ctx) {
		let first;
		let if_block_anchor;
		let current;
		let if_block = !/*listItem*/ ctx[4].empty && create_if_block$3(ctx);

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				if (if_block) if_block.c();
				if_block_anchor = empty$1();
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (!/*listItem*/ ctx[4].empty) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*list*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$3(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(first);
				if (if_block) if_block.d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	function create_fragment$7(ctx) {
		let div;
		let each_blocks = [];
		let each_1_lookup = new Map();
		let current;
		let each_value = /*list*/ ctx[0];
		const get_key = ctx => /*listItem*/ ctx[4].side;

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$2(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
		}

		return {
			c() {
				div = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr(div, "class", baseClass$2);
			},
			m(target, anchor) {
				insert(target, div, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				current = true;
			},
			p(ctx, [dirty]) {
				if (dirty & /*baseClass, list*/ 1) {
					const each_value = /*list*/ ctx[0];
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}
			}
		};
	}

	const baseClass$2 = "iif-tabs";
	const baseItemClass = "iif-tab";

	function instance$7($$self, $$props, $$invalidate) {
		
		let { tabs } = $$props;
		let { selected } = $$props;
		let { onClick } = $$props;

		// Generate tabs list
		let list = [];

		$$self.$$set = $$props => {
			if ("tabs" in $$props) $$invalidate(1, tabs = $$props.tabs);
			if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
			if ("onClick" in $$props) $$invalidate(3, onClick = $$props.onClick);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*tabs, list, selected, onClick*/ 15) {
				 {
					const leftList = [];
					const rightList = [];

					tabs.forEach(tab => {
						const key = tab.key;
						const index = (tab.index === void 0 ? list.length : tab.index) % maxIndex;

						// Generate class name
						const className = baseItemClass + " " + baseItemClass + "--" + index + (key === selected
						? " " + baseItemClass + "--selected"
						: "") + (tab.type ? " " + baseItemClass + "--" + tab.type : "");

						// Generate item
						const item = {
							key,
							className,
							title: tab.title,
							index,
							href: tab.href === void 0 ? "# " : tab.href,
							icon: tab.icon,
							hint: tab.hint,
							onClick: tab.onClick === void 0
							? () => onClick(key)
							: tab.onClick
						};

						if (tab.right) {
							rightList.push(item);
						} else {
							leftList.push(item);
						}
					});

					$$invalidate(0, list = [
						{
							side: "left",
							items: leftList,
							empty: !leftList.length
						},
						{
							side: "right",
							items: rightList,
							empty: !rightList.length
						}
					]);
				}
			}
		};

		return [list, tabs, selected, onClick];
	}

	class Tabs extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$7, create_fragment$7, safe_not_equal, { tabs: 1, selected: 2, onClick: 3 });
		}
	}

	/* src/icon-finder/components/forms/AddForm.svelte generated by Svelte v3.29.4 */

	function create_if_block_3(ctx) {
		let div;
		let t_value = /*phrases*/ ctx[1].title + "";
		let t;

		return {
			c() {
				div = element("div");
				t = text(t_value);
				attr(div, "class", "iif-block--add-form-title");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, t);
			},
			p(ctx, dirty) {
				if (dirty & /*phrases*/ 2 && t_value !== (t_value = /*phrases*/ ctx[1].title + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) detach(div);
			}
		};
	}

	// (60:3) {#if buttonIcon}
	function create_if_block_2$2(ctx) {
		let uiicon;
		let current;
		uiicon = new Icon({ props: { icon: "plus" } });

		return {
			c() {
				create_component(uiicon.$$.fragment);
			},
			m(target, anchor) {
				mount_component(uiicon, target, anchor);
				current = true;
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(uiicon, detaching);
			}
		};
	}

	// (66:1) {#if status}
	function create_if_block_1$2(ctx) {
		let div;
		let t;

		return {
			c() {
				div = element("div");
				t = text(/*status*/ ctx[4]);
				attr(div, "class", "iif-block--add-form-status");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, t);
			},
			p(ctx, dirty) {
				if (dirty & /*status*/ 16) set_data(t, /*status*/ ctx[4]);
			},
			d(detaching) {
				if (detaching) detach(div);
			}
		};
	}

	// (69:1) {#if !valid && phrases.invalid}
	function create_if_block$4(ctx) {
		let div;
		let t_value = /*phrases*/ ctx[1].invalid + "";
		let t;

		return {
			c() {
				div = element("div");
				t = text(t_value);
				attr(div, "class", "iif-block--add-form-invalid");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, t);
			},
			p(ctx, dirty) {
				if (dirty & /*phrases*/ 2 && t_value !== (t_value = /*phrases*/ ctx[1].invalid + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) detach(div);
			}
		};
	}

	function create_fragment$8(ctx) {
		let div;
		let t0;
		let form;
		let input;
		let updating_value;
		let t1;
		let button;
		let t2;
		let t3_value = /*phrases*/ ctx[1].submit + "";
		let t3;
		let t4;
		let t5;
		let current;
		let mounted;
		let dispose;
		let if_block0 = /*phrases*/ ctx[1].title && create_if_block_3(ctx);

		function input_value_binding(value) {
			/*input_value_binding*/ ctx[10].call(null, value);
		}

		let input_props = {
			type: "text",
			placeholder: /*phrases*/ ctx[1].placeholder,
			icon: /*inputIcon*/ ctx[3]
		};

		if (/*value*/ ctx[0] !== void 0) {
			input_props.value = /*value*/ ctx[0];
		}

		input = new Input({ props: input_props });
		binding_callbacks.push(() => bind(input, "value", input_value_binding));
		let if_block1 = /*buttonIcon*/ ctx[2] && create_if_block_2$2();
		let if_block2 = /*status*/ ctx[4] && create_if_block_1$2(ctx);
		let if_block3 = !/*valid*/ ctx[5] && /*phrases*/ ctx[1].invalid && create_if_block$4(ctx);

		return {
			c() {
				div = element("div");
				if (if_block0) if_block0.c();
				t0 = space();
				form = element("form");
				create_component(input.$$.fragment);
				t1 = space();
				button = element("button");
				if (if_block1) if_block1.c();
				t2 = space();
				t3 = text(t3_value);
				t4 = space();
				if (if_block2) if_block2.c();
				t5 = space();
				if (if_block3) if_block3.c();
				attr(button, "class", /*buttonClass*/ ctx[6]);
				attr(button, "type", "submit");
				attr(form, "class", "iif-block--add-form-form");
				attr(div, "class", "iif-block--add-form");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append(div, t0);
				append(div, form);
				mount_component(input, form, null);
				append(form, t1);
				append(form, button);
				if (if_block1) if_block1.m(button, null);
				append(button, t2);
				append(button, t3);
				append(div, t4);
				if (if_block2) if_block2.m(div, null);
				append(div, t5);
				if (if_block3) if_block3.m(div, null);
				current = true;

				if (!mounted) {
					dispose = listen(form, "submit", prevent_default(/*submitForm*/ ctx[7]));
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (/*phrases*/ ctx[1].title) {
					if (if_block0) {
						if_block0.p(ctx, dirty);
					} else {
						if_block0 = create_if_block_3(ctx);
						if_block0.c();
						if_block0.m(div, t0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				const input_changes = {};
				if (dirty & /*phrases*/ 2) input_changes.placeholder = /*phrases*/ ctx[1].placeholder;
				if (dirty & /*inputIcon*/ 8) input_changes.icon = /*inputIcon*/ ctx[3];

				if (!updating_value && dirty & /*value*/ 1) {
					updating_value = true;
					input_changes.value = /*value*/ ctx[0];
					add_flush_callback(() => updating_value = false);
				}

				input.$set(input_changes);

				if (/*buttonIcon*/ ctx[2]) {
					if (if_block1) {
						if (dirty & /*buttonIcon*/ 4) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block_2$2();
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(button, t2);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}

				if ((!current || dirty & /*phrases*/ 2) && t3_value !== (t3_value = /*phrases*/ ctx[1].submit + "")) set_data(t3, t3_value);

				if (!current || dirty & /*buttonClass*/ 64) {
					attr(button, "class", /*buttonClass*/ ctx[6]);
				}

				if (/*status*/ ctx[4]) {
					if (if_block2) {
						if_block2.p(ctx, dirty);
					} else {
						if_block2 = create_if_block_1$2(ctx);
						if_block2.c();
						if_block2.m(div, t5);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (!/*valid*/ ctx[5] && /*phrases*/ ctx[1].invalid) {
					if (if_block3) {
						if_block3.p(ctx, dirty);
					} else {
						if_block3 = create_if_block$4(ctx);
						if_block3.c();
						if_block3.m(div, null);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}
			},
			i(local) {
				if (current) return;
				transition_in(input.$$.fragment, local);
				transition_in(if_block1);
				current = true;
			},
			o(local) {
				transition_out(input.$$.fragment, local);
				transition_out(if_block1);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				if (if_block0) if_block0.d();
				destroy_component(input);
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				if (if_block3) if_block3.d();
				mounted = false;
				dispose();
			}
		};
	}

	function instance$8($$self, $$props, $$invalidate) {
		
		let { phrases } = $$props;
		let { buttonIcon = false } = $$props;
		let { inputIcon = "" } = $$props;
		let { value } = $$props;
		let { onSubmit } = $$props;
		let { onValidate = null } = $$props;
		let { status = "" } = $$props;

		// Validate value
		let valid;

		// Get class for button
		let buttonClass;

		/**
	 * Validate current value
	 */
		function validateValue(value) {
			if (typeof onValidate === "function") {
				return onValidate(value);
			}

			return true;
		}

		/**
	 * Submit form
	 */
		function submitForm() {
			onSubmit(value);
		}

		function input_value_binding(value$1) {
			value = value$1;
			$$invalidate(0, value);
		}

		$$self.$$set = $$props => {
			if ("phrases" in $$props) $$invalidate(1, phrases = $$props.phrases);
			if ("buttonIcon" in $$props) $$invalidate(2, buttonIcon = $$props.buttonIcon);
			if ("inputIcon" in $$props) $$invalidate(3, inputIcon = $$props.inputIcon);
			if ("value" in $$props) $$invalidate(0, value = $$props.value);
			if ("onSubmit" in $$props) $$invalidate(8, onSubmit = $$props.onSubmit);
			if ("onValidate" in $$props) $$invalidate(9, onValidate = $$props.onValidate);
			if ("status" in $$props) $$invalidate(4, status = $$props.status);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*value*/ 1) {
				 {
					$$invalidate(5, valid = validateValue(value));
				}
			}

			if ($$self.$$.dirty & /*buttonIcon*/ 4) {
				 {
					$$invalidate(6, buttonClass = "iif-form-button iif-form-button--primary" + (buttonIcon ? " iif-form-button--with-icon" : ""));
				}
			}
		};

		return [
			value,
			phrases,
			buttonIcon,
			inputIcon,
			status,
			valid,
			buttonClass,
			submitForm,
			onSubmit,
			onValidate,
			input_value_binding
		];
	}

	class AddForm extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$8, create_fragment$8, safe_not_equal, {
				phrases: 1,
				buttonIcon: 2,
				inputIcon: 3,
				value: 0,
				onSubmit: 8,
				onValidate: 9,
				status: 4
			});
		}
	}

	/**
	 * Validate API provider host
	 */
	function validateProvider(url) {
	    let parts = url.toLowerCase().split('/');
	    // Check protocol
	    const protocol = parts.shift();
	    switch (protocol) {
	        case 'http:':
	        case 'https:':
	            break;
	        default:
	            return null;
	    }
	    // Double '/'
	    if (parts.shift() !== '') {
	        return null;
	    }
	    // Host
	    const host = parts.shift();
	    if (typeof host !== 'string') {
	        return null;
	    }
	    const hostParts = host.split(':');
	    if (hostParts.length > 2) {
	        return null;
	    }
	    // Validate domain
	    const domain = hostParts.shift();
	    if (!domain || !domain.match(/^[a-z0-9.-]+$/)) {
	        return null;
	    }
	    // Validate port
	    const port = hostParts.shift();
	    if (port !== void 0 && !port.match(/^[0-9]+$/)) {
	        return null;
	    }
	    // Return protocol + host, ignore the rest
	    return protocol + '//' + host;
	}
	/**
	 * Retrieve API provider data
	 */
	function retrieveProvider(registry, host, callback) {
	    // console.log('retrieveProvider:', host);
	    const api = registry.api;
	    api.sendQuery(host, '/provider', (status, data) => {
	        const providerData = data;
	        let convertedData;
	        let error = 'error';
	        switch (status) {
	            case 'success':
	                // Validate
	                if (typeof providerData !== 'object') {
	                    break;
	                }
	                // Check if API supports provider
	                if (typeof providerData.provider !== 'string') {
	                    error = 'unsupported';
	                    break;
	                }
	                // Convert data
	                convertedData = lib.convertProviderData(host, providerData);
	                if (!convertedData) {
	                    // console.log('Failed to convert data');
	                    break;
	                }
	                const provider = providerData.provider;
	                // Check if provider exists
	                const list = lib.listProviders();
	                if (list.indexOf(provider) !== -1) {
	                    error = 'exists';
	                    break;
	                }
	                // Add provider
	                lib.addProvider(provider, convertedData);
	                callback(host, true, provider);
	                return;
	        }
	        callback(host, false, error);
	    });
	}

	/* src/icon-finder/components/blocks/Providers.svelte generated by Svelte v3.29.4 */

	function create_if_block$5(ctx) {
		let addform;
		let current;

		addform = new AddForm({
				props: {
					phrases: /*providersPhrases*/ ctx[4].addForm,
					inputIcon: "link",
					buttonIcon: true,
					value: "",
					onValidate: /*validateForm*/ ctx[6],
					onSubmit: /*submitForm*/ ctx[7],
					status: /*status*/ ctx[2]
				}
			});

		return {
			c() {
				create_component(addform.$$.fragment);
			},
			m(target, anchor) {
				mount_component(addform, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const addform_changes = {};
				if (dirty & /*status*/ 4) addform_changes.status = /*status*/ ctx[2];
				addform.$set(addform_changes);
			},
			i(local) {
				if (current) return;
				transition_in(addform.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(addform.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(addform, detaching);
			}
		};
	}

	// (96:0) <Block type="providers">
	function create_default_slot$2(ctx) {
		let tabs;
		let t;
		let if_block_anchor;
		let current;

		tabs = new Tabs({
				props: {
					tabs: /*list*/ ctx[3],
					selected: /*activeProvider*/ ctx[0],
					onClick: /*handleClick*/ ctx[5]
				}
			});

		let if_block = /*formVisible*/ ctx[1] && create_if_block$5(ctx);

		return {
			c() {
				create_component(tabs.$$.fragment);
				t = space();
				if (if_block) if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				mount_component(tabs, target, anchor);
				insert(target, t, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const tabs_changes = {};
				if (dirty & /*list*/ 8) tabs_changes.tabs = /*list*/ ctx[3];
				if (dirty & /*activeProvider*/ 1) tabs_changes.selected = /*activeProvider*/ ctx[0];
				tabs.$set(tabs_changes);

				if (/*formVisible*/ ctx[1]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*formVisible*/ 2) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$5(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(tabs.$$.fragment, local);
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(tabs.$$.fragment, local);
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				destroy_component(tabs, detaching);
				if (detaching) detach(t);
				if (if_block) if_block.d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	function create_fragment$9(ctx) {
		let block;
		let current;

		block = new Block({
				props: {
					type: "providers",
					$$slots: { default: [create_default_slot$2] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const block_changes = {};

				if (dirty & /*$$scope, status, formVisible, list, activeProvider*/ 2063) {
					block_changes.$$scope = { dirty, ctx };
				}

				block.$set(block_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block, detaching);
			}
		};
	}

	function instance$9($$self, $$props, $$invalidate) {
		
		
		
		let { activeProvider } = $$props;
		let { providers } = $$props;

		// Registry
		const registry = getContext("registry");

		const providersPhrases = phrases.providers;
		let formVisible = false;
		let status = "";

		/**
	 * Select new provider
	 */
		function handleClick(key) {
			$$invalidate(1, formVisible = false);
			registry.router.action("provider", key);
		}

		/**
	 * Validate possible new provider
	 */
		function validateForm(value) {
			if (status !== "") {
				// Reset status on input change
				$$invalidate(2, status = "");
			}

			return validateProvider(value) !== null;
		}

		/**
	 * Submit new provider
	 */
		function submitForm(value) {
			const host = validateProvider(value);

			if (!host) {
				return;
			}

			$$invalidate(2, status = providersPhrases.status.loading.replace("{host}", host));

			retrieveProvider(registry, host, (host, success, provider) => {
				if (!success) {
					const error = provider;

					// Use provider as error message
					$$invalidate(2, status = providersPhrases.status[error].replace("{host}", host));

					return;
				}

				$$invalidate(2, status = "");
				$$invalidate(1, formVisible = false);
				registry.router.action("provider", provider);
			});
		}

		// Get items
		let list;

		$$self.$$set = $$props => {
			if ("activeProvider" in $$props) $$invalidate(0, activeProvider = $$props.activeProvider);
			if ("providers" in $$props) $$invalidate(8, providers = $$props.providers);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*providers, list, formVisible*/ 266) {
				 {
					$$invalidate(3, list = []);

					providers.forEach((provider, index) => {
						const item = lib.getProvider(provider);

						if (item) {
							list.push({ key: provider, title: item.title, index });
						}
					});
				}
			}
		};

		return [
			activeProvider,
			formVisible,
			status,
			list,
			providersPhrases,
			handleClick,
			validateForm,
			submitForm,
			providers
		];
	}

	class Providers extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$9, create_fragment$9, safe_not_equal, { activeProvider: 0, providers: 8 });
		}
	}

	/* src/icon-finder/components/views/Error.svelte generated by Svelte v3.29.4 */

	function get_each_context$3(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[7] = list[i];
		return child_ctx;
	}

	// (55:3) {#if canReturn}
	function create_if_block$6(ctx) {
		let br;
		let t0;
		let a;
		let mounted;
		let dispose;

		return {
			c() {
				br = element("br");
				t0 = space();
				a = element("a");
				a.textContent = `${/*errorPhrases*/ ctx[3].custom.home}`;
				attr(a, "href", "# ");
			},
			m(target, anchor) {
				insert(target, br, anchor);
				insert(target, t0, anchor);
				insert(target, a, anchor);

				if (!mounted) {
					dispose = listen(a, "click", prevent_default(/*handleReturn*/ ctx[4]));
					mounted = true;
				}
			},
			p: noop,
			d(detaching) {
				if (detaching) detach(br);
				if (detaching) detach(t0);
				if (detaching) detach(a);
				mounted = false;
				dispose();
			}
		};
	}

	// (51:1) <Block type="error" extra={'error--' + type}>
	function create_default_slot$3(ctx) {
		let uiicon;
		let t0;
		let p;
		let t1;
		let t2;
		let t3;
		let current;

		uiicon = new Icon({
				props: { icon: "error-" + /*type*/ ctx[7] }
			});

		let if_block = /*canReturn*/ ctx[2] && create_if_block$6(ctx);

		return {
			c() {
				create_component(uiicon.$$.fragment);
				t0 = space();
				p = element("p");
				t1 = text(/*text*/ ctx[1]);
				t2 = space();
				if (if_block) if_block.c();
				t3 = space();
			},
			m(target, anchor) {
				mount_component(uiicon, target, anchor);
				insert(target, t0, anchor);
				insert(target, p, anchor);
				append(p, t1);
				append(p, t2);
				if (if_block) if_block.m(p, null);
				insert(target, t3, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const uiicon_changes = {};
				if (dirty & /*error*/ 1) uiicon_changes.icon = "error-" + /*type*/ ctx[7];
				uiicon.$set(uiicon_changes);
				if (!current || dirty & /*text*/ 2) set_data(t1, /*text*/ ctx[1]);

				if (/*canReturn*/ ctx[2]) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block$6(ctx);
						if_block.c();
						if_block.m(p, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(uiicon, detaching);
				if (detaching) detach(t0);
				if (detaching) detach(p);
				if (if_block) if_block.d();
				if (detaching) detach(t3);
			}
		};
	}

	// (50:0) {#each [error] as type (type)}
	function create_each_block$3(key_1, ctx) {
		let first;
		let block;
		let current;

		block = new Block({
				props: {
					type: "error",
					extra: "error--" + /*type*/ ctx[7],
					$$slots: { default: [create_default_slot$3] },
					$$scope: { ctx }
				}
			});

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				create_component(block.$$.fragment);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				mount_component(block, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const block_changes = {};
				if (dirty & /*error*/ 1) block_changes.extra = "error--" + /*type*/ ctx[7];

				if (dirty & /*$$scope, canReturn, text, error*/ 1031) {
					block_changes.$$scope = { dirty, ctx };
				}

				block.$set(block_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(first);
				destroy_component(block, detaching);
			}
		};
	}

	function create_fragment$a(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value = [/*error*/ ctx[0]];
		const get_key = ctx => /*type*/ ctx[7];

		for (let i = 0; i < 1; i += 1) {
			let child_ctx = get_each_context$3(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
		}

		return {
			c() {
				for (let i = 0; i < 1; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty$1();
			},
			m(target, anchor) {
				for (let i = 0; i < 1; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_1_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				if (dirty & /*error, handleReturn, errorPhrases, canReturn, text*/ 31) {
					const each_value = [/*error*/ ctx[0]];
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$3, each_1_anchor, get_each_context$3);
					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < 1; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < 1; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				for (let i = 0; i < 1; i += 1) {
					each_blocks[i].d(detaching);
				}

				if (detaching) detach(each_1_anchor);
			}
		};
	}

	function instance$a($$self, $$props, $$invalidate) {
		
		
		let { error } = $$props;
		let { route } = $$props;

		// Registry
		const registry = getContext("registry");

		// Get text and check if can return
		const errorPhrases = phrases.errors;

		let text;
		let canReturn;

		function handleReturn() {
			const router = registry.router;

			if (route && route.type === "collections") {
				// Return to default provider
				router.home("");
			} else {
				router.home();
			}
		}

		$$self.$$set = $$props => {
			if ("error" in $$props) $$invalidate(0, error = $$props.error);
			if ("route" in $$props) $$invalidate(5, route = $$props.route);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*route, error, text*/ 35) {
				 {
					$$invalidate(2, canReturn = !!(route && (route.type !== "collections" || route.parent || route.params && route.params.provider) && errorPhrases.custom.home !== void 0));

					$$invalidate(1, text = errorPhrases.custom[error] === void 0
					? errorPhrases.defaultError
					: errorPhrases.custom[error]);

					switch (error) {
						case "not_found":
							$$invalidate(1, text = text.replace("{prefix}", route && route.type === "collection"
							? "\"" + route.params.prefix + "\""
							: ""));
							break;
						case "bad_route":
							$$invalidate(2, canReturn = errorPhrases.custom.home !== void 0);
							break;
					}
				}
			}
		};

		return [error, text, canReturn, errorPhrases, handleReturn, route];
	}

	class Error$1 extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$a, create_fragment$a, safe_not_equal, { error: 0, route: 5 });
		}
	}

	/* src/icon-finder/components/blocks/filters/Filter.svelte generated by Svelte v3.29.4 */

	function create_else_block$1(ctx) {
		let button;
		let t;
		let button_disabled_value;
		let mounted;
		let dispose;

		return {
			c() {
				button = element("button");
				t = text(/*title*/ ctx[1]);
				attr(button, "class", /*className*/ ctx[4]);
				button.disabled = button_disabled_value = /*filter*/ ctx[0].disabled;
			},
			m(target, anchor) {
				insert(target, button, anchor);
				append(button, t);

				if (!mounted) {
					dispose = listen(button, "click", prevent_default(function () {
						if (is_function(/*onClick*/ ctx[2])) /*onClick*/ ctx[2].apply(this, arguments);
					}));

					mounted = true;
				}
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty & /*title*/ 2) set_data(t, /*title*/ ctx[1]);

				if (dirty & /*className*/ 16) {
					attr(button, "class", /*className*/ ctx[4]);
				}

				if (dirty & /*filter*/ 1 && button_disabled_value !== (button_disabled_value = /*filter*/ ctx[0].disabled)) {
					button.disabled = button_disabled_value;
				}
			},
			d(detaching) {
				if (detaching) detach(button);
				mounted = false;
				dispose();
			}
		};
	}

	// (32:0) {#if link}
	function create_if_block$7(ctx) {
		let a;
		let t;
		let mounted;
		let dispose;

		return {
			c() {
				a = element("a");
				t = text(/*title*/ ctx[1]);
				attr(a, "class", /*className*/ ctx[4]);
				attr(a, "href", /*link*/ ctx[3]);
			},
			m(target, anchor) {
				insert(target, a, anchor);
				append(a, t);

				if (!mounted) {
					dispose = listen(a, "click", prevent_default(function () {
						if (is_function(/*onClick*/ ctx[2])) /*onClick*/ ctx[2].apply(this, arguments);
					}));

					mounted = true;
				}
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty & /*title*/ 2) set_data(t, /*title*/ ctx[1]);

				if (dirty & /*className*/ 16) {
					attr(a, "class", /*className*/ ctx[4]);
				}

				if (dirty & /*link*/ 8) {
					attr(a, "href", /*link*/ ctx[3]);
				}
			},
			d(detaching) {
				if (detaching) detach(a);
				mounted = false;
				dispose();
			}
		};
	}

	function create_fragment$b(ctx) {
		let if_block_anchor;

		function select_block_type(ctx, dirty) {
			if (/*link*/ ctx[3]) return create_if_block$7;
			return create_else_block$1;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		return {
			c() {
				if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},
			p(ctx, [dirty]) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				if_block.d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	const baseClass$3 = "iif-filter";

	function instance$b($$self, $$props, $$invalidate) {
		
		let { active = false } = $$props;
		let { hasActive = false } = $$props;
		let { filter } = $$props;
		let { title } = $$props;
		let { onClick } = $$props;
		let { link = "# " } = $$props;
		let className;

		$$self.$$set = $$props => {
			if ("active" in $$props) $$invalidate(5, active = $$props.active);
			if ("hasActive" in $$props) $$invalidate(6, hasActive = $$props.hasActive);
			if ("filter" in $$props) $$invalidate(0, filter = $$props.filter);
			if ("title" in $$props) $$invalidate(1, title = $$props.title);
			if ("onClick" in $$props) $$invalidate(2, onClick = $$props.onClick);
			if ("link" in $$props) $$invalidate(3, link = $$props.link);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*active, hasActive, filter*/ 97) {
				 {
					$$invalidate(4, className = baseClass$3 + (active
					? " " + baseClass$3 + "--selected"
					: hasActive ? " " + baseClass$3 + "--unselected" : "") + (filter.index
					? " " + baseClass$3 + "--" + filter.index % maxIndex
					: ""));
				}
			}
		};

		return [filter, title, onClick, link, className, active, hasActive];
	}

	class Filter extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$b, create_fragment$b, safe_not_equal, {
				active: 5,
				hasActive: 6,
				filter: 0,
				title: 1,
				onClick: 2,
				link: 3
			});
		}
	}

	/* src/icon-finder/components/blocks/Filters.svelte generated by Svelte v3.29.4 */

	function get_each_context$4(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[13] = list[i][0];
		child_ctx[14] = list[i][1];
		child_ctx[16] = i;
		return child_ctx;
	}

	// (65:0) {#if filters.length > 1}
	function create_if_block$8(ctx) {
		let block_1;
		let current;

		block_1 = new Block({
				props: {
					type: "filters",
					name: /*name*/ ctx[0],
					extra: /*extra*/ ctx[5],
					$$slots: { default: [create_default_slot$4] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block_1.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block_1, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const block_1_changes = {};
				if (dirty & /*name*/ 1) block_1_changes.name = /*name*/ ctx[0];
				if (dirty & /*extra*/ 32) block_1_changes.extra = /*extra*/ ctx[5];

				if (dirty & /*$$scope, block, link, header*/ 131086) {
					block_1_changes.$$scope = { dirty, ctx };
				}

				block_1.$set(block_1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block_1, detaching);
			}
		};
	}

	// (67:2) {#if header !== ''}
	function create_if_block_1$3(ctx) {
		let div;
		let t;

		return {
			c() {
				div = element("div");
				t = text(/*header*/ ctx[3]);
				attr(div, "class", "iif-filters-header");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, t);
			},
			p(ctx, dirty) {
				if (dirty & /*header*/ 8) set_data(t, /*header*/ ctx[3]);
			},
			d(detaching) {
				if (detaching) detach(div);
			}
		};
	}

	// (71:3) {#each Object.entries(block.filters) as [key, filter], i (key)}
	function create_each_block$4(key_1, ctx) {
		let first;
		let filter;
		let current;

		function func(...args) {
			return /*func*/ ctx[11](/*key*/ ctx[13], ...args);
		}

		filter = new Filter({
				props: {
					active: /*key*/ ctx[13] === /*block*/ ctx[1].active,
					hasActive: /*block*/ ctx[1].active !== null,
					filter: /*filter*/ ctx[14],
					link: /*link*/ ctx[2]
					? /*link*/ ctx[2].replace("{prefix}", /*key*/ ctx[13])
					: void 0,
					title: /*filter*/ ctx[14].title === ""
					? phrases.filters.uncategorised
					: /*filter*/ ctx[14].title,
					onClick: func
				}
			});

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				create_component(filter.$$.fragment);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				mount_component(filter, target, anchor);
				current = true;
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				const filter_changes = {};
				if (dirty & /*block*/ 2) filter_changes.active = /*key*/ ctx[13] === /*block*/ ctx[1].active;
				if (dirty & /*block*/ 2) filter_changes.hasActive = /*block*/ ctx[1].active !== null;
				if (dirty & /*block*/ 2) filter_changes.filter = /*filter*/ ctx[14];

				if (dirty & /*link, block*/ 6) filter_changes.link = /*link*/ ctx[2]
				? /*link*/ ctx[2].replace("{prefix}", /*key*/ ctx[13])
				: void 0;

				if (dirty & /*block*/ 2) filter_changes.title = /*filter*/ ctx[14].title === ""
				? phrases.filters.uncategorised
				: /*filter*/ ctx[14].title;

				if (dirty & /*block*/ 2) filter_changes.onClick = func;
				filter.$set(filter_changes);
			},
			i(local) {
				if (current) return;
				transition_in(filter.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(filter.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(first);
				destroy_component(filter, detaching);
			}
		};
	}

	// (66:1) <Block type="filters" {name} {extra}>
	function create_default_slot$4(ctx) {
		let t;
		let div;
		let each_blocks = [];
		let each_1_lookup = new Map();
		let current;
		let if_block = /*header*/ ctx[3] !== "" && create_if_block_1$3(ctx);
		let each_value = Object.entries(/*block*/ ctx[1].filters);
		const get_key = ctx => /*key*/ ctx[13];

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$4(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
		}

		return {
			c() {
				if (if_block) if_block.c();
				t = space();
				div = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr(div, "class", "iif-filters-list");
			},
			m(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, t, anchor);
				insert(target, div, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				current = true;
			},
			p(ctx, dirty) {
				if (/*header*/ ctx[3] !== "") {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block_1$3(ctx);
						if_block.c();
						if_block.m(t.parentNode, t);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (dirty & /*Object, block, link, phrases, handleClick*/ 70) {
					const each_value = Object.entries(/*block*/ ctx[1].filters);
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$4, null, get_each_context$4);
					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach(t);
				if (detaching) detach(div);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}
			}
		};
	}

	function create_fragment$c(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*filters*/ ctx[4].length > 1 && create_if_block$8(ctx);

		return {
			c() {
				if (if_block) if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				if (/*filters*/ ctx[4].length > 1) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*filters*/ 16) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$8(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	function instance$c($$self, $$props, $$invalidate) {
		
		
		let { name } = $$props;
		let { block } = $$props;
		let { parent = "" } = $$props;
		let { link = "" } = $$props;
		let { onClick = null } = $$props;
		let { showTitle = false } = $$props;
		let { title = "" } = $$props;

		// Registry
		const registry = getContext("registry");

		// Handle click
		function handleClick(key) {
			if (typeof onClick === "function") {
				onClick(key);
			} else {
				registry.router.action(name, key === block.active ? null : key);
			}
		}

		// Resolve header
		let header;

		// Get filter keys
		let filters;

		// Get extra class name
		let extra;

		const func = key => handleClick(key);

		$$self.$$set = $$props => {
			if ("name" in $$props) $$invalidate(0, name = $$props.name);
			if ("block" in $$props) $$invalidate(1, block = $$props.block);
			if ("parent" in $$props) $$invalidate(7, parent = $$props.parent);
			if ("link" in $$props) $$invalidate(2, link = $$props.link);
			if ("onClick" in $$props) $$invalidate(8, onClick = $$props.onClick);
			if ("showTitle" in $$props) $$invalidate(9, showTitle = $$props.showTitle);
			if ("title" in $$props) $$invalidate(10, title = $$props.title);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*showTitle, title, name, parent*/ 1665) {
				 {
					if (showTitle === false) {
						$$invalidate(3, header = "");
					} else if (typeof title === "string") {
						$$invalidate(3, header = title);
					} else {
						let key = name;

						if (parent !== "") {
							if (phrases.filters[name + "-" + parent] !== void 0) {
								key = name + "-" + parent;
							}
						}

						$$invalidate(3, header = phrases.filters[key] === void 0
						? ""
						: phrases.filters[key]);
					}
				}
			}

			if ($$self.$$.dirty & /*block*/ 2) {
				 {
					$$invalidate(4, filters = block === null ? [] : Object.keys(block.filters));
				}
			}

			if ($$self.$$.dirty & /*block*/ 2) {
				 {
					$$invalidate(5, extra = block === null || block.active === null
					? ""
					: "filters--active");
				}
			}
		};

		return [
			name,
			block,
			link,
			header,
			filters,
			extra,
			handleClick,
			parent,
			onClick,
			showTitle,
			title,
			func
		];
	}

	class Filters extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$c, create_fragment$c, safe_not_equal, {
				name: 0,
				block: 1,
				parent: 7,
				link: 2,
				onClick: 8,
				showTitle: 9,
				title: 10
			});
		}
	}

	/* src/icon-finder/components/blocks/CollectionsFilter.svelte generated by Svelte v3.29.4 */

	function create_default_slot$5(ctx) {
		let input;
		let updating_value;
		let current;

		function input_value_binding(value) {
			/*input_value_binding*/ ctx[4].call(null, value);
		}

		let input_props = {
			type: "text",
			icon: "search",
			placeholder: /*placeholder*/ ctx[1]
		};

		if (/*value*/ ctx[0] !== void 0) {
			input_props.value = /*value*/ ctx[0];
		}

		input = new Input({ props: input_props });
		binding_callbacks.push(() => bind(input, "value", input_value_binding));

		return {
			c() {
				create_component(input.$$.fragment);
			},
			m(target, anchor) {
				mount_component(input, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const input_changes = {};

				if (!updating_value && dirty & /*value*/ 1) {
					updating_value = true;
					input_changes.value = /*value*/ ctx[0];
					add_flush_callback(() => updating_value = false);
				}

				input.$set(input_changes);
			},
			i(local) {
				if (current) return;
				transition_in(input.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(input.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(input, detaching);
			}
		};
	}

	function create_fragment$d(ctx) {
		let block_1;
		let current;

		block_1 = new Block({
				props: {
					type: "filter",
					$$slots: { default: [create_default_slot$5] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block_1.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block_1, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const block_1_changes = {};

				if (dirty & /*$$scope, value*/ 129) {
					block_1_changes.$$scope = { dirty, ctx };
				}

				block_1.$set(block_1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block_1, detaching);
			}
		};
	}

	function instance$d($$self, $$props, $$invalidate) {
		
		
		let { name } = $$props;
		let { block } = $$props;

		// Registry
		const registry = getContext("registry");

		// Set initial input value
		let value = block.keyword;

		// Get placeholder
		const text = phrases.search;

		const placeholder = text.placeholder.collections === void 0
		? text.defaultPlaceholder
		: text.placeholder.collections;

		function input_value_binding(value$1) {
			value = value$1;
			$$invalidate(0, value);
		}

		$$self.$$set = $$props => {
			if ("name" in $$props) $$invalidate(2, name = $$props.name);
			if ("block" in $$props) $$invalidate(3, block = $$props.block);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*value, block, name*/ 13) {
				 {
					// Update value
					if (value !== block.keyword) {
						registry.router.action(name, value);
					}
				}
			}
		};

		return [value, placeholder, name, block, input_value_binding];
	}

	class CollectionsFilter extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$d, create_fragment$d, safe_not_equal, { name: 2, block: 3 });
		}
	}

	/* src/icon-finder/components/blocks/collections-list/Height.svelte generated by Svelte v3.29.4 */

	function create_fragment$e(ctx) {
		let html_tag;
		let html_anchor;

		return {
			c() {
				html_anchor = empty$1();
				html_tag = new HtmlTag(html_anchor);
			},
			m(target, anchor) {
				html_tag.m(/*html*/ ctx[0], target, anchor);
				insert(target, html_anchor, anchor);
			},
			p(ctx, [dirty]) {
				if (dirty & /*html*/ 1) html_tag.p(/*html*/ ctx[0]);
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) detach(html_anchor);
				if (detaching) html_tag.d();
			}
		};
	}

	const unit = 8;

	function instance$e($$self, $$props, $$invalidate) {
		let { text } = $$props;

		const shapesData = {
			"0": {
				paths: [
					"M24 68h8c6 0 12 6 12 12v32c0 6-6 12-12 12H16c-6 0-12-6-12-12V80c0-6 5-12 12-12h8z"
				],
				width: 48
			},
			"1": {
				paths: ["M4 68c6 0 12 6 12 12v44H4h24"],
				width: 32
			},
			"2": {
				paths: [
					"M4 80c0-6 6-12 12-12h16c6 0 12 6 12 12v8c0 6-6 12-12 12H16c-6 0-12 6-12 12v12h40"
				],
				width: 48
			},
			"3": {
				paths: [
					"M4 80c0-6 6-12 12-12h16c6 0 12 6 12 12v4c0 6-6 12-12 12h-4 4c6 0 12 6 12 12v4c0 6-6 12-12 12H16c-6 0-12-6-12-12"
				],
				width: 48
			},
			"4": {
				paths: ["M4 68v20c0 6 6 12 12 12h16c6 0 12-6 12-12V68v56"],
				width: 48
			},
			"5": {
				paths: ["M44 68H4v24h28c6 0 12 6 12 12v8c0 6-6 12-12 12H16c-6 0-12-6-12-12"],
				width: 48
			},
			"6": {
				paths: [
					"M44 80c0-6-6-12-12-12H16c-6 0-12 6-12 12v32c0 6 6 12 12 12h16c6 0 12-6 12-12v-8c0-6-6-12-12-12H16c-6 0-12 6-12 12"
				],
				width: 48
			},
			"7": {
				paths: ["M4 68h28c6 0 12 6 12 12 0 4-6.667 18.667-20 44"],
				width: 48
			},
			"8": {
				paths: [
					"M24 68h8c6 0 12 6 12 12v4c0 6-6 12-12 12 6 0 12 6 12 12v4c0 6-6 12-12 12H16c-6 0-12-6-12-12v-4c0-6 6-12 12-12-6 0-12-6-12-12v-4c0-6 6-12 12-12h8z"
				],
				width: 48
			},
			"9": {
				paths: [
					"M44 88c0 6-6 12-12 12H16c-6 0-12-6-12-12v-8c0-6 6-12 12-12h16c6 0 12 6 12 12v32c0 6-6 12-12 12H16c-6 0-12-6-12-12"
				],
				width: 48
			},
			"|": {
				paths: [
					// Top arrow
					"M4 48l24-24 24 24",
					// Bottom arrow
					"M4 144l24 24 24-24",
					// Middle line
					"M28 48v96"
				],
				width: 56
			},
			",": {
				paths: ["M8 124c-2 0-4-2-4-4s2-4 4-4 4 2 4 4v8c0 2-2 6-4 8"],
				width: 16
			},
			".": {
				paths: ["M8 116c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4z"],
				width: 16
			}
		};

		const defaultOptions = { line: false, animate: false, height: 24 };

		function iconHeight(text, options) {
			let width = unit, height = 24 * unit, svg = "", i, char, item, scale;

			// Convert from number
			if (typeof text === "number") {
				text = "" + text;
			}

			// Set options
			const allOptions = Object.assign({}, defaultOptions, typeof options === "object" ? options : {});

			// Get scale
			scale = height / allOptions.height;

			// Add 1 unit for line
			if (allOptions.line) {
				width += unit;
			}

			// Parse each character
			for (i = 0; i < text.length; i++) {
				char = text.slice(i, i + 1);

				if (shapesData[char] === void 0) {
					if (char === " ") {
						width += unit * 2;
					}

					continue;
				}

				if (char === "|") {
					// Force line
					allOptions.line = true;
				}

				item = shapesData[char];

				if (width > unit) {
					svg += "<g transform=\"translate(" + width + ")\">";
				}

				item.paths.forEach(path => {
					svg += "<path d=\"" + path + "\" />";
				});

				if (width > unit) {
					svg += "</g>";
				}

				width += item.width + unit;
			}

			// Add line
			if (allOptions.line) {
				svg += "<path d=\"M" + unit / 2 + " " + unit / 2 + "h" + (width - unit) + "\" />";
				svg += "<path d=\"M" + unit / 2 + " " + (height - unit / 2) + "h" + (width - unit) + "\" />";
			}

			// Wrap in group
			svg = "<g stroke-width=\"" + unit + "\" stroke=\"currentColor\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">" + svg + "</g>";

			// Wrap in <svg>
			return "<svg xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\" width=\"" + width / scale + "\" height=\"" + height / scale + "\" viewBox=\"0 0 " + width + " " + height + "\"> " + svg + "</svg>";
		}

		// Convert to HTML
		let html;

		$$self.$$set = $$props => {
			if ("text" in $$props) $$invalidate(1, text = $$props.text);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*text*/ 2) {
				 {
					$$invalidate(0, html = iconHeight(text));
				}
			}
		};

		return [html, text];
	}

	class Height extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$e, create_fragment$e, safe_not_equal, { text: 1 });
		}
	}

	/* src/icon-finder/components/blocks/collections-list/Item.svelte generated by Svelte v3.29.4 */

	function get_each_context$5(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[14] = list[i];
		return child_ctx;
	}

	// (85:2) {#if info.author}
	function create_if_block_2$3(ctx) {
		let small;
		let t0_value = phrases.collection.by + "";
		let t0;
		let t1;

		function select_block_type(ctx, dirty) {
			if ( /*info*/ ctx[2].author.url) return create_if_block_3$1;
			return create_else_block$2;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		return {
			c() {
				small = element("small");
				t0 = text(t0_value);
				t1 = space();
				if_block.c();
			},
			m(target, anchor) {
				insert(target, small, anchor);
				append(small, t0);
				append(small, t1);
				if_block.m(small, null);
			},
			p(ctx, dirty) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(small, null);
					}
				}
			},
			d(detaching) {
				if (detaching) detach(small);
				if_block.d();
			}
		};
	}

	// (93:4) {:else}
	function create_else_block$2(ctx) {
		let t_value = /*info*/ ctx[2].author.name + "";
		let t;

		return {
			c() {
				t = text(t_value);
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*info*/ 4 && t_value !== (t_value = /*info*/ ctx[2].author.name + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) detach(t);
			}
		};
	}

	// (88:4) {#if showCollectionAuthorLink && info.author.url}
	function create_if_block_3$1(ctx) {
		let a;
		let t_value = /*info*/ ctx[2].author.name + "";
		let t;
		let a_href_value;
		let mounted;
		let dispose;

		return {
			c() {
				a = element("a");
				t = text(t_value);
				attr(a, "href", a_href_value = /*info*/ ctx[2].author.url);
				attr(a, "target", "_blank");
			},
			m(target, anchor) {
				insert(target, a, anchor);
				append(a, t);

				if (!mounted) {
					dispose = listen(a, "click", function () {
						if (is_function(/*onExternalClick*/ ctx[4])) /*onExternalClick*/ ctx[4].apply(this, arguments);
					});

					mounted = true;
				}
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty & /*info*/ 4 && t_value !== (t_value = /*info*/ ctx[2].author.name + "")) set_data(t, t_value);

				if (dirty & /*info*/ 4 && a_href_value !== (a_href_value = /*info*/ ctx[2].author.url)) {
					attr(a, "href", a_href_value);
				}
			},
			d(detaching) {
				if (detaching) detach(a);
				mounted = false;
				dispose();
			}
		};
	}

	// (98:2) {#if samples.length > 0}
	function create_if_block_1$4(ctx) {
		let div;
		let div_class_value;
		let each_value = /*samples*/ ctx[7];
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
		}

		return {
			c() {
				div = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr(div, "class", div_class_value = "iif-collection-samples" + (/*samplesHeight*/ ctx[8]
				? " iif-collection-samples--" + /*samplesHeight*/ ctx[8]
				: ""));
			},
			m(target, anchor) {
				insert(target, div, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}
			},
			p(ctx, dirty) {
				if (dirty & /*provider, prefix, samples*/ 131) {
					each_value = /*samples*/ ctx[7];
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$5(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$5(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}
			},
			d(detaching) {
				if (detaching) detach(div);
				destroy_each(each_blocks, detaching);
			}
		};
	}

	// (101:4) {#each samples as sample}
	function create_each_block$5(ctx) {
		let span;
		let span_data_icon_value;

		return {
			c() {
				span = element("span");
				attr(span, "class", "iconify");

				attr(span, "data-icon", span_data_icon_value = (/*provider*/ ctx[0] === ""
				? ""
				: "@" + /*provider*/ ctx[0] + ":") + /*prefix*/ ctx[1] + ":" + /*sample*/ ctx[14]);

				attr(span, "data-inline", "false");
			},
			m(target, anchor) {
				insert(target, span, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*provider, prefix*/ 3 && span_data_icon_value !== (span_data_icon_value = (/*provider*/ ctx[0] === ""
				? ""
				: "@" + /*provider*/ ctx[0] + ":") + /*prefix*/ ctx[1] + ":" + /*sample*/ ctx[14])) {
					attr(span, "data-icon", span_data_icon_value);
				}
			},
			d(detaching) {
				if (detaching) detach(span);
			}
		};
	}

	// (109:2) {#if info.height}
	function create_if_block$9(ctx) {
		let div;
		let height_1;
		let current;
		height_1 = new Height({ props: { text: /*height*/ ctx[9] } });

		return {
			c() {
				div = element("div");
				create_component(height_1.$$.fragment);
				attr(div, "class", "iif-collection-height");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				mount_component(height_1, div, null);
				current = true;
			},
			p: noop,
			i(local) {
				if (current) return;
				transition_in(height_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(height_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				destroy_component(height_1);
			}
		};
	}

	function create_fragment$f(ctx) {
		let li;
		let div0;
		let a;
		let t0_value = /*info*/ ctx[2].name + "";
		let t0;
		let t1;
		let t2;
		let div2;
		let t3;
		let t4;
		let div1;
		let height_1;
		let current;
		let mounted;
		let dispose;
		let if_block0 = /*info*/ ctx[2].author && create_if_block_2$3(ctx);
		let if_block1 = /*samples*/ ctx[7].length > 0 && create_if_block_1$4(ctx);
		let if_block2 = /*info*/ ctx[2].height && create_if_block$9(ctx);

		height_1 = new Height({
				props: { text: /*info*/ ctx[2].total + "" }
			});

		return {
			c() {
				li = element("li");
				div0 = element("div");
				a = element("a");
				t0 = text(t0_value);
				t1 = space();
				if (if_block0) if_block0.c();
				t2 = space();
				div2 = element("div");
				if (if_block1) if_block1.c();
				t3 = space();
				if (if_block2) if_block2.c();
				t4 = space();
				div1 = element("div");
				create_component(height_1.$$.fragment);
				attr(a, "href", /*link*/ ctx[5]);
				attr(div0, "class", "iif-collection-text");
				attr(div1, "class", "iif-collection-total");
				attr(div2, "class", "iif-collection-data");
				attr(li, "class", /*className*/ ctx[6]);
			},
			m(target, anchor) {
				insert(target, li, anchor);
				append(li, div0);
				append(div0, a);
				append(a, t0);
				append(div0, t1);
				if (if_block0) if_block0.m(div0, null);
				append(li, t2);
				append(li, div2);
				if (if_block1) if_block1.m(div2, null);
				append(div2, t3);
				if (if_block2) if_block2.m(div2, null);
				append(div2, t4);
				append(div2, div1);
				mount_component(height_1, div1, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen(a, "click", prevent_default(/*click_handler*/ ctx[11])),
						listen(li, "click", /*handleBlockClick*/ ctx[10])
					];

					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if ((!current || dirty & /*info*/ 4) && t0_value !== (t0_value = /*info*/ ctx[2].name + "")) set_data(t0, t0_value);

				if (!current || dirty & /*link*/ 32) {
					attr(a, "href", /*link*/ ctx[5]);
				}

				if (/*info*/ ctx[2].author) {
					if (if_block0) {
						if_block0.p(ctx, dirty);
					} else {
						if_block0 = create_if_block_2$3(ctx);
						if_block0.c();
						if_block0.m(div0, null);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (/*samples*/ ctx[7].length > 0) if_block1.p(ctx, dirty);

				if (/*info*/ ctx[2].height) {
					if (if_block2) {
						if_block2.p(ctx, dirty);

						if (dirty & /*info*/ 4) {
							transition_in(if_block2, 1);
						}
					} else {
						if_block2 = create_if_block$9(ctx);
						if_block2.c();
						transition_in(if_block2, 1);
						if_block2.m(div2, t4);
					}
				} else if (if_block2) {
					group_outros();

					transition_out(if_block2, 1, 1, () => {
						if_block2 = null;
					});

					check_outros();
				}

				const height_1_changes = {};
				if (dirty & /*info*/ 4) height_1_changes.text = /*info*/ ctx[2].total + "";
				height_1.$set(height_1_changes);

				if (!current || dirty & /*className*/ 64) {
					attr(li, "class", /*className*/ ctx[6]);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block2);
				transition_in(height_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(if_block2);
				transition_out(height_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(li);
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				destroy_component(height_1);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	const baseClass$4 = "iif-collection";

	function instance$f($$self, $$props, $$invalidate) {
		
		let { provider } = $$props;
		let { prefix } = $$props;
		let { info } = $$props;
		let { onClick } = $$props;
		let { onExternalClick } = $$props;

		// Get link
		let link;

		// Get container class name
		let className;

		// Samples
		const samples = getSamples();

		const samplesHeight = getSamplesHeight();

		// Height
		const height = "|" + (typeof info.height !== "object"
		? info.height
		: info.height.join(", "));

		// Block was clicked
		function handleBlockClick(event) {
		}

		function getSamplesHeight() {
			if (info.displayHeight) {
				return info.displayHeight;
			} else if (typeof info.height === "number") {
				return info.height;
			}

			return 0;
		}

		function getSamples() {
			if (info.samples instanceof Array) {
				return info.samples.slice(0, 3);
			}

			return [];
		}

		const click_handler = () => onClick(prefix);

		$$self.$$set = $$props => {
			if ("provider" in $$props) $$invalidate(0, provider = $$props.provider);
			if ("prefix" in $$props) $$invalidate(1, prefix = $$props.prefix);
			if ("info" in $$props) $$invalidate(2, info = $$props.info);
			if ("onClick" in $$props) $$invalidate(3, onClick = $$props.onClick);
			if ("onExternalClick" in $$props) $$invalidate(4, onExternalClick = $$props.onExternalClick);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*provider, prefix, link*/ 35) {
				 {
					const providerData = lib.getProvider(provider);

					if (providerData) {
						$$invalidate(5, link = providerData.links.collection.replace("{prefix}", prefix));

						if (link === "") {
							$$invalidate(5, link = "#");
						}
					} else {
						$$invalidate(5, link = "#");
					}
				}
			}

			if ($$self.$$.dirty & /*prefix, provider, info*/ 7) {
				 {
					$$invalidate(6, className = baseClass$4 + " " + baseClass$4 + "--prefix--" + prefix + (provider === ""
					? ""
					: " " + baseClass$4 + "--provider--" + provider) + ( "") + (info.index
					? " " + baseClass$4 + "--" + info.index % maxIndex
					: ""));
				}
			}
		};

		return [
			provider,
			prefix,
			info,
			onClick,
			onExternalClick,
			link,
			className,
			samples,
			samplesHeight,
			height,
			handleBlockClick,
			click_handler
		];
	}

	class Item extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$f, create_fragment$f, safe_not_equal, {
				provider: 0,
				prefix: 1,
				info: 2,
				onClick: 3,
				onExternalClick: 4
			});
		}
	}

	/* src/icon-finder/components/blocks/collections-list/Category.svelte generated by Svelte v3.29.4 */

	function get_each_context$6(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[6] = list[i][0];
		child_ctx[7] = list[i][1];
		child_ctx[9] = i;
		return child_ctx;
	}

	// (18:1) {#if showCategories}
	function create_if_block$a(ctx) {
		let div;
		let t;

		return {
			c() {
				div = element("div");
				t = text(/*category*/ ctx[1]);
				attr(div, "class", "iif-collections-list-title");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, t);
			},
			p(ctx, dirty) {
				if (dirty & /*category*/ 2) set_data(t, /*category*/ ctx[1]);
			},
			d(detaching) {
				if (detaching) detach(div);
			}
		};
	}

	// (22:2) {#each Object.entries(items) as [prefix, info], i (prefix)}
	function create_each_block$6(key_1, ctx) {
		let first;
		let item;
		let current;

		item = new Item({
				props: {
					provider: /*provider*/ ctx[3],
					prefix: /*prefix*/ ctx[6],
					info: /*info*/ ctx[7],
					onClick: /*onClick*/ ctx[4],
					onExternalClick: /*onExternalClick*/ ctx[5]
				}
			});

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				create_component(item.$$.fragment);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				mount_component(item, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const item_changes = {};
				if (dirty & /*provider*/ 8) item_changes.provider = /*provider*/ ctx[3];
				if (dirty & /*items*/ 4) item_changes.prefix = /*prefix*/ ctx[6];
				if (dirty & /*items*/ 4) item_changes.info = /*info*/ ctx[7];
				if (dirty & /*onClick*/ 16) item_changes.onClick = /*onClick*/ ctx[4];
				if (dirty & /*onExternalClick*/ 32) item_changes.onExternalClick = /*onExternalClick*/ ctx[5];
				item.$set(item_changes);
			},
			i(local) {
				if (current) return;
				transition_in(item.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(item.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(first);
				destroy_component(item, detaching);
			}
		};
	}

	function create_fragment$g(ctx) {
		let div;
		let t;
		let ul;
		let each_blocks = [];
		let each_1_lookup = new Map();
		let current;
		let if_block = /*showCategories*/ ctx[0] && create_if_block$a(ctx);
		let each_value = Object.entries(/*items*/ ctx[2]);
		const get_key = ctx => /*prefix*/ ctx[6];

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$6(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$6(key, child_ctx));
		}

		return {
			c() {
				div = element("div");
				if (if_block) if_block.c();
				t = space();
				ul = element("ul");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr(ul, "class", "iif-collections-list-items");
				attr(div, "class", "iif-collections-list-category");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if (if_block) if_block.m(div, null);
				append(div, t);
				append(div, ul);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				current = true;
			},
			p(ctx, [dirty]) {
				if (/*showCategories*/ ctx[0]) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block$a(ctx);
						if_block.c();
						if_block.m(div, t);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (dirty & /*provider, Object, items, onClick, onExternalClick*/ 60) {
					const each_value = Object.entries(/*items*/ ctx[2]);
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$6, null, get_each_context$6);
					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				if (if_block) if_block.d();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}
			}
		};
	}

	function instance$g($$self, $$props, $$invalidate) {
		
		let { showCategories } = $$props;
		let { category = "" } = $$props;
		let { items } = $$props;
		let { provider } = $$props;
		let { onClick } = $$props;
		let { onExternalClick } = $$props;

		$$self.$$set = $$props => {
			if ("showCategories" in $$props) $$invalidate(0, showCategories = $$props.showCategories);
			if ("category" in $$props) $$invalidate(1, category = $$props.category);
			if ("items" in $$props) $$invalidate(2, items = $$props.items);
			if ("provider" in $$props) $$invalidate(3, provider = $$props.provider);
			if ("onClick" in $$props) $$invalidate(4, onClick = $$props.onClick);
			if ("onExternalClick" in $$props) $$invalidate(5, onExternalClick = $$props.onExternalClick);
		};

		return [showCategories, category, items, provider, onClick, onExternalClick];
	}

	class Category extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$g, create_fragment$g, safe_not_equal, {
				showCategories: 0,
				category: 1,
				items: 2,
				provider: 3,
				onClick: 4,
				onExternalClick: 5
			});
		}
	}

	/* src/icon-finder/components/blocks/errors/ContentError.svelte generated by Svelte v3.29.4 */

	function create_fragment$h(ctx) {
		let div;
		let t;

		return {
			c() {
				div = element("div");
				t = text(/*error*/ ctx[0]);
				attr(div, "class", "iif-content-error");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, t);
			},
			p(ctx, [dirty]) {
				if (dirty & /*error*/ 1) set_data(t, /*error*/ ctx[0]);
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) detach(div);
			}
		};
	}

	function instance$h($$self, $$props, $$invalidate) {
		let { error } = $$props;

		$$self.$$set = $$props => {
			if ("error" in $$props) $$invalidate(0, error = $$props.error);
		};

		return [error];
	}

	class ContentError extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$h, create_fragment$h, safe_not_equal, { error: 0 });
		}
	}

	/* src/icon-finder/components/blocks/CollectionsList.svelte generated by Svelte v3.29.4 */

	function get_each_context$7(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[6] = list[i][0];
		child_ctx[7] = list[i][1];
		child_ctx[9] = i;
		return child_ctx;
	}

	// (33:1) {:else}
	function create_else_block$3(ctx) {
		let error;
		let current;

		error = new ContentError({
				props: { error: phrases.errors.noCollections }
			});

		return {
			c() {
				create_component(error.$$.fragment);
			},
			m(target, anchor) {
				mount_component(error, target, anchor);
				current = true;
			},
			p: noop,
			i(local) {
				if (current) return;
				transition_in(error.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(error.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(error, detaching);
			}
		};
	}

	// (25:1) {#each Object.entries(block.collections) as [category, items], i (category)}
	function create_each_block$7(key_1, ctx) {
		let first;
		let category;
		let current;

		category = new Category({
				props: {
					onExternalClick: /*onExternalClick*/ ctx[2],
					onClick: /*onClick*/ ctx[3],
					showCategories: /*block*/ ctx[0].showCategories,
					category: /*category*/ ctx[6],
					provider: /*provider*/ ctx[1],
					items: /*items*/ ctx[7]
				}
			});

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				create_component(category.$$.fragment);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				mount_component(category, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const category_changes = {};
				if (dirty & /*block*/ 1) category_changes.showCategories = /*block*/ ctx[0].showCategories;
				if (dirty & /*block*/ 1) category_changes.category = /*category*/ ctx[6];
				if (dirty & /*provider*/ 2) category_changes.provider = /*provider*/ ctx[1];
				if (dirty & /*block*/ 1) category_changes.items = /*items*/ ctx[7];
				category.$set(category_changes);
			},
			i(local) {
				if (current) return;
				transition_in(category.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(category.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(first);
				destroy_component(category, detaching);
			}
		};
	}

	// (24:0) <Block type="collections">
	function create_default_slot$6(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value = Object.entries(/*block*/ ctx[0].collections);
		const get_key = ctx => /*category*/ ctx[6];

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$7(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$7(key, child_ctx));
		}

		let each_1_else = null;

		if (!each_value.length) {
			each_1_else = create_else_block$3();
		}

		return {
			c() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty$1();

				if (each_1_else) {
					each_1_else.c();
				}
			},
			m(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_1_anchor, anchor);

				if (each_1_else) {
					each_1_else.m(target, anchor);
				}

				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*onExternalClick, onClick, block, Object, provider, phrases*/ 15) {
					const each_value = Object.entries(/*block*/ ctx[0].collections);
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$7, each_1_anchor, get_each_context$7);
					check_outros();

					if (!each_value.length && each_1_else) {
						each_1_else.p(ctx, dirty);
					} else if (!each_value.length) {
						each_1_else = create_else_block$3();
						each_1_else.c();
						transition_in(each_1_else, 1);
						each_1_else.m(each_1_anchor.parentNode, each_1_anchor);
					} else if (each_1_else) {
						group_outros();

						transition_out(each_1_else, 1, 1, () => {
							each_1_else = null;
						});

						check_outros();
					}
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d(detaching);
				}

				if (detaching) detach(each_1_anchor);
				if (each_1_else) each_1_else.d(detaching);
			}
		};
	}

	function create_fragment$i(ctx) {
		let block_1;
		let current;

		block_1 = new Block({
				props: {
					type: "collections",
					$$slots: { default: [create_default_slot$6] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block_1.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block_1, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const block_1_changes = {};

				if (dirty & /*$$scope, block, provider*/ 1027) {
					block_1_changes.$$scope = { dirty, ctx };
				}

				block_1.$set(block_1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block_1, detaching);
			}
		};
	}

	function instance$i($$self, $$props, $$invalidate) {
		
		
		let { name } = $$props;
		let { block } = $$props;
		let { provider } = $$props;

		// Get registry instance
		const registry = getContext("registry");

		// Callback for external link
		const onExternalClick = registry.link;

		// Click event
		function onClick(prefix) {
			registry.router.action(name, prefix);
		}

		$$self.$$set = $$props => {
			if ("name" in $$props) $$invalidate(4, name = $$props.name);
			if ("block" in $$props) $$invalidate(0, block = $$props.block);
			if ("provider" in $$props) $$invalidate(1, provider = $$props.provider);
		};

		return [block, provider, onExternalClick, onClick, name];
	}

	class CollectionsList extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$i, create_fragment$i, safe_not_equal, { name: 4, block: 0, provider: 1 });
		}
	}

	/* src/icon-finder/components/views/Collections.svelte generated by Svelte v3.29.4 */

	function create_if_block$b(ctx) {
		let filtersblock;
		let current;

		filtersblock = new Filters({
				props: {
					name: "categories",
					block: /*blocks*/ ctx[0].categories
				}
			});

		return {
			c() {
				create_component(filtersblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(filtersblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const filtersblock_changes = {};
				if (dirty & /*blocks*/ 1) filtersblock_changes.block = /*blocks*/ ctx[0].categories;
				filtersblock.$set(filtersblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(filtersblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(filtersblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(filtersblock, detaching);
			}
		};
	}

	function create_fragment$j(ctx) {
		let div1;
		let div0;
		let t0;
		let collectionsfilterblock;
		let t1;
		let collectionslistblock;
		let current;
		let if_block = /*blocks*/ ctx[0].categories && create_if_block$b(ctx);

		collectionsfilterblock = new CollectionsFilter({
				props: {
					name: "filter",
					block: /*blocks*/ ctx[0].filter
				}
			});

		collectionslistblock = new CollectionsList({
				props: {
					provider: /*route*/ ctx[1].params.provider,
					name: "collections",
					block: /*blocks*/ ctx[0].collections
				}
			});

		return {
			c() {
				div1 = element("div");
				div0 = element("div");
				if (if_block) if_block.c();
				t0 = space();
				create_component(collectionsfilterblock.$$.fragment);
				t1 = space();
				create_component(collectionslistblock.$$.fragment);
				attr(div0, "class", "iif-collections-header");
				attr(div1, "class", "iif-view iif-view--collections");
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				if (if_block) if_block.m(div0, null);
				append(div0, t0);
				mount_component(collectionsfilterblock, div0, null);
				append(div1, t1);
				mount_component(collectionslistblock, div1, null);
				current = true;
			},
			p(ctx, [dirty]) {
				if (/*blocks*/ ctx[0].categories) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*blocks*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$b(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(div0, t0);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				const collectionsfilterblock_changes = {};
				if (dirty & /*blocks*/ 1) collectionsfilterblock_changes.block = /*blocks*/ ctx[0].filter;
				collectionsfilterblock.$set(collectionsfilterblock_changes);
				const collectionslistblock_changes = {};
				if (dirty & /*route*/ 2) collectionslistblock_changes.provider = /*route*/ ctx[1].params.provider;
				if (dirty & /*blocks*/ 1) collectionslistblock_changes.block = /*blocks*/ ctx[0].collections;
				collectionslistblock.$set(collectionslistblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				transition_in(collectionsfilterblock.$$.fragment, local);
				transition_in(collectionslistblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				transition_out(collectionsfilterblock.$$.fragment, local);
				transition_out(collectionslistblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div1);
				if (if_block) if_block.d();
				destroy_component(collectionsfilterblock);
				destroy_component(collectionslistblock);
			}
		};
	}

	function instance$j($$self, $$props, $$invalidate) {
		
		let { blocks } = $$props;
		let { route } = $$props;

		$$self.$$set = $$props => {
			if ("blocks" in $$props) $$invalidate(0, blocks = $$props.blocks);
			if ("route" in $$props) $$invalidate(1, route = $$props.route);
		};

		return [blocks, route];
	}

	class Collections extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$j, create_fragment$j, safe_not_equal, { blocks: 0, route: 1 });
		}
	}

	/* src/icon-finder/components/blocks/CollectionInfo.svelte generated by Svelte v3.29.4 */

	function create_fragment$k(ctx) {
		let if_block_anchor;
		let current;
		let if_block = false ;

		return {
			c() {
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	function instance$k($$self, $$props, $$invalidate) {
		
		
		
		let { name } = $$props;
		let { block } = $$props;
		let { short = false } = $$props;
		let { showTitle = true } = $$props;
		const text = phrases.collectionInfo;

		// Registry
		const registry = getContext("registry");

		// Callback for external link
		const onExternalClick = registry.link;

		// Split info into a separate object
		let info;

		$$self.$$set = $$props => {
			if ("name" in $$props) $$invalidate(0, name = $$props.name);
			if ("block" in $$props) $$invalidate(6, block = $$props.block);
			if ("short" in $$props) $$invalidate(1, short = $$props.short);
			if ("showTitle" in $$props) $$invalidate(2, showTitle = $$props.showTitle);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*block*/ 64) {
				 {
					$$invalidate(3, info = block.info);
				}
			}
		};

		return [name, short, showTitle, info, text, onExternalClick, block];
	}

	class CollectionInfo extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$k, create_fragment$k, safe_not_equal, {
				name: 0,
				block: 6,
				short: 1,
				showTitle: 2
			});
		}
	}

	/**
	 * Add icon to selection
	 */
	function addToSelection(icons, icon) {
	    if (icons[icon.provider] === void 0) {
	        icons[icon.provider] = Object.create(null);
	    }
	    const providerIcons = icons[icon.provider];
	    if (providerIcons[icon.prefix] === void 0) {
	        providerIcons[icon.prefix] = [];
	    }
	    const list = providerIcons[icon.prefix];
	    if (list.indexOf(icon.name) === -1) {
	        list.push(icon.name);
	        return true;
	    }
	    return false;
	}
	/**
	 * Remove icon from selection
	 */
	function removeFromSelection(icons, icon) {
	    if (icons[icon.provider] === void 0 ||
	        icons[icon.provider][icon.prefix] === void 0) {
	        return false;
	    }
	    const providerIcons = icons[icon.provider];
	    let oldCount = providerIcons[icon.prefix].length;
	    const matches = icon.aliases
	        ? icon.aliases.concat([icon.name])
	        : [icon.name];
	    providerIcons[icon.prefix] = providerIcons[icon.prefix].filter((name) => matches.indexOf(name) === -1);
	    const found = oldCount !== providerIcons[icon.prefix].length;
	    if (!providerIcons[icon.prefix].length) {
	        // Clean up
	        delete providerIcons[icon.prefix];
	        if (!Object.keys(providerIcons).length) {
	            delete icons[icon.provider];
	        }
	    }
	    return found;
	}
	/**
	 * Check if icon is selected
	 */
	function isIconSelected(icons, icon) {
	    // Check if provider and prefix exist
	    if (icons[icon.provider] === void 0) {
	        return false;
	    }
	    const provider = icons[icon.provider];
	    if (provider[icon.prefix] === void 0) {
	        return false;
	    }
	    // Check name and aliases
	    const list = provider[icon.prefix];
	    if (list.indexOf(icon.name) !== -1) {
	        return true;
	    }
	    if (icon.aliases) {
	        for (let i = 0; i < icon.aliases.length; i++) {
	            if (list.indexOf(icon.aliases[i]) !== -1) {
	                return true;
	            }
	        }
	    }
	    return false;
	}
	/**
	 * Convert selection to array
	 */
	function selectionToArray(icons) {
	    const result = [];
	    Object.keys(icons).forEach((provider) => {
	        Object.keys(icons[provider]).forEach((prefix) => {
	            icons[provider][prefix].forEach((name) => {
	                result.push({
	                    provider,
	                    prefix,
	                    name,
	                });
	            });
	        });
	    });
	    return result;
	}

	/* src/icon-finder/components/blocks/icons/IconList.svelte generated by Svelte v3.29.4 */

	function get_each_context$8(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[15] = list[i];
		return child_ctx;
	}

	// (78:3) {#if svg !== false}
	function create_if_block_2$4(ctx) {
		let html_tag;
		let t;
		let if_block_anchor;
		let current;
		let if_block = /*isSelecting*/ ctx[5] && create_if_block_3$2(ctx);

		return {
			c() {
				t = space();
				if (if_block) if_block.c();
				if_block_anchor = empty$1();
				html_tag = new HtmlTag(t);
			},
			m(target, anchor) {
				html_tag.m(/*svg*/ ctx[8], target, anchor);
				insert(target, t, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (!current || dirty & /*svg*/ 256) html_tag.p(/*svg*/ ctx[8]);

				if (/*isSelecting*/ ctx[5]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*isSelecting*/ 32) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block_3$2(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) html_tag.d();
				if (detaching) detach(t);
				if (if_block) if_block.d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	// (80:4) {#if isSelecting}
	function create_if_block_3$2(ctx) {
		let uiicon;
		let current;

		uiicon = new Icon({
				props: {
					icon: /*selected*/ ctx[2]
					? "selecting-selected"
					: "selecting-unselected"
				}
			});

		return {
			c() {
				create_component(uiicon.$$.fragment);
			},
			m(target, anchor) {
				mount_component(uiicon, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const uiicon_changes = {};

				if (dirty & /*selected*/ 4) uiicon_changes.icon = /*selected*/ ctx[2]
				? "selecting-selected"
				: "selecting-unselected";

				uiicon.$set(uiicon_changes);
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(uiicon, detaching);
			}
		};
	}

	// (96:2) {#if size}
	function create_if_block_1$5(ctx) {
		let div;
		let t0_value = /*size*/ ctx[9].width + "";
		let t0;
		let t1;
		let t2_value = /*size*/ ctx[9].height + "";
		let t2;

		return {
			c() {
				div = element("div");
				t0 = text(t0_value);
				t1 = text(" x ");
				t2 = text(t2_value);
				attr(div, "class", "iif-icon-size");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, t0);
				append(div, t1);
				append(div, t2);
			},
			p(ctx, dirty) {
				if (dirty & /*size*/ 512 && t0_value !== (t0_value = /*size*/ ctx[9].width + "")) set_data(t0, t0_value);
				if (dirty & /*size*/ 512 && t2_value !== (t2_value = /*size*/ ctx[9].height + "")) set_data(t2, t2_value);
			},
			d(detaching) {
				if (detaching) detach(div);
			}
		};
	}

	// (99:2) {#if filters}
	function create_if_block$c(ctx) {
		let each_1_anchor;
		let current;
		let each_value = /*filters*/ ctx[6];
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		return {
			c() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty$1();
			},
			m(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_1_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*filters, phrases, onClick*/ 80) {
					each_value = /*filters*/ ctx[6];
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$8(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$8(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				destroy_each(each_blocks, detaching);
				if (detaching) detach(each_1_anchor);
			}
		};
	}

	// (100:3) {#each filters as filter}
	function create_each_block$8(ctx) {
		let filter;
		let current;

		function func(...args) {
			return /*func*/ ctx[14](/*filter*/ ctx[15], ...args);
		}

		filter = new Filter({
				props: {
					filter: /*filter*/ ctx[15].item,
					title: /*filter*/ ctx[15].item.title === ""
					? phrases.filters.uncategorised
					: /*filter*/ ctx[15].item.title,
					onClick: func
				}
			});

		return {
			c() {
				create_component(filter.$$.fragment);
			},
			m(target, anchor) {
				mount_component(filter, target, anchor);
				current = true;
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				const filter_changes = {};
				if (dirty & /*filters*/ 64) filter_changes.filter = /*filter*/ ctx[15].item;

				if (dirty & /*filters*/ 64) filter_changes.title = /*filter*/ ctx[15].item.title === ""
				? phrases.filters.uncategorised
				: /*filter*/ ctx[15].item.title;

				if (dirty & /*onClick, filters*/ 80) filter_changes.onClick = func;
				filter.$set(filter_changes);
			},
			i(local) {
				if (current) return;
				transition_in(filter.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(filter.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(filter, detaching);
			}
		};
	}

	function create_fragment$l(ctx) {
		let li;
		let div0;
		let a0;
		let t0;
		let div1;
		let a1;
		let t1;
		let t2;
		let t3;
		let div1_class_value;
		let current;
		let mounted;
		let dispose;
		let if_block0 = /*svg*/ ctx[8] !== false && create_if_block_2$4(ctx);
		let if_block1 = /*size*/ ctx[9] && create_if_block_1$5(ctx);
		let if_block2 = /*filters*/ ctx[6] && create_if_block$c(ctx);

		return {
			c() {
				li = element("li");
				div0 = element("div");
				a0 = element("a");
				if (if_block0) if_block0.c();
				t0 = space();
				div1 = element("div");
				a1 = element("a");
				t1 = text(/*text*/ ctx[1]);
				t2 = space();
				if (if_block1) if_block1.c();
				t3 = space();
				if (if_block2) if_block2.c();
				attr(a0, "href", /*link*/ ctx[3]);
				attr(a0, "target", "_blank");
				attr(a0, "title", /*tooltip*/ ctx[0]);
				attr(div0, "class", "iif-icon-sample");
				attr(a1, "class", "iif-icon-name");
				attr(a1, "href", /*link*/ ctx[3]);
				attr(a1, "title", /*tooltip*/ ctx[0]);
				attr(div1, "class", div1_class_value = "iif-icon-data iif-icon-data--filters--" + /*filters*/ ctx[6].length);
				attr(li, "class", /*className*/ ctx[7]);
			},
			m(target, anchor) {
				insert(target, li, anchor);
				append(li, div0);
				append(div0, a0);
				if (if_block0) if_block0.m(a0, null);
				append(li, t0);
				append(li, div1);
				append(div1, a1);
				append(a1, t1);
				append(div1, t2);
				if (if_block1) if_block1.m(div1, null);
				append(div1, t3);
				if (if_block2) if_block2.m(div1, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen(a0, "click", prevent_default(/*handleClick*/ ctx[10])),
						listen(a1, "click", prevent_default(/*handleClick*/ ctx[10]))
					];

					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (/*svg*/ ctx[8] !== false) {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty & /*svg*/ 256) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_2$4(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(a0, null);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if (!current || dirty & /*link*/ 8) {
					attr(a0, "href", /*link*/ ctx[3]);
				}

				if (!current || dirty & /*tooltip*/ 1) {
					attr(a0, "title", /*tooltip*/ ctx[0]);
				}

				if (!current || dirty & /*text*/ 2) set_data(t1, /*text*/ ctx[1]);

				if (!current || dirty & /*link*/ 8) {
					attr(a1, "href", /*link*/ ctx[3]);
				}

				if (!current || dirty & /*tooltip*/ 1) {
					attr(a1, "title", /*tooltip*/ ctx[0]);
				}

				if (/*size*/ ctx[9]) {
					if (if_block1) {
						if_block1.p(ctx, dirty);
					} else {
						if_block1 = create_if_block_1$5(ctx);
						if_block1.c();
						if_block1.m(div1, t3);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (/*filters*/ ctx[6]) {
					if (if_block2) {
						if_block2.p(ctx, dirty);

						if (dirty & /*filters*/ 64) {
							transition_in(if_block2, 1);
						}
					} else {
						if_block2 = create_if_block$c(ctx);
						if_block2.c();
						transition_in(if_block2, 1);
						if_block2.m(div1, null);
					}
				} else if (if_block2) {
					group_outros();

					transition_out(if_block2, 1, 1, () => {
						if_block2 = null;
					});

					check_outros();
				}

				if (!current || dirty & /*filters*/ 64 && div1_class_value !== (div1_class_value = "iif-icon-data iif-icon-data--filters--" + /*filters*/ ctx[6].length)) {
					attr(div1, "class", div1_class_value);
				}

				if (!current || dirty & /*className*/ 128) {
					attr(li, "class", /*className*/ ctx[7]);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block2);
				current = true;
			},
			o(local) {
				transition_out(if_block0);
				transition_out(if_block2);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(li);
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				mounted = false;
				run_all(dispose);
			}
		};
	}

	const baseClass$5 = "iif-icon-list";

	function instance$l($$self, $$props, $$invalidate) {
		
		
		
		let { name } = $$props;
		let { tooltip } = $$props;
		let { text } = $$props;
		let { icon } = $$props;
		let { exists } = $$props;
		let { selected } = $$props;
		let { link } = $$props;
		let { onClick } = $$props;
		let { isSelecting } = $$props;
		let { filters } = $$props;
		let className = "";

		// Get SVG
		let svg = false;

		// Get size
		let size = null;

		// Select icon
		function handleClick() {
			onClick(
				isSelecting
				? selected ? "deselect" : "select"
				: "toggle",
				icon
			);
		}

		const func = filter => onClick(filter.action, filter.value);

		$$self.$$set = $$props => {
			if ("name" in $$props) $$invalidate(11, name = $$props.name);
			if ("tooltip" in $$props) $$invalidate(0, tooltip = $$props.tooltip);
			if ("text" in $$props) $$invalidate(1, text = $$props.text);
			if ("icon" in $$props) $$invalidate(12, icon = $$props.icon);
			if ("exists" in $$props) $$invalidate(13, exists = $$props.exists);
			if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
			if ("link" in $$props) $$invalidate(3, link = $$props.link);
			if ("onClick" in $$props) $$invalidate(4, onClick = $$props.onClick);
			if ("isSelecting" in $$props) $$invalidate(5, isSelecting = $$props.isSelecting);
			if ("filters" in $$props) $$invalidate(6, filters = $$props.filters);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*exists, selected, className*/ 8324) {
				 {
					const newClassName = baseClass$5 + " " + baseClass$5 + (exists ? "--loaded" : "--loading") + (selected ? " " + baseClass$5 + "--selected" : "");

					if (newClassName !== className) {
						// Trigger re-render only if value was changed
						$$invalidate(7, className = newClassName);
					}
				}
			}

			if ($$self.$$.dirty & /*exists, name, svg*/ 10496) {
				 {
					const newSVG = exists
					? Iconify__default['default'].renderHTML(name, {
							width: "1em",
							height: "1em",
							inline: false
						})
					: false;

					if (newSVG !== svg) {
						// Trigger re-render only if SVG was changed
						$$invalidate(8, svg = newSVG);
					}
				}
			}

			if ($$self.$$.dirty & /*exists, name, size*/ 10752) {
				 {
					const newSize = exists ? Iconify__default['default'].getIcon(name) : null;

					if (newSize !== size) {
						$$invalidate(9, size = newSize);
					}
				}
			}
		};

		return [
			tooltip,
			text,
			selected,
			link,
			onClick,
			isSelecting,
			filters,
			className,
			svg,
			size,
			handleClick,
			name,
			icon,
			exists,
			func
		];
	}

	class IconList extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$l, create_fragment$l, safe_not_equal, {
				name: 11,
				tooltip: 0,
				text: 1,
				icon: 12,
				exists: 13,
				selected: 2,
				link: 3,
				onClick: 4,
				isSelecting: 5,
				filters: 6
			});
		}
	}

	/* src/icon-finder/components/blocks/icons/IconGrid.svelte generated by Svelte v3.29.4 */

	function create_if_block$d(ctx) {
		let html_tag;
		let t;
		let if_block_anchor;
		let current;
		let if_block = /*isSelecting*/ ctx[3] && create_if_block_1$6(ctx);

		return {
			c() {
				t = space();
				if (if_block) if_block.c();
				if_block_anchor = empty$1();
				html_tag = new HtmlTag(t);
			},
			m(target, anchor) {
				html_tag.m(/*svg*/ ctx[5], target, anchor);
				insert(target, t, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (!current || dirty & /*svg*/ 32) html_tag.p(/*svg*/ ctx[5]);

				if (/*isSelecting*/ ctx[3]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*isSelecting*/ 8) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block_1$6(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) html_tag.d();
				if (detaching) detach(t);
				if (if_block) if_block.d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	// (65:3) {#if isSelecting}
	function create_if_block_1$6(ctx) {
		let uiicon;
		let current;

		uiicon = new Icon({
				props: {
					icon: /*selected*/ ctx[1]
					? "selecting-selected"
					: "selecting-unselected"
				}
			});

		return {
			c() {
				create_component(uiicon.$$.fragment);
			},
			m(target, anchor) {
				mount_component(uiicon, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const uiicon_changes = {};

				if (dirty & /*selected*/ 2) uiicon_changes.icon = /*selected*/ ctx[1]
				? "selecting-selected"
				: "selecting-unselected";

				uiicon.$set(uiicon_changes);
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(uiicon, detaching);
			}
		};
	}

	function create_fragment$m(ctx) {
		let li;
		let a;
		let current;
		let mounted;
		let dispose;
		let if_block = /*svg*/ ctx[5] !== false && create_if_block$d(ctx);

		return {
			c() {
				li = element("li");
				a = element("a");
				if (if_block) if_block.c();
				attr(a, "href", /*link*/ ctx[2]);
				attr(a, "target", "_blank");
				attr(a, "title", /*tooltip*/ ctx[0]);
				attr(li, "class", /*className*/ ctx[4]);
			},
			m(target, anchor) {
				insert(target, li, anchor);
				append(li, a);
				if (if_block) if_block.m(a, null);
				current = true;

				if (!mounted) {
					dispose = listen(a, "click", prevent_default(/*handleClick*/ ctx[6]));
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (/*svg*/ ctx[5] !== false) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*svg*/ 32) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$d(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(a, null);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				if (!current || dirty & /*link*/ 4) {
					attr(a, "href", /*link*/ ctx[2]);
				}

				if (!current || dirty & /*tooltip*/ 1) {
					attr(a, "title", /*tooltip*/ ctx[0]);
				}

				if (!current || dirty & /*className*/ 16) {
					attr(li, "class", /*className*/ ctx[4]);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(li);
				if (if_block) if_block.d();
				mounted = false;
				dispose();
			}
		};
	}

	const baseClass$6 = "iif-icon-grid";

	function instance$m($$self, $$props, $$invalidate) {
		
		let { name } = $$props;
		let { tooltip } = $$props;
		let { icon } = $$props;
		let { exists } = $$props;
		let { selected } = $$props;
		let { link } = $$props;
		let { onClick } = $$props;
		let { isSelecting } = $$props;
		let className = "";

		// Get SVG
		let svg = false;

		// Select icon
		function handleClick() {
			onClick(
				isSelecting
				? selected ? "deselect" : "select"
				: "toggle",
				icon
			);
		}

		$$self.$$set = $$props => {
			if ("name" in $$props) $$invalidate(7, name = $$props.name);
			if ("tooltip" in $$props) $$invalidate(0, tooltip = $$props.tooltip);
			if ("icon" in $$props) $$invalidate(8, icon = $$props.icon);
			if ("exists" in $$props) $$invalidate(9, exists = $$props.exists);
			if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
			if ("link" in $$props) $$invalidate(2, link = $$props.link);
			if ("onClick" in $$props) $$invalidate(10, onClick = $$props.onClick);
			if ("isSelecting" in $$props) $$invalidate(3, isSelecting = $$props.isSelecting);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*exists, selected, className*/ 530) {
				 {
					const newClassName = baseClass$6 + " " + baseClass$6 + (exists ? "--loaded" : "--loading") + (selected ? " " + baseClass$6 + "--selected" : "");

					if (newClassName !== className) {
						// Trigger re-render only if value was changed
						$$invalidate(4, className = newClassName);
					}
				}
			}

			if ($$self.$$.dirty & /*exists, name, svg*/ 672) {
				 {
					const newSVG = exists
					? Iconify__default['default'].renderHTML(name, {
							width: "1em",
							height: "1em",
							inline: false
						})
					: false;

					if (newSVG !== svg) {
						// Trigger re-render only if SVG was changed
						$$invalidate(5, svg = newSVG);
					}
				}
			}
		};

		return [
			tooltip,
			selected,
			link,
			isSelecting,
			className,
			svg,
			handleClick,
			name,
			icon,
			exists,
			onClick
		];
	}

	class IconGrid extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$m, create_fragment$m, safe_not_equal, {
				name: 7,
				tooltip: 0,
				icon: 8,
				exists: 9,
				selected: 1,
				link: 2,
				onClick: 10,
				isSelecting: 3
			});
		}
	}

	/* src/icon-finder/components/blocks/icons/Container.svelte generated by Svelte v3.29.4 */

	function get_each_context$9(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[15] = list[i];
		child_ctx[17] = i;
		return child_ctx;
	}

	// (222:3) {:else}
	function create_else_block$4(ctx) {
		let icongrid;
		let current;

		const icongrid_spread_levels = [
			/*item*/ ctx[15],
			{ onClick: /*onClick*/ ctx[3] },
			{ isSelecting: /*isSelecting*/ ctx[1] }
		];

		let icongrid_props = {};

		for (let i = 0; i < icongrid_spread_levels.length; i += 1) {
			icongrid_props = assign(icongrid_props, icongrid_spread_levels[i]);
		}

		icongrid = new IconGrid({ props: icongrid_props });

		return {
			c() {
				create_component(icongrid.$$.fragment);
			},
			m(target, anchor) {
				mount_component(icongrid, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const icongrid_changes = (dirty & /*parsedIcons, onClick, isSelecting*/ 14)
				? get_spread_update(icongrid_spread_levels, [
						dirty & /*parsedIcons*/ 4 && get_spread_object(/*item*/ ctx[15]),
						dirty & /*onClick*/ 8 && { onClick: /*onClick*/ ctx[3] },
						dirty & /*isSelecting*/ 2 && { isSelecting: /*isSelecting*/ ctx[1] }
					])
				: {};

				icongrid.$set(icongrid_changes);
			},
			i(local) {
				if (current) return;
				transition_in(icongrid.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(icongrid.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(icongrid, detaching);
			}
		};
	}

	// (220:3) {#if isList}
	function create_if_block$e(ctx) {
		let iconlist;
		let current;

		const iconlist_spread_levels = [
			/*item*/ ctx[15],
			{ onClick: /*onClick*/ ctx[3] },
			{ isSelecting: /*isSelecting*/ ctx[1] }
		];

		let iconlist_props = {};

		for (let i = 0; i < iconlist_spread_levels.length; i += 1) {
			iconlist_props = assign(iconlist_props, iconlist_spread_levels[i]);
		}

		iconlist = new IconList({ props: iconlist_props });

		return {
			c() {
				create_component(iconlist.$$.fragment);
			},
			m(target, anchor) {
				mount_component(iconlist, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const iconlist_changes = (dirty & /*parsedIcons, onClick, isSelecting*/ 14)
				? get_spread_update(iconlist_spread_levels, [
						dirty & /*parsedIcons*/ 4 && get_spread_object(/*item*/ ctx[15]),
						dirty & /*onClick*/ 8 && { onClick: /*onClick*/ ctx[3] },
						dirty & /*isSelecting*/ 2 && { isSelecting: /*isSelecting*/ ctx[1] }
					])
				: {};

				iconlist.$set(iconlist_changes);
			},
			i(local) {
				if (current) return;
				transition_in(iconlist.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(iconlist.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(iconlist, detaching);
			}
		};
	}

	// (219:2) {#each parsedIcons as item, i (item.name)}
	function create_each_block$9(key_1, ctx) {
		let first;
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block$e, create_else_block$4];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*isList*/ ctx[0]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				if_block.c();
				if_block_anchor = empty$1();
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(first);
				if_blocks[current_block_type_index].d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	function create_fragment$n(ctx) {
		let div;
		let ul;
		let each_blocks = [];
		let each_1_lookup = new Map();
		let div_class_value;
		let current;
		let each_value = /*parsedIcons*/ ctx[2];
		const get_key = ctx => /*item*/ ctx[15].name;

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$9(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$9(key, child_ctx));
		}

		return {
			c() {
				div = element("div");
				ul = element("ul");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr(div, "class", div_class_value = baseClass$7 + " " + baseClass$7 + (/*isList*/ ctx[0] ? "--list" : "--grid") + (/*isSelecting*/ ctx[1]
				? " " + baseClass$7 + "--selecting"
				: ""));
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, ul);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				current = true;
			},
			p(ctx, [dirty]) {
				if (dirty & /*parsedIcons, onClick, isSelecting, isList*/ 15) {
					const each_value = /*parsedIcons*/ ctx[2];
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$9, null, get_each_context$9);
					check_outros();
				}

				if (!current || dirty & /*isList, isSelecting*/ 3 && div_class_value !== (div_class_value = baseClass$7 + " " + baseClass$7 + (/*isList*/ ctx[0] ? "--list" : "--grid") + (/*isSelecting*/ ctx[1]
				? " " + baseClass$7 + "--selecting"
				: ""))) {
					attr(div, "class", div_class_value);
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}
			}
		};
	}

	const baseClass$7 = "iif-icons";

	function instance$n($$self, $$props, $$invalidate) {
		
		
		
		let { route } = $$props;
		let { selection } = $$props;
		let { blocks } = $$props;
		let { isList } = $$props;
		let { isSelecting } = $$props;

		// Registry
		const registry = getContext("registry");

		// List of keys used for filters. Same keys are used in both blocks and icon.
		const filterKeys = ["tags", "themePrefixes", "themeSuffixes"];

		// Tooltip
		const tooltipText = phrases.icons.tooltip;

		// Show prefix
		let showPrefix;

		// Event listener for loading icons
		let abortLoader = null;

		let updateCounter = 0;

		const loadingEvent = () => {
			$$invalidate(9, updateCounter++, updateCounter);
		};

		function getFilters(item) {
			let filters = [];
			const icon = item.icon;

			// Filters
			filterKeys.forEach(k => {
				const key = k;

				if (!blocks[key]) {
					return;
				}

				if (icon[key] === void 0) {
					return;
				}

				const block = blocks[key];
				const active = block.active;
				const iconValue = icon[key];

				(typeof iconValue === "string"
				? [iconValue]
				: iconValue instanceof Array ? iconValue : []).forEach(value => {
					if (value === active) {
						return;
					}

					if (block.filters[value] !== void 0) {
						filters.push({
							action: key,
							value,
							item: block.filters[value]
						});
					}
				});
			});

			// Icon sets
			if (route.type === "search") {
				const searchBlocks = blocks;

				if (searchBlocks.collections) {
					const prefix = item.icon.prefix;

					if (searchBlocks.collections.filters[prefix]) {
						filters.push({
							action: "collections",
							value: prefix,
							item: searchBlocks.collections.filters[prefix]
						});
					}
				}
			}

			return filters;
		}

		// Filter icons
		let parsedIcons = [];

		// Icon or filter was clicked
		function onClick(event, value) {
			if (event === "toggle") {
				// UISelectionEvent
				registry.callback({ type: "selection", icon: value });

				return;
			}

			if (event === "select" || event === "deselect") {
				// UISelectionEvent
				registry.callback({
					type: "selection",
					icon: value,
					selected: event === "select"
				});

				return;
			}

			registry.router.action(event, value);
		}

		// Remove event listener
		onDestroy(() => {
			if (abortLoader !== null) {
				abortLoader();
				$$invalidate(8, abortLoader = null);
			}
		});

		$$self.$$set = $$props => {
			if ("route" in $$props) $$invalidate(4, route = $$props.route);
			if ("selection" in $$props) $$invalidate(5, selection = $$props.selection);
			if ("blocks" in $$props) $$invalidate(6, blocks = $$props.blocks);
			if ("isList" in $$props) $$invalidate(0, isList = $$props.isList);
			if ("isSelecting" in $$props) $$invalidate(1, isSelecting = $$props.isSelecting);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*route*/ 16) {
				 {
					$$invalidate(7, showPrefix = route.type !== "collection");
				}
			}

			if ($$self.$$.dirty & /*updateCounter, parsedIcons, blocks, showPrefix, selection, isList, abortLoader*/ 997) {
				 {

					// Reset icons list
					let newParsedIcons = [];

					// Parse icons
					let pending = [];

					// Map old icons
					const oldKeys = Object.create(null);

					parsedIcons.forEach(icon => {
						oldKeys[icon.name] = icon;
					});

					let updated = false;

					blocks.icons.icons.forEach(icon => {
						const name = lib.iconToString(icon);
						const data = Iconify__default['default'].getIcon(name);
						const exists = data !== null;

						// Icon name, used in list view and tooltip
						const text = showPrefix ? name : icon.name;

						// Tooltip
						let tooltip = text;

						if (data) {
							tooltip += tooltipText.size.replace("{size}", data.width + " x " + data.height);
							tooltip += tooltipText.length.replace("{length}", data.body.length + "");

							if (icon.chars !== void 0) {
								tooltip += tooltipText.char.replace("{char}", typeof icon.chars === "string"
								? icon.chars
								: icon.chars.join(", "));
							}

							tooltip += tooltipText[data.body.indexOf("currentColor") === -1
							? "colorful"
							: "colorless"];
						}

						// Link
						const providerData = lib.getProvider(icon.provider);

						let link;

						if (providerData) {
							link = providerData.links.icon.replace("{prefix}", icon.prefix).replace("{name}", icon.name);

							if (link === "") {
								link = "#";
							}
						} else {
							link = "#";
						}

						// Item
						let newItem = {
							name,
							text,
							tooltip,
							icon: lib.cloneObject(icon),
							exists,
							link,
							selected: isIconSelected(selection, icon)
						};

						let item = newItem;

						if (isList) {
							// Add filters
							item.filters = getFilters(item);
						}

						// Check if item has been updated, use old item if not to avoid re-rendering child component
						if (oldKeys[name] === void 0) {
							updated = true;

							if (!exists) {
								pending.push(name);
							}
						} else if (!lib.compareObjects(oldKeys[name], item)) {
							updated = true;
						} else {
							item = oldKeys[name];
						}

						newParsedIcons.push(item);
					});

					// Load pending images
					if (pending.length) {
						if (abortLoader !== null) {
							abortLoader();
						}

						$$invalidate(8, abortLoader = Iconify__default['default'].loadIcons(pending, loadingEvent));
					}

					// Overwrite parseIcons variable only if something was updated, triggering component re-render
					// Also compare length in case if new set is subset of old set
					if (updated || parsedIcons.length !== newParsedIcons.length) {
						$$invalidate(2, parsedIcons = newParsedIcons);
					}
				}
			}
		};

		return [isList, isSelecting, parsedIcons, onClick, route, selection, blocks];
	}

	class Container extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$n, create_fragment$n, safe_not_equal, {
				route: 4,
				selection: 5,
				blocks: 6,
				isList: 0,
				isSelecting: 1
			});
		}
	}

	/* src/icon-finder/components/forms/IconButton.svelte generated by Svelte v3.29.4 */

	function create_fragment$o(ctx) {
		let button;
		let uiicon;
		let current;
		let mounted;
		let dispose;
		uiicon = new Icon({ props: { icon: /*icon*/ ctx[0] } });

		return {
			c() {
				button = element("button");
				create_component(uiicon.$$.fragment);
				attr(button, "class", "iif-icon-button");
				attr(button, "title", /*title*/ ctx[1]);
			},
			m(target, anchor) {
				insert(target, button, anchor);
				mount_component(uiicon, button, null);
				current = true;

				if (!mounted) {
					dispose = listen(button, "click", function () {
						if (is_function(/*onClick*/ ctx[2])) /*onClick*/ ctx[2].apply(this, arguments);
					});

					mounted = true;
				}
			},
			p(new_ctx, [dirty]) {
				ctx = new_ctx;
				const uiicon_changes = {};
				if (dirty & /*icon*/ 1) uiicon_changes.icon = /*icon*/ ctx[0];
				uiicon.$set(uiicon_changes);

				if (!current || dirty & /*title*/ 2) {
					attr(button, "title", /*title*/ ctx[1]);
				}
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(button);
				destroy_component(uiicon);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$o($$self, $$props, $$invalidate) {
		let { icon } = $$props;
		let { title } = $$props;
		let { onClick } = $$props;

		$$self.$$set = $$props => {
			if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
			if ("title" in $$props) $$invalidate(1, title = $$props.title);
			if ("onClick" in $$props) $$invalidate(2, onClick = $$props.onClick);
		};

		return [icon, title, onClick];
	}

	class IconButton extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$o, create_fragment$o, safe_not_equal, { icon: 0, title: 1, onClick: 2 });
		}
	}

	/* src/icon-finder/components/blocks/icons/Header.svelte generated by Svelte v3.29.4 */

	function get_each_context$a(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[10] = list[i];
		return child_ctx;
	}

	// (34:1) {#if canChangeLayout || canSelectMultiple}
	function create_if_block$f(ctx) {
		let div;
		let t;
		let current;
		let if_block0 = /*canSelectMultiple*/ ctx[3] && create_if_block_2$5(ctx);
		let if_block1 = /*canChangeLayout*/ ctx[1] && create_if_block_1$7(ctx);

		return {
			c() {
				div = element("div");
				if (if_block0) if_block0.c();
				t = space();
				if (if_block1) if_block1.c();
				attr(div, "class", "iif-icons-header-modes");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append(div, t);
				if (if_block1) if_block1.m(div, null);
				current = true;
			},
			p(ctx, dirty) {
				if (/*canSelectMultiple*/ ctx[3]) {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty & /*canSelectMultiple*/ 8) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_2$5(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(div, t);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if (/*canChangeLayout*/ ctx[1]) {
					if (if_block1) {
						if_block1.p(ctx, dirty);

						if (dirty & /*canChangeLayout*/ 2) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block_1$7(ctx);
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(div, null);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block1);
				current = true;
			},
			o(local) {
				transition_out(if_block0);
				transition_out(if_block1);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
			}
		};
	}

	// (36:3) {#if canSelectMultiple}
	function create_if_block_2$5(ctx) {
		let iconbutton;
		let current;

		iconbutton = new IconButton({
				props: {
					icon: /*selectionIcon*/ ctx[6],
					onClick: /*toggleSelection*/ ctx[4],
					title: /*text*/ ctx[7].select
				}
			});

		return {
			c() {
				create_component(iconbutton.$$.fragment);
			},
			m(target, anchor) {
				mount_component(iconbutton, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const iconbutton_changes = {};
				if (dirty & /*selectionIcon*/ 64) iconbutton_changes.icon = /*selectionIcon*/ ctx[6];
				if (dirty & /*toggleSelection*/ 16) iconbutton_changes.onClick = /*toggleSelection*/ ctx[4];
				iconbutton.$set(iconbutton_changes);
			},
			i(local) {
				if (current) return;
				transition_in(iconbutton.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(iconbutton.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(iconbutton, detaching);
			}
		};
	}

	// (42:3) {#if canChangeLayout}
	function create_if_block_1$7(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value = [/*mode*/ ctx[5]];
		const get_key = ctx => /*icon*/ ctx[10];

		for (let i = 0; i < 1; i += 1) {
			let child_ctx = get_each_context$a(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$a(key, child_ctx));
		}

		return {
			c() {
				for (let i = 0; i < 1; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty$1();
			},
			m(target, anchor) {
				for (let i = 0; i < 1; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_1_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*mode, changeLayout, text*/ 164) {
					const each_value = [/*mode*/ ctx[5]];
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$a, each_1_anchor, get_each_context$a);
					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < 1; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < 1; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				for (let i = 0; i < 1; i += 1) {
					each_blocks[i].d(detaching);
				}

				if (detaching) detach(each_1_anchor);
			}
		};
	}

	// (43:4) {#each [mode] as icon (icon)}
	function create_each_block$a(key_1, ctx) {
		let first;
		let iconbutton;
		let current;

		iconbutton = new IconButton({
				props: {
					icon: /*icon*/ ctx[10],
					onClick: /*changeLayout*/ ctx[2],
					title: /*text*/ ctx[7].modes[/*icon*/ ctx[10]]
				}
			});

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				create_component(iconbutton.$$.fragment);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				mount_component(iconbutton, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const iconbutton_changes = {};
				if (dirty & /*mode*/ 32) iconbutton_changes.icon = /*icon*/ ctx[10];
				if (dirty & /*changeLayout*/ 4) iconbutton_changes.onClick = /*changeLayout*/ ctx[2];
				if (dirty & /*mode*/ 32) iconbutton_changes.title = /*text*/ ctx[7].modes[/*icon*/ ctx[10]];
				iconbutton.$set(iconbutton_changes);
			},
			i(local) {
				if (current) return;
				transition_in(iconbutton.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(iconbutton.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(first);
				destroy_component(iconbutton, detaching);
			}
		};
	}

	function create_fragment$p(ctx) {
		let div1;
		let div0;
		let t0;
		let t1;
		let current;
		let if_block = (/*canChangeLayout*/ ctx[1] || /*canSelectMultiple*/ ctx[3]) && create_if_block$f(ctx);

		return {
			c() {
				div1 = element("div");
				div0 = element("div");
				t0 = text(/*headerText*/ ctx[0]);
				t1 = space();
				if (if_block) if_block.c();
				attr(div0, "class", "iif-icons-header-text");
				attr(div1, "class", "iif-icons-header");
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, t0);
				append(div1, t1);
				if (if_block) if_block.m(div1, null);
				current = true;
			},
			p(ctx, [dirty]) {
				if (!current || dirty & /*headerText*/ 1) set_data(t0, /*headerText*/ ctx[0]);

				if (/*canChangeLayout*/ ctx[1] || /*canSelectMultiple*/ ctx[3]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*canChangeLayout, canSelectMultiple*/ 10) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$f(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(div1, null);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div1);
				if (if_block) if_block.d();
			}
		};
	}

	function instance$p($$self, $$props, $$invalidate) {
		
		let { headerText } = $$props;
		let { isList } = $$props;
		let { canChangeLayout } = $$props;
		let { changeLayout } = $$props;
		let { canSelectMultiple } = $$props;
		let { isSelecting } = $$props;
		let { toggleSelection } = $$props;

		// Text
		const text = phrases.icons.header;

		// Modes
		let mode;

		// Selection icon
		let selectionIcon;

		$$self.$$set = $$props => {
			if ("headerText" in $$props) $$invalidate(0, headerText = $$props.headerText);
			if ("isList" in $$props) $$invalidate(8, isList = $$props.isList);
			if ("canChangeLayout" in $$props) $$invalidate(1, canChangeLayout = $$props.canChangeLayout);
			if ("changeLayout" in $$props) $$invalidate(2, changeLayout = $$props.changeLayout);
			if ("canSelectMultiple" in $$props) $$invalidate(3, canSelectMultiple = $$props.canSelectMultiple);
			if ("isSelecting" in $$props) $$invalidate(9, isSelecting = $$props.isSelecting);
			if ("toggleSelection" in $$props) $$invalidate(4, toggleSelection = $$props.toggleSelection);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*isList*/ 256) {
				 {
					$$invalidate(5, mode = isList ? "grid" : "list");
				}
			}

			if ($$self.$$.dirty & /*isSelecting*/ 512) {
				 {
					$$invalidate(6, selectionIcon = "check-list" + (isSelecting ? "-checked" : ""));
				}
			}
		};

		return [
			headerText,
			canChangeLayout,
			changeLayout,
			canSelectMultiple,
			toggleSelection,
			mode,
			selectionIcon,
			text,
			isList,
			isSelecting
		];
	}

	class Header extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$p, create_fragment$p, safe_not_equal, {
				headerText: 0,
				isList: 8,
				canChangeLayout: 1,
				changeLayout: 2,
				canSelectMultiple: 3,
				isSelecting: 9,
				toggleSelection: 4
			});
		}
	}

	/* src/icon-finder/components/blocks/Pagination.svelte generated by Svelte v3.29.4 */

	function get_each_context$b(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[13] = list[i];
		child_ctx[15] = i;
		return child_ctx;
	}

	// (59:0) {#if pages.length > 0}
	function create_if_block$g(ctx) {
		let div;
		let t0;
		let each_blocks = [];
		let each_1_lookup = new Map();
		let t1;
		let t2;
		let current;
		let if_block0 = /*prevPage*/ ctx[2] !== -1 && create_if_block_4(ctx);
		let each_value = /*pages*/ ctx[1];
		const get_key = ctx => /*page*/ ctx[13].page;

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$b(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$b(key, child_ctx));
		}

		let if_block1 = /*block*/ ctx[0].more && create_if_block_2$6(ctx);
		let if_block2 = /*nextPage*/ ctx[3] !== -1 && create_if_block_1$8(ctx);

		return {
			c() {
				div = element("div");
				if (if_block0) if_block0.c();
				t0 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t1 = space();
				if (if_block1) if_block1.c();
				t2 = space();
				if (if_block2) if_block2.c();
				attr(div, "class", "iif-pagination");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append(div, t0);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				append(div, t1);
				if (if_block1) if_block1.m(div, null);
				append(div, t2);
				if (if_block2) if_block2.m(div, null);
				current = true;
			},
			p(ctx, dirty) {
				if (/*prevPage*/ ctx[2] !== -1) {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty & /*prevPage*/ 4) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_4(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(div, t0);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if (dirty & /*pages*/ 2) {
					const each_value = /*pages*/ ctx[1];
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$b, t1, get_each_context$b);
				}

				if (/*block*/ ctx[0].more) {
					if (if_block1) {
						if_block1.p(ctx, dirty);
					} else {
						if_block1 = create_if_block_2$6(ctx);
						if_block1.c();
						if_block1.m(div, t2);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (/*nextPage*/ ctx[3] !== -1) {
					if (if_block2) {
						if_block2.p(ctx, dirty);

						if (dirty & /*nextPage*/ 8) {
							transition_in(if_block2, 1);
						}
					} else {
						if_block2 = create_if_block_1$8(ctx);
						if_block2.c();
						transition_in(if_block2, 1);
						if_block2.m(div, null);
					}
				} else if (if_block2) {
					group_outros();

					transition_out(if_block2, 1, 1, () => {
						if_block2 = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block2);
				current = true;
			},
			o(local) {
				transition_out(if_block0);
				transition_out(if_block2);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				if (if_block0) if_block0.d();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}

				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
			}
		};
	}

	// (61:2) {#if prevPage !== -1}
	function create_if_block_4(ctx) {
		let a;
		let uiicon;
		let a_class_value;
		let current;
		let mounted;
		let dispose;
		uiicon = new Icon({ props: { icon: "left" } });

		return {
			c() {
				a = element("a");
				create_component(uiicon.$$.fragment);
				attr(a, "href", "# ");
				attr(a, "class", a_class_value = /*arrowClass*/ ctx[4] + "prev");
			},
			m(target, anchor) {
				insert(target, a, anchor);
				mount_component(uiicon, a, null);
				current = true;

				if (!mounted) {
					dispose = listen(a, "click", prevent_default(/*click_handler*/ ctx[8]));
					mounted = true;
				}
			},
			p: noop,
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(a);
				destroy_component(uiicon);
				mounted = false;
				dispose();
			}
		};
	}

	// (70:3) {#if page.dot}
	function create_if_block_3$3(ctx) {
		let span;

		return {
			c() {
				span = element("span");
				span.textContent = "...";
			},
			m(target, anchor) {
				insert(target, span, anchor);
			},
			d(detaching) {
				if (detaching) detach(span);
			}
		};
	}

	// (69:2) {#each pages as page, i (page.page)}
	function create_each_block$b(key_1, ctx) {
		let first;
		let t0;
		let a;
		let t1_value = /*page*/ ctx[13].text + "";
		let t1;
		let a_href_value;
		let a_class_value;
		let mounted;
		let dispose;
		let if_block = /*page*/ ctx[13].dot && create_if_block_3$3();

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				if (if_block) if_block.c();
				t0 = space();
				a = element("a");
				t1 = text(t1_value);
				attr(a, "href", a_href_value = /*page*/ ctx[13].selected ? void 0 : "# ");
				attr(a, "class", a_class_value = /*page*/ ctx[13].className);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, t0, anchor);
				insert(target, a, anchor);
				append(a, t1);

				if (!mounted) {
					dispose = listen(a, "click", prevent_default(function () {
						if (is_function(/*page*/ ctx[13].onClick)) /*page*/ ctx[13].onClick.apply(this, arguments);
					}));

					mounted = true;
				}
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;

				if (/*page*/ ctx[13].dot) {
					if (if_block) ; else {
						if_block = create_if_block_3$3();
						if_block.c();
						if_block.m(t0.parentNode, t0);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (dirty & /*pages*/ 2 && t1_value !== (t1_value = /*page*/ ctx[13].text + "")) set_data(t1, t1_value);

				if (dirty & /*pages*/ 2 && a_href_value !== (a_href_value = /*page*/ ctx[13].selected ? void 0 : "# ")) {
					attr(a, "href", a_href_value);
				}

				if (dirty & /*pages*/ 2 && a_class_value !== (a_class_value = /*page*/ ctx[13].className)) {
					attr(a, "class", a_class_value);
				}
			},
			d(detaching) {
				if (detaching) detach(first);
				if (if_block) if_block.d(detaching);
				if (detaching) detach(t0);
				if (detaching) detach(a);
				mounted = false;
				dispose();
			}
		};
	}

	// (78:2) {#if block.more}
	function create_if_block_2$6(ctx) {
		let a;
		let t_value = phrases.icons.more + "";
		let t;
		let mounted;
		let dispose;

		return {
			c() {
				a = element("a");
				t = text(t_value);
				attr(a, "href", "# ");
				attr(a, "class", /*moreClass*/ ctx[5]);
			},
			m(target, anchor) {
				insert(target, a, anchor);
				append(a, t);

				if (!mounted) {
					dispose = listen(a, "click", prevent_default(/*click_handler_1*/ ctx[9]));
					mounted = true;
				}
			},
			p: noop,
			d(detaching) {
				if (detaching) detach(a);
				mounted = false;
				dispose();
			}
		};
	}

	// (86:2) {#if nextPage !== -1}
	function create_if_block_1$8(ctx) {
		let a;
		let uiicon;
		let a_class_value;
		let current;
		let mounted;
		let dispose;
		uiicon = new Icon({ props: { icon: "right" } });

		return {
			c() {
				a = element("a");
				create_component(uiicon.$$.fragment);
				attr(a, "href", "# ");
				attr(a, "class", a_class_value = /*arrowClass*/ ctx[4] + "next");
			},
			m(target, anchor) {
				insert(target, a, anchor);
				mount_component(uiicon, a, null);
				current = true;

				if (!mounted) {
					dispose = listen(a, "click", prevent_default(/*click_handler_2*/ ctx[10]));
					mounted = true;
				}
			},
			p: noop,
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(a);
				destroy_component(uiicon);
				mounted = false;
				dispose();
			}
		};
	}

	function create_fragment$q(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*pages*/ ctx[1].length > 0 && create_if_block$g(ctx);

		return {
			c() {
				if (if_block) if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				if (/*pages*/ ctx[1].length > 0) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*pages*/ 2) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$g(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	const baseClass$8 = "iif-page";

	function instance$q($$self, $$props, $$invalidate) {
		
		
		let { name } = $$props;
		let { block } = $$props;

		// Registry
		const registry = getContext("registry");

		const selectedClass = baseClass$8 + " " + baseClass$8 + "--selected";
		const arrowClass = baseClass$8 + " " + baseClass$8 + "--arrow " + baseClass$8 + "--";
		const moreClass = baseClass$8 + " " + baseClass$8 + "--more";
		let pages = [];
		let prevPage;
		let nextPage;

		// Change page
		function setPage(page) {
			registry.router.action(name, page);
		}

		const click_handler = () => setPage(prevPage);
		const click_handler_1 = () => setPage(phrases.icons.moreAsNumber ? 2 : "more");
		const click_handler_2 = () => setPage(nextPage);

		$$self.$$set = $$props => {
			if ("name" in $$props) $$invalidate(7, name = $$props.name);
			if ("block" in $$props) $$invalidate(0, block = $$props.block);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*block, pages*/ 3) {
				 {
					const visiblePages = lib.showPagination(block);

					if (visiblePages.length) {
						// Get previous / next pages
						$$invalidate(3, nextPage = block.more
						? block.page + 1
						: visiblePages[visiblePages.length - 1] > block.page
							? block.page + 1
							: -1);

						$$invalidate(2, prevPage = block.page > 0 ? block.page - 1 : -1);

						// Map pages
						$$invalidate(1, pages = visiblePages.map((page, index) => {
							const dot = index > 0 && visiblePages[index - 1] < page - 1;
							const selected = page === block.page;

							const result = {
								selected,
								dot,
								page,
								text: page + 1 + "",
								className: selected ? selectedClass : baseClass$8,
								onClick: () => setPage(page)
							};

							return result;
						}));
					} else if (pages.length) {
						// Reset
						$$invalidate(1, pages = []);

						$$invalidate(2, prevPage = -1);
						$$invalidate(3, nextPage = -1);
					}
				}
			}
		};

		return [
			block,
			pages,
			prevPage,
			nextPage,
			arrowClass,
			moreClass,
			setPage,
			name,
			click_handler,
			click_handler_1,
			click_handler_2
		];
	}

	class Pagination extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$q, create_fragment$q, safe_not_equal, { name: 7, block: 0 });
		}
	}

	/* src/icon-finder/components/blocks/IconsWithPages.svelte generated by Svelte v3.29.4 */

	function create_else_block$5(ctx) {
		let block;
		let current;

		block = new Block({
				props: {
					type: "icons",
					$$slots: { default: [create_default_slot$7] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const block_changes = {};

				if (dirty & /*$$scope, pagination, selection, blocks, route, isList, isSelecting, headerText*/ 33007) {
					block_changes.$$scope = { dirty, ctx };
				}

				block.$set(block_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block, detaching);
			}
		};
	}

	// (74:0) {#if isEmpty}
	function create_if_block$h(ctx) {
		let contenterror;
		let current;

		contenterror = new ContentError({
				props: { error: phrases.errors.noIconsFound }
			});

		return {
			c() {
				create_component(contenterror.$$.fragment);
			},
			m(target, anchor) {
				mount_component(contenterror, target, anchor);
				current = true;
			},
			p: noop,
			i(local) {
				if (current) return;
				transition_in(contenterror.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(contenterror.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(contenterror, detaching);
			}
		};
	}

	// (77:1) <Block type="icons">
	function create_default_slot$7(ctx) {
		let iconsheader;
		let t0;
		let iconscontainer;
		let t1;
		let pagination_1;
		let current;

		iconsheader = new Header({
				props: {
					headerText: /*headerText*/ ctx[5],
					isList: /*isList*/ ctx[6],
					canChangeLayout: /*canChangeLayout*/ ctx[8],
					changeLayout: /*changeLayout*/ ctx[9],
					canSelectMultiple: /*canSelectMultiple*/ ctx[10],
					isSelecting: /*isSelecting*/ ctx[7],
					toggleSelection: /*toggleSelection*/ ctx[11]
				}
			});

		iconscontainer = new Container({
				props: {
					selection: /*selection*/ ctx[1],
					blocks: /*blocks*/ ctx[2],
					route: /*route*/ ctx[0],
					isList: /*isList*/ ctx[6],
					isSelecting: /*isSelecting*/ ctx[7]
				}
			});

		pagination_1 = new Pagination({
				props: {
					name: "pagination",
					block: /*pagination*/ ctx[3]
				}
			});

		return {
			c() {
				create_component(iconsheader.$$.fragment);
				t0 = space();
				create_component(iconscontainer.$$.fragment);
				t1 = space();
				create_component(pagination_1.$$.fragment);
			},
			m(target, anchor) {
				mount_component(iconsheader, target, anchor);
				insert(target, t0, anchor);
				mount_component(iconscontainer, target, anchor);
				insert(target, t1, anchor);
				mount_component(pagination_1, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const iconsheader_changes = {};
				if (dirty & /*headerText*/ 32) iconsheader_changes.headerText = /*headerText*/ ctx[5];
				if (dirty & /*isList*/ 64) iconsheader_changes.isList = /*isList*/ ctx[6];
				if (dirty & /*isSelecting*/ 128) iconsheader_changes.isSelecting = /*isSelecting*/ ctx[7];
				iconsheader.$set(iconsheader_changes);
				const iconscontainer_changes = {};
				if (dirty & /*selection*/ 2) iconscontainer_changes.selection = /*selection*/ ctx[1];
				if (dirty & /*blocks*/ 4) iconscontainer_changes.blocks = /*blocks*/ ctx[2];
				if (dirty & /*route*/ 1) iconscontainer_changes.route = /*route*/ ctx[0];
				if (dirty & /*isList*/ 64) iconscontainer_changes.isList = /*isList*/ ctx[6];
				if (dirty & /*isSelecting*/ 128) iconscontainer_changes.isSelecting = /*isSelecting*/ ctx[7];
				iconscontainer.$set(iconscontainer_changes);
				const pagination_1_changes = {};
				if (dirty & /*pagination*/ 8) pagination_1_changes.block = /*pagination*/ ctx[3];
				pagination_1.$set(pagination_1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(iconsheader.$$.fragment, local);
				transition_in(iconscontainer.$$.fragment, local);
				transition_in(pagination_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(iconsheader.$$.fragment, local);
				transition_out(iconscontainer.$$.fragment, local);
				transition_out(pagination_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(iconsheader, detaching);
				if (detaching) detach(t0);
				destroy_component(iconscontainer, detaching);
				if (detaching) detach(t1);
				destroy_component(pagination_1, detaching);
			}
		};
	}

	function create_fragment$r(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block$h, create_else_block$5];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*isEmpty*/ ctx[4]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		return {
			c() {
				if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if_blocks[current_block_type_index].d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	function instance$r($$self, $$props, $$invalidate) {
		
		
		
		let { route } = $$props;
		let { selection } = $$props;
		let { blocks } = $$props;

		// Registry
		const registry = getContext("registry");

		// Get config
		const componentsConfig = registry.config.components;

		// Get pagination
		let pagination;

		// Generate header text
		function generateHeaderText() {
			// const pagination = blocks.pagination as ;
			const total = pagination.length, text = phrases.icons;

			if (pagination.more && total > 0) {
				// Search results with "more" button
				return text.header.full;
			}

			// Exact phrase for count
			if (text.headerWithCount[total] !== void 0) {
				return text.headerWithCount[total];
			}

			// Default
			return text.header.full;
		}

		// Check if block is empty and get header text
		let isEmpty;

		let headerText;

		// Layout mode
		const canChangeLayout = componentsConfig.toggleList;

		let isList = componentsConfig.list;

		function changeLayout() {
			if (canChangeLayout) {
				$$invalidate(6, isList = componentsConfig.list = !componentsConfig.list);

				// UIConfigEvent
				registry.callback({ type: "config" });
			}
		}

		// Select multiple icons
		const canSelectMultiple = componentsConfig.multiSelect;

		let isSelecting = false;

		function toggleSelection() {
			$$invalidate(7, isSelecting = !isSelecting);
		}

		$$self.$$set = $$props => {
			if ("route" in $$props) $$invalidate(0, route = $$props.route);
			if ("selection" in $$props) $$invalidate(1, selection = $$props.selection);
			if ("blocks" in $$props) $$invalidate(2, blocks = $$props.blocks);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*blocks*/ 4) {
				 {
					$$invalidate(3, pagination = blocks.pagination);
				}
			}

			if ($$self.$$.dirty & /*pagination, blocks, isEmpty*/ 28) {
				 {
					$$invalidate(4, isEmpty = !pagination || !blocks.icons || blocks.icons.icons.length < 1);

					if (!isEmpty) {
						// Generate header text
						$$invalidate(5, headerText = generateHeaderText().replace("{count}", pagination.length + ""));
					}
				}
			}
		};

		return [
			route,
			selection,
			blocks,
			pagination,
			isEmpty,
			headerText,
			isList,
			isSelecting,
			canChangeLayout,
			changeLayout,
			canSelectMultiple,
			toggleSelection
		];
	}

	class IconsWithPages extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$r, create_fragment$r, safe_not_equal, { route: 0, selection: 1, blocks: 2 });
		}
	}

	/* src/icon-finder/components/blocks/Search.svelte generated by Svelte v3.29.4 */

	function create_default_slot$8(ctx) {
		let input;
		let current;

		input = new Input({
				props: {
					type: "text",
					value: /*block*/ ctx[1].keyword,
					onInput: /*changeValue*/ ctx[3],
					placeholder: /*placeholder*/ ctx[2],
					icon: "search",
					autofocus: canFocusSearch
				}
			});

		return {
			c() {
				create_component(input.$$.fragment);
			},
			m(target, anchor) {
				mount_component(input, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const input_changes = {};
				if (dirty & /*block*/ 2) input_changes.value = /*block*/ ctx[1].keyword;
				if (dirty & /*placeholder*/ 4) input_changes.placeholder = /*placeholder*/ ctx[2];
				input.$set(input_changes);
			},
			i(local) {
				if (current) return;
				transition_in(input.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(input.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(input, detaching);
			}
		};
	}

	function create_fragment$s(ctx) {
		let block_1;
		let current;

		block_1 = new Block({
				props: {
					type: "search",
					name: /*name*/ ctx[0],
					extra: "search-form",
					$$slots: { default: [create_default_slot$8] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block_1.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block_1, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const block_1_changes = {};
				if (dirty & /*name*/ 1) block_1_changes.name = /*name*/ ctx[0];

				if (dirty & /*$$scope, block, placeholder*/ 262) {
					block_1_changes.$$scope = { dirty, ctx };
				}

				block_1.$set(block_1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block_1, detaching);
			}
		};
	}

	function instance$s($$self, $$props, $$invalidate) {
		
		
		let { name } = $$props;
		let { block } = $$props;
		let { info = null } = $$props;
		let { customType = "" } = $$props;

		// Registry
		const registry = getContext("registry");

		// Phrases
		const searchPhrases = phrases.search;

		// Get placeholder
		let placeholder;

		// Submit form
		function changeValue(value) {
			registry.router.action(name, value.trim().toLowerCase());
		}

		$$self.$$set = $$props => {
			if ("name" in $$props) $$invalidate(0, name = $$props.name);
			if ("block" in $$props) $$invalidate(1, block = $$props.block);
			if ("info" in $$props) $$invalidate(4, info = $$props.info);
			if ("customType" in $$props) $$invalidate(5, customType = $$props.customType);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*customType, info*/ 48) {
				 {
					if (customType !== "" && searchPhrases.placeholder[customType] !== void 0) {
						$$invalidate(2, placeholder = searchPhrases.placeholder[customType]);
					} else if (info && info.name && searchPhrases.placeholder.collection !== void 0) {
						$$invalidate(2, placeholder = searchPhrases.placeholder.collection.replace("{name}", info.name));
					} else {
						$$invalidate(2, placeholder = searchPhrases.defaultPlaceholder);
					}
				}
			}
		};

		return [name, block, placeholder, changeValue, info, customType];
	}

	class Search extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$s, create_fragment$s, safe_not_equal, {
				name: 0,
				block: 1,
				info: 4,
				customType: 5
			});
		}
	}

	/* src/icon-finder/components/views/Collection.svelte generated by Svelte v3.29.4 */

	function get_each_context$c(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[9] = list[i];
		child_ctx[11] = i;
		return child_ctx;
	}

	// (61:1) {#if blocks.collections}
	function create_if_block_2$7(ctx) {
		let div;
		let filters;
		let current;

		filters = new Filters({
				props: {
					name: "collections",
					parent: /*route*/ ctx[2].parent
					? /*route*/ ctx[2].parent.type
					: "collections",
					link: /*collectionsLink*/ ctx[6],
					block: /*blocks*/ ctx[1].collections
				}
			});

		return {
			c() {
				div = element("div");
				create_component(filters.$$.fragment);
				attr(div, "class", "iff-filters");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				mount_component(filters, div, null);
				current = true;
			},
			p(ctx, dirty) {
				const filters_changes = {};

				if (dirty & /*route*/ 4) filters_changes.parent = /*route*/ ctx[2].parent
				? /*route*/ ctx[2].parent.type
				: "collections";

				if (dirty & /*collectionsLink*/ 64) filters_changes.link = /*collectionsLink*/ ctx[6];
				if (dirty & /*blocks*/ 2) filters_changes.block = /*blocks*/ ctx[1].collections;
				filters.$set(filters_changes);
			},
			i(local) {
				if (current) return;
				transition_in(filters.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(filters.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				destroy_component(filters);
			}
		};
	}

	// (71:1) {#if showCollectionInfoBlock && info !== null}
	function create_if_block_1$9(ctx) {
		let collectioninfoblock;
		let current;

		collectioninfoblock = new CollectionInfo({
				props: {
					name: "info",
					block: /*blocks*/ ctx[1].info
				}
			});

		return {
			c() {
				create_component(collectioninfoblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(collectioninfoblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const collectioninfoblock_changes = {};
				if (dirty & /*blocks*/ 2) collectioninfoblock_changes.block = /*blocks*/ ctx[1].info;
				collectioninfoblock.$set(collectioninfoblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(collectioninfoblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(collectioninfoblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(collectioninfoblock, detaching);
			}
		};
	}

	// (77:1) {#if filterBlocks.length > 0}
	function create_if_block$i(ctx) {
		let div;
		let each_blocks = [];
		let each_1_lookup = new Map();
		let current;
		let each_value = /*filterBlocks*/ ctx[7];
		const get_key = ctx => /*item*/ ctx[9].key;

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$c(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$c(key, child_ctx));
		}

		return {
			c() {
				div = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr(div, "class", "iff-filters");
			},
			m(target, anchor) {
				insert(target, div, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*filterBlocks*/ 128) {
					const each_value = /*filterBlocks*/ ctx[7];
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$c, null, get_each_context$c);
					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}
			}
		};
	}

	// (79:3) {#each filterBlocks as item, i (item.key)}
	function create_each_block$c(key_1, ctx) {
		let first;
		let filters;
		let current;

		filters = new Filters({
				props: {
					name: /*item*/ ctx[9].key,
					block: /*item*/ ctx[9].item
				}
			});

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				create_component(filters.$$.fragment);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				mount_component(filters, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const filters_changes = {};
				if (dirty & /*filterBlocks*/ 128) filters_changes.name = /*item*/ ctx[9].key;
				if (dirty & /*filterBlocks*/ 128) filters_changes.block = /*item*/ ctx[9].item;
				filters.$set(filters_changes);
			},
			i(local) {
				if (current) return;
				transition_in(filters.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(filters.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(first);
				destroy_component(filters, detaching);
			}
		};
	}

	function create_fragment$t(ctx) {
		let div;
		let t0;
		let t1;
		let searchblock;
		let t2;
		let t3;
		let iconswithpages;
		let div_class_value;
		let current;
		let if_block0 = /*blocks*/ ctx[1].collections && create_if_block_2$7(ctx);
		let if_block1 =  /*info*/ ctx[5] !== null && create_if_block_1$9(ctx);

		searchblock = new Search({
				props: {
					name: "filter",
					block: /*blocks*/ ctx[1].filter,
					info: /*info*/ ctx[5]
				}
			});

		let if_block2 = /*filterBlocks*/ ctx[7].length > 0 && create_if_block$i(ctx);

		iconswithpages = new IconsWithPages({
				props: {
					blocks: /*blocks*/ ctx[1],
					selection: /*selection*/ ctx[0],
					route: /*route*/ ctx[2]
				}
			});

		return {
			c() {
				div = element("div");
				if (if_block0) if_block0.c();
				t0 = space();
				if (if_block1) if_block1.c();
				t1 = space();
				create_component(searchblock.$$.fragment);
				t2 = space();
				if (if_block2) if_block2.c();
				t3 = space();
				create_component(iconswithpages.$$.fragment);

				attr(div, "class", div_class_value = "iif-view " + baseClass$9 + "\n\t\t" + baseClass$9 + "--prefix--" + (/*prefix*/ ctx[4] + (/*provider*/ ctx[3] === ""
				? ""
				: " " + baseClass$9 + "--provider--" + /*provider*/ ctx[3])));
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append(div, t0);
				if (if_block1) if_block1.m(div, null);
				append(div, t1);
				mount_component(searchblock, div, null);
				append(div, t2);
				if (if_block2) if_block2.m(div, null);
				append(div, t3);
				mount_component(iconswithpages, div, null);
				current = true;
			},
			p(ctx, [dirty]) {
				if (/*blocks*/ ctx[1].collections) {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty & /*blocks*/ 2) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_2$7(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(div, t0);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if ( /*info*/ ctx[5] !== null) {
					if (if_block1) {
						if_block1.p(ctx, dirty);

						if (dirty & /*info*/ 32) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block_1$9(ctx);
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(div, t1);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}

				const searchblock_changes = {};
				if (dirty & /*blocks*/ 2) searchblock_changes.block = /*blocks*/ ctx[1].filter;
				if (dirty & /*info*/ 32) searchblock_changes.info = /*info*/ ctx[5];
				searchblock.$set(searchblock_changes);

				if (/*filterBlocks*/ ctx[7].length > 0) {
					if (if_block2) {
						if_block2.p(ctx, dirty);

						if (dirty & /*filterBlocks*/ 128) {
							transition_in(if_block2, 1);
						}
					} else {
						if_block2 = create_if_block$i(ctx);
						if_block2.c();
						transition_in(if_block2, 1);
						if_block2.m(div, t3);
					}
				} else if (if_block2) {
					group_outros();

					transition_out(if_block2, 1, 1, () => {
						if_block2 = null;
					});

					check_outros();
				}

				const iconswithpages_changes = {};
				if (dirty & /*blocks*/ 2) iconswithpages_changes.blocks = /*blocks*/ ctx[1];
				if (dirty & /*selection*/ 1) iconswithpages_changes.selection = /*selection*/ ctx[0];
				if (dirty & /*route*/ 4) iconswithpages_changes.route = /*route*/ ctx[2];
				iconswithpages.$set(iconswithpages_changes);

				if (!current || dirty & /*prefix, provider*/ 24 && div_class_value !== (div_class_value = "iif-view " + baseClass$9 + "\n\t\t" + baseClass$9 + "--prefix--" + (/*prefix*/ ctx[4] + (/*provider*/ ctx[3] === ""
				? ""
				: " " + baseClass$9 + "--provider--" + /*provider*/ ctx[3])))) {
					attr(div, "class", div_class_value);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block1);
				transition_in(searchblock.$$.fragment, local);
				transition_in(if_block2);
				transition_in(iconswithpages.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(if_block0);
				transition_out(if_block1);
				transition_out(searchblock.$$.fragment, local);
				transition_out(if_block2);
				transition_out(iconswithpages.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				destroy_component(searchblock);
				if (if_block2) if_block2.d();
				destroy_component(iconswithpages);
			}
		};
	}

	const baseClass$9 = "iif-view--collection";

	function instance$t($$self, $$props, $$invalidate) {
		
		
		let { selection } = $$props;
		let { blocks } = $$props;
		let { route } = $$props;

		// Filter blocks
		const filterBlockKeys = ["tags", "themePrefixes", "themeSuffixes"];

		// Provider and prefix from route
		let provider;

		let prefix;

		// Collection info
		let info;

		// Collection link
		let collectionsLink;

		let filterBlocks;

		$$self.$$set = $$props => {
			if ("selection" in $$props) $$invalidate(0, selection = $$props.selection);
			if ("blocks" in $$props) $$invalidate(1, blocks = $$props.blocks);
			if ("route" in $$props) $$invalidate(2, route = $$props.route);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*route, provider, blocks*/ 14) {
				 {
					$$invalidate(3, provider = route.params.provider);

					if (typeof provider !== "string") {
						$$invalidate(3, provider = "");
					}

					$$invalidate(4, prefix = route.params.prefix);
					$$invalidate(5, info = blocks.info === null ? null : blocks.info.info);

					// Get collection link
					const providerData = lib.getProvider(provider);

					if (providerData) {
						$$invalidate(6, collectionsLink = providerData.links.collection);
					} else {
						$$invalidate(6, collectionsLink = "");
					}
				}
			}

			if ($$self.$$.dirty & /*blocks*/ 2) {
				 {
					$$invalidate(7, filterBlocks = filterBlockKeys.filter(key => !!blocks[key]).map(key => {
						return { key, item: blocks[key] };
					}));
				}
			}
		};

		return [
			selection,
			blocks,
			route,
			provider,
			prefix,
			info,
			collectionsLink,
			filterBlocks
		];
	}

	class Collection extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$t, create_fragment$t, safe_not_equal, { selection: 0, blocks: 1, route: 2 });
		}
	}

	/* src/icon-finder/components/views/Search.svelte generated by Svelte v3.29.4 */

	function create_if_block$j(ctx) {
		let filtersblock;
		let current;

		filtersblock = new Filters({
				props: {
					name: "collections",
					block: /*blocks*/ ctx[2].collections,
					link: /*collectionsLink*/ ctx[3]
				}
			});

		return {
			c() {
				create_component(filtersblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(filtersblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const filtersblock_changes = {};
				if (dirty & /*blocks*/ 4) filtersblock_changes.block = /*blocks*/ ctx[2].collections;
				if (dirty & /*collectionsLink*/ 8) filtersblock_changes.link = /*collectionsLink*/ ctx[3];
				filtersblock.$set(filtersblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(filtersblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(filtersblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(filtersblock, detaching);
			}
		};
	}

	function create_fragment$u(ctx) {
		let div;
		let t;
		let iconswithpages;
		let current;
		let if_block = /*blocks*/ ctx[2].collections && create_if_block$j(ctx);

		iconswithpages = new IconsWithPages({
				props: {
					blocks: /*blocks*/ ctx[2],
					selection: /*selection*/ ctx[1],
					route: /*route*/ ctx[0]
				}
			});

		return {
			c() {
				div = element("div");
				if (if_block) if_block.c();
				t = space();
				create_component(iconswithpages.$$.fragment);
				attr(div, "class", "iif-view iif-view--search");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if (if_block) if_block.m(div, null);
				append(div, t);
				mount_component(iconswithpages, div, null);
				current = true;
			},
			p(ctx, [dirty]) {
				if (/*blocks*/ ctx[2].collections) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*blocks*/ 4) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$j(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(div, t);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				const iconswithpages_changes = {};
				if (dirty & /*blocks*/ 4) iconswithpages_changes.blocks = /*blocks*/ ctx[2];
				if (dirty & /*selection*/ 2) iconswithpages_changes.selection = /*selection*/ ctx[1];
				if (dirty & /*route*/ 1) iconswithpages_changes.route = /*route*/ ctx[0];
				iconswithpages.$set(iconswithpages_changes);
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				transition_in(iconswithpages.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				transition_out(iconswithpages.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				if (if_block) if_block.d();
				destroy_component(iconswithpages);
			}
		};
	}

	function instance$u($$self, $$props, $$invalidate) {
		
		
		let { route } = $$props;
		let { selection } = $$props;
		let { blocks } = $$props;

		// Get collection link
		let collectionsLink;

		$$self.$$set = $$props => {
			if ("route" in $$props) $$invalidate(0, route = $$props.route);
			if ("selection" in $$props) $$invalidate(1, selection = $$props.selection);
			if ("blocks" in $$props) $$invalidate(2, blocks = $$props.blocks);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*route*/ 1) {
				 {
					let provider = route.params.provider;

					if (typeof provider !== "string") {
						provider = "";
					}

					// Get collection link
					const providerData = lib.getProvider(provider);

					if (providerData) {
						$$invalidate(3, collectionsLink = providerData.links.collection);
					} else {
						$$invalidate(3, collectionsLink = "");
					}
				}
			}
		};

		return [route, selection, blocks, collectionsLink];
	}

	class Search$1 extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$u, create_fragment$u, safe_not_equal, { route: 0, selection: 1, blocks: 2 });
		}
	}

	/* src/icon-finder/components/views/Custom.svelte generated by Svelte v3.29.4 */

	function create_fragment$v(ctx) {
		let div;
		let searchblock;
		let t;
		let iconswithpages;
		let div_class_value;
		let current;

		searchblock = new Search({
				props: {
					name: "filter",
					block: /*blocks*/ ctx[2].filter,
					customType: /*route*/ ctx[0].params.customType
				}
			});

		iconswithpages = new IconsWithPages({
				props: {
					blocks: /*blocks*/ ctx[2],
					selection: /*selection*/ ctx[1],
					route: /*route*/ ctx[0]
				}
			});

		return {
			c() {
				div = element("div");
				create_component(searchblock.$$.fragment);
				t = space();
				create_component(iconswithpages.$$.fragment);
				attr(div, "class", div_class_value = "iif-view iif-view--custom iif-view--custom--" + /*route*/ ctx[0].params.customType);
			},
			m(target, anchor) {
				insert(target, div, anchor);
				mount_component(searchblock, div, null);
				append(div, t);
				mount_component(iconswithpages, div, null);
				current = true;
			},
			p(ctx, [dirty]) {
				const searchblock_changes = {};
				if (dirty & /*blocks*/ 4) searchblock_changes.block = /*blocks*/ ctx[2].filter;
				if (dirty & /*route*/ 1) searchblock_changes.customType = /*route*/ ctx[0].params.customType;
				searchblock.$set(searchblock_changes);
				const iconswithpages_changes = {};
				if (dirty & /*blocks*/ 4) iconswithpages_changes.blocks = /*blocks*/ ctx[2];
				if (dirty & /*selection*/ 2) iconswithpages_changes.selection = /*selection*/ ctx[1];
				if (dirty & /*route*/ 1) iconswithpages_changes.route = /*route*/ ctx[0];
				iconswithpages.$set(iconswithpages_changes);

				if (!current || dirty & /*route*/ 1 && div_class_value !== (div_class_value = "iif-view iif-view--custom iif-view--custom--" + /*route*/ ctx[0].params.customType)) {
					attr(div, "class", div_class_value);
				}
			},
			i(local) {
				if (current) return;
				transition_in(searchblock.$$.fragment, local);
				transition_in(iconswithpages.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(searchblock.$$.fragment, local);
				transition_out(iconswithpages.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				destroy_component(searchblock);
				destroy_component(iconswithpages);
			}
		};
	}

	function instance$v($$self, $$props, $$invalidate) {
		
		
		let { route } = $$props;
		let { selection } = $$props;
		let { blocks } = $$props;

		$$self.$$set = $$props => {
			if ("route" in $$props) $$invalidate(0, route = $$props.route);
			if ("selection" in $$props) $$invalidate(1, selection = $$props.selection);
			if ("blocks" in $$props) $$invalidate(2, blocks = $$props.blocks);
		};

		return [route, selection, blocks];
	}

	class Custom extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$v, create_fragment$v, safe_not_equal, { route: 0, selection: 1, blocks: 2 });
		}
	}

	/* src/icon-finder/components/main/Content.svelte generated by Svelte v3.29.4 */

	function create_if_block_8(ctx) {
		let providersblock;
		let current;

		providersblock = new Providers({
				props: {
					providers: /*providers*/ ctx[9],
					activeProvider: /*activeProvider*/ ctx[8]
				}
			});

		return {
			c() {
				create_component(providersblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(providersblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const providersblock_changes = {};
				if (dirty & /*providers*/ 512) providersblock_changes.providers = /*providers*/ ctx[9];
				if (dirty & /*activeProvider*/ 256) providersblock_changes.activeProvider = /*activeProvider*/ ctx[8];
				providersblock.$set(providersblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(providersblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(providersblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(providersblock, detaching);
			}
		};
	}

	// (132:1) {#if showGlobalSearch}
	function create_if_block_7(ctx) {
		let searchblock;
		let current;

		searchblock = new GlobalSearch({
				props: {
					viewChanged: /*viewChanged*/ ctx[1],
					route: /*route*/ ctx[3]
				}
			});

		return {
			c() {
				create_component(searchblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(searchblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const searchblock_changes = {};
				if (dirty & /*viewChanged*/ 2) searchblock_changes.viewChanged = /*viewChanged*/ ctx[1];
				if (dirty & /*route*/ 8) searchblock_changes.route = /*route*/ ctx[3];
				searchblock.$set(searchblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(searchblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(searchblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(searchblock, detaching);
			}
		};
	}

	// (136:1) {#if route?.parent}
	function create_if_block_6(ctx) {
		let parentblock;
		let current;
		parentblock = new Parent({ props: { route: /*route*/ ctx[3] } });

		return {
			c() {
				create_component(parentblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(parentblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const parentblock_changes = {};
				if (dirty & /*route*/ 8) parentblock_changes.route = /*route*/ ctx[3];
				parentblock.$set(parentblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(parentblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(parentblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(parentblock, detaching);
			}
		};
	}

	// (140:1) {#if !route || route.type !== 'empty'}
	function create_if_block$k(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;

		const if_block_creators = [
			create_if_block_1$a,
			create_if_block_2$8,
			create_if_block_3$4,
			create_if_block_4$1,
			create_if_block_5,
			create_else_block$6
		];

		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*error*/ ctx[2] !== "" || !/*route*/ ctx[3]) return 0;
			if (/*route*/ ctx[3].type === "collections") return 1;
			if (/*route*/ ctx[3].type === "collection") return 2;
			if (/*route*/ ctx[3].type === "search") return 3;
			if (/*route*/ ctx[3].type === "custom") return 4;
			return 5;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		return {
			c() {
				if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if_blocks[current_block_type_index].d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	// (151:2) {:else}
	function create_else_block$6(ctx) {
		let viewerror;
		let current;

		viewerror = new Error$1({
				props: {
					error: "bad_route",
					route: /*route*/ ctx[3]
				}
			});

		return {
			c() {
				create_component(viewerror.$$.fragment);
			},
			m(target, anchor) {
				mount_component(viewerror, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const viewerror_changes = {};
				if (dirty & /*route*/ 8) viewerror_changes.route = /*route*/ ctx[3];
				viewerror.$set(viewerror_changes);
			},
			i(local) {
				if (current) return;
				transition_in(viewerror.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(viewerror.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(viewerror, detaching);
			}
		};
	}

	// (149:36) 
	function create_if_block_5(ctx) {
		let customview;
		let current;

		customview = new Custom({
				props: {
					route: /*route*/ ctx[3],
					blocks: /*blocks*/ ctx[4],
					selection: /*selection*/ ctx[0]
				}
			});

		return {
			c() {
				create_component(customview.$$.fragment);
			},
			m(target, anchor) {
				mount_component(customview, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const customview_changes = {};
				if (dirty & /*route*/ 8) customview_changes.route = /*route*/ ctx[3];
				if (dirty & /*blocks*/ 16) customview_changes.blocks = /*blocks*/ ctx[4];
				if (dirty & /*selection*/ 1) customview_changes.selection = /*selection*/ ctx[0];
				customview.$set(customview_changes);
			},
			i(local) {
				if (current) return;
				transition_in(customview.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(customview.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(customview, detaching);
			}
		};
	}

	// (147:36) 
	function create_if_block_4$1(ctx) {
		let searchview;
		let current;

		searchview = new Search$1({
				props: {
					route: /*route*/ ctx[3],
					blocks: /*blocks*/ ctx[4],
					selection: /*selection*/ ctx[0]
				}
			});

		return {
			c() {
				create_component(searchview.$$.fragment);
			},
			m(target, anchor) {
				mount_component(searchview, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const searchview_changes = {};
				if (dirty & /*route*/ 8) searchview_changes.route = /*route*/ ctx[3];
				if (dirty & /*blocks*/ 16) searchview_changes.blocks = /*blocks*/ ctx[4];
				if (dirty & /*selection*/ 1) searchview_changes.selection = /*selection*/ ctx[0];
				searchview.$set(searchview_changes);
			},
			i(local) {
				if (current) return;
				transition_in(searchview.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(searchview.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(searchview, detaching);
			}
		};
	}

	// (145:40) 
	function create_if_block_3$4(ctx) {
		let collectionview;
		let current;

		collectionview = new Collection({
				props: {
					route: /*route*/ ctx[3],
					blocks: /*blocks*/ ctx[4],
					selection: /*selection*/ ctx[0]
				}
			});

		return {
			c() {
				create_component(collectionview.$$.fragment);
			},
			m(target, anchor) {
				mount_component(collectionview, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const collectionview_changes = {};
				if (dirty & /*route*/ 8) collectionview_changes.route = /*route*/ ctx[3];
				if (dirty & /*blocks*/ 16) collectionview_changes.blocks = /*blocks*/ ctx[4];
				if (dirty & /*selection*/ 1) collectionview_changes.selection = /*selection*/ ctx[0];
				collectionview.$set(collectionview_changes);
			},
			i(local) {
				if (current) return;
				transition_in(collectionview.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(collectionview.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(collectionview, detaching);
			}
		};
	}

	// (143:41) 
	function create_if_block_2$8(ctx) {
		let collectionsview;
		let current;

		collectionsview = new Collections({
				props: {
					route: /*route*/ ctx[3],
					blocks: /*blocks*/ ctx[4]
				}
			});

		return {
			c() {
				create_component(collectionsview.$$.fragment);
			},
			m(target, anchor) {
				mount_component(collectionsview, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const collectionsview_changes = {};
				if (dirty & /*route*/ 8) collectionsview_changes.route = /*route*/ ctx[3];
				if (dirty & /*blocks*/ 16) collectionsview_changes.blocks = /*blocks*/ ctx[4];
				collectionsview.$set(collectionsview_changes);
			},
			i(local) {
				if (current) return;
				transition_in(collectionsview.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(collectionsview.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(collectionsview, detaching);
			}
		};
	}

	// (141:2) {#if error !== '' || !route}
	function create_if_block_1$a(ctx) {
		let viewerror;
		let current;

		viewerror = new Error$1({
				props: {
					error: /*error*/ ctx[2] !== "" ? /*error*/ ctx[2] : "bad_route",
					route: /*route*/ ctx[3]
				}
			});

		return {
			c() {
				create_component(viewerror.$$.fragment);
			},
			m(target, anchor) {
				mount_component(viewerror, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const viewerror_changes = {};
				if (dirty & /*error*/ 4) viewerror_changes.error = /*error*/ ctx[2] !== "" ? /*error*/ ctx[2] : "bad_route";
				if (dirty & /*route*/ 8) viewerror_changes.route = /*route*/ ctx[3];
				viewerror.$set(viewerror_changes);
			},
			i(local) {
				if (current) return;
				transition_in(viewerror.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(viewerror.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(viewerror, detaching);
			}
		};
	}

	function create_fragment$w(ctx) {
		let div;
		let t0;
		let t1;
		let t2;
		let current;
		let if_block0 = /*providersVisible*/ ctx[7] && create_if_block_8(ctx);
		let if_block1 = /*showGlobalSearch*/ ctx[6] && create_if_block_7(ctx);
		let if_block2 = /*route*/ ctx[3]?.parent && create_if_block_6(ctx);
		let if_block3 = (!/*route*/ ctx[3] || /*route*/ ctx[3].type !== "empty") && create_if_block$k(ctx);

		return {
			c() {
				div = element("div");
				if (if_block0) if_block0.c();
				t0 = space();
				if (if_block1) if_block1.c();
				t1 = space();
				if (if_block2) if_block2.c();
				t2 = space();
				if (if_block3) if_block3.c();
				attr(div, "class", /*className*/ ctx[5]);
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append(div, t0);
				if (if_block1) if_block1.m(div, null);
				append(div, t1);
				if (if_block2) if_block2.m(div, null);
				append(div, t2);
				if (if_block3) if_block3.m(div, null);
				current = true;
			},
			p(ctx, [dirty]) {
				if (/*providersVisible*/ ctx[7]) {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty & /*providersVisible*/ 128) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_8(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(div, t0);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if (/*showGlobalSearch*/ ctx[6]) {
					if (if_block1) {
						if_block1.p(ctx, dirty);

						if (dirty & /*showGlobalSearch*/ 64) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block_7(ctx);
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(div, t1);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}

				if (/*route*/ ctx[3]?.parent) {
					if (if_block2) {
						if_block2.p(ctx, dirty);

						if (dirty & /*route*/ 8) {
							transition_in(if_block2, 1);
						}
					} else {
						if_block2 = create_if_block_6(ctx);
						if_block2.c();
						transition_in(if_block2, 1);
						if_block2.m(div, t2);
					}
				} else if (if_block2) {
					group_outros();

					transition_out(if_block2, 1, 1, () => {
						if_block2 = null;
					});

					check_outros();
				}

				if (!/*route*/ ctx[3] || /*route*/ ctx[3].type !== "empty") {
					if (if_block3) {
						if_block3.p(ctx, dirty);

						if (dirty & /*route*/ 8) {
							transition_in(if_block3, 1);
						}
					} else {
						if_block3 = create_if_block$k(ctx);
						if_block3.c();
						transition_in(if_block3, 1);
						if_block3.m(div, null);
					}
				} else if (if_block3) {
					group_outros();

					transition_out(if_block3, 1, 1, () => {
						if_block3 = null;
					});

					check_outros();
				}

				if (!current || dirty & /*className*/ 32) {
					attr(div, "class", /*className*/ ctx[5]);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block1);
				transition_in(if_block2);
				transition_in(if_block3);
				current = true;
			},
			o(local) {
				transition_out(if_block0);
				transition_out(if_block1);
				transition_out(if_block2);
				transition_out(if_block3);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				if (if_block3) if_block3.d();
			}
		};
	}

	const baseClass$a = "iif-content";

	function instance$w($$self, $$props, $$invalidate) {
		
		
		let { selection } = $$props;
		let { viewChanged } = $$props;
		let { error } = $$props;
		let { route } = $$props;
		let { blocks } = $$props;
		let className;

		// Check if collections list is in route, don't show global search if its not there
		let showGlobalSearch;

		// Get providers
		let providersVisible = canAddProviders;

		let activeProvider = "";
		let providers = [""];

		$$self.$$set = $$props => {
			if ("selection" in $$props) $$invalidate(0, selection = $$props.selection);
			if ("viewChanged" in $$props) $$invalidate(1, viewChanged = $$props.viewChanged);
			if ("error" in $$props) $$invalidate(2, error = $$props.error);
			if ("route" in $$props) $$invalidate(3, route = $$props.route);
			if ("blocks" in $$props) $$invalidate(4, blocks = $$props.blocks);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*error, className, route*/ 44) {
				 {
					// Check class name and search form value
					$$invalidate(5, className = baseClass$a);

					if (error !== "") {
						// View shows error
						$$invalidate(5, className += " " + baseClass$a + "--error " + baseClass$a + "--error--" + error);
					} else {
						// View shows something
						$$invalidate(5, className += " " + baseClass$a + "--view " + baseClass$a + "--view--" + route.type);

						if (route.params && (route.type === "search" || route.type === "collections" || route.type === "collection") && route.params.provider) {
							// Add provider: '{base}--view--{type}--provider--{provider}'
							$$invalidate(5, className += " " + baseClass$a + "--view--" + route.type + "--provider--" + route.params.provider);
						}

						if (route.type === "collection") {
							// Add prefix: '{base}--view--collection--prefix--{prefix}'
							$$invalidate(5, className += " " + baseClass$a + "--view--collection--prefix--" + route.params.prefix);
						} else if (route.type === "custom") {
							// Add custom type: '{base} {base}--view {base}--view--custom {base}--view--custom--{customType}'
							$$invalidate(5, className += " " + baseClass$a + "--view--custom--" + route.params.customType);
						}
					}
				}
			}

			if ($$self.$$.dirty & /*route, showGlobalSearch*/ 72) {
				 {
					$$invalidate(6, showGlobalSearch = false);
					let item = route;

					while (!showGlobalSearch && item) {
						if (item.type === "collections") {
							$$invalidate(6, showGlobalSearch = true);
						} else {
							item = item.parent;
						}
					}
				}
			}

			if ($$self.$$.dirty & /*route, providers*/ 520) {
				 {
					{
						$$invalidate(7, providersVisible = false);
					}
				}
			}
		};

		return [
			selection,
			viewChanged,
			error,
			route,
			blocks,
			className,
			showGlobalSearch,
			providersVisible,
			activeProvider,
			providers
		];
	}

	class Content extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$w, create_fragment$w, safe_not_equal, {
				selection: 0,
				viewChanged: 1,
				error: 2,
				route: 3,
				blocks: 4
			});
		}
	}

	/**
	 * Empty values
	 */
	const emptyCustomisations = {
	    hFlip: false,
	    vFlip: false,
	    rotate: 0,
	    color: '',
	    width: '',
	    height: '',
	    inline: false,
	};
	/**
	 * Default values
	 */
	const defaultCustomisations = {
	    hFlip: false,
	    vFlip: false,
	    rotate: 0,
	    color: '',
	    width: '',
	    height: '',
	    inline: false,
	};
	/**
	 * Add missing values to customisations, creating new object. Function does type checking
	 */
	function mergeCustomisations(defaults, values) {
	    let result = {};
	    for (let key in defaults) {
	        const attr = key;
	        if (values && typeof values[attr] === typeof defaults[attr]) {
	            result[attr] = values[attr];
	        }
	        else {
	            result[attr] = defaults[attr];
	        }
	    }
	    return result;
	}
	/**
	 * Export only customised attributes
	 */
	function filterCustomisations(values) {
	    let result = {};
	    for (let key in defaultCustomisations) {
	        const attr = key;
	        if (values[attr] !== defaultCustomisations[attr] &&
	            values[attr] !== emptyCustomisations[attr]) {
	            result[attr] = values[attr];
	        }
	    }
	    return result;
	}

	/* src/icon-finder/components/footer/misc/Block.svelte generated by Svelte v3.29.4 */

	function create_if_block_1$b(ctx) {
		let p;
		let t;
		let current;
		let if_block0 = !/*expanded*/ ctx[1] && create_if_block_3$5();

		function select_block_type(ctx, dirty) {
			if (/*canExpand*/ ctx[3]) return create_if_block_2$9;
			return create_else_block$7;
		}

		let current_block_type = select_block_type(ctx);
		let if_block1 = current_block_type(ctx);

		return {
			c() {
				p = element("p");
				if (if_block0) if_block0.c();
				t = space();
				if_block1.c();
				attr(p, "class", "iif-footer-block-title");
			},
			m(target, anchor) {
				insert(target, p, anchor);
				if (if_block0) if_block0.m(p, null);
				append(p, t);
				if_block1.m(p, null);
				current = true;
			},
			p(ctx, dirty) {
				if (!/*expanded*/ ctx[1]) {
					if (if_block0) {
						if (dirty & /*expanded*/ 2) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_3$5();
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(p, t);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if_block1.p(ctx, dirty);
			},
			i(local) {
				if (current) return;
				transition_in(if_block0);
				current = true;
			},
			o(local) {
				transition_out(if_block0);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(p);
				if (if_block0) if_block0.d();
				if_block1.d();
			}
		};
	}

	// (48:3) {#if !expanded}
	function create_if_block_3$5(ctx) {
		let uiicon;
		let current;
		uiicon = new Icon({ props: { icon: "expand" } });

		return {
			c() {
				create_component(uiicon.$$.fragment);
			},
			m(target, anchor) {
				mount_component(uiicon, target, anchor);
				current = true;
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(uiicon, detaching);
			}
		};
	}

	// (55:3) {:else}
	function create_else_block$7(ctx) {
		let t_value = /*title*/ ctx[0] + ":" + "";
		let t;

		return {
			c() {
				t = text(t_value);
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*title*/ 1 && t_value !== (t_value = /*title*/ ctx[0] + ":" + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) detach(t);
			}
		};
	}

	// (51:3) {#if canExpand}
	function create_if_block_2$9(ctx) {
		let a;
		let t_value = /*title*/ ctx[0] + (/*expanded*/ ctx[1] ? ":" : "") + "";
		let t;
		let mounted;
		let dispose;

		return {
			c() {
				a = element("a");
				t = text(t_value);
				attr(a, "href", "# ");
			},
			m(target, anchor) {
				insert(target, a, anchor);
				append(a, t);

				if (!mounted) {
					dispose = listen(a, "click", prevent_default(/*toggle*/ ctx[4]));
					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*title, expanded*/ 3 && t_value !== (t_value = /*title*/ ctx[0] + (/*expanded*/ ctx[1] ? ":" : "") + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) detach(a);
				mounted = false;
				dispose();
			}
		};
	}

	// (58:1) {#if expanded}
	function create_if_block$l(ctx) {
		let current;
		const default_slot_template = /*#slots*/ ctx[7].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

		return {
			c() {
				if (default_slot) default_slot.c();
			},
			m(target, anchor) {
				if (default_slot) {
					default_slot.m(target, anchor);
				}

				current = true;
			},
			p(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 64) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
					}
				}
			},
			i(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d(detaching) {
				if (default_slot) default_slot.d(detaching);
			}
		};
	}

	function create_fragment$x(ctx) {
		let div;
		let t;
		let current;
		let if_block0 = /*title*/ ctx[0] !== "" && create_if_block_1$b(ctx);
		let if_block1 = /*expanded*/ ctx[1] && create_if_block$l(ctx);

		return {
			c() {
				div = element("div");
				if (if_block0) if_block0.c();
				t = space();
				if (if_block1) if_block1.c();
				attr(div, "class", /*className*/ ctx[2]);
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append(div, t);
				if (if_block1) if_block1.m(div, null);
				current = true;
			},
			p(ctx, [dirty]) {
				if (/*title*/ ctx[0] !== "") {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty & /*title*/ 1) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_1$b(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(div, t);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if (/*expanded*/ ctx[1]) {
					if (if_block1) {
						if_block1.p(ctx, dirty);

						if (dirty & /*expanded*/ 2) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block$l(ctx);
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(div, null);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}

				if (!current || dirty & /*className*/ 4) {
					attr(div, "class", /*className*/ ctx[2]);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block1);
				current = true;
			},
			o(local) {
				transition_out(if_block0);
				transition_out(if_block1);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
			}
		};
	}

	const baseClass$b = "iif-footer-block";

	function instance$x($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		
		let { name } = $$props;
		let { title } = $$props;

		// Config key
		let key = name + "Visible";

		// Registry
		const registry = getContext("registry");

		// Get config
		const config = registry.config.components;

		// Check if block can expand
		const canExpand = canToggleFooterBlocks ;

		// Check if info block is visible
		let expanded =  true;

		let className;

		/**
	 * Toggle block
	 */
		function toggle() {
			$$invalidate(1, expanded = config[key] = !expanded);
			registry.callback({ type: "config" });
		}

		$$self.$$set = $$props => {
			if ("name" in $$props) $$invalidate(5, name = $$props.name);
			if ("title" in $$props) $$invalidate(0, title = $$props.title);
			if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*name, expanded*/ 34) {
				 {
					$$invalidate(2, className = baseClass$b + " " + baseClass$b + "--" + name + " " + baseClass$b + "--" + (expanded ? "expanded" : "collapsed"));
				}
			}
		};

		return [title, expanded, className, canExpand, toggle, name, $$scope, slots];
	}

	class Block$1 extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$x, create_fragment$x, safe_not_equal, { name: 5, title: 0 });
		}
	}

	function shortenIconName(route, icon, fullName) {
	    if (!route) {
	        return fullName;
	    }
	    switch (route.type) {
	        case 'collections':
	        case 'search':
	        case 'collection':
	            break;
	        default:
	            return fullName;
	    }
	    const params = route.params;
	    // Get and check provider
	    const provider = params && typeof params.provider === 'string' ? params.provider : '';
	    if (icon.provider !== provider) {
	        return fullName;
	    }
	    // Check if icon has same prefix (only for collection)
	    if (route.type === 'collection' && icon.prefix === route.params.prefix) {
	        return icon.name;
	    }
	    // Remove only provider
	    return icon.prefix + ':' + icon.name;
	}

	/* src/icon-finder/components/footer/parts/name/Simple.svelte generated by Svelte v3.29.4 */

	function create_fragment$y(ctx) {
		let div1;
		let dl;
		let dt;
		let dd;
		let uiicon;
		let t1;
		let div0;
		let span;
		let t2;
		let current;
		uiicon = new Icon({ props: { icon: /*iconName*/ ctx[0] } });

		return {
			c() {
				div1 = element("div");
				dl = element("dl");
				dt = element("dt");
				dt.textContent = `${phrases.footer.iconName}`;
				dd = element("dd");
				create_component(uiicon.$$.fragment);
				t1 = space();
				div0 = element("div");
				span = element("span");
				t2 = text(/*text*/ ctx[1]);
				attr(div0, "class", "iif-footer-icon-name-input");
				attr(div1, "class", "iif-footer-icon-name iif-footer-icon-name--simple");
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				append(div1, dl);
				append(dl, dt);
				append(dl, dd);
				mount_component(uiicon, dd, null);
				append(dd, t1);
				append(dd, div0);
				append(div0, span);
				append(span, t2);
				current = true;
			},
			p(ctx, [dirty]) {
				const uiicon_changes = {};
				if (dirty & /*iconName*/ 1) uiicon_changes.icon = /*iconName*/ ctx[0];
				uiicon.$set(uiicon_changes);
				if (!current || dirty & /*text*/ 2) set_data(t2, /*text*/ ctx[1]);
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div1);
				destroy_component(uiicon);
			}
		};
	}

	function instance$y($$self, $$props, $$invalidate) {
		
		let { icon } = $$props;
		let { route } = $$props;

		// Get icon name
		let iconName;

		let text;

		$$self.$$set = $$props => {
			if ("icon" in $$props) $$invalidate(2, icon = $$props.icon);
			if ("route" in $$props) $$invalidate(3, route = $$props.route);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*icon, route, iconName*/ 13) {
				 {
					// Full name
					$$invalidate(0, iconName = lib.iconToString(icon));

					// Do not show prefix if viewing collection
					$$invalidate(1, text =  shortenIconName(route, icon, iconName)
					);
				}
			}
		};

		return [iconName, text, icon, route];
	}

	class Simple extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$y, create_fragment$y, safe_not_equal, { icon: 2, route: 3 });
		}
	}

	/**
	 * List of base colors. From https://www.w3.org/TR/css3-color/
	 */
	const baseColorKeywords = {
	    silver: [192, 192, 192],
	    gray: [128, 128, 128],
	    white: [255, 255, 255],
	    maroon: [128, 0, 0],
	    red: [255, 0, 0],
	    purple: [128, 0, 128],
	    fuchsia: [255, 0, 255],
	    green: [0, 128, 0],
	    lime: [0, 255, 0],
	    olive: [128, 128, 0],
	    yellow: [255, 255, 0],
	    navy: [0, 0, 128],
	    blue: [0, 0, 255],
	    teal: [0, 128, 128],
	    aqua: [0, 255, 255],
	};
	/**
	 * List of extended colors. From https://www.w3.org/TR/css3-color/
	 */
	const extendedColorKeywords = {
	    aliceblue: [240, 248, 255],
	    antiquewhite: [250, 235, 215],
	    aqua: [0, 255, 255],
	    aquamarine: [127, 255, 212],
	    azure: [240, 255, 255],
	    beige: [245, 245, 220],
	    bisque: [255, 228, 196],
	    black: [0, 0, 0],
	    blanchedalmond: [255, 235, 205],
	    blue: [0, 0, 255],
	    blueviolet: [138, 43, 226],
	    brown: [165, 42, 42],
	    burlywood: [222, 184, 135],
	    cadetblue: [95, 158, 160],
	    chartreuse: [127, 255, 0],
	    chocolate: [210, 105, 30],
	    coral: [255, 127, 80],
	    cornflowerblue: [100, 149, 237],
	    cornsilk: [255, 248, 220],
	    crimson: [220, 20, 60],
	    cyan: [0, 255, 255],
	    darkblue: [0, 0, 139],
	    darkcyan: [0, 139, 139],
	    darkgoldenrod: [184, 134, 11],
	    darkgray: [169, 169, 169],
	    darkgreen: [0, 100, 0],
	    darkgrey: [169, 169, 169],
	    darkkhaki: [189, 183, 107],
	    darkmagenta: [139, 0, 139],
	    darkolivegreen: [85, 107, 47],
	    darkorange: [255, 140, 0],
	    darkorchid: [153, 50, 204],
	    darkred: [139, 0, 0],
	    darksalmon: [233, 150, 122],
	    darkseagreen: [143, 188, 143],
	    darkslateblue: [72, 61, 139],
	    darkslategray: [47, 79, 79],
	    darkslategrey: [47, 79, 79],
	    darkturquoise: [0, 206, 209],
	    darkviolet: [148, 0, 211],
	    deeppink: [255, 20, 147],
	    deepskyblue: [0, 191, 255],
	    dimgray: [105, 105, 105],
	    dimgrey: [105, 105, 105],
	    dodgerblue: [30, 144, 255],
	    firebrick: [178, 34, 34],
	    floralwhite: [255, 250, 240],
	    forestgreen: [34, 139, 34],
	    fuchsia: [255, 0, 255],
	    gainsboro: [220, 220, 220],
	    ghostwhite: [248, 248, 255],
	    gold: [255, 215, 0],
	    goldenrod: [218, 165, 32],
	    gray: [128, 128, 128],
	    green: [0, 128, 0],
	    greenyellow: [173, 255, 47],
	    grey: [128, 128, 128],
	    honeydew: [240, 255, 240],
	    hotpink: [255, 105, 180],
	    indianred: [205, 92, 92],
	    indigo: [75, 0, 130],
	    ivory: [255, 255, 240],
	    khaki: [240, 230, 140],
	    lavender: [230, 230, 250],
	    lavenderblush: [255, 240, 245],
	    lawngreen: [124, 252, 0],
	    lemonchiffon: [255, 250, 205],
	    lightblue: [173, 216, 230],
	    lightcoral: [240, 128, 128],
	    lightcyan: [224, 255, 255],
	    lightgoldenrodyellow: [250, 250, 210],
	    lightgray: [211, 211, 211],
	    lightgreen: [144, 238, 144],
	    lightgrey: [211, 211, 211],
	    lightpink: [255, 182, 193],
	    lightsalmon: [255, 160, 122],
	    lightseagreen: [32, 178, 170],
	    lightskyblue: [135, 206, 250],
	    lightslategray: [119, 136, 153],
	    lightslategrey: [119, 136, 153],
	    lightsteelblue: [176, 196, 222],
	    lightyellow: [255, 255, 224],
	    lime: [0, 255, 0],
	    limegreen: [50, 205, 50],
	    linen: [250, 240, 230],
	    magenta: [255, 0, 255],
	    maroon: [128, 0, 0],
	    mediumaquamarine: [102, 205, 170],
	    mediumblue: [0, 0, 205],
	    mediumorchid: [186, 85, 211],
	    mediumpurple: [147, 112, 219],
	    mediumseagreen: [60, 179, 113],
	    mediumslateblue: [123, 104, 238],
	    mediumspringgreen: [0, 250, 154],
	    mediumturquoise: [72, 209, 204],
	    mediumvioletred: [199, 21, 133],
	    midnightblue: [25, 25, 112],
	    mintcream: [245, 255, 250],
	    mistyrose: [255, 228, 225],
	    moccasin: [255, 228, 181],
	    navajowhite: [255, 222, 173],
	    navy: [0, 0, 128],
	    oldlace: [253, 245, 230],
	    olive: [128, 128, 0],
	    olivedrab: [107, 142, 35],
	    orange: [255, 165, 0],
	    orangered: [255, 69, 0],
	    orchid: [218, 112, 214],
	    palegoldenrod: [238, 232, 170],
	    palegreen: [152, 251, 152],
	    paleturquoise: [175, 238, 238],
	    palevioletred: [219, 112, 147],
	    papayawhip: [255, 239, 213],
	    peachpuff: [255, 218, 185],
	    peru: [205, 133, 63],
	    pink: [255, 192, 203],
	    plum: [221, 160, 221],
	    powderblue: [176, 224, 230],
	    purple: [128, 0, 128],
	    red: [255, 0, 0],
	    rosybrown: [188, 143, 143],
	    royalblue: [65, 105, 225],
	    saddlebrown: [139, 69, 19],
	    salmon: [250, 128, 114],
	    sandybrown: [244, 164, 96],
	    seagreen: [46, 139, 87],
	    seashell: [255, 245, 238],
	    sienna: [160, 82, 45],
	    silver: [192, 192, 192],
	    skyblue: [135, 206, 235],
	    slateblue: [106, 90, 205],
	    slategray: [112, 128, 144],
	    slategrey: [112, 128, 144],
	    snow: [255, 250, 250],
	    springgreen: [0, 255, 127],
	    steelblue: [70, 130, 180],
	    tan: [210, 180, 140],
	    teal: [0, 128, 128],
	    thistle: [216, 191, 216],
	    tomato: [255, 99, 71],
	    turquoise: [64, 224, 208],
	    violet: [238, 130, 238],
	    wheat: [245, 222, 179],
	    white: [255, 255, 255],
	    whitesmoke: [245, 245, 245],
	    yellow: [255, 255, 0],
	    yellowgreen: [154, 205, 50],
	    // Color module level 4
	    rebeccapurple: [102, 51, 153],
	};

	/**
	 * Attempt to convert color to keyword.
	 *
	 * Assumes that check for alpha === 1 has been completed
	 */
	function colorToKeyword(color) {
	    // Test all keyword lists
	    const lists = [baseColorKeywords, extendedColorKeywords];
	    for (let i = 0; i < lists.length; i++) {
	        const list = lists[i];
	        const keys = Object.keys(list);
	        let key;
	        while ((key = keys.shift()) !== void 0) {
	            const rgb = list[key];
	            if (rgb[0] === color.r &&
	                rgb[1] === color.g &&
	                rgb[2] === color.b) {
	                return key;
	            }
	        }
	    }
	    return null;
	}
	/**
	 * Convert array to object
	 */
	function valueToKeyword(value) {
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
	function hexToColor(value) {
	    if (value.slice(0, 1) === '#') {
	        value = value.slice(1);
	    }
	    if (!/^[\da-f]+$/i.test(value)) {
	        return null;
	    }
	    let alphaStr = '';
	    let redStr, greenStr, blueStr;
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
	function stringToColor(value) {
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
	        alpha = parseFloat(colors.pop());
	        if (isNaN(alpha)) {
	            alpha = 0;
	        }
	        else {
	            alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
	        }
	    }
	    else if (colors.length !== 3) {
	        return null;
	    }
	    // Parse
	    switch (keyword) {
	        case 'rgb':
	        case 'rgba':
	            if (colors[0].slice(-1) === '%') {
	                // All components must be percentages
	                if (colors[1].slice(-1) !== '%' ||
	                    colors[2].slice(-1) !== '%') {
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
	            if (colors[0].indexOf('%') !== -1 ||
	                colors[1].slice(-1) !== '%' ||
	                colors[2].slice(-1) !== '%') {
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
	function hslToRGB(value, round = false) {
	    function valore(n1, n2, hue) {
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
	    let hue = value.h < 0
	        ? (value.h % 360) + 360
	        : value.h >= 360
	            ? value.h % 360
	            : value.h;
	    let sat = value.s < 0 ? 0 : value.s > 100 ? 1 : value.s / 100;
	    let lum = value.l < 0 ? 0 : value.l > 100 ? 1 : value.l / 100;
	    let m2;
	    if (lum <= 0.5) {
	        m2 = lum * (1 + sat);
	    }
	    else {
	        m2 = lum + sat * (1 - lum);
	    }
	    let m1 = 2 * lum - m2;
	    let c1, c2, c3;
	    if (sat === 0 && hue === 0) {
	        c1 = lum;
	        c2 = lum;
	        c3 = lum;
	    }
	    else {
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
	function colorToString(color) {
	    // Attempt to convert to RGB
	    let rgbColor;
	    try {
	        rgbColor =
	            color.r !== void 0
	                ? color
	                : hslToRGB(color);
	    }
	    catch (err) {
	        return '';
	    }
	    // Check for floats
	    const rgbRounded = rgbColor.r === Math.round(rgbColor.r) &&
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
	            ['r', 'g', 'b'].forEach((attr) => {
	                const value = rgbColor[attr];
	                if (value < 0 || value > 255) {
	                    throw new Error('Invalid color');
	                }
	                const str = (value < 16 ? '0' : '') + value.toString(16);
	                result += str;
	                canShorten = canShorten && str[0] === str[1];
	            });
	        }
	        catch (err) {
	            return '';
	        }
	        return '#' + (canShorten ? result[0] + result[2] + result[4] : result);
	    }
	    // RGB(A) or HSL(A)
	    if (!rgbRounded && color.h !== void 0) {
	        // HSL(A)
	        const hslColor = color;
	        const list = [];
	        try {
	            // Hue
	            let hue = hslColor.h % 360;
	            while (hue < 0) {
	                hue += 360;
	            }
	            list.push(hue + '');
	            // Saturation, lightness
	            ['s', 'l'].forEach((attr) => {
	                const value = hslColor[attr];
	                if (value < 0 || value > 100) {
	                    throw new Error('Invalid color');
	                }
	                list.push(value + '%');
	            });
	        }
	        catch (err) {
	            return '';
	        }
	        if (hslColor.a !== 1) {
	            list.push(hslColor.a + '');
	        }
	        return (hslColor.a === 1 ? 'hsl(' : 'hsla(') + list.join(', ') + ')';
	    }
	    // RGB(A)
	    const list = [];
	    try {
	        ['r', 'g', 'b'].forEach((attr) => {
	            const value = rgbColor[attr];
	            if (value < 0 || value > 255) {
	                throw new Error('Invalid color');
	            }
	            list.push(value + '');
	        });
	    }
	    catch (err) {
	        return '';
	    }
	    if (rgbColor.a !== 1) {
	        list.push(rgbColor.a + '');
	    }
	    return (rgbColor.a === 1 ? 'rgb(' : 'rgba(') + list.join(', ') + ')';
	}

	/* src/icon-finder/components/footer/parts/props/Block.svelte generated by Svelte v3.29.4 */

	function create_fragment$z(ctx) {
		let div1;
		let p;
		let t0;
		let t1;
		let div0;
		let div1_class_value;
		let current;
		const default_slot_template = /*#slots*/ ctx[3].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

		return {
			c() {
				div1 = element("div");
				p = element("p");
				t0 = text(/*title*/ ctx[1]);
				t1 = space();
				div0 = element("div");
				if (default_slot) default_slot.c();
				attr(div1, "class", div1_class_value = baseClass$c + " " + baseClass$c + "--" + /*type*/ ctx[0]);
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				append(div1, p);
				append(p, t0);
				append(div1, t1);
				append(div1, div0);

				if (default_slot) {
					default_slot.m(div0, null);
				}

				current = true;
			},
			p(ctx, [dirty]) {
				if (!current || dirty & /*title*/ 2) set_data(t0, /*title*/ ctx[1]);

				if (default_slot) {
					if (default_slot.p && dirty & /*$$scope*/ 4) {
						update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
					}
				}

				if (!current || dirty & /*type*/ 1 && div1_class_value !== (div1_class_value = baseClass$c + " " + baseClass$c + "--" + /*type*/ ctx[0])) {
					attr(div1, "class", div1_class_value);
				}
			},
			i(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div1);
				if (default_slot) default_slot.d(detaching);
			}
		};
	}

	const baseClass$c = "iif-footer-options-block";

	function instance$z($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		let { type } = $$props;

		// Get title
		let title;

		$$self.$$set = $$props => {
			if ("type" in $$props) $$invalidate(0, type = $$props.type);
			if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*type*/ 1) {
				 {
					const text = phrases.footerBlocks;

					$$invalidate(1, title = text[type] === void 0
					? type.split(" ").map(str => str.slice(0, 1).toUpperCase() + str.slice(1)).join(" ")
					: text[type]);
				}
			}
		};

		return [type, title, $$scope, slots];
	}

	class Block$2 extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$z, create_fragment$z, safe_not_equal, { type: 0 });
		}
	}

	/* src/icon-finder/components/footer/parts/props/color/Color.svelte generated by Svelte v3.29.4 */

	function create_if_block$m(ctx) {
		let block;
		let current;

		block = new Block$2({
				props: {
					type: "color",
					$$slots: { default: [create_default_slot$9] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const block_changes = {};

				if (dirty & /*$$scope, inputValue, value*/ 1029) {
					block_changes.$$scope = { dirty, ctx };
				}

				block.$set(block_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block, detaching);
			}
		};
	}

	// (70:1) <Block type="color">
	function create_default_slot$9(ctx) {
		let input;
		let current;

		input = new Input({
				props: {
					value: /*inputValue*/ ctx[2],
					placeholder: defaultColor,
					title: /*title*/ ctx[3],
					onInput: /*onInput*/ ctx[4],
					onBlur: /*onBlur*/ ctx[5],
					icon: /*value*/ ctx[0] === void 0 || /*value*/ ctx[0] === ""
					? "color"
					: "color-filled",
					extra: /*value*/ ctx[0] === void 0 ? "" : /*value*/ ctx[0],
					type: "color"
				}
			});

		return {
			c() {
				create_component(input.$$.fragment);
			},
			m(target, anchor) {
				mount_component(input, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const input_changes = {};
				if (dirty & /*inputValue*/ 4) input_changes.value = /*inputValue*/ ctx[2];

				if (dirty & /*value*/ 1) input_changes.icon = /*value*/ ctx[0] === void 0 || /*value*/ ctx[0] === ""
				? "color"
				: "color-filled";

				if (dirty & /*value*/ 1) input_changes.extra = /*value*/ ctx[0] === void 0 ? "" : /*value*/ ctx[0];
				input.$set(input_changes);
			},
			i(local) {
				if (current) return;
				transition_in(input.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(input.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(input, detaching);
			}
		};
	}

	function create_fragment$A(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*hasColor*/ ctx[1] && create_if_block$m(ctx);

		return {
			c() {
				if (if_block) if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				if (/*hasColor*/ ctx[1]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*hasColor*/ 2) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$m(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	function instance$A($$self, $$props, $$invalidate) {
		
		
		let { icons } = $$props;
		let { value } = $$props;
		let { customise } = $$props;

		// Check if at least one icon has color
		let hasColor;

		const title = phrases.footerBlocks.color;
		let lastValue = value;
		let inputValue = value;

		// Convert color to valid string
		function getColor(value, defaultValue) {
			const color = stringToColor(value);

			if (!color) {
				return defaultValue;
			}

			const cleanColor = colorToString(color);
			return cleanColor === "" ? defaultValue : cleanColor;
		}

		// Check input
		function onInput(newValue) {
			$$invalidate(2, inputValue = newValue);

			// Check for valid color
			if (newValue === "") {
				customise("color", "");
				return;
			}

			const validatedValue = getColor(newValue, null);

			if (validatedValue !== null) {
				// Change lastValue to avoid triggering component refresh
				$$invalidate(8, lastValue = $$invalidate(0, value = validatedValue));

				customise("color", validatedValue);
			}
		}

		// Reset to last valid value
		function onBlur() {
			// Set last value as input value
			$$invalidate(2, inputValue = value);
		}

		$$self.$$set = $$props => {
			if ("icons" in $$props) $$invalidate(6, icons = $$props.icons);
			if ("value" in $$props) $$invalidate(0, value = $$props.value);
			if ("customise" in $$props) $$invalidate(7, customise = $$props.customise);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*icons*/ 64) {
				 {
					$$invalidate(1, hasColor = false);

					for (let i = 0; i < icons.length; i++) {
						const data = Iconify__default['default'].getIcon(lib.iconToString(icons[i]));

						if (data && data.body.indexOf("currentColor") !== -1) {
							$$invalidate(1, hasColor = true);
							break;
						}
					}
				}
			}

			if ($$self.$$.dirty & /*lastValue, value*/ 257) {
				 {
					// Change inputValue when value changes
					if (lastValue !== value) {
						$$invalidate(8, lastValue = value);
						$$invalidate(2, inputValue = value);
					}
				}
			}
		};

		return [value, hasColor, inputValue, title, onInput, onBlur, icons, customise];
	}

	class Color extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$A, create_fragment$A, safe_not_equal, { icons: 6, value: 0, customise: 7 });
		}
	}

	/* src/icon-finder/components/footer/parts/props/size/SizeInput.svelte generated by Svelte v3.29.4 */

	function create_fragment$B(ctx) {
		let input;
		let current;

		input = new Input({
				props: {
					value: /*inputValue*/ ctx[3],
					placeholder: /*placeholder*/ ctx[1],
					title: /*title*/ ctx[2],
					onInput: /*onInput*/ ctx[4],
					onBlur: /*onBlur*/ ctx[5],
					icon: "icon-" + /*prop*/ ctx[0],
					type: "number"
				}
			});

		return {
			c() {
				create_component(input.$$.fragment);
			},
			m(target, anchor) {
				mount_component(input, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const input_changes = {};
				if (dirty & /*inputValue*/ 8) input_changes.value = /*inputValue*/ ctx[3];
				if (dirty & /*placeholder*/ 2) input_changes.placeholder = /*placeholder*/ ctx[1];
				if (dirty & /*title*/ 4) input_changes.title = /*title*/ ctx[2];
				if (dirty & /*prop*/ 1) input_changes.icon = "icon-" + /*prop*/ ctx[0];
				input.$set(input_changes);
			},
			i(local) {
				if (current) return;
				transition_in(input.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(input.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(input, detaching);
			}
		};
	}

	function instance$B($$self, $$props, $$invalidate) {
		
		let { prop } = $$props;
		let { value } = $$props;
		let { placeholder } = $$props;
		let { customise } = $$props;

		// Get title
		let title;

		let lastValue = value;
		let inputValue = value;

		// Check input
		function onInput(newValue) {
			$$invalidate(3, inputValue = newValue);

			// Clean up number: make sure it is empty or complete
			let cleanValue = newValue;

			if (newValue !== "") {
				const num = parseFloat(newValue);
				cleanValue = "" + num;

				if (isNaN(num) || cleanValue !== newValue || num <= 0) {
					return;
				}
			}

			customise(prop, cleanValue);
		}

		// Reset to last valid value
		function onBlur() {
			$$invalidate(3, inputValue = value);
		}

		$$self.$$set = $$props => {
			if ("prop" in $$props) $$invalidate(0, prop = $$props.prop);
			if ("value" in $$props) $$invalidate(6, value = $$props.value);
			if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
			if ("customise" in $$props) $$invalidate(7, customise = $$props.customise);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*prop*/ 1) {
				 {
					$$invalidate(2, title = phrases.footerBlocks[prop]);
				}
			}

			if ($$self.$$.dirty & /*lastValue, value*/ 320) {
				 {
					// Change inputValue when value changes
					if (lastValue !== value) {
						$$invalidate(8, lastValue = value);
						$$invalidate(3, inputValue = value);
					}
				}
			}
		};

		return [prop, placeholder, title, inputValue, onInput, onBlur, value, customise];
	}

	class SizeInput extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$B, create_fragment$B, safe_not_equal, {
				prop: 0,
				value: 6,
				placeholder: 1,
				customise: 7
			});
		}
	}

	/* src/icon-finder/components/footer/parts/props/size/Size.svelte generated by Svelte v3.29.4 */

	function get_each_context$d(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[8] = list[i];
		child_ctx[10] = i;
		return child_ctx;
	}

	// (121:1) {#each props as prop, i (prop)}
	function create_each_block$d(key_1, ctx) {
		let first;
		let sizeinput;
		let current;

		sizeinput = new SizeInput({
				props: {
					prop: /*prop*/ ctx[8],
					value: /*customisations*/ ctx[0][/*prop*/ ctx[8]] + "",
					placeholder: /*placeholders*/ ctx[2][/*prop*/ ctx[8]],
					customise: /*customise*/ ctx[1]
				}
			});

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				create_component(sizeinput.$$.fragment);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				mount_component(sizeinput, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const sizeinput_changes = {};
				if (dirty & /*customisations*/ 1) sizeinput_changes.value = /*customisations*/ ctx[0][/*prop*/ ctx[8]] + "";
				if (dirty & /*placeholders*/ 4) sizeinput_changes.placeholder = /*placeholders*/ ctx[2][/*prop*/ ctx[8]];
				if (dirty & /*customise*/ 2) sizeinput_changes.customise = /*customise*/ ctx[1];
				sizeinput.$set(sizeinput_changes);
			},
			i(local) {
				if (current) return;
				transition_in(sizeinput.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(sizeinput.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(first);
				destroy_component(sizeinput, detaching);
			}
		};
	}

	// (120:0) <Block {type}>
	function create_default_slot$a(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value = /*props*/ ctx[4];
		const get_key = ctx => /*prop*/ ctx[8];

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$d(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$d(key, child_ctx));
		}

		return {
			c() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty$1();
			},
			m(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_1_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*props, customisations, placeholders, customise*/ 23) {
					const each_value = /*props*/ ctx[4];
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$d, each_1_anchor, get_each_context$d);
					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d(detaching);
				}

				if (detaching) detach(each_1_anchor);
			}
		};
	}

	function create_fragment$C(ctx) {
		let block;
		let current;

		block = new Block$2({
				props: {
					type: /*type*/ ctx[3],
					$$slots: { default: [create_default_slot$a] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const block_changes = {};

				if (dirty & /*$$scope, customisations, placeholders, customise*/ 2055) {
					block_changes.$$scope = { dirty, ctx };
				}

				block.$set(block_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block, detaching);
			}
		};
	}

	function instance$C($$self, $$props, $$invalidate) {
		
		
		let { icons } = $$props;
		let { customisations } = $$props;
		let { customise } = $$props;

		// Get customisation type (constants because they cannot be changed at run time)
		const type =  "size"
		;

		const props =  ["width", "height"]
		;

		const defaultSize = {
			width: defaultWidth,
			height: defaultHeight
		};

		let data;
		let placeholders;

		$$self.$$set = $$props => {
			if ("icons" in $$props) $$invalidate(5, icons = $$props.icons);
			if ("customisations" in $$props) $$invalidate(0, customisations = $$props.customisations);
			if ("customise" in $$props) $$invalidate(1, customise = $$props.customise);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*icons*/ 32) {
				 {
					// Get common width and height
					let width = 0;

					let height = 0;
					let hasWidth = true;
					let hasHeight = true;
					let ratio = 1;
					let hasRatio = true;

					icons.forEach(icon => {
						if (!hasWidth && !hasHeight) {
							return;
						}

						const name = lib.iconToString(icon);
						const data = Iconify__default['default'].getIcon(name);

						if (!data) {
							return;
						}

						if (!width) {
							// First icon
							width = data.width;

							height = data.height;
							ratio = width / height;
							return;
						}

						// Compare
						if (hasWidth && width !== data.width) {
							hasWidth = false;
						}

						if (hasHeight && height !== data.height) {
							hasHeight = false;
						}

						if (hasRatio && data.width / data.height !== ratio) {
							hasRatio = false;
						}
					});

					// Set data
					$$invalidate(6, data = {
						width: hasWidth ? width : 0,
						height: hasHeight ? height : 0,
						ratio: hasRatio ? ratio : 0
					});
				}
			}

			if ($$self.$$.dirty & /*customisations, data*/ 65) {
				 {
					$$invalidate(2, placeholders = { width: "", height: "" });

					// Check if icon is rotated
					const rotated = !!(customisations.rotate && customisations.rotate % 2 === 1);

					// Get placeholder for both sides
					if (data.ratio !== 0) {
						const keys = ["width", "height"];

						keys.forEach((key, index) => {
							const altKey = keys[1 - index];
							const placeholderKey = rotated ? altKey : key;
							let size = "";
							let scale = false;

							if (customisations[rotated ? key : altKey]) {
								// Another property is customised, use it for ratio
								size = customisations[rotated ? key : altKey];

								scale = true;
							} else if (defaultSize[key] !== "") {
								// Use default size, do not scale
								size = defaultSize[key];
							} else if (defaultSize[altKey] !== "") {
								// Use default size for other property
								size = defaultSize[altKey];

								scale = true;
							} else if (data[key]) {
								// Use icon size
								size = data[key];
							}

							// Scale placeholder using size ratio
							// console.log(`Size for ${key} is ${size}`);
							if (size !== "") {
								$$invalidate(
									2,
									placeholders[placeholderKey] = (scale
									? Iconify__default['default']._internal.calculateSize(size, key === "width" ? data.ratio : 1 / data.ratio)
									: size) + "",
									placeholders
								);
							}
						});
					}
				} // console.log('Placeholders:', JSON.stringify(placeholders));
			}
		};

		return [customisations, customise, placeholders, type, props, icons];
	}

	class Size extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$C, create_fragment$C, safe_not_equal, {
				icons: 5,
				customisations: 0,
				customise: 1
			});
		}
	}

	/* src/icon-finder/components/forms/OptionButton.svelte generated by Svelte v3.29.4 */

	function create_if_block$n(ctx) {
		let uiicon;
		let current;

		uiicon = new Icon({
				props: {
					icon: /*icon*/ ctx[0],
					onLoad: /*iconLoaded*/ ctx[5]
				}
			});

		return {
			c() {
				create_component(uiicon.$$.fragment);
			},
			m(target, anchor) {
				mount_component(uiicon, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const uiicon_changes = {};
				if (dirty & /*icon*/ 1) uiicon_changes.icon = /*icon*/ ctx[0];
				uiicon.$set(uiicon_changes);
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(uiicon, detaching);
			}
		};
	}

	function create_fragment$D(ctx) {
		let button;
		let t0;
		let span;
		let t1_value = (/*text*/ ctx[3] ? /*text*/ ctx[3] : /*title*/ ctx[2]) + "";
		let t1;
		let current;
		let mounted;
		let dispose;
		let if_block = /*icon*/ ctx[0] && create_if_block$n(ctx);

		return {
			c() {
				button = element("button");
				if (if_block) if_block.c();
				t0 = space();
				span = element("span");
				t1 = text(t1_value);
				attr(button, "class", /*className*/ ctx[4]);
				attr(button, "title", /*title*/ ctx[2]);
			},
			m(target, anchor) {
				insert(target, button, anchor);
				if (if_block) if_block.m(button, null);
				append(button, t0);
				append(button, span);
				append(span, t1);
				current = true;

				if (!mounted) {
					dispose = listen(button, "click", function () {
						if (is_function(/*onClick*/ ctx[1])) /*onClick*/ ctx[1].apply(this, arguments);
					});

					mounted = true;
				}
			},
			p(new_ctx, [dirty]) {
				ctx = new_ctx;

				if (/*icon*/ ctx[0]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*icon*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$n(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(button, t0);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				if ((!current || dirty & /*text, title*/ 12) && t1_value !== (t1_value = (/*text*/ ctx[3] ? /*text*/ ctx[3] : /*title*/ ctx[2]) + "")) set_data(t1, t1_value);

				if (!current || dirty & /*className*/ 16) {
					attr(button, "class", /*className*/ ctx[4]);
				}

				if (!current || dirty & /*title*/ 4) {
					attr(button, "title", /*title*/ ctx[2]);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(button);
				if (if_block) if_block.d();
				mounted = false;
				dispose();
			}
		};
	}

	const baseClass$d = "iif-option-button";

	function instance$D($$self, $$props, $$invalidate) {
		let { icon = "" } = $$props;
		let { onClick } = $$props;
		let { title } = $$props;
		let { text = null } = $$props;
		let { textOptional = false } = $$props;
		let { status = "" } = $$props;

		// Icon status
		let hasIcon = false;

		function iconLoaded() {
			$$invalidate(8, hasIcon = true);
		}

		let className;

		$$self.$$set = $$props => {
			if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
			if ("onClick" in $$props) $$invalidate(1, onClick = $$props.onClick);
			if ("title" in $$props) $$invalidate(2, title = $$props.title);
			if ("text" in $$props) $$invalidate(3, text = $$props.text);
			if ("textOptional" in $$props) $$invalidate(6, textOptional = $$props.textOptional);
			if ("status" in $$props) $$invalidate(7, status = $$props.status);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*hasIcon, text, textOptional, status*/ 456) {
				 {
					$$invalidate(4, className = baseClass$d + " " + baseClass$d + (hasIcon ? "--with-icon" : "--without-icon") + " " + baseClass$d + (text && !textOptional || !hasIcon
					? "--with-text"
					: "--without-text") + (status === "" ? "" : " " + baseClass$d + "--" + status));
				}
			}
		};

		return [icon, onClick, title, text, className, iconLoaded, textOptional, status];
	}

	class OptionButton extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$D, create_fragment$D, safe_not_equal, {
				icon: 0,
				onClick: 1,
				title: 2,
				text: 3,
				textOptional: 6,
				status: 7
			});
		}
	}

	/* src/icon-finder/components/footer/parts/props/rotate/Rotate.svelte generated by Svelte v3.29.4 */

	function get_each_context$e(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[6] = list[i].count;
		child_ctx[7] = list[i].key;
		child_ctx[9] = i;
		return child_ctx;
	}

	// (45:1) {#each list as { count, key }
	function create_each_block$e(key_1, ctx) {
		let first;
		let button;
		let current;

		function func(...args) {
			return /*func*/ ctx[5](/*count*/ ctx[6], ...args);
		}

		button = new OptionButton({
				props: {
					icon: "rotate" + /*count*/ ctx[6],
					title: /*buttonPhrases*/ ctx[2].rotateTitle.replace("{num}", /*count*/ ctx[6] * 90 + ""),
					text: /*buttonPhrases*/ ctx[2].rotate.replace("{num}", /*count*/ ctx[6] * 90 + ""),
					status: /*value*/ ctx[0] === /*count*/ ctx[6]
					? "checked"
					: "unchecked",
					onClick: func
				}
			});

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				create_component(button.$$.fragment);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				mount_component(button, target, anchor);
				current = true;
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				const button_changes = {};
				if (dirty & /*list*/ 2) button_changes.icon = "rotate" + /*count*/ ctx[6];
				if (dirty & /*list*/ 2) button_changes.title = /*buttonPhrases*/ ctx[2].rotateTitle.replace("{num}", /*count*/ ctx[6] * 90 + "");
				if (dirty & /*list*/ 2) button_changes.text = /*buttonPhrases*/ ctx[2].rotate.replace("{num}", /*count*/ ctx[6] * 90 + "");

				if (dirty & /*value, list*/ 3) button_changes.status = /*value*/ ctx[0] === /*count*/ ctx[6]
				? "checked"
				: "unchecked";

				if (dirty & /*list*/ 2) button_changes.onClick = func;
				button.$set(button_changes);
			},
			i(local) {
				if (current) return;
				transition_in(button.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(button.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(first);
				destroy_component(button, detaching);
			}
		};
	}

	// (44:0) <Block type="rotate">
	function create_default_slot$b(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value = /*list*/ ctx[1];
		const get_key = ctx => /*key*/ ctx[7];

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$e(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$e(key, child_ctx));
		}

		return {
			c() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty$1();
			},
			m(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_1_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*list, buttonPhrases, value, rotateClicked*/ 15) {
					const each_value = /*list*/ ctx[1];
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$e, each_1_anchor, get_each_context$e);
					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d(detaching);
				}

				if (detaching) detach(each_1_anchor);
			}
		};
	}

	function create_fragment$E(ctx) {
		let block;
		let current;

		block = new Block$2({
				props: {
					type: "rotate",
					$$slots: { default: [create_default_slot$b] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const block_changes = {};

				if (dirty & /*$$scope, list, value*/ 1027) {
					block_changes.$$scope = { dirty, ctx };
				}

				block.$set(block_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block, detaching);
			}
		};
	}

	function addItem(count, selected, temp) {
		return {
			count,
			key: count + "-" + temp,
			selected,
			temp
		};
	}

	function instance$E($$self, $$props, $$invalidate) {
		
		let { value } = $$props;
		let { customise } = $$props;

		// Get text
		const buttonPhrases = phrases.footerOptionButtons;

		let list;

		function rotateClicked(count) {
			if (!count && !value) {
				return;
			}

			customise("rotate", count === value ? 0 : count);
		}

		const func = count => rotateClicked(count);

		$$self.$$set = $$props => {
			if ("value" in $$props) $$invalidate(0, value = $$props.value);
			if ("customise" in $$props) $$invalidate(4, customise = $$props.customise);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*list, value*/ 3) {
				 {
					const newList = [];

					for (let i = 0; i < 4; i++) {
						if (list && list[i] && value !== i) {
							// Not selected and exists: keep old item to avoid re-render
							const oldItem = list[i];

							oldItem.selected = false;
							newList.push(oldItem);
						} else {
							// Update key to force re-render
							newList.push(addItem(i, value === i, list && list[i] ? list[i].temp + 1 : 0));
						}
					}

					$$invalidate(1, list = newList);
				}
			}
		};

		return [value, list, buttonPhrases, rotateClicked, customise, func];
	}

	class Rotate extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$E, create_fragment$E, safe_not_equal, { value: 0, customise: 4 });
		}
	}

	/* src/icon-finder/components/footer/parts/props/flip/Flip.svelte generated by Svelte v3.29.4 */

	function get_each_context$f(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[6] = list[i];
		child_ctx[8] = i;
		return child_ctx;
	}

	// (32:1) {#each list as item, i (item.key)}
	function create_each_block$f(key_1, ctx) {
		let first;
		let button;
		let current;

		function func(...args) {
			return /*func*/ ctx[4](/*item*/ ctx[6], ...args);
		}

		button = new OptionButton({
				props: {
					icon: /*item*/ ctx[6].icon,
					title: /*item*/ ctx[6].title,
					status: /*customisations*/ ctx[0][/*item*/ ctx[6].prop]
					? "checked"
					: "unchecked",
					onClick: func
				}
			});

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				create_component(button.$$.fragment);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				mount_component(button, target, anchor);
				current = true;
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				const button_changes = {};
				if (dirty & /*list*/ 2) button_changes.icon = /*item*/ ctx[6].icon;
				if (dirty & /*list*/ 2) button_changes.title = /*item*/ ctx[6].title;

				if (dirty & /*customisations, list*/ 3) button_changes.status = /*customisations*/ ctx[0][/*item*/ ctx[6].prop]
				? "checked"
				: "unchecked";

				if (dirty & /*list*/ 2) button_changes.onClick = func;
				button.$set(button_changes);
			},
			i(local) {
				if (current) return;
				transition_in(button.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(button.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(first);
				destroy_component(button, detaching);
			}
		};
	}

	// (31:0) <Block type="flip">
	function create_default_slot$c(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value = /*list*/ ctx[1];
		const get_key = ctx => /*item*/ ctx[6].key;

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$f(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$f(key, child_ctx));
		}

		return {
			c() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty$1();
			},
			m(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_1_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*list, customisations, flipClicked*/ 7) {
					const each_value = /*list*/ ctx[1];
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$f, each_1_anchor, get_each_context$f);
					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d(detaching);
				}

				if (detaching) detach(each_1_anchor);
			}
		};
	}

	function create_fragment$F(ctx) {
		let block;
		let current;

		block = new Block$2({
				props: {
					type: "flip",
					$$slots: { default: [create_default_slot$c] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const block_changes = {};

				if (dirty & /*$$scope, list, customisations*/ 515) {
					block_changes.$$scope = { dirty, ctx };
				}

				block.$set(block_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block, detaching);
			}
		};
	}

	function instance$F($$self, $$props, $$invalidate) {
		
		let { customisations } = $$props;
		let { customise } = $$props;
		let list;

		function addItem(key, selected) {
			const prop = key + "Flip";

			return {
				prop,
				icon: key + "-flip",
				key: key + "Flip" + (selected ? "!" : ""),
				title: phrases.footerOptionButtons[prop]
			};
		}

		// Toggle
		function flipClicked(type) {
			customise(type, !customisations[type]);
		}

		const func = item => flipClicked(item.prop);

		$$self.$$set = $$props => {
			if ("customisations" in $$props) $$invalidate(0, customisations = $$props.customisations);
			if ("customise" in $$props) $$invalidate(3, customise = $$props.customise);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*customisations*/ 1) {
				 {
					$$invalidate(1, list = [addItem("h", customisations.hFlip), addItem("v", customisations.vFlip)]);
				}
			}
		};

		return [customisations, list, flipClicked, customise, func];
	}

	class Flip extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$F, create_fragment$F, safe_not_equal, { customisations: 0, customise: 3 });
		}
	}

	/* src/icon-finder/components/footer/parts/props/inline/Inline.svelte generated by Svelte v3.29.4 */

	function get_each_context$g(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[5] = list[i].mode;
		child_ctx[6] = list[i].inline;
		child_ctx[7] = list[i].key;
		child_ctx[9] = i;
		return child_ctx;
	}

	// (45:1) {#each list as { mode, inline, key }
	function create_each_block$g(key_1, ctx) {
		let first;
		let button;
		let current;

		button = new OptionButton({
				props: {
					icon: "mode-" + /*mode*/ ctx[5],
					text: /*buttonPhrases*/ ctx[2][/*mode*/ ctx[5]],
					title: /*buttonPhrases*/ ctx[2][/*mode*/ ctx[5] + "Hint"],
					status: /*value*/ ctx[0] === /*inline*/ ctx[6]
					? "checked"
					: "unchecked",
					textOptional: true,
					onClick: /*inlineClicked*/ ctx[3]
				}
			});

		return {
			key: key_1,
			first: null,
			c() {
				first = empty$1();
				create_component(button.$$.fragment);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				mount_component(button, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const button_changes = {};
				if (dirty & /*list*/ 2) button_changes.icon = "mode-" + /*mode*/ ctx[5];
				if (dirty & /*list*/ 2) button_changes.text = /*buttonPhrases*/ ctx[2][/*mode*/ ctx[5]];
				if (dirty & /*list*/ 2) button_changes.title = /*buttonPhrases*/ ctx[2][/*mode*/ ctx[5] + "Hint"];

				if (dirty & /*value, list*/ 3) button_changes.status = /*value*/ ctx[0] === /*inline*/ ctx[6]
				? "checked"
				: "unchecked";

				button.$set(button_changes);
			},
			i(local) {
				if (current) return;
				transition_in(button.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(button.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(first);
				destroy_component(button, detaching);
			}
		};
	}

	// (44:0) <Block type="mode">
	function create_default_slot$d(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value = /*list*/ ctx[1];
		const get_key = ctx => /*key*/ ctx[7];

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$g(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$g(key, child_ctx));
		}

		return {
			c() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty$1();
			},
			m(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_1_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*list, buttonPhrases, value, inlineClicked*/ 15) {
					const each_value = /*list*/ ctx[1];
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$g, each_1_anchor, get_each_context$g);
					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d(detaching);
				}

				if (detaching) detach(each_1_anchor);
			}
		};
	}

	function create_fragment$G(ctx) {
		let block;
		let current;

		block = new Block$2({
				props: {
					type: "mode",
					$$slots: { default: [create_default_slot$d] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const block_changes = {};

				if (dirty & /*$$scope, list, value*/ 1027) {
					block_changes.$$scope = { dirty, ctx };
				}

				block.$set(block_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block, detaching);
			}
		};
	}

	function addItem$1(inline, selected, temp) {
		const mode = inline ? "inline" : "block";

		return {
			mode,
			inline,
			key: mode + temp,
			selected,
			temp
		};
	}

	function instance$G($$self, $$props, $$invalidate) {
		
		let { value } = $$props;
		let { customise } = $$props;

		// Phrases
		const buttonPhrases = phrases.footerOptionButtons;

		let list;

		function inlineClicked() {
			customise("inline", !value);
		}

		$$self.$$set = $$props => {
			if ("value" in $$props) $$invalidate(0, value = $$props.value);
			if ("customise" in $$props) $$invalidate(4, customise = $$props.customise);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*list, value*/ 3) {
				 {
					const newList = [];

					for (let i = 0; i < 2; i++) {
						const inline = !!i;

						if (list && list[i] && value !== inline) {
							// Not selected and exists: keep old item to avoid re-render
							const oldItem = list[i];

							oldItem.selected = false;
							newList.push(oldItem);
						} else {
							// Update key to force re-render
							newList.push(addItem$1(inline, value === inline, list && list[i] ? list[i].temp + 1 : 0));
						}
					}

					$$invalidate(1, list = newList);
				}
			}
		};

		return [value, list, buttonPhrases, inlineClicked, customise];
	}

	class Inline extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$G, create_fragment$G, safe_not_equal, { value: 0, customise: 4 });
		}
	}

	/**
	 * Configuration for API providers for code samples
	 */
	const codeConfig = {
	    providers: Object.create(null),
	    // Default configuration
	    defaultProvider: {
	        iconify: true,
	    },
	};
	// Add default provider
	codeConfig.providers[''] = {
	    // Show SVG framework
	    iconify: true,
	    // NPM packages for React, Vue, Svelte components
	    npm: '@iconify-icons/{prefix}',
	    file: '/{name}',
	};

	// Split numbers
	const unitsSplit = /([0-9]+[0-9.]*)/g;
	/**
	 * Capitalize string: split by dash and numbers
	 */
	function capitalize(str, split = '-') {
	    return str
	        .split(split)
	        .map((item) => {
	        return item
	            .split(unitsSplit)
	            .filter((item) => item.length > 0)
	            .map((item) => item.slice(0, 1).toUpperCase() + item.slice(1))
	            .join(' ');
	    })
	        .join(' ');
	}

	/**
	 * Raw code tabs
	 */
	const rawCodeTabs = [
	    {
	        lang: 'iconify',
	        mode: 'iconify',
	    },
	    {
	        tab: 'svg',
	        mode: 'raw',
	        children: [
	            {
	                lang: 'svg-raw',
	            },
	            {
	                lang: 'svg-box',
	            },
	            {
	                lang: 'svg-uri',
	            },
	        ],
	    },
	    {
	        tab: 'react',
	        children: [
	            {
	                lang: 'react-npm',
	                mode: 'npm',
	            },
	            {
	                lang: 'react-api',
	                mode: 'iconify',
	            },
	        ],
	    },
	    {
	        tab: 'vue',
	        mode: 'npm',
	        children: [
	            {
	                lang: 'vue3',
	            },
	            {
	                lang: 'vue2',
	            },
	        ],
	    },
	    {
	        lang: 'svelte',
	        mode: 'npm',
	    },
	];
	/**
	 * Get code tree
	 */
	function getCodeTree(config, phrases) {
	    const modes = {
	        raw: true,
	        iconify: config.iconify,
	        npm: !!config.npm,
	    };
	    const result = {
	        tree: [],
	        aliases: Object.create(null),
	        filters: {
	            type: 'filters',
	            filterType: 'code-tabs',
	            active: '',
	            filters: Object.create(null),
	        },
	        childFilters: Object.create(null),
	    };
	    rawCodeTabs.forEach((sourceItem) => {
	        if (sourceItem.mode && !modes[sourceItem.mode]) {
	            // Root item is disabled
	            return;
	        }
	        // Item without child items
	        if (typeof sourceItem.lang === 'string') {
	            const lang = sourceItem.lang;
	            const title = getCodeTitle(phrases, lang);
	            result.tree.push({
	                lang,
	                title,
	            });
	            result.filters.filters[lang] = {
	                title,
	            };
	            return;
	        }
	        // Test child items
	        const sourceTab = sourceItem;
	        const tab = sourceTab.tab;
	        // Test child items
	        const children = [];
	        sourceTab.children.forEach((childItem) => {
	            if (childItem.mode && !modes[childItem.mode]) {
	                return;
	            }
	            const lang = childItem.lang;
	            children.push({
	                lang,
	                title: getCodeTitle(phrases, lang),
	            });
	        });
	        let title;
	        let filters$1;
	        let lang;
	        switch (children.length) {
	            case 0:
	                return;
	            case 1:
	                // Move child item to root, use title from parent item
	                title = getCodeTitle(phrases, tab);
	                lang = children[0].lang;
	                result.tree.push({
	                    lang,
	                    title,
	                });
	                result.filters.filters[lang] = {
	                    title,
	                };
	                result.aliases[tab] = lang;
	                break;
	            default:
	                title = getCodeTitle(phrases, tab);
	                result.tree.push({
	                    tab,
	                    title,
	                    children,
	                });
	                result.filters.filters[tab] = {
	                    title,
	                };
	                // Create filters block
	                filters$1 = Object.create(null);
	                result.childFilters[tab] = {
	                    type: 'filters',
	                    filterType: 'code-tabs',
	                    active: '',
	                    filters: filters$1,
	                };
	                children.forEach((item) => {
	                    filters$1[item.lang] = {
	                        title: item.title,
	                    };
	                });
	                filters.autoIndexFilters(result.childFilters[tab]);
	        }
	    });
	    filters.autoIndexFilters(result.filters);
	    return result;
	}
	/**
	 * Filter code tabs
	 */
	function filterCodeTabs(codeTabs, selected) {
	    const result = {};
	    let found = false;
	    let selected2 = codeTabs.aliases[selected];
	    // Check tree for matches
	    for (let i = 0; i < codeTabs.tree.length; i++) {
	        const tab = codeTabs.tree[i];
	        if (typeof tab.lang === 'string') {
	            // Tab for language
	            const langTab = tab;
	            const key = langTab.lang;
	            if (key === selected || key === selected2) {
	                // Found match
	                found = true;
	                result.active = {
	                    key,
	                    title: tab.title,
	                };
	                result.root = result.active;
	                break;
	            }
	        }
	        else {
	            // Tab with child items
	            const tabTab = tab;
	            const key = tabTab.tab;
	            if (key === selected) {
	                // Tab matched: use first child
	                selected = tabTab.children[0].lang;
	            }
	            // Test child items
	            for (let j = 0; j < tabTab.children.length; j++) {
	                const childTab = tabTab.children[j];
	                const lang = childTab.lang;
	                if (lang === selected || lang === selected2) {
	                    // Child matched
	                    found = true;
	                    result.active = {
	                        key: lang,
	                        title: childTab.title,
	                    };
	                    result.child = result.active;
	                    result.root = {
	                        key,
	                        title: tabTab.title,
	                    };
	                    break;
	                }
	            }
	        }
	        if (found) {
	            break;
	        }
	    }
	    // Not found? Use first tab
	    if (!found) {
	        const firstTab = codeTabs.tree[0];
	        if (typeof firstTab.lang === 'string') {
	            const childTab = firstTab;
	            // Tab without child item
	            result.active = {
	                key: childTab.lang,
	                title: childTab.title,
	            };
	            result.root = result.active;
	        }
	        else {
	            // Tab with child item
	            const parentTab = firstTab;
	            const childTab = parentTab.children[0];
	            result.active = {
	                key: childTab.lang,
	                title: childTab.title,
	            };
	            result.root = {
	                key: parentTab.tab,
	                title: parentTab.title,
	            };
	            result.child = result.active;
	        }
	    }
	    return result;
	}
	/**
	 * Get title for code block
	 */
	function getCodeTitle(phrases, key) {
	    const titles = phrases.codeSamples.titles;
	    return titles[key] === void 0 ? capitalize(key) : titles[key];
	}

	/**
	 * Convert icon name to variable
	 */
	function varName(iconName) {
	    let name = '';
	    const parts = iconName.split('-');
	    parts.forEach((part, index) => {
	        name += index ? part.slice(0, 1).toUpperCase() + part.slice(1) : part;
	    });
	    if (name.charCodeAt(0) < 97 || name.charCodeAt(0) > 122) {
	        // Not a-z - add "icon" at start
	        name = 'icon' + name.slice(0, 1).toUpperCase() + name.slice(1);
	    }
	    else if (parts.length < 2) {
	        // Add "Icon" to avoid reserved keywords
	        name += 'Icon';
	    }
	    return name;
	}
	/**
	 * Check if string contains units
	 */
	function isNumber(value) {
	    return typeof value === 'number'
	        ? true
	        : typeof value === 'string'
	            ? !!value.match(/^\-?[0-9.]+$/)
	            : false;
	}
	/**
	 * Convert number to degrees string
	 */
	function degrees(value) {
	    return value * 90 + 'deg';
	}
	/**
	 * Convert value to string
	 */
	function toString(value) {
	    switch (typeof value) {
	        case 'number':
	            return value + '';
	        case 'string':
	            return value;
	        default:
	            return JSON.stringify(value);
	    }
	}
	/**
	 * List of attributes
	 */
	const baseCustomisationAttributes = [
	    'width',
	    'height',
	    'rotate',
	    'hFlip',
	    'vFlip',
	];
	const colorCustomisationAttributes = [
	    'color',
	].concat(baseCustomisationAttributes);
	const inlineCustomisationAttributes = [
	    'inline',
	].concat(baseCustomisationAttributes);
	const allCustomisationAttributes = [
	    'color',
	].concat(inlineCustomisationAttributes);
	/**
	 * Documentation
	 */
	const docsBase = 'https://docs.iconify.design/implementations/';
	/**
	 * Convert template to string
	 */
	function resolveTemplate(value, attr, customisations) {
	    return typeof value === 'string'
	        ? value.replace('{attr}', attr)
	        : value(attr, customisations);
	}
	/**
	 * Generate parsers
	 */
	function generateParsers() {
	    /**
	     * Add attributes to parsed attributes
	     */
	    function addRawAttr(list, key, value) {
	        list[key] = toString(value);
	    }
	    function addAttr(list, key, value) {
	        list[key] = {
	            key,
	            value,
	        };
	    }
	    function addDynamicAttr(list, key, anyValue, syntax) {
	        let value;
	        switch (typeof anyValue) {
	            case 'boolean':
	                value = anyValue ? 'true' : 'false';
	                break;
	            case 'object':
	                value = JSON.stringify(anyValue);
	                break;
	            default:
	                value = anyValue;
	        }
	        list[key] = {
	            key,
	            value,
	            syntax,
	        };
	    }
	    function addReactAttr(list, key, value) {
	        if (typeof value === 'string' && key !== 'icon') {
	            addAttr(list, key, value);
	        }
	        else {
	            addDynamicAttr(list, key, value, '{var}={{value}}');
	        }
	    }
	    function addVueAttr(list, key, value) {
	        if (typeof value === 'string' && key !== 'icon') {
	            addAttr(list, key, value);
	        }
	        else {
	            addDynamicAttr(list, key, value, ':{var}="{value}"');
	        }
	    }
	    /**
	     * Merge attribute values
	     */
	    function mergeAttr(list, key, value, separator) {
	        const oldItem = typeof list[key] === 'object'
	            ? list[key]
	            : void 0;
	        list[key] = {
	            key,
	            value: (oldItem ? oldItem.value + separator : '') + value,
	            syntax: oldItem ? oldItem.syntax : void 0,
	        };
	    }
	    /**
	     * Add functions for multiple attribute parsers
	     */
	    function addMultipleAttributeParsers(parser, attribs, callback) {
	        attribs.forEach((attr) => {
	            if (parser.parsers[attr] === void 0) {
	                parser.parsers[attr] = (list, value) => callback(list, attr, value);
	            }
	        });
	        return parser;
	    }
	    /**
	     * Merge result
	     */
	    function mergeAttributes(list) {
	        return Object.keys(list)
	            .map((key) => {
	            const item = list[key];
	            if (typeof item === 'object') {
	                return (typeof item.syntax === 'string'
	                    ? item.syntax
	                    : '{var}="{value}"')
	                    .replace('{var}', item.key)
	                    .replace('{value}', item.value);
	            }
	            return item;
	        })
	            .join(' ');
	    }
	    /**
	     * Generate all parsers
	     */
	    // SVG framework
	    const iconifyParser = {
	        init: (customisations) => {
	            return {
	                class: 'class="' +
	                    (customisations.inline ? 'iconify-inline' : 'iconify') +
	                    '"',
	            };
	        },
	        iconParser: (list, valueStr, valueIcon) => addAttr(list, 'data-icon', valueStr),
	        parsers: {
	            color: (list, value) => mergeAttr(list, 'style', 'color: ' + value + ';', ' '),
	            onlyHeight: (list, value) => mergeAttr(list, 'style', 'font-size: ' + value + (isNumber(value) ? 'px;' : ';'), ' '),
	            width: (list, value) => addAttr(list, 'data-width', toString(value)),
	            height: (list, value) => addAttr(list, 'data-height', toString(value)),
	            rotate: (list, value) => addAttr(list, 'data-rotate', degrees(value)),
	            hFlip: (list) => mergeAttr(list, 'data-flip', 'horizontal', ','),
	            vFlip: (list) => mergeAttr(list, 'data-flip', 'vertical', ','),
	        },
	        merge: mergeAttributes,
	        template: '<span {attr}></span>',
	        docs: {
	            type: 'iconify',
	            href: docsBase + 'svg-framework/',
	        },
	    };
	    // React
	    const reactNPMParser = {
	        iconParser: (list, valueStr, valueIcon) => addReactAttr(list, 'icon', varName(valueIcon.name)),
	        parsers: {},
	        merge: mergeAttributes,
	        template: (attr, customisations) => '<' +
	            (customisations.inline ? 'InlineIcon' : 'Icon') +
	            ' ' +
	            attr +
	            ' />',
	        docs: {
	            type: 'react',
	            href: docsBase + 'react/',
	        },
	        npm: {
	            install: '@iconify/react@beta',
	            import: (attr, customisations) => 'import { ' +
	                (customisations.inline ? 'InlineIcon' : 'Icon') +
	                " } from '@iconify/react';",
	        },
	    };
	    const reactAPIParser = {
	        iconParser: (list, valueStr, valueIcon) => addAttr(list, 'icon', valueStr),
	        parsers: {},
	        merge: mergeAttributes,
	        template: reactNPMParser.template,
	        docs: {
	            type: 'react',
	            href: docsBase + 'react-with-api/',
	        },
	        npm: {
	            install: '@iconify/react-with-api',
	            import: (attr, customisations) => 'import { ' +
	                (customisations.inline ? 'InlineIcon' : 'Icon') +
	                " } from '@iconify/react-with-api';",
	        },
	    };
	    addMultipleAttributeParsers(reactNPMParser, colorCustomisationAttributes, addReactAttr);
	    addMultipleAttributeParsers(reactAPIParser, colorCustomisationAttributes, addReactAttr);
	    // Vue
	    const vue2Usage = '<template>\n\t<IconifyIcon {attr} />\n</template>';
	    const vue2Template = 'export default {\n\tcomponents: {\n\t\tIconifyIcon,\n\t},\n\tdata() {\n\t\treturn {\n\t\t\ticons: {\n\t\t\t\t{varName},\n\t\t\t},\n\t\t};\n\t},\n});';
	    const vueParser = {
	        iconParser: (list, valueStr, valueIcon) => addVueAttr(list, 'icon', 'icons.' + varName(valueIcon.name)),
	        parsers: {
	            hFlip: (list, value) => addVueAttr(list, 'horizontalFlip', value),
	            vFlip: (list, value) => addVueAttr(list, 'verticalFlip', value),
	        },
	        merge: mergeAttributes,
	        template: (attr, customisations) => vue2Usage
	            .replace(/IconifyIcon/g, customisations.inline ? 'InlineIcon' : 'Icon')
	            .replace('{attr}', attr),
	        vueTemplate: (attr, customisations) => vue2Template
	            .replace(/IconifyIcon/g, customisations.inline ? 'InlineIcon' : 'Icon')
	            .replace('{attr}', attr),
	        docs: {
	            type: 'vue',
	            href: docsBase + 'vue/',
	        },
	        npm: {
	            install: '@iconify/vue@beta',
	            import: (attr, customisations) => 'import { ' +
	                (customisations.inline ? 'InlineIcon' : 'Icon') +
	                " } from '@iconify/vue';",
	        },
	    };
	    addMultipleAttributeParsers(vueParser, colorCustomisationAttributes, addVueAttr);
	    const vue2Parser = Object.assign({}, vueParser, {
	        docs: {
	            type: 'vue',
	            href: docsBase + 'vue2/',
	        },
	        npm: {
	            install: '@iconify/vue@^1',
	            import: "import IconifyIcon from '@iconify/vue';",
	        },
	        parsers: Object.assign({
	            inline: (list, value) => addVueAttr(list, 'inline', value),
	        }, vueParser.parsers),
	        template: vue2Usage,
	        vueTemplate: vue2Template,
	    });
	    // Svelte
	    const svelteParser = {
	        iconParser: (list, valueStr, valueIcon) => addReactAttr(list, 'icon', varName(valueIcon.name)),
	        parsers: {},
	        merge: mergeAttributes,
	        template: '<IconifyIcon {attr} />',
	        docs: {
	            type: 'svelte',
	            href: docsBase + 'svelte/',
	        },
	        npm: {
	            install: '@iconify/svelte',
	            import: "import IconifyIcon from '@iconify/svelte';",
	        },
	    };
	    addMultipleAttributeParsers(svelteParser, allCustomisationAttributes, addReactAttr);
	    // SVG
	    const svgParser = {
	        parsers: {},
	    };
	    addMultipleAttributeParsers(svgParser, inlineCustomisationAttributes, addRawAttr);
	    // Merge all parsers
	    const parsers = {
	        'iconify': iconifyParser,
	        'svg-raw': svgParser,
	        'svg-box': svgParser,
	        'svg-uri': svgParser,
	        'react-npm': reactNPMParser,
	        'react-api': reactAPIParser,
	        'vue2': vue2Parser,
	        'vue3': vueParser,
	        'svelte': svelteParser,
	    };
	    return parsers;
	}
	const parsers = generateParsers();
	const codeOutputComponentKeys = [
	    'install',
	    'install1',
	    'import',
	    'import1',
	    'vue',
	    'use',
	];
	/**
	 * Get code for icon
	 */
	function getIconCode(lang, icon, customisations, providerConfig) {
	    function npmIconImport() {
	        const name = varName(icon.name);
	        return {
	            name,
	            package: providerConfig.npm.replace('{prefix}', icon.prefix),
	            file: providerConfig.file.replace('{name}', icon.name),
	        };
	    }
	    if (parsers[lang] === void 0) {
	        return null;
	    }
	    const parser = parsers[lang];
	    // Icon as string
	    const iconName = lib.iconToString(icon);
	    // Init parser
	    const attr = parser.init ? parser.init(customisations) : {};
	    const attrParsers = parser.parsers;
	    // Add icon name
	    if (parser.iconParser) {
	        parser.iconParser(attr, iconName, icon);
	    }
	    // Add color
	    if (customisations.color !== '' && attrParsers.color) {
	        attrParsers.color(attr, customisations.color);
	    }
	    // Add dimensions
	    if (customisations.width === '' &&
	        customisations.height !== '' &&
	        attrParsers.onlyHeight) {
	        attrParsers.onlyHeight(attr, customisations.height);
	    }
	    else {
	        ['width', 'height'].forEach((prop) => {
	            const key = prop;
	            if (customisations[key] !== '' && attrParsers[key]) {
	                attrParsers[key](attr, customisations[key]);
	            }
	        });
	    }
	    // Transformations
	    ['rotate', 'vFlip', 'hFlip'].forEach((prop) => {
	        const key = prop;
	        if (customisations[key] && attrParsers[key]) {
	            attrParsers[key](attr, customisations[key]);
	        }
	    });
	    // Inline
	    if (customisations.inline && attrParsers.inline) {
	        attrParsers.inline(attr, true);
	    }
	    // Merge attributes
	    const merged = parser.merge ? parser.merge(attr) : '';
	    // Use template
	    const html = parser.template
	        ? resolveTemplate(parser.template, merged, customisations)
	        : '';
	    // Generate output
	    const output = {
	        docs: parser.docs,
	    };
	    // Add language specific stuff
	    let str;
	    let data;
	    let npm;
	    switch (lang) {
	        case 'iconify':
	            str = Iconify__default['default'].getVersion();
	            output.iconify = {
	                head: '<script src="https://code.iconify.design/' +
	                    str.split('.').shift() +
	                    '/' +
	                    str +
	                    '/iconify.min.js"><' +
	                    '/script>',
	                html,
	            };
	            break;
	        case 'svg-raw':
	        case 'svg-box':
	        case 'svg-uri':
	            str = Iconify__default['default'].renderHTML(iconName, attr);
	            if (customisations.color !== '') {
	                str = str.replace(/currentColor/g, customisations.color);
	            }
	            if (lang === 'svg-box') {
	                // Add empty rectangle before shapes
	                data = Iconify__default['default'].getIcon(iconName);
	                str = str.replace('>', '><rect x="' +
	                    data.left +
	                    '" y="' +
	                    data.top +
	                    '" width="' +
	                    data.width +
	                    '" height="' +
	                    data.height +
	                    '" fill="none" stroke="none" />');
	            }
	            if (lang === 'svg-uri') {
	                // Remove unused attributes
	                const parts = str.split('>');
	                let firstTag = parts.shift();
	                ['aria-hidden', 'focusable', 'role', 'class', 'style'].forEach((attr) => {
	                    firstTag = firstTag.replace(new RegExp('\\s' + attr + '="[^"]*"'), '');
	                });
	                parts.unshift(firstTag);
	                str = parts.join('>');
	                // Encode
	                str =
	                    "url('data:image/svg+xml," + encodeURIComponent(str) + "')";
	            }
	            output.raw = [str];
	            break;
	        case 'react-npm':
	        case 'svelte':
	        case 'vue2':
	        case 'vue3':
	            if (!parser.npm || !providerConfig.npm) {
	                break;
	            }
	            npm = npmIconImport();
	            output.component = {
	                install: 'npm install --save-dev ' +
	                    parser.npm.install +
	                    ' ' +
	                    npm.package,
	                import: resolveTemplate(parser.npm.import, merged, customisations) +
	                    '\nimport ' +
	                    npm.name +
	                    " from '" +
	                    npm.package +
	                    npm.file +
	                    "';",
	                use: html
	                    .replace(/{varName}/g, npm.name)
	                    .replace('{iconPackage}', npm.package + npm.file),
	            };
	            if (typeof parser.vueTemplate === 'string') {
	                output.component.vue = parser.vueTemplate
	                    .replace(/{varName}/g, npm.name)
	                    .replace('{iconPackage}', npm.package + npm.file);
	            }
	            break;
	        case 'react-api':
	            if (!parser.npm) {
	                break;
	            }
	            output.component = {
	                install1: 'npm install --save-dev ' + parser.npm.install,
	                import1: resolveTemplate(parser.npm.import, merged, customisations),
	                use: html,
	            };
	            break;
	    }
	    // Add line-md stylesheet
	    if (lang !== 'svg-uri') {
	        // Add link to footer
	        output.footer = {
	            text: 'Do not forget to add stylesheet to your page if you want animated icons:',
	            code: '<link rel="stylesheet" href="https://code.iconify.design/css/line-md.css">',
	        };
	        // Modify code
	        if (output.component) {
	            if (typeof output.component.use === 'string') {
	                // Add class
	                output.component.use = output.component.use
	                    // Rect and Svelte
	                    .replace('Icon icon={', 'Icon class' +
	                    (lang === 'svelte' ? '' : 'Name') +
	                    '="iconify--line-md" icon={')
	                    // Vue
	                    .replace('Icon :icon', 'Icon class="iconify--line-md" :icon');
	            }
	        }
	    }
	    return output;
	}

	/* src/icon-finder/components/footer/parts/code/Sample.svelte generated by Svelte v3.29.4 */

	function create_if_block$o(ctx) {
		let div;
		let uiicon;
		let t0;
		let t1_value = /*text*/ ctx[3].copied + "";
		let t1;
		let div_class_value;
		let current;
		uiicon = new Icon({ props: { icon: "confirm" } });

		return {
			c() {
				div = element("div");
				create_component(uiicon.$$.fragment);
				t0 = space();
				t1 = text(t1_value);
				attr(div, "class", div_class_value = baseClassName + "-notice");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				mount_component(uiicon, div, null);
				append(div, t0);
				append(div, t1);
				current = true;
			},
			p: noop,
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				destroy_component(uiicon);
			}
		};
	}

	function create_fragment$H(ctx) {
		let div1;
		let div0;
		let t0;
		let div0_class_value;
		let t1;
		let a;
		let uiicon;
		let a_title_value;
		let t2;
		let current;
		let mounted;
		let dispose;
		uiicon = new Icon({ props: { icon: "clipboard" } });
		let if_block = /*notice*/ ctx[1] > 0 && create_if_block$o(ctx);

		return {
			c() {
				div1 = element("div");
				div0 = element("div");
				t0 = text(/*content*/ ctx[0]);
				t1 = space();
				a = element("a");
				create_component(uiicon.$$.fragment);
				t2 = space();
				if (if_block) if_block.c();
				attr(div0, "class", div0_class_value = baseClassName + "-content");
				attr(a, "title", a_title_value = /*text*/ ctx[3].copy);
				attr(a, "href", "# ");
				attr(div1, "class", /*className*/ ctx[2]);
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, t0);
				append(div1, t1);
				append(div1, a);
				mount_component(uiicon, a, null);
				append(div1, t2);
				if (if_block) if_block.m(div1, null);
				current = true;

				if (!mounted) {
					dispose = listen(a, "click", prevent_default(/*copy*/ ctx[4]));
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (!current || dirty & /*content*/ 1) set_data(t0, /*content*/ ctx[0]);

				if (/*notice*/ ctx[1] > 0) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*notice*/ 2) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$o(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(div1, null);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				if (!current || dirty & /*className*/ 4) {
					attr(div1, "class", /*className*/ ctx[2]);
				}
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div1);
				destroy_component(uiicon);
				if (if_block) if_block.d();
				mounted = false;
				dispose();
			}
		};
	}

	const baseClassName = "iif-input-sample";

	function instance$H($$self, $$props, $$invalidate) {
		let { content } = $$props;
		const text = phrases.codeSamples;

		// Notice counter
		let notice = 0;

		let className = baseClassName;

		/**
	 * Copy code to clipboard
	 */
		function copy() {
			const node = document.body;
			const textarea = document.createElement("textarea");
			const style = textarea.style;
			textarea.value = content;
			style.position = "absolute";

			try {
				style.left = window.pageXOffset + "px";
				style.top = window.pageYOffset + "px";
			} catch(err) {
				
			}

			style.height = "0";
			node.appendChild(textarea);
			textarea.focus();
			textarea.select();
			let copied = false;

			try {
				// Modern way
				if (!document.execCommand || !document.execCommand("copy")) {
					const w = window;

					if (w.clipboardData) {
						w.clipboardData.setData("Text", content);
						copied = true;
					}
				} else {
					copied = true;
				}
			} catch(err) {
				
			}

			// Remove textarea on next tick
			setTimeout(() => {
				node.removeChild(textarea);
			});

			if (copied) {
				// Show notice
				$$invalidate(1, notice++, notice);

				// Remove notice after 2 seconds
				setTimeout(
					() => {
						if (notice) {
							$$invalidate(1, notice--, notice);
						}
					},
					2000
				);
			}
		}

		$$self.$$set = $$props => {
			if ("content" in $$props) $$invalidate(0, content = $$props.content);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*notice*/ 2) {
				 {
					$$invalidate(2, className = baseClassName + (notice > 0 ? " " + baseClassName + "--with-notice" : ""));
				}
			}
		};

		return [content, notice, className, text, copy];
	}

	class Sample extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$H, create_fragment$H, safe_not_equal, { content: 0 });
		}
	}

	/* src/icon-finder/components/footer/parts/code/Code.svelte generated by Svelte v3.29.4 */

	function get_each_context$h(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[9] = list[i];
		return child_ctx;
	}

	function get_each_context_1$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[12] = list[i];
		return child_ctx;
	}

	// (49:0) {#if output}
	function create_if_block$p(ctx) {
		let t0;
		let t1;
		let t2;
		let t3;
		let t4;
		let t5;
		let if_block6_anchor;
		let current;
		let if_block0 = /*output*/ ctx[2].header && create_if_block_10(ctx);
		let if_block1 = /*codePhrases*/ ctx[5].intro[/*mode*/ ctx[1]] && create_if_block_9(ctx);
		let if_block2 = /*output*/ ctx[2].iconify && create_if_block_8$1(ctx);
		let if_block3 = /*output*/ ctx[2].raw && create_if_block_7$1(ctx);
		let if_block4 = /*output*/ ctx[2].component && create_if_block_5$1(ctx);
		let if_block5 = /*output*/ ctx[2].footer && create_if_block_2$a(ctx);
		let if_block6 = /*output*/ ctx[2].docs && create_if_block_1$c(ctx);

		return {
			c() {
				if (if_block0) if_block0.c();
				t0 = space();
				if (if_block1) if_block1.c();
				t1 = space();
				if (if_block2) if_block2.c();
				t2 = space();
				if (if_block3) if_block3.c();
				t3 = space();
				if (if_block4) if_block4.c();
				t4 = space();
				if (if_block5) if_block5.c();
				t5 = space();
				if (if_block6) if_block6.c();
				if_block6_anchor = empty$1();
			},
			m(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, t0, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert(target, t1, anchor);
				if (if_block2) if_block2.m(target, anchor);
				insert(target, t2, anchor);
				if (if_block3) if_block3.m(target, anchor);
				insert(target, t3, anchor);
				if (if_block4) if_block4.m(target, anchor);
				insert(target, t4, anchor);
				if (if_block5) if_block5.m(target, anchor);
				insert(target, t5, anchor);
				if (if_block6) if_block6.m(target, anchor);
				insert(target, if_block6_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (/*output*/ ctx[2].header) {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty & /*output*/ 4) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_10(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(t0.parentNode, t0);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if (/*codePhrases*/ ctx[5].intro[/*mode*/ ctx[1]]) {
					if (if_block1) {
						if_block1.p(ctx, dirty);
					} else {
						if_block1 = create_if_block_9(ctx);
						if_block1.c();
						if_block1.m(t1.parentNode, t1);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (/*output*/ ctx[2].iconify) {
					if (if_block2) {
						if_block2.p(ctx, dirty);

						if (dirty & /*output*/ 4) {
							transition_in(if_block2, 1);
						}
					} else {
						if_block2 = create_if_block_8$1(ctx);
						if_block2.c();
						transition_in(if_block2, 1);
						if_block2.m(t2.parentNode, t2);
					}
				} else if (if_block2) {
					group_outros();

					transition_out(if_block2, 1, 1, () => {
						if_block2 = null;
					});

					check_outros();
				}

				if (/*output*/ ctx[2].raw) {
					if (if_block3) {
						if_block3.p(ctx, dirty);

						if (dirty & /*output*/ 4) {
							transition_in(if_block3, 1);
						}
					} else {
						if_block3 = create_if_block_7$1(ctx);
						if_block3.c();
						transition_in(if_block3, 1);
						if_block3.m(t3.parentNode, t3);
					}
				} else if (if_block3) {
					group_outros();

					transition_out(if_block3, 1, 1, () => {
						if_block3 = null;
					});

					check_outros();
				}

				if (/*output*/ ctx[2].component) {
					if (if_block4) {
						if_block4.p(ctx, dirty);

						if (dirty & /*output*/ 4) {
							transition_in(if_block4, 1);
						}
					} else {
						if_block4 = create_if_block_5$1(ctx);
						if_block4.c();
						transition_in(if_block4, 1);
						if_block4.m(t4.parentNode, t4);
					}
				} else if (if_block4) {
					group_outros();

					transition_out(if_block4, 1, 1, () => {
						if_block4 = null;
					});

					check_outros();
				}

				if (/*output*/ ctx[2].footer) {
					if (if_block5) {
						if_block5.p(ctx, dirty);

						if (dirty & /*output*/ 4) {
							transition_in(if_block5, 1);
						}
					} else {
						if_block5 = create_if_block_2$a(ctx);
						if_block5.c();
						transition_in(if_block5, 1);
						if_block5.m(t5.parentNode, t5);
					}
				} else if (if_block5) {
					group_outros();

					transition_out(if_block5, 1, 1, () => {
						if_block5 = null;
					});

					check_outros();
				}

				if (/*output*/ ctx[2].docs) {
					if (if_block6) {
						if_block6.p(ctx, dirty);

						if (dirty & /*output*/ 4) {
							transition_in(if_block6, 1);
						}
					} else {
						if_block6 = create_if_block_1$c(ctx);
						if_block6.c();
						transition_in(if_block6, 1);
						if_block6.m(if_block6_anchor.parentNode, if_block6_anchor);
					}
				} else if (if_block6) {
					group_outros();

					transition_out(if_block6, 1, 1, () => {
						if_block6 = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block2);
				transition_in(if_block3);
				transition_in(if_block4);
				transition_in(if_block5);
				transition_in(if_block6);
				current = true;
			},
			o(local) {
				transition_out(if_block0);
				transition_out(if_block2);
				transition_out(if_block3);
				transition_out(if_block4);
				transition_out(if_block5);
				transition_out(if_block6);
				current = false;
			},
			d(detaching) {
				if (if_block0) if_block0.d(detaching);
				if (detaching) detach(t0);
				if (if_block1) if_block1.d(detaching);
				if (detaching) detach(t1);
				if (if_block2) if_block2.d(detaching);
				if (detaching) detach(t2);
				if (if_block3) if_block3.d(detaching);
				if (detaching) detach(t3);
				if (if_block4) if_block4.d(detaching);
				if (detaching) detach(t4);
				if (if_block5) if_block5.d(detaching);
				if (detaching) detach(t5);
				if (if_block6) if_block6.d(detaching);
				if (detaching) detach(if_block6_anchor);
			}
		};
	}

	// (50:1) {#if output.header}
	function create_if_block_10(ctx) {
		let t;
		let if_block1_anchor;
		let current;
		let if_block0 = /*output*/ ctx[2].header.text && create_if_block_12(ctx);
		let if_block1 = /*output*/ ctx[2].header.code && create_if_block_11(ctx);

		return {
			c() {
				if (if_block0) if_block0.c();
				t = space();
				if (if_block1) if_block1.c();
				if_block1_anchor = empty$1();
			},
			m(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, t, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert(target, if_block1_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (/*output*/ ctx[2].header.text) {
					if (if_block0) {
						if_block0.p(ctx, dirty);
					} else {
						if_block0 = create_if_block_12(ctx);
						if_block0.c();
						if_block0.m(t.parentNode, t);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (/*output*/ ctx[2].header.code) {
					if (if_block1) {
						if_block1.p(ctx, dirty);

						if (dirty & /*output*/ 4) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block_11(ctx);
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block1);
				current = true;
			},
			o(local) {
				transition_out(if_block1);
				current = false;
			},
			d(detaching) {
				if (if_block0) if_block0.d(detaching);
				if (detaching) detach(t);
				if (if_block1) if_block1.d(detaching);
				if (detaching) detach(if_block1_anchor);
			}
		};
	}

	// (51:2) {#if output.header.text}
	function create_if_block_12(ctx) {
		let p;
		let t_value = /*output*/ ctx[2].header.text + "";
		let t;

		return {
			c() {
				p = element("p");
				t = text(t_value);
			},
			m(target, anchor) {
				insert(target, p, anchor);
				append(p, t);
			},
			p(ctx, dirty) {
				if (dirty & /*output*/ 4 && t_value !== (t_value = /*output*/ ctx[2].header.text + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) detach(p);
			}
		};
	}

	// (54:2) {#if output.header.code}
	function create_if_block_11(ctx) {
		let sampleinput;
		let current;

		sampleinput = new Sample({
				props: { content: /*output*/ ctx[2].header.code }
			});

		return {
			c() {
				create_component(sampleinput.$$.fragment);
			},
			m(target, anchor) {
				mount_component(sampleinput, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const sampleinput_changes = {};
				if (dirty & /*output*/ 4) sampleinput_changes.content = /*output*/ ctx[2].header.code;
				sampleinput.$set(sampleinput_changes);
			},
			i(local) {
				if (current) return;
				transition_in(sampleinput.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(sampleinput.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(sampleinput, detaching);
			}
		};
	}

	// (59:1) {#if codePhrases.intro[mode]}
	function create_if_block_9(ctx) {
		let p;
		let t_value = /*codePhrases*/ ctx[5].intro[/*mode*/ ctx[1]] + "";
		let t;

		return {
			c() {
				p = element("p");
				t = text(t_value);
			},
			m(target, anchor) {
				insert(target, p, anchor);
				append(p, t);
			},
			p(ctx, dirty) {
				if (dirty & /*mode*/ 2 && t_value !== (t_value = /*codePhrases*/ ctx[5].intro[/*mode*/ ctx[1]] + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) detach(p);
			}
		};
	}

	// (63:1) {#if output.iconify}
	function create_if_block_8$1(ctx) {
		let p0;
		let t0_value = /*codePhrases*/ ctx[5].iconify.intro1.replace("{name}", /*icon*/ ctx[0].name) + "";
		let t0;
		let t1;
		let sampleinput0;
		let t2;
		let p1;
		let t4;
		let p2;
		let t6;
		let sampleinput1;
		let current;

		sampleinput0 = new Sample({
				props: { content: /*output*/ ctx[2].iconify.html }
			});

		sampleinput1 = new Sample({
				props: { content: /*output*/ ctx[2].iconify.head }
			});

		return {
			c() {
				p0 = element("p");
				t0 = text(t0_value);
				t1 = space();
				create_component(sampleinput0.$$.fragment);
				t2 = space();
				p1 = element("p");
				p1.textContent = `${/*codePhrases*/ ctx[5].iconify.intro2}`;
				t4 = space();
				p2 = element("p");
				p2.textContent = `${/*codePhrases*/ ctx[5].iconify.head}`;
				t6 = space();
				create_component(sampleinput1.$$.fragment);
			},
			m(target, anchor) {
				insert(target, p0, anchor);
				append(p0, t0);
				insert(target, t1, anchor);
				mount_component(sampleinput0, target, anchor);
				insert(target, t2, anchor);
				insert(target, p1, anchor);
				insert(target, t4, anchor);
				insert(target, p2, anchor);
				insert(target, t6, anchor);
				mount_component(sampleinput1, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if ((!current || dirty & /*icon*/ 1) && t0_value !== (t0_value = /*codePhrases*/ ctx[5].iconify.intro1.replace("{name}", /*icon*/ ctx[0].name) + "")) set_data(t0, t0_value);
				const sampleinput0_changes = {};
				if (dirty & /*output*/ 4) sampleinput0_changes.content = /*output*/ ctx[2].iconify.html;
				sampleinput0.$set(sampleinput0_changes);
				const sampleinput1_changes = {};
				if (dirty & /*output*/ 4) sampleinput1_changes.content = /*output*/ ctx[2].iconify.head;
				sampleinput1.$set(sampleinput1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(sampleinput0.$$.fragment, local);
				transition_in(sampleinput1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(sampleinput0.$$.fragment, local);
				transition_out(sampleinput1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(p0);
				if (detaching) detach(t1);
				destroy_component(sampleinput0, detaching);
				if (detaching) detach(t2);
				if (detaching) detach(p1);
				if (detaching) detach(t4);
				if (detaching) detach(p2);
				if (detaching) detach(t6);
				destroy_component(sampleinput1, detaching);
			}
		};
	}

	// (71:1) {#if output.raw}
	function create_if_block_7$1(ctx) {
		let each_1_anchor;
		let current;
		let each_value_1 = /*output*/ ctx[2].raw;
		let each_blocks = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		return {
			c() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty$1();
			},
			m(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_1_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*output*/ 4) {
					each_value_1 = /*output*/ ctx[2].raw;
					let i;

					for (i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block_1$1(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value_1.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value_1.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				destroy_each(each_blocks, detaching);
				if (detaching) detach(each_1_anchor);
			}
		};
	}

	// (72:2) {#each output.raw as code}
	function create_each_block_1$1(ctx) {
		let sampleinput;
		let current;
		sampleinput = new Sample({ props: { content: /*code*/ ctx[12] } });

		return {
			c() {
				create_component(sampleinput.$$.fragment);
			},
			m(target, anchor) {
				mount_component(sampleinput, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const sampleinput_changes = {};
				if (dirty & /*output*/ 4) sampleinput_changes.content = /*code*/ ctx[12];
				sampleinput.$set(sampleinput_changes);
			},
			i(local) {
				if (current) return;
				transition_in(sampleinput.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(sampleinput.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(sampleinput, detaching);
			}
		};
	}

	// (77:1) {#if output.component}
	function create_if_block_5$1(ctx) {
		let each_1_anchor;
		let current;
		let each_value = codeOutputComponentKeys;
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$h(get_each_context$h(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		return {
			c() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty$1();
			},
			m(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert(target, each_1_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*output, codeOutputComponentKeys, codePhrases*/ 36) {
					each_value = codeOutputComponentKeys;
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$h(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$h(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				destroy_each(each_blocks, detaching);
				if (detaching) detach(each_1_anchor);
			}
		};
	}

	// (79:3) {#if output.component[key]}
	function create_if_block_6$1(ctx) {
		let p;
		let t0_value = /*codePhrases*/ ctx[5].component[/*key*/ ctx[9]] + "";
		let t0;
		let t1;
		let sampleinput;
		let current;

		sampleinput = new Sample({
				props: {
					content: /*output*/ ctx[2].component[/*key*/ ctx[9]]
				}
			});

		return {
			c() {
				p = element("p");
				t0 = text(t0_value);
				t1 = space();
				create_component(sampleinput.$$.fragment);
			},
			m(target, anchor) {
				insert(target, p, anchor);
				append(p, t0);
				insert(target, t1, anchor);
				mount_component(sampleinput, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const sampleinput_changes = {};
				if (dirty & /*output*/ 4) sampleinput_changes.content = /*output*/ ctx[2].component[/*key*/ ctx[9]];
				sampleinput.$set(sampleinput_changes);
			},
			i(local) {
				if (current) return;
				transition_in(sampleinput.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(sampleinput.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(p);
				if (detaching) detach(t1);
				destroy_component(sampleinput, detaching);
			}
		};
	}

	// (78:2) {#each codeOutputComponentKeys as key}
	function create_each_block$h(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*output*/ ctx[2].component[/*key*/ ctx[9]] && create_if_block_6$1(ctx);

		return {
			c() {
				if (if_block) if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (/*output*/ ctx[2].component[/*key*/ ctx[9]]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*output*/ 4) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block_6$1(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	// (86:1) {#if output.footer}
	function create_if_block_2$a(ctx) {
		let t;
		let if_block1_anchor;
		let current;
		let if_block0 = /*output*/ ctx[2].footer.text && create_if_block_4$2(ctx);
		let if_block1 = /*output*/ ctx[2].footer.code && create_if_block_3$6(ctx);

		return {
			c() {
				if (if_block0) if_block0.c();
				t = space();
				if (if_block1) if_block1.c();
				if_block1_anchor = empty$1();
			},
			m(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, t, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert(target, if_block1_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (/*output*/ ctx[2].footer.text) {
					if (if_block0) {
						if_block0.p(ctx, dirty);
					} else {
						if_block0 = create_if_block_4$2(ctx);
						if_block0.c();
						if_block0.m(t.parentNode, t);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (/*output*/ ctx[2].footer.code) {
					if (if_block1) {
						if_block1.p(ctx, dirty);

						if (dirty & /*output*/ 4) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block_3$6(ctx);
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block1);
				current = true;
			},
			o(local) {
				transition_out(if_block1);
				current = false;
			},
			d(detaching) {
				if (if_block0) if_block0.d(detaching);
				if (detaching) detach(t);
				if (if_block1) if_block1.d(detaching);
				if (detaching) detach(if_block1_anchor);
			}
		};
	}

	// (87:2) {#if output.footer.text}
	function create_if_block_4$2(ctx) {
		let p;
		let t_value = /*output*/ ctx[2].footer.text + "";
		let t;

		return {
			c() {
				p = element("p");
				t = text(t_value);
			},
			m(target, anchor) {
				insert(target, p, anchor);
				append(p, t);
			},
			p(ctx, dirty) {
				if (dirty & /*output*/ 4 && t_value !== (t_value = /*output*/ ctx[2].footer.text + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) detach(p);
			}
		};
	}

	// (90:2) {#if output.footer.code}
	function create_if_block_3$6(ctx) {
		let sampleinput;
		let current;

		sampleinput = new Sample({
				props: { content: /*output*/ ctx[2].footer.code }
			});

		return {
			c() {
				create_component(sampleinput.$$.fragment);
			},
			m(target, anchor) {
				mount_component(sampleinput, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const sampleinput_changes = {};
				if (dirty & /*output*/ 4) sampleinput_changes.content = /*output*/ ctx[2].footer.code;
				sampleinput.$set(sampleinput_changes);
			},
			i(local) {
				if (current) return;
				transition_in(sampleinput.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(sampleinput.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(sampleinput, detaching);
			}
		};
	}

	// (95:1) {#if output.docs}
	function create_if_block_1$c(ctx) {
		let p;
		let uiicon0;
		let t0;
		let a;
		let t1;
		let t2;
		let uiicon1;
		let a_href_value;
		let current;
		let mounted;
		let dispose;
		uiicon0 = new Icon({ props: { icon: "docs" } });
		uiicon1 = new Icon({ props: { icon: "link" } });

		return {
			c() {
				p = element("p");
				create_component(uiicon0.$$.fragment);
				t0 = space();
				a = element("a");
				t1 = text(/*docsText*/ ctx[3]);
				t2 = space();
				create_component(uiicon1.$$.fragment);
				attr(a, "href", a_href_value = /*output*/ ctx[2].docs.href);
				attr(a, "target", "_blank");
				attr(p, "class", "iif-code-docs");
			},
			m(target, anchor) {
				insert(target, p, anchor);
				mount_component(uiicon0, p, null);
				append(p, t0);
				append(p, a);
				append(a, t1);
				append(a, t2);
				mount_component(uiicon1, a, null);
				current = true;

				if (!mounted) {
					dispose = listen(a, "click", /*onExternalClick*/ ctx[4]);
					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (!current || dirty & /*docsText*/ 8) set_data(t1, /*docsText*/ ctx[3]);

				if (!current || dirty & /*output*/ 4 && a_href_value !== (a_href_value = /*output*/ ctx[2].docs.href)) {
					attr(a, "href", a_href_value);
				}
			},
			i(local) {
				if (current) return;
				transition_in(uiicon0.$$.fragment, local);
				transition_in(uiicon1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon0.$$.fragment, local);
				transition_out(uiicon1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(p);
				destroy_component(uiicon0);
				destroy_component(uiicon1);
				mounted = false;
				dispose();
			}
		};
	}

	function create_fragment$I(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*output*/ ctx[2] && create_if_block$p(ctx);

		return {
			c() {
				if (if_block) if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				if (/*output*/ ctx[2]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*output*/ 4) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$p(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	function instance$I($$self, $$props, $$invalidate) {
		
		
		
		
		
		
		let { icon } = $$props;
		let { customisations } = $$props;
		let { providerConfig } = $$props;
		let { mode } = $$props;

		// Registry
		const registry = getContext("registry");

		// Callback for external link
		const onExternalClick = registry.link;

		// Get text
		const codePhrases = phrases.codeSamples;

		// Get mode specific data and text
		/*
	    Actual type: "CodeOutput | null", but Svelte language tools cannot handle nested conditional
	    statements in template, so intentionally using wrong type to get rid of warnings.
	*/
		let output;

		let docsText;

		$$self.$$set = $$props => {
			if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
			if ("customisations" in $$props) $$invalidate(6, customisations = $$props.customisations);
			if ("providerConfig" in $$props) $$invalidate(7, providerConfig = $$props.providerConfig);
			if ("mode" in $$props) $$invalidate(1, mode = $$props.mode);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*mode, icon, customisations, providerConfig, output*/ 199) {
				 {
					$$invalidate(2, output = getIconCode(mode, icon, customisations, providerConfig));

					// Get title for docs
					if (output && output.docs) {
						const docsType = output.docs.type;

						$$invalidate(3, docsText = codePhrases.docs[docsType]
						? codePhrases.docs[docsType]
						: codePhrases.docsDefault.replace("{title}", capitalize(docsType)));
					} else {
						$$invalidate(3, docsText = "");
					}
				}
			}
		};

		return [
			icon,
			mode,
			output,
			docsText,
			onExternalClick,
			codePhrases,
			customisations,
			providerConfig
		];
	}

	class Code extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$I, create_fragment$I, safe_not_equal, {
				icon: 0,
				customisations: 6,
				providerConfig: 7,
				mode: 1
			});
		}
	}

	/* src/icon-finder/components/footer/parts/code/Container.svelte generated by Svelte v3.29.4 */

	function create_if_block$q(ctx) {
		let footerblock;
		let current;

		footerblock = new Block$1({
				props: {
					name: "code",
					title: /*codePhrases*/ ctx[7].heading.replace("{name}", /*icon*/ ctx[0].name),
					$$slots: { default: [create_default_slot$e] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(footerblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(footerblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const footerblock_changes = {};
				if (dirty & /*icon*/ 1) footerblock_changes.title = /*codePhrases*/ ctx[7].heading.replace("{name}", /*icon*/ ctx[0].name);

				if (dirty & /*$$scope, selection, icon, customisations, providerConfig, childFiltersBlock, childTabsTitle, codeTabs*/ 4223) {
					footerblock_changes.$$scope = { dirty, ctx };
				}

				footerblock.$set(footerblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(footerblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(footerblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(footerblock, detaching);
			}
		};
	}

	// (78:4) {#if childFiltersBlock}
	function create_if_block_1$d(ctx) {
		let filterscomponent;
		let current;

		filterscomponent = new Filters({
				props: {
					name: "code",
					block: /*childFiltersBlock*/ ctx[5],
					onClick: /*changeTab*/ ctx[8],
					title: /*childTabsTitle*/ ctx[6]
				}
			});

		return {
			c() {
				create_component(filterscomponent.$$.fragment);
			},
			m(target, anchor) {
				mount_component(filterscomponent, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const filterscomponent_changes = {};
				if (dirty & /*childFiltersBlock*/ 32) filterscomponent_changes.block = /*childFiltersBlock*/ ctx[5];
				if (dirty & /*childTabsTitle*/ 64) filterscomponent_changes.title = /*childTabsTitle*/ ctx[6];
				filterscomponent.$set(filterscomponent_changes);
			},
			i(local) {
				if (current) return;
				transition_in(filterscomponent.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(filterscomponent.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(filterscomponent, detaching);
			}
		};
	}

	// (69:1) <FooterBlock   name="code"   title={codePhrases.heading.replace('{name}', icon.name)}>
	function create_default_slot$e(ctx) {
		let div1;
		let div0;
		let filterscomponent;
		let t0;
		let t1;
		let codecomponent;
		let current;

		filterscomponent = new Filters({
				props: {
					name: "code",
					block: /*codeTabs*/ ctx[3].filters,
					onClick: /*changeTab*/ ctx[8]
				}
			});

		let if_block = /*childFiltersBlock*/ ctx[5] && create_if_block_1$d(ctx);

		codecomponent = new Code({
				props: {
					mode: /*selection*/ ctx[4].active.key,
					icon: /*icon*/ ctx[0],
					customisations: /*customisations*/ ctx[1],
					providerConfig: /*providerConfig*/ ctx[2]
				}
			});

		return {
			c() {
				div1 = element("div");
				div0 = element("div");
				create_component(filterscomponent.$$.fragment);
				t0 = space();
				if (if_block) if_block.c();
				t1 = space();
				create_component(codecomponent.$$.fragment);
				attr(div0, "class", "iif-filters");
				attr(div1, "class", "iif-code");
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				mount_component(filterscomponent, div0, null);
				append(div0, t0);
				if (if_block) if_block.m(div0, null);
				append(div1, t1);
				mount_component(codecomponent, div1, null);
				current = true;
			},
			p(ctx, dirty) {
				const filterscomponent_changes = {};
				if (dirty & /*codeTabs*/ 8) filterscomponent_changes.block = /*codeTabs*/ ctx[3].filters;
				filterscomponent.$set(filterscomponent_changes);

				if (/*childFiltersBlock*/ ctx[5]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*childFiltersBlock*/ 32) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block_1$d(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(div0, null);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				const codecomponent_changes = {};
				if (dirty & /*selection*/ 16) codecomponent_changes.mode = /*selection*/ ctx[4].active.key;
				if (dirty & /*icon*/ 1) codecomponent_changes.icon = /*icon*/ ctx[0];
				if (dirty & /*customisations*/ 2) codecomponent_changes.customisations = /*customisations*/ ctx[1];
				if (dirty & /*providerConfig*/ 4) codecomponent_changes.providerConfig = /*providerConfig*/ ctx[2];
				codecomponent.$set(codecomponent_changes);
			},
			i(local) {
				if (current) return;
				transition_in(filterscomponent.$$.fragment, local);
				transition_in(if_block);
				transition_in(codecomponent.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(filterscomponent.$$.fragment, local);
				transition_out(if_block);
				transition_out(codecomponent.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div1);
				destroy_component(filterscomponent);
				if (if_block) if_block.d();
				destroy_component(codecomponent);
			}
		};
	}

	function create_fragment$J(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*codeTabs*/ ctx[3].tree.length && create_if_block$q(ctx);

		return {
			c() {
				if (if_block) if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				if (/*codeTabs*/ ctx[3].tree.length) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*codeTabs*/ 8) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$q(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	function instance$J($$self, $$props, $$invalidate) {
		
		
		
		
		
		let { icon } = $$props;
		let { customisations } = $$props;

		// Registry
		const registry = getContext("registry");

		const codePhrases = phrases.codeSamples;
		const componentsConfig = registry.config.components;

		// Get list of all code tabs
		let providerConfig;

		let codeTabs;

		// Selected tab
		let currentTab = componentsConfig.codeTab;

		let selection;
		let childFiltersBlock;
		let childTabsTitle;

		// Change current tab
		function changeTab(tab) {
			componentsConfig.codeTab = tab;
			$$invalidate(10, currentTab = tab);

			// UIConfigEvent
			registry.callback({ type: "config" });
		}

		$$self.$$set = $$props => {
			if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
			if ("customisations" in $$props) $$invalidate(1, customisations = $$props.customisations);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*icon, providerConfig*/ 5) {
				 {
					const provider = icon.provider;

					$$invalidate(2, providerConfig = codeConfig.providers[provider] === void 0
					? codeConfig.defaultProvider
					: codeConfig.providers[provider]);

					$$invalidate(3, codeTabs = getCodeTree(providerConfig, phrases));
				}
			}

			if ($$self.$$.dirty & /*codeTabs, currentTab, selection*/ 1048) {
				 {
					$$invalidate(4, selection = filterCodeTabs(codeTabs, currentTab));

					// Update tabs
					const key = selection.root.key;

					$$invalidate(3, codeTabs.filters.active = key, codeTabs);

					if (selection.child && codeTabs.childFilters[key]) {
						// Child tab: update active tab and get title
						$$invalidate(5, childFiltersBlock = codeTabs.childFilters[key]);

						$$invalidate(5, childFiltersBlock.active = selection.child.key, childFiltersBlock);

						$$invalidate(6, childTabsTitle = codePhrases.childTabTitles[key] === void 0
						? codePhrases.childTabTitle.replace("{key}", key)
						: codePhrases.childTabTitles[key]);
					} else {
						$$invalidate(5, childFiltersBlock = null);
						$$invalidate(6, childTabsTitle = "");
					}
				}
			}
		};

		return [
			icon,
			customisations,
			providerConfig,
			codeTabs,
			selection,
			childFiltersBlock,
			childTabsTitle,
			codePhrases,
			changeTab
		];
	}

	class Container$1 extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$J, create_fragment$J, safe_not_equal, { icon: 0, customisations: 1 });
		}
	}

	/* src/icon-finder/components/footer/parts/Properties.svelte generated by Svelte v3.29.4 */

	function create_if_block_4$3(ctx) {
		let colorblock;
		let current;

		colorblock = new Color({
				props: {
					icons: /*icons*/ ctx[0],
					value: /*customisations*/ ctx[1].color,
					customise: /*customise*/ ctx[2]
				}
			});

		return {
			c() {
				create_component(colorblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(colorblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const colorblock_changes = {};
				if (dirty & /*icons*/ 1) colorblock_changes.icons = /*icons*/ ctx[0];
				if (dirty & /*customisations*/ 2) colorblock_changes.value = /*customisations*/ ctx[1].color;
				if (dirty & /*customise*/ 4) colorblock_changes.customise = /*customise*/ ctx[2];
				colorblock.$set(colorblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(colorblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(colorblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(colorblock, detaching);
			}
		};
	}

	// (27:2) {#if customiseWidth || customiseHeight}
	function create_if_block_3$7(ctx) {
		let sizeblock;
		let current;

		sizeblock = new Size({
				props: {
					icons: /*icons*/ ctx[0],
					customisations: /*customisations*/ ctx[1],
					customise: /*customise*/ ctx[2]
				}
			});

		return {
			c() {
				create_component(sizeblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(sizeblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const sizeblock_changes = {};
				if (dirty & /*icons*/ 1) sizeblock_changes.icons = /*icons*/ ctx[0];
				if (dirty & /*customisations*/ 2) sizeblock_changes.customisations = /*customisations*/ ctx[1];
				if (dirty & /*customise*/ 4) sizeblock_changes.customise = /*customise*/ ctx[2];
				sizeblock.$set(sizeblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(sizeblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(sizeblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(sizeblock, detaching);
			}
		};
	}

	// (30:2) {#if customiseFlip}
	function create_if_block_2$b(ctx) {
		let flipblock;
		let current;

		flipblock = new Flip({
				props: {
					customisations: /*customisations*/ ctx[1],
					customise: /*customise*/ ctx[2]
				}
			});

		return {
			c() {
				create_component(flipblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(flipblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const flipblock_changes = {};
				if (dirty & /*customisations*/ 2) flipblock_changes.customisations = /*customisations*/ ctx[1];
				if (dirty & /*customise*/ 4) flipblock_changes.customise = /*customise*/ ctx[2];
				flipblock.$set(flipblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(flipblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(flipblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(flipblock, detaching);
			}
		};
	}

	// (33:2) {#if customiseRotate}
	function create_if_block_1$e(ctx) {
		let rotateblock;
		let current;

		rotateblock = new Rotate({
				props: {
					value: /*customisations*/ ctx[1].rotate,
					customise: /*customise*/ ctx[2]
				}
			});

		return {
			c() {
				create_component(rotateblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(rotateblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const rotateblock_changes = {};
				if (dirty & /*customisations*/ 2) rotateblock_changes.value = /*customisations*/ ctx[1].rotate;
				if (dirty & /*customise*/ 4) rotateblock_changes.customise = /*customise*/ ctx[2];
				rotateblock.$set(rotateblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(rotateblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(rotateblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(rotateblock, detaching);
			}
		};
	}

	// (36:2) {#if customiseInline && icons.length === 1}
	function create_if_block$r(ctx) {
		let inlineblock;
		let current;

		inlineblock = new Inline({
				props: {
					value: /*customisations*/ ctx[1].inline,
					customise: /*customise*/ ctx[2]
				}
			});

		return {
			c() {
				create_component(inlineblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(inlineblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const inlineblock_changes = {};
				if (dirty & /*customisations*/ 2) inlineblock_changes.value = /*customisations*/ ctx[1].inline;
				if (dirty & /*customise*/ 4) inlineblock_changes.customise = /*customise*/ ctx[2];
				inlineblock.$set(inlineblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(inlineblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(inlineblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(inlineblock, detaching);
			}
		};
	}

	// (22:0) <FooterBlock name="props" {title}>
	function create_default_slot$f(ctx) {
		let div;
		let t0;
		let t1;
		let t2;
		let t3;
		let current;
		let if_block0 =  create_if_block_4$3(ctx);
		let if_block1 =  create_if_block_3$7(ctx);
		let if_block2 =  create_if_block_2$b(ctx);
		let if_block3 =  create_if_block_1$e(ctx);
		let if_block4 =  /*icons*/ ctx[0].length === 1 && create_if_block$r(ctx);

		return {
			c() {
				div = element("div");
				if (if_block0) if_block0.c();
				t0 = space();
				if (if_block1) if_block1.c();
				t1 = space();
				if (if_block2) if_block2.c();
				t2 = space();
				if (if_block3) if_block3.c();
				t3 = space();
				if (if_block4) if_block4.c();
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append(div, t0);
				if (if_block1) if_block1.m(div, null);
				append(div, t1);
				if (if_block2) if_block2.m(div, null);
				append(div, t2);
				if (if_block3) if_block3.m(div, null);
				append(div, t3);
				if (if_block4) if_block4.m(div, null);
				current = true;
			},
			p(ctx, dirty) {
				if_block0.p(ctx, dirty);
				if_block1.p(ctx, dirty);
				if_block2.p(ctx, dirty);
				if_block3.p(ctx, dirty);

				if ( /*icons*/ ctx[0].length === 1) {
					if (if_block4) {
						if_block4.p(ctx, dirty);

						if (dirty & /*icons*/ 1) {
							transition_in(if_block4, 1);
						}
					} else {
						if_block4 = create_if_block$r(ctx);
						if_block4.c();
						transition_in(if_block4, 1);
						if_block4.m(div, null);
					}
				} else if (if_block4) {
					group_outros();

					transition_out(if_block4, 1, 1, () => {
						if_block4 = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block1);
				transition_in(if_block2);
				transition_in(if_block3);
				transition_in(if_block4);
				current = true;
			},
			o(local) {
				transition_out(if_block0);
				transition_out(if_block1);
				transition_out(if_block2);
				transition_out(if_block3);
				transition_out(if_block4);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				if (if_block3) if_block3.d();
				if (if_block4) if_block4.d();
			}
		};
	}

	function create_fragment$K(ctx) {
		let footerblock;
		let current;

		footerblock = new Block$1({
				props: {
					name: "props",
					title: /*title*/ ctx[3],
					$$slots: { default: [create_default_slot$f] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(footerblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(footerblock, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const footerblock_changes = {};
				if (dirty & /*title*/ 8) footerblock_changes.title = /*title*/ ctx[3];

				if (dirty & /*$$scope, customisations, customise, icons*/ 23) {
					footerblock_changes.$$scope = { dirty, ctx };
				}

				footerblock.$set(footerblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(footerblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(footerblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(footerblock, detaching);
			}
		};
	}

	function instance$K($$self, $$props, $$invalidate) {
		
		
		let { icons } = $$props;
		let { customisations } = $$props;
		let { customise } = $$props;

		// Title
		let title;

		$$self.$$set = $$props => {
			if ("icons" in $$props) $$invalidate(0, icons = $$props.icons);
			if ("customisations" in $$props) $$invalidate(1, customisations = $$props.customisations);
			if ("customise" in $$props) $$invalidate(2, customise = $$props.customise);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*icons*/ 1) {
				 {
					$$invalidate(3, title =  "");
				}
			}
		};

		return [icons, customisations, customise, title];
	}

	class Properties extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$K, create_fragment$K, safe_not_equal, {
				icons: 0,
				customisations: 1,
				customise: 2
			});
		}
	}

	/**
	 * Calculate both dimensions
	 */
	function getDimensions(width, height, ratio, rotated) {
	    if (width && height) {
	        return {
	            width: rotated ? height : width,
	            height: rotated ? width : height,
	        };
	    }
	    if (!height) {
	        height = Iconify__default['default']._internal.calculateSize(width, rotated ? ratio : 1 / ratio);
	    }
	    else {
	        width = Iconify__default['default']._internal.calculateSize(height, rotated ? 1 / ratio : ratio);
	    }
	    return {
	        width,
	        height,
	    };
	}

	/* src/icon-finder/components/footer/parts/samples/Full.svelte generated by Svelte v3.29.4 */

	function create_fragment$L(ctx) {
		let div;
		let uiicon;
		let current;

		uiicon = new Icon({
				props: {
					icon: /*data*/ ctx[0].name,
					props: /*props*/ ctx[2]
				}
			});

		return {
			c() {
				div = element("div");
				create_component(uiicon.$$.fragment);
				attr(div, "class", "iif-footer-sample iif-footer-sample--block iif-footer-sample--loaded");
				attr(div, "style", /*style*/ ctx[1]);
			},
			m(target, anchor) {
				insert(target, div, anchor);
				mount_component(uiicon, div, null);
				current = true;
			},
			p(ctx, [dirty]) {
				const uiicon_changes = {};
				if (dirty & /*data*/ 1) uiicon_changes.icon = /*data*/ ctx[0].name;
				if (dirty & /*props*/ 4) uiicon_changes.props = /*props*/ ctx[2];
				uiicon.$set(uiicon_changes);

				if (!current || dirty & /*style*/ 2) {
					attr(div, "style", /*style*/ ctx[1]);
				}
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div);
				destroy_component(uiicon);
			}
		};
	}

	function instance$L($$self, $$props, $$invalidate) {
		
		
		
		let { icon } = $$props;
		let { customisations } = $$props;
		const divisions = [2.5, 3, 3.5];

		// Get maximum width/height from options
		const maxWidth = iconSampleSize.width;

		const maxHeight = iconSampleSize.height;
		const minWidth = Math.floor(maxWidth / 2);
		const minHeight = Math.floor(maxHeight / 2);

		function scaleSample(size, canScaleUp) {
			// Scale
			while (size.width > maxWidth || size.height > maxHeight) {
				// Attempt to divide by 2
				let newWidth = size.width / 2;

				let newHeight = size.height / 2;

				if (Math.round(newWidth) !== newWidth || Math.round(newHeight) !== newHeight) {
					// Try to divide by a different number
					for (let i = 0; i < divisions.length; i++) {
						let div = divisions[i];
						let newWidth2 = size.width / div;
						let newHeight2 = size.height / div;

						if (Math.round(newWidth2) === newWidth2 && Math.round(newHeight2) === newHeight2) {
							newWidth = newWidth2;
							newHeight = newHeight2;
							break;
						}
					}
				}

				size.width = newWidth;
				size.height = newHeight;
			}

			if (canScaleUp) {
				while (size.width < minWidth && size.height < minHeight) {
					size.width *= 2;
					size.height *= 2;
				}
			}
		}

		let data;

		// Calculate style
		let style;

		// Scale sample
		let props;

		$$self.$$set = $$props => {
			if ("icon" in $$props) $$invalidate(3, icon = $$props.icon);
			if ("customisations" in $$props) $$invalidate(4, customisations = $$props.customisations);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*icon, customisations*/ 24) {
				 {
					// Get name
					const name = lib.iconToString(icon);

					// Get data
					const iconData = Iconify__default['default'].getIcon(name);

					// Check if icon is rotated (for width/height calculations)
					const rotated = !!(iconData.width !== iconData.height && customisations.rotate && customisations.rotate % 2 === 1);

					// Width / height ratio
					const ratio = iconData.width / iconData.height;

					$$invalidate(0, data = { name, data: iconData, rotated, ratio });
				}
			}

			if ($$self.$$.dirty & /*customisations, style, data*/ 19) {
				 {
					$$invalidate(1, style = "");

					// Add color
					if (customisations.color) {
						$$invalidate(1, style += "color: " + customisations.color + ";");
					} else {
						$$invalidate(1, style += "color: " + defaultColor + ";");
					}

					// Set dimensions
					if (!customisations.width && !customisations.height) {
						// Calculate size
						let size;

						{
							size = getDimensions(data.data.width, data.data.height, data.ratio, data.rotated);
						}

						// Scale
						scaleSample(size, true);

						$$invalidate(1, style += "font-size: " + size.height + "px;");
					}
				}
			}

			if ($$self.$$.dirty & /*customisations, data*/ 17) {
				 {
					$$invalidate(2, props = {});

					["hFlip", "vFlip", "rotate"].forEach(key => {
						const prop = key;

						if (customisations[prop]) {
							$$invalidate(2, props[prop] = customisations[prop], props);
						}
					});

					let size;

					if (customisations.width || customisations.height) {
						size = getDimensions(customisations.width, customisations.height, data.ratio, data.rotated);
					}

					if (size !== void 0) {
						scaleSample(size, false);
						$$invalidate(2, props.width = size.width + "", props);
						$$invalidate(2, props.height = size.height + "", props);
					}
				}
			}
		};

		return [data, style, props, icon, customisations];
	}

	class Full extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$L, create_fragment$L, safe_not_equal, { icon: 3, customisations: 4 });
		}
	}

	/* src/icon-finder/components/footer/parts/samples/Inline.svelte generated by Svelte v3.29.4 */

	function create_fragment$M(ctx) {
		let div;
		let p;
		let t0_value = /*samplePhrases*/ ctx[2].before + "";
		let t0;
		let t1;
		let span;
		let t2;
		let t3_value = /*samplePhrases*/ ctx[2].after + "";
		let t3;

		return {
			c() {
				div = element("div");
				p = element("p");
				t0 = text(t0_value);
				t1 = space();
				span = element("span");
				t2 = space();
				t3 = text(t3_value);
				attr(span, "style", /*style*/ ctx[1]);
				attr(div, "class", "iif-footer-sample iif-footer-sample--inline iif-footer-sample--loaded");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, p);
				append(p, t0);
				append(p, t1);
				append(p, span);
				span.innerHTML = /*html*/ ctx[0];
				append(p, t2);
				append(p, t3);
			},
			p(ctx, [dirty]) {
				if (dirty & /*html*/ 1) span.innerHTML = /*html*/ ctx[0];
				if (dirty & /*style*/ 2) {
					attr(span, "style", /*style*/ ctx[1]);
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) detach(div);
			}
		};
	}

	function instance$M($$self, $$props, $$invalidate) {
		
		
		let { icon } = $$props;
		let { customisations } = $$props;
		const samplePhrases = phrases.footer.inlineSample;

		// Get maximum width/height from options
		const maxWidth = iconSampleSize.width;

		const maxHeight = iconSampleSize.height;

		// Get HTML
		let html;

		let style;

		$$self.$$set = $$props => {
			if ("icon" in $$props) $$invalidate(3, icon = $$props.icon);
			if ("customisations" in $$props) $$invalidate(4, customisations = $$props.customisations);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*icon, customisations*/ 24) {
				 {
					const iconName = lib.iconToString(icon);
					const props = {};
					$$invalidate(1, style = "");

					Object.keys(customisations).forEach(key => {
						const attr = key;
						const value = customisations[attr];

						if (value !== "" && value !== 0 && value !== false) {
							if (attr === "color") {
								$$invalidate(1, style = "color: " + value);
							} else {
								props[attr] = value;
							}
						}
					});

					// Adjust width and height
					if (props.width || props.height) {
						const rotated = !!(customisations.rotate % 2);

						// Check maxWidth
						let key = rotated ? "height" : "width";

						if (props[key] && props[key] > maxWidth) {
							props[key] = maxWidth;
						}

						// Check maxHeight
						key = !rotated ? "height" : "width";

						if (props[key] && props[key] > maxHeight) {
							props[key] = maxHeight;
						}
					}

					$$invalidate(0, html = Iconify__default['default'].renderHTML(iconName, props));
				}
			}
		};

		return [html, style, samplePhrases, icon, customisations];
	}

	class Inline$1 extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$M, create_fragment$M, safe_not_equal, { icon: 3, customisations: 4 });
		}
	}

	/* src/icon-finder/components/footer/parts/Icons.svelte generated by Svelte v3.29.4 */

	function get_each_context$i(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[13] = list[i];
		child_ctx[15] = i;
		return child_ctx;
	}

	// (107:5) {#if !onSelect}
	function create_if_block_1$f(ctx) {
		let span;
		let uiicon;
		let current;
		uiicon = new Icon({ props: { icon: "reset" } });

		return {
			c() {
				span = element("span");
				create_component(uiicon.$$.fragment);
				attr(span, "class", "iif-footer-icons-reset");
			},
			m(target, anchor) {
				insert(target, span, anchor);
				mount_component(uiicon, span, null);
				current = true;
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(span);
				destroy_component(uiicon);
			}
		};
	}

	// (113:4) {#if onSelect}
	function create_if_block$s(ctx) {
		let a;
		let uiicon;
		let a_title_value;
		let current;
		let mounted;
		let dispose;
		uiicon = new Icon({ props: { icon: "reset" } });

		function click_handler_1(...args) {
			return /*click_handler_1*/ ctx[10](/*item*/ ctx[13], ...args);
		}

		return {
			c() {
				a = element("a");
				create_component(uiicon.$$.fragment);
				attr(a, "href", "# ");
				attr(a, "class", "iif-footer-icons-reset");
				attr(a, "title", a_title_value = /*item*/ ctx[13].removeTitle);
			},
			m(target, anchor) {
				insert(target, a, anchor);
				mount_component(uiicon, a, null);
				current = true;

				if (!mounted) {
					dispose = listen(a, "click", prevent_default(click_handler_1));
					mounted = true;
				}
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;

				if (!current || dirty & /*items*/ 2 && a_title_value !== (a_title_value = /*item*/ ctx[13].removeTitle)) {
					attr(a, "title", a_title_value);
				}
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(a);
				destroy_component(uiicon);
				mounted = false;
				dispose();
			}
		};
	}

	// (98:2) {#each items as item, i (item.name)}
	function create_each_block$i(key_1, ctx) {
		let li;
		let a;
		let uiicon;
		let t0;
		let a_title_value;
		let t1;
		let t2;
		let current;
		let mounted;
		let dispose;

		uiicon = new Icon({
				props: {
					icon: /*item*/ ctx[13].name,
					props: /*props*/ ctx[2]
				}
			});

		let if_block0 = !/*onSelect*/ ctx[0] && create_if_block_1$f();

		function click_handler(...args) {
			return /*click_handler*/ ctx[9](/*item*/ ctx[13], ...args);
		}

		let if_block1 = /*onSelect*/ ctx[0] && create_if_block$s(ctx);

		return {
			key: key_1,
			first: null,
			c() {
				li = element("li");
				a = element("a");
				create_component(uiicon.$$.fragment);
				t0 = space();
				if (if_block0) if_block0.c();
				t1 = space();
				if (if_block1) if_block1.c();
				t2 = space();
				attr(a, "href", "# ");
				attr(a, "title", a_title_value = /*item*/ ctx[13].selectTitle);
				this.first = li;
			},
			m(target, anchor) {
				insert(target, li, anchor);
				append(li, a);
				mount_component(uiicon, a, null);
				append(a, t0);
				if (if_block0) if_block0.m(a, null);
				append(li, t1);
				if (if_block1) if_block1.m(li, null);
				append(li, t2);
				current = true;

				if (!mounted) {
					dispose = listen(a, "click", prevent_default(click_handler));
					mounted = true;
				}
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				const uiicon_changes = {};
				if (dirty & /*items*/ 2) uiicon_changes.icon = /*item*/ ctx[13].name;
				if (dirty & /*props*/ 4) uiicon_changes.props = /*props*/ ctx[2];
				uiicon.$set(uiicon_changes);

				if (!/*onSelect*/ ctx[0]) {
					if (if_block0) {
						if (dirty & /*onSelect*/ 1) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_1$f();
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(a, null);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if (!current || dirty & /*items*/ 2 && a_title_value !== (a_title_value = /*item*/ ctx[13].selectTitle)) {
					attr(a, "title", a_title_value);
				}

				if (/*onSelect*/ ctx[0]) {
					if (if_block1) {
						if_block1.p(ctx, dirty);

						if (dirty & /*onSelect*/ 1) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block$s(ctx);
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(li, t2);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(uiicon.$$.fragment, local);
				transition_in(if_block0);
				transition_in(if_block1);
				current = true;
			},
			o(local) {
				transition_out(uiicon.$$.fragment, local);
				transition_out(if_block0);
				transition_out(if_block1);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(li);
				destroy_component(uiicon);
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				mounted = false;
				dispose();
			}
		};
	}

	// (96:0) <Block type="icons">
	function create_default_slot$g(ctx) {
		let ul;
		let each_blocks = [];
		let each_1_lookup = new Map();
		let current;
		let each_value = /*items*/ ctx[1];
		const get_key = ctx => /*item*/ ctx[13].name;

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$i(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$i(key, child_ctx));
		}

		return {
			c() {
				ul = element("ul");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr(ul, "class", "iif-footer-icons");
				attr(ul, "style", /*style*/ ctx[3]);
			},
			m(target, anchor) {
				insert(target, ul, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(ul, null);
				}

				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*items, onClick, onSelect, props*/ 23) {
					const each_value = /*items*/ ctx[1];
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$i, null, get_each_context$i);
					check_outros();
				}

				if (!current || dirty & /*style*/ 8) {
					attr(ul, "style", /*style*/ ctx[3]);
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) detach(ul);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}
			}
		};
	}

	function create_fragment$N(ctx) {
		let block;
		let current;

		block = new Block$2({
				props: {
					type: "icons",
					$$slots: { default: [create_default_slot$g] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const block_changes = {};

				if (dirty & /*$$scope, style, items, onSelect, props*/ 65551) {
					block_changes.$$scope = { dirty, ctx };
				}

				block.$set(block_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block, detaching);
			}
		};
	}

	function instance$N($$self, $$props, $$invalidate) {
		
		
		
		
		let { icons } = $$props;
		let { customisations } = $$props;
		let { route } = $$props;
		let { selected = "" } = $$props;
		let { onSelect = null } = $$props;

		// Registry
		const registry = getContext("registry");

		let items;

		// Copy customisations
		const transformations = ["rotate", "hFlip", "vFlip"];

		let props;
		let style;

		// Toggle icon
		function onClick(select, icon) {
			if (select && onSelect) {
				onSelect(icon);
				return;
			}

			registry.callback({ type: "selection", icon, selected: false });
		}

		const click_handler = item => {
			onClick(true, item.icon);
		};

		const click_handler_1 = item => {
			onClick(false, item.icon);
		};

		$$self.$$set = $$props => {
			if ("icons" in $$props) $$invalidate(5, icons = $$props.icons);
			if ("customisations" in $$props) $$invalidate(6, customisations = $$props.customisations);
			if ("route" in $$props) $$invalidate(7, route = $$props.route);
			if ("selected" in $$props) $$invalidate(8, selected = $$props.selected);
			if ("onSelect" in $$props) $$invalidate(0, onSelect = $$props.onSelect);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*icons, route, onSelect, selected, items*/ 419) {
				 {
					$$invalidate(1, items = []);

					icons.forEach(icon => {
						// Full name
						const name = lib.iconToString(icon);

						// Do not show prefix if viewing collection
						const text =  shortenIconName(route, icon, name)
						;

						// Hint
						const removeTitle = phrases.footer.remove.replace("{name}", text);

						const selectTitle = onSelect
						? phrases.footer.select.replace("{name}", text)
						: removeTitle;

						// Item
						const item = {
							icon,
							name,
							text,
							removeTitle,
							selectTitle,
							selected: name === selected
						};

						items.push(item);
					});
				}
			}

			if ($$self.$$.dirty & /*customisations*/ 64) {
				 {
					$$invalidate(2, props = {});

					// Transformations
					transformations.forEach(key => {
						if (customisations[key]) {
							$$invalidate(2, props[key] = customisations[key], props);
						}
					});

					// Height
					if (typeof customisations.height === "number" && customisations.height < 32) {
						$$invalidate(2, props.height = customisations.height, props);

						// Width, but only if height is set
						if (customisations.width) {
							$$invalidate(2, props.width = customisations.width, props);
						}
					}

					// Color
					$$invalidate(3, style = "");

					if (customisations.color !== "") {
						$$invalidate(3, style = "color: " + customisations.color + ";");
					}
				}
			}
		};

		return [
			onSelect,
			items,
			props,
			style,
			onClick,
			icons,
			customisations,
			route,
			selected,
			click_handler,
			click_handler_1
		];
	}

	class Icons extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$N, create_fragment$N, safe_not_equal, {
				icons: 5,
				customisations: 6,
				route: 7,
				selected: 8,
				onSelect: 0
			});
		}
	}

	/* src/icon-finder/components/footer/Full.svelte generated by Svelte v3.29.4 */

	function create_if_block$t(ctx) {
		let block;
		let current;

		block = new Block({
				props: {
					type: "footer",
					$$slots: { default: [create_default_slot$h] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(block.$$.fragment);
			},
			m(target, anchor) {
				mount_component(block, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const block_changes = {};

				if (dirty & /*$$scope, icon, icons, route, customisations, customise, hasIcons, infoBlockTitle, infoBlock*/ 767) {
					block_changes.$$scope = { dirty, ctx };
				}

				block.$set(block_changes);
			},
			i(local) {
				if (current) return;
				transition_in(block.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(block.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(block, detaching);
			}
		};
	}

	// (101:3) {#if icon}
	function create_if_block_7$2(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block_8$2, create_else_block$8];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if ( /*customisations*/ ctx[2].inline) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		return {
			c() {
				if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if_blocks[current_block_type_index].d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	// (104:4) {:else}
	function create_else_block$8(ctx) {
		let sample;
		let current;

		sample = new Full({
				props: {
					icon: /*icon*/ ctx[4],
					customisations: /*customisations*/ ctx[2]
				}
			});

		return {
			c() {
				create_component(sample.$$.fragment);
			},
			m(target, anchor) {
				mount_component(sample, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const sample_changes = {};
				if (dirty & /*icon*/ 16) sample_changes.icon = /*icon*/ ctx[4];
				if (dirty & /*customisations*/ 4) sample_changes.customisations = /*customisations*/ ctx[2];
				sample.$set(sample_changes);
			},
			i(local) {
				if (current) return;
				transition_in(sample.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(sample.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(sample, detaching);
			}
		};
	}

	// (102:4) {#if customiseInline && customisations.inline}
	function create_if_block_8$2(ctx) {
		let inlinesample;
		let current;

		inlinesample = new Inline$1({
				props: {
					icon: /*icon*/ ctx[4],
					customisations: /*customisations*/ ctx[2]
				}
			});

		return {
			c() {
				create_component(inlinesample.$$.fragment);
			},
			m(target, anchor) {
				mount_component(inlinesample, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const inlinesample_changes = {};
				if (dirty & /*icon*/ 16) inlinesample_changes.icon = /*icon*/ ctx[4];
				if (dirty & /*customisations*/ 4) inlinesample_changes.customisations = /*customisations*/ ctx[2];
				inlinesample.$set(inlinesample_changes);
			},
			i(local) {
				if (current) return;
				transition_in(inlinesample.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(inlinesample.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(inlinesample, detaching);
			}
		};
	}

	// (111:23) 
	function create_if_block_6$2(ctx) {
		let iconslist;
		let current;

		iconslist = new Icons({
				props: {
					route: /*route*/ ctx[3],
					icons: /*icons*/ ctx[0],
					customisations: /*customisations*/ ctx[2]
				}
			});

		return {
			c() {
				create_component(iconslist.$$.fragment);
			},
			m(target, anchor) {
				mount_component(iconslist, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const iconslist_changes = {};
				if (dirty & /*route*/ 8) iconslist_changes.route = /*route*/ ctx[3];
				if (dirty & /*icons*/ 1) iconslist_changes.icons = /*icons*/ ctx[0];
				if (dirty & /*customisations*/ 4) iconslist_changes.customisations = /*customisations*/ ctx[2];
				iconslist.$set(iconslist_changes);
			},
			i(local) {
				if (current) return;
				transition_in(iconslist.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(iconslist.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(iconslist, detaching);
			}
		};
	}

	// (109:4) {#if icon}
	function create_if_block_5$2(ctx) {
		let iconname;
		let current;

		iconname = new Simple({
				props: {
					icon: /*icon*/ ctx[4],
					route: /*route*/ ctx[3]
				}
			});

		return {
			c() {
				create_component(iconname.$$.fragment);
			},
			m(target, anchor) {
				mount_component(iconname, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const iconname_changes = {};
				if (dirty & /*icon*/ 16) iconname_changes.icon = /*icon*/ ctx[4];
				if (dirty & /*route*/ 8) iconname_changes.route = /*route*/ ctx[3];
				iconname.$set(iconname_changes);
			},
			i(local) {
				if (current) return;
				transition_in(iconname.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(iconname.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(iconname, detaching);
			}
		};
	}

	// (114:4) {#if infoBlock}
	function create_if_block_4$4(ctx) {
		let footerblock;
		let current;

		footerblock = new Block$1({
				props: {
					name: "info",
					title: /*infoBlockTitle*/ ctx[7],
					$$slots: { default: [create_default_slot_1] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(footerblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(footerblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const footerblock_changes = {};
				if (dirty & /*infoBlockTitle*/ 128) footerblock_changes.title = /*infoBlockTitle*/ ctx[7];

				if (dirty & /*$$scope, infoBlock*/ 576) {
					footerblock_changes.$$scope = { dirty, ctx };
				}

				footerblock.$set(footerblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(footerblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(footerblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(footerblock, detaching);
			}
		};
	}

	// (115:5) <FooterBlock name="info" title={infoBlockTitle}>
	function create_default_slot_1(ctx) {
		let infoblock;
		let current;

		infoblock = new CollectionInfo({
				props: {
					name: "info",
					block: /*infoBlock*/ ctx[6],
					short: true,
					showTitle: false
				}
			});

		return {
			c() {
				create_component(infoblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(infoblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const infoblock_changes = {};
				if (dirty & /*infoBlock*/ 64) infoblock_changes.block = /*infoBlock*/ ctx[6];
				infoblock.$set(infoblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(infoblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(infoblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(infoblock, detaching);
			}
		};
	}

	// (123:4) {#if showCustomisatons && hasIcons}
	function create_if_block_3$8(ctx) {
		let propertiescontainer;
		let current;

		propertiescontainer = new Properties({
				props: {
					icons: /*icons*/ ctx[0],
					customise: /*customise*/ ctx[1],
					customisations: /*customisations*/ ctx[2]
				}
			});

		return {
			c() {
				create_component(propertiescontainer.$$.fragment);
			},
			m(target, anchor) {
				mount_component(propertiescontainer, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const propertiescontainer_changes = {};
				if (dirty & /*icons*/ 1) propertiescontainer_changes.icons = /*icons*/ ctx[0];
				if (dirty & /*customise*/ 2) propertiescontainer_changes.customise = /*customise*/ ctx[1];
				if (dirty & /*customisations*/ 4) propertiescontainer_changes.customisations = /*customisations*/ ctx[2];
				propertiescontainer.$set(propertiescontainer_changes);
			},
			i(local) {
				if (current) return;
				transition_in(propertiescontainer.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(propertiescontainer.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(propertiescontainer, detaching);
			}
		};
	}

	// (126:4) {#if showCode && icon}
	function create_if_block_2$c(ctx) {
		let codeblock;
		let current;

		codeblock = new Container$1({
				props: {
					icon: /*icon*/ ctx[4],
					customisations: /*customisations*/ ctx[2]
				}
			});

		return {
			c() {
				create_component(codeblock.$$.fragment);
			},
			m(target, anchor) {
				mount_component(codeblock, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const codeblock_changes = {};
				if (dirty & /*icon*/ 16) codeblock_changes.icon = /*icon*/ ctx[4];
				if (dirty & /*customisations*/ 4) codeblock_changes.customisations = /*customisations*/ ctx[2];
				codeblock.$set(codeblock_changes);
			},
			i(local) {
				if (current) return;
				transition_in(codeblock.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(codeblock.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(codeblock, detaching);
			}
		};
	}

	// (99:1) <Block type="footer">
	function create_default_slot$h(ctx) {
		let div1;
		let t0;
		let div0;
		let current_block_type_index;
		let if_block1;
		let t1;
		let t2;
		let t3;
		let t4;
		let div0_class_value;
		let div1_class_value;
		let current;
		let if_block0 = /*icon*/ ctx[4] && create_if_block_7$2(ctx);
		const if_block_creators = [create_if_block_5$2, create_if_block_6$2];
		const if_blocks = [];

		function select_block_type_1(ctx, dirty) {
			if (/*icon*/ ctx[4]) return 0;
			if (/*hasIcons*/ ctx[5]) return 1;
			return -1;
		}

		if (~(current_block_type_index = select_block_type_1(ctx))) {
			if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		}

		let if_block2 = /*infoBlock*/ ctx[6] && create_if_block_4$4(ctx);
		let if_block3 =  /*hasIcons*/ ctx[5] && create_if_block_3$8(ctx);
		let if_block4 =  /*icon*/ ctx[4] && create_if_block_2$c(ctx);
		let if_block5 = showButtons ;

		return {
			c() {
				div1 = element("div");
				if (if_block0) if_block0.c();
				t0 = space();
				div0 = element("div");
				if (if_block1) if_block1.c();
				t1 = space();
				if (if_block2) if_block2.c();
				t2 = space();
				if (if_block3) if_block3.c();
				t3 = space();
				if (if_block4) if_block4.c();
				t4 = space();
				attr(div0, "class", div0_class_value = /*icon*/ ctx[4] ? "iif-footer-full-content" : "");
				attr(div1, "class", div1_class_value = /*icon*/ ctx[4] ? "iif-footer-full" : "");
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				if (if_block0) if_block0.m(div1, null);
				append(div1, t0);
				append(div1, div0);

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].m(div0, null);
				}

				append(div0, t1);
				if (if_block2) if_block2.m(div0, null);
				append(div0, t2);
				if (if_block3) if_block3.m(div0, null);
				append(div0, t3);
				if (if_block4) if_block4.m(div0, null);
				append(div0, t4);
				current = true;
			},
			p(ctx, dirty) {
				if (/*icon*/ ctx[4]) {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty & /*icon*/ 16) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_7$2(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(div1, t0);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type_1(ctx);

				if (current_block_type_index === previous_block_index) {
					if (~current_block_type_index) {
						if_blocks[current_block_type_index].p(ctx, dirty);
					}
				} else {
					if (if_block1) {
						group_outros();

						transition_out(if_blocks[previous_block_index], 1, 1, () => {
							if_blocks[previous_block_index] = null;
						});

						check_outros();
					}

					if (~current_block_type_index) {
						if_block1 = if_blocks[current_block_type_index];

						if (!if_block1) {
							if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
							if_block1.c();
						}

						transition_in(if_block1, 1);
						if_block1.m(div0, t1);
					} else {
						if_block1 = null;
					}
				}

				if (/*infoBlock*/ ctx[6]) {
					if (if_block2) {
						if_block2.p(ctx, dirty);

						if (dirty & /*infoBlock*/ 64) {
							transition_in(if_block2, 1);
						}
					} else {
						if_block2 = create_if_block_4$4(ctx);
						if_block2.c();
						transition_in(if_block2, 1);
						if_block2.m(div0, t2);
					}
				} else if (if_block2) {
					group_outros();

					transition_out(if_block2, 1, 1, () => {
						if_block2 = null;
					});

					check_outros();
				}

				if ( /*hasIcons*/ ctx[5]) {
					if (if_block3) {
						if_block3.p(ctx, dirty);

						if (dirty & /*hasIcons*/ 32) {
							transition_in(if_block3, 1);
						}
					} else {
						if_block3 = create_if_block_3$8(ctx);
						if_block3.c();
						transition_in(if_block3, 1);
						if_block3.m(div0, t3);
					}
				} else if (if_block3) {
					group_outros();

					transition_out(if_block3, 1, 1, () => {
						if_block3 = null;
					});

					check_outros();
				}

				if ( /*icon*/ ctx[4]) {
					if (if_block4) {
						if_block4.p(ctx, dirty);

						if (dirty & /*icon*/ 16) {
							transition_in(if_block4, 1);
						}
					} else {
						if_block4 = create_if_block_2$c(ctx);
						if_block4.c();
						transition_in(if_block4, 1);
						if_block4.m(div0, t4);
					}
				} else if (if_block4) {
					group_outros();

					transition_out(if_block4, 1, 1, () => {
						if_block4 = null;
					});

					check_outros();
				}

				if (!current || dirty & /*icon*/ 16 && div0_class_value !== (div0_class_value = /*icon*/ ctx[4] ? "iif-footer-full-content" : "")) {
					attr(div0, "class", div0_class_value);
				}

				if (!current || dirty & /*icon*/ 16 && div1_class_value !== (div1_class_value = /*icon*/ ctx[4] ? "iif-footer-full" : "")) {
					attr(div1, "class", div1_class_value);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block1);
				transition_in(if_block2);
				transition_in(if_block3);
				transition_in(if_block4);
				transition_in(if_block5);
				current = true;
			},
			o(local) {
				transition_out(if_block0);
				transition_out(if_block1);
				transition_out(if_block2);
				transition_out(if_block3);
				transition_out(if_block4);
				transition_out(if_block5);
				current = false;
			},
			d(detaching) {
				if (detaching) detach(div1);
				if (if_block0) if_block0.d();

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].d();
				}

				if (if_block2) if_block2.d();
				if (if_block3) if_block3.d();
				if (if_block4) if_block4.d();
			}
		};
	}

	function create_fragment$O(ctx) {
		let if_block_anchor;
		let current;
		let if_block = ( /*hasIcons*/ ctx[5]) && create_if_block$t(ctx);

		return {
			c() {
				if (if_block) if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				if ( /*hasIcons*/ ctx[5]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*hasIcons*/ 32) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$t(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	function instance$O($$self, $$props, $$invalidate) {
		
		
		
		let { icons } = $$props;
		let { customise } = $$props;
		let { customisations } = $$props;
		let { route } = $$props;

		// Registry
		const registry = getContext("registry");

		// Check if icons are selected, get first icon
		let icon;

		let hasIcons;

		// Check if info block should be shown
		let infoBlock;

		let infoBlockTitle;

		$$self.$$set = $$props => {
			if ("icons" in $$props) $$invalidate(0, icons = $$props.icons);
			if ("customise" in $$props) $$invalidate(1, customise = $$props.customise);
			if ("customisations" in $$props) $$invalidate(2, customisations = $$props.customisations);
			if ("route" in $$props) $$invalidate(3, route = $$props.route);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*icons*/ 1) {
				 {
					$$invalidate(5, hasIcons = icons.length > 0);
					$$invalidate(4, icon = icons.length === 1 ? icons[0] : null);
				}
			}

			if ($$self.$$.dirty & /*icons, icon, route*/ 25) {
				 {
					let showInfo = true;

					// Get provider and prefix for info
					let provider = "";

					let prefix = "";

					{
						// Disabled
						showInfo = false;
					}

					// Check route
					if ( showInfo && route.type === "collection" && provider === route.params.provider && prefix === route.params.prefix) {
						// Already showing info for the same icon set above icons list
						showInfo = false;
					}

					// Get data
					if (showInfo) {
						const info = lib.getCollectionInfo(registry.collections, provider, prefix);

						if (!info) {
							$$invalidate(6, infoBlock = null);
							$$invalidate(7, infoBlockTitle = "");
						} else {
							$$invalidate(6, infoBlock = { type: "collection-info", prefix, info });
							$$invalidate(7, infoBlockTitle = phrases.footer.about.replace("{title}", info.name));
						}
					} else {
						$$invalidate(6, infoBlock = null);
						$$invalidate(7, infoBlockTitle = "");
					}
				}
			}
		};

		return [
			icons,
			customise,
			customisations,
			route,
			icon,
			hasIcons,
			infoBlock,
			infoBlockTitle
		];
	}

	class Full$1 extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$O, create_fragment$O, safe_not_equal, {
				icons: 0,
				customise: 1,
				customisations: 2,
				route: 3
			});
		}
	}

	/* src/icon-finder/components/main/Footer.svelte generated by Svelte v3.29.4 */

	function create_fragment$P(ctx) {
		let footer;
		let current;

		footer = new Full$1({
				props: {
					icons: /*icons*/ ctx[2],
					customisations: /*customisations*/ ctx[0],
					route: /*route*/ ctx[1],
					customise: /*customise*/ ctx[3]
				}
			});

		return {
			c() {
				create_component(footer.$$.fragment);
			},
			m(target, anchor) {
				mount_component(footer, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const footer_changes = {};
				if (dirty & /*icons*/ 4) footer_changes.icons = /*icons*/ ctx[2];
				if (dirty & /*customisations*/ 1) footer_changes.customisations = /*customisations*/ ctx[0];
				if (dirty & /*route*/ 2) footer_changes.route = /*route*/ ctx[1];
				footer.$set(footer_changes);
			},
			i(local) {
				if (current) return;
				transition_in(footer.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(footer.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(footer, detaching);
			}
		};
	}

	function instance$P($$self, $$props, $$invalidate) {
		
		
		
		
		
		let { selection } = $$props;
		let { selectionLength } = $$props;
		let { customisations } = $$props;
		let { route } = $$props;

		// Registry
		const registry = getContext("registry");

		// Change icon customisation value
		function customise(prop, value) {
			if (customisations[prop] !== void 0 && customisations[prop] !== value && typeof customisations[prop] === typeof value) {
				// Change value then change object to force Svelte update components
				const changed = { [prop]: value };

				const newCustomisations = mergeCustomisations(customisations, changed);

				// Send event: UICustomisationEvent
				registry.callback({
					type: "customisation",
					changed,
					customisations: newCustomisations
				});
			}
		}

		// Event listener
		let updateCounter = 0;

		let abortLoader = null;

		function loadingEvent() {
			$$invalidate(6, updateCounter++, updateCounter);
		}

		// Get list of loaded and pending icons
		let icons;

		let pending;

		// Remove event listener
		onDestroy(() => {
			if (abortLoader !== null) {
				abortLoader();
			}
		});

		$$self.$$set = $$props => {
			if ("selection" in $$props) $$invalidate(4, selection = $$props.selection);
			if ("selectionLength" in $$props) $$invalidate(5, selectionLength = $$props.selectionLength);
			if ("customisations" in $$props) $$invalidate(0, customisations = $$props.customisations);
			if ("route" in $$props) $$invalidate(1, route = $$props.route);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*updateCounter, selectionLength, selection, icons, abortLoader, pending*/ 500) {
				 {

					// Filter icons
					$$invalidate(2, icons = []);

					const newPending = [];
					const toLoad = [];
					const list = selectionLength ? selectionToArray(selection) : [];

					list.forEach(icon => {
						const name = lib.iconToString(icon);

						if (Iconify__default['default'].iconExists(name)) {
							icons.push(icon);
							return;
						}

						// Icon is missing
						if (abortLoader && pending && pending.indexOf(name) !== -1) {
							// Already pending: do nothing
							newPending.push(name);

							return;
						}

						// Add icon to list of icons to load
						newPending.push(name);

						toLoad.push(name);
					});

					// Update pending list
					$$invalidate(8, pending = newPending);

					if (toLoad.length) {
						// Load new icons
						if (abortLoader !== null) {
							abortLoader();
						}

						$$invalidate(7, abortLoader = Iconify__default['default'].loadIcons(toLoad, loadingEvent));
					}
				}
			}
		};

		return [customisations, route, icons, customise, selection, selectionLength];
	}

	class Footer_1 extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$P, create_fragment$P, safe_not_equal, {
				selection: 4,
				selectionLength: 5,
				customisations: 0,
				route: 1
			});
		}
	}

	/* src/icon-finder/components/Container.svelte generated by Svelte v3.29.4 */

	function create_if_block$u(ctx) {
		let wrapper;
		let current;

		wrapper = new Wrapper({
				props: {
					$$slots: { default: [create_default_slot$i] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(wrapper.$$.fragment);
			},
			m(target, anchor) {
				mount_component(wrapper, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const wrapper_changes = {};

				if (dirty & /*$$scope, selection, selectionLength, route, customisations, viewChanged, error, blocks*/ 759) {
					wrapper_changes.$$scope = { dirty, ctx };
				}

				wrapper.$set(wrapper_changes);
			},
			i(local) {
				if (current) return;
				transition_in(wrapper.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(wrapper.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(wrapper, detaching);
			}
		};
	}

	// (27:1) <Wrapper>
	function create_default_slot$i(ctx) {
		let content;
		let t;
		let footer;
		let current;

		content = new Content({
				props: {
					selection: /*selection*/ ctx[0],
					viewChanged: /*viewChanged*/ ctx[4],
					error: /*error*/ ctx[5],
					route: /*route*/ ctx[6],
					blocks: /*blocks*/ ctx[7]
				}
			});

		footer = new Footer_1({
				props: {
					selection: /*selection*/ ctx[0],
					selectionLength: /*selectionLength*/ ctx[1],
					route: /*route*/ ctx[6],
					customisations: /*customisations*/ ctx[2]
				}
			});

		return {
			c() {
				create_component(content.$$.fragment);
				t = space();
				create_component(footer.$$.fragment);
			},
			m(target, anchor) {
				mount_component(content, target, anchor);
				insert(target, t, anchor);
				mount_component(footer, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const content_changes = {};
				if (dirty & /*selection*/ 1) content_changes.selection = /*selection*/ ctx[0];
				if (dirty & /*viewChanged*/ 16) content_changes.viewChanged = /*viewChanged*/ ctx[4];
				if (dirty & /*error*/ 32) content_changes.error = /*error*/ ctx[5];
				if (dirty & /*route*/ 64) content_changes.route = /*route*/ ctx[6];
				if (dirty & /*blocks*/ 128) content_changes.blocks = /*blocks*/ ctx[7];
				content.$set(content_changes);
				const footer_changes = {};
				if (dirty & /*selection*/ 1) footer_changes.selection = /*selection*/ ctx[0];
				if (dirty & /*selectionLength*/ 2) footer_changes.selectionLength = /*selectionLength*/ ctx[1];
				if (dirty & /*route*/ 64) footer_changes.route = /*route*/ ctx[6];
				if (dirty & /*customisations*/ 4) footer_changes.customisations = /*customisations*/ ctx[2];
				footer.$set(footer_changes);
			},
			i(local) {
				if (current) return;
				transition_in(content.$$.fragment, local);
				transition_in(footer.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(content.$$.fragment, local);
				transition_out(footer.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(content, detaching);
				if (detaching) detach(t);
				destroy_component(footer, detaching);
			}
		};
	}

	function create_fragment$Q(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*hidden*/ ctx[3] !== true && create_if_block$u(ctx);

		return {
			c() {
				if (if_block) if_block.c();
				if_block_anchor = empty$1();
			},
			m(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				if (/*hidden*/ ctx[3] !== true) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*hidden*/ 8) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$u(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach(if_block_anchor);
			}
		};
	}

	function instance$Q($$self, $$props, $$invalidate) {
		
		
		
		
		let { registry } = $$props;
		let { selection } = $$props;
		let { selectionLength } = $$props;
		let { customisations } = $$props;
		let { hidden } = $$props;
		let { viewChanged } = $$props;
		let { error } = $$props;
		let { route } = $$props;
		let { blocks } = $$props;

		// Set context
		setContext("registry", registry);

		$$self.$$set = $$props => {
			if ("registry" in $$props) $$invalidate(8, registry = $$props.registry);
			if ("selection" in $$props) $$invalidate(0, selection = $$props.selection);
			if ("selectionLength" in $$props) $$invalidate(1, selectionLength = $$props.selectionLength);
			if ("customisations" in $$props) $$invalidate(2, customisations = $$props.customisations);
			if ("hidden" in $$props) $$invalidate(3, hidden = $$props.hidden);
			if ("viewChanged" in $$props) $$invalidate(4, viewChanged = $$props.viewChanged);
			if ("error" in $$props) $$invalidate(5, error = $$props.error);
			if ("route" in $$props) $$invalidate(6, route = $$props.route);
			if ("blocks" in $$props) $$invalidate(7, blocks = $$props.blocks);
		};

		return [
			selection,
			selectionLength,
			customisations,
			hidden,
			viewChanged,
			error,
			route,
			blocks,
			registry
		];
	}

	class Container$2 extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$Q, create_fragment$Q, safe_not_equal, {
				registry: 8,
				selection: 0,
				selectionLength: 1,
				customisations: 2,
				hidden: 3,
				viewChanged: 4,
				error: 5,
				route: 6,
				blocks: 7
			});
		}
	}

	/**
	 * Default values
	 */
	const defaultComponentsConfig = {
	    // Icons list mode.
	    list: false,
	    // True if icons list mode can be changed.
	    toggleList: true,
	    // Active code tab
	    codeTab: '',
	    // Can select multiple icons
	    multiSelect: false,
	    // Toggle footer blocks
	    propsVisible: true,
	    infoVisible: false,
	    codeVisible: false,
	};

	/**
	 * List of custom API providers
	 *
	 * Each array item must have:
	 *  provider: unique provider key, similar to icon set prefix
	 *  title: title to show in API providers tabs (used if showProviders is enabled in ./components.ts)
	 *  api: host name(s) as string or array of strings
	 */
	const customProviders = [
	/*
	{
	    provider: 'local',
	    title: 'Local Test',
	    api: 'http://localhost:3100',
	},
	*/
	];
	/**
	 * Add custom API providers
	 */
	function addCustomAPIProviders(registry) {
	    if (customProviders.length) {
	        customProviders.forEach((item) => {
	            const converted = lib.convertProviderData('', item);
	            if (converted) {
	                lib.addProvider(item.provider, converted);
	            }
	        });
	        // Set default API provider in router
	        // registry.router.defaultProvider = customProviders[0].provider;
	    }
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-empty-function
	function assertNever(s) { }
	// Add components configuration to config object
	lib.setComponentsConfig(defaultComponentsConfig);
	/**
	 * Wrapper class
	 */
	class Wrapper$1 {
	    /**
	     * Constructor
	     */
	    constructor(params) {
	        // Current state, always up to date
	        this._state = {
	            icons: [],
	            customisations: {},
	        };
	        // Selected icons as nested object
	        this._selection = Object.create(null);
	        // Number of selected icons
	        this._selectionLength = 0;
	        // Status
	        this._status = 'loading';
	        // Container component, added on first render
	        this._container = null;
	        this._params = params;
	        const customState = params.state;
	        // Set core parameters
	        const coreParams = {
	            callback: this._coreCallback.bind(this),
	        };
	        if (customState && customState.config) {
	            coreParams.config = customState.config;
	        }
	        if (params.iconSets) {
	            coreParams.iconSets =
	                params.iconSets instanceof Array
	                    ? {
	                        iconSets: params.iconSets,
	                    }
	                    : params.iconSets;
	            // console.log('Params.iconSets:', coreParams.iconSets);
	        }
	        // Disable Iconify cache
	        Iconify__default['default'].enableCache('local', false);
	        Iconify__default['default'].enableCache('session', false);
	        // Init core
	        const core = (this._core = new lib.IconFinderCore(coreParams));
	        const registry = (this._registry = core.registry);
	        // Callback
	        registry.setCustom('callback', this._internalCallback.bind(this));
	        // External link callback
	        registry.setCustom('link', this._externalLinkCallback.bind(this));
	        // Add API providers
	        addCustomAPIProviders();
	        // Set initial state
	        const state = this._state;
	        state.config = lib.customisedConfig(registry.config);
	        // Store partial route in state
	        const route = registry.partialRoute;
	        state.route = route ? route : void 0;
	        if (customState) {
	            // Set custom stuff
	            if (customState.icons) {
	                customState.icons.forEach((icon) => {
	                    let iconValue = typeof icon === 'string' ? lib.stringToIcon(icon) : icon;
	                    if (lib.validateIcon(iconValue)) {
	                        addToSelection(this._selection, iconValue);
	                    }
	                });
	                state.icons = selectionToArray(this._selection);
	                this._selectionLength = state.icons.length;
	            }
	            if (customState.customisations) {
	                state.customisations = customState.customisations;
	            }
	            if (customState.route) {
	                setTimeout(() => {
	                    // Set on next tick
	                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	                    registry.partialRoute = customState.route;
	                });
	            }
	        }
	    }
	    /**
	     * Get container status
	     */
	    getStatus() {
	        return this._status;
	    }
	    /**
	     * Get current state
	     */
	    getState() {
	        return this._state;
	    }
	    /**
	     * Hide or destroy
	     */
	    _hide(newStatus) {
	        switch (this._status) {
	            case 'hidden':
	            case 'destroyed':
	                // Cannot hide
	                return;
	            case 'loading':
	            case '':
	                // Hide
	                break;
	            default:
	                assertNever(this._status);
	        }
	        this._status = newStatus;
	        if (this._container) {
	            this._container.$set({
	                hidden: true,
	            });
	        }
	    }
	    /**
	     * Hide
	     */
	    hide() {
	        this._hide('hidden');
	    }
	    /**
	     * Destroy
	     */
	    destroy() {
	        if (this._status !== 'destroyed') {
	            this._hide('destroyed');
	            this._container = null;
	            this._registry.destroy();
	        }
	    }
	    /**
	     * Show
	     */
	    show() {
	        switch (this._status) {
	            // Cannot show or loading
	            case 'destroyed':
	            // Already visible or loading
	            case 'loading':
	            case '':
	                return;
	            case 'hidden':
	                // Show
	                break;
	            default:
	                assertNever(this._status);
	        }
	        this._status = '';
	        if (this._container) {
	            this._container.$set({
	                hidden: false,
	            });
	        }
	    }
	    /**
	     * Create Container component
	     */
	    _initContainer(data) {
	        const state = this._state;
	        // Check if container should be visible
	        let hidden = false;
	        switch (this._status) {
	            case 'hidden':
	            case 'destroyed':
	                hidden = true;
	            case '':
	            case 'loading':
	                break;
	            default:
	                assertNever(this._status);
	        }
	        // Properties
	        const props = {
	            // From RouterEvent
	            viewChanged: data.viewChanged,
	            error: data.error,
	            blocks: data.blocks,
	            // Convert to full route
	            route: data.route ? lib.objectToRoute(data.route) : null,
	            // Selected icons
	            selection: this._selection,
	            selectionLength: this._selectionLength,
	            // Full icon customisations
	            customisations: mergeCustomisations(defaultCustomisations, state.customisations ? state.customisations : {}),
	            // Registry
	            registry: this._core.registry,
	            // Status
	            hidden,
	        };
	        // Constructor parameters
	        const params = {
	            target: this._params.container,
	            props,
	        };
	        return new Container$2(params);
	    }
	    /**
	     * Trigger event
	     */
	    _triggerEvent(event) {
	        if (this._status !== 'destroyed' && this._params.callback) {
	            this._params.callback(event);
	        }
	    }
	    /**
	     * Callback from core
	     */
	    _coreCallback(data) {
	        if (!this._container) {
	            // Create new container on first render
	            this._container = this._initContainer(data);
	            // Mark as loaded
	            if (this._status === 'loading') {
	                this._status = '';
	                this._triggerEvent({
	                    type: 'load',
	                });
	            }
	            // Save route
	            if (data.route) {
	                this._setRoute(data.route);
	            }
	            return;
	        }
	        // Update container
	        const container = this._container;
	        // Convert partial route to full route.
	        // Use full route in components, partial route in state and callback
	        const partialRoute = data.route;
	        const fullRoute = partialRoute ? lib.objectToRoute(partialRoute) : null;
	        data.route = fullRoute;
	        // Check for changes
	        if (data.viewChanged ||
	            !lib.compareObjects(data.route, container.$$.props.route)) {
	            // Change everything
	            container.$set(data);
	            // Save route
	            if (partialRoute) {
	                this._setRoute(partialRoute);
	            }
	        }
	        else {
	            // Route is the same, so if error has changed, only error and blocks need update
	            if (data.error === '' || data.error !== container.$$.props.error) {
	                container.$set({
	                    error: data.error,
	                    blocks: data.blocks,
	                });
	            }
	        }
	    }
	    /**
	     * Select icon
	     */
	    _internalCallback(event) {
	        // console.log('Internal event:', event);
	        let icon;
	        let selectionEvent;
	        const type = event.type;
	        switch (type) {
	            case 'selection':
	                // Selected icon changed: trigger event and update container (this event does not automatically update container)
	                selectionEvent = event;
	                if (typeof selectionEvent.icon === 'string') {
	                    icon = lib.stringToIcon(selectionEvent.icon);
	                }
	                else {
	                    icon = selectionEvent.icon;
	                }
	                this._selectIcon(icon, typeof selectionEvent.selected === 'boolean'
	                    ? selectionEvent.selected
	                    : 'force', true);
	                return;
	            case 'customisation':
	                // Customisation was clicked: trigger event
	                this._setCustomisations(event.customisations);
	                return;
	            case 'button':
	                // Button was clicked: trigger event
	                this._triggerEvent({
	                    type: 'button',
	                    button: event.button,
	                    state: this._state,
	                });
	                return;
	            case 'config':
	                // Configuration changed: trigger event
	                this._state.config = lib.customisedConfig(this._registry.config);
	                this._triggerEvent({
	                    type: 'config',
	                    config: this._state.config,
	                });
	                return;
	        }
	    }
	    /**
	     * External link was clicked
	     */
	    _externalLinkCallback(event) {
	        if (event && event.target) {
	            const target = event.target;
	            const href = target.getAttribute('href');
	            if (typeof href === 'string') {
	                this._triggerEvent({
	                    type: 'link',
	                    href,
	                    event,
	                });
	            }
	        }
	    }
	    /**
	     * Set route
	     */
	    _setRoute(route) {
	        const state = this._state;
	        // Check if route has changed
	        if (state.route === void 0 || !lib.compareObjects(route, state.route)) {
	            state.route = route;
	            this._triggerEvent({
	                type: 'route',
	                route,
	            });
	            return true;
	        }
	        return false;
	    }
	    /**
	     * Set route
	     */
	    setRoute(route) {
	        if (this._status === 'destroyed') {
	            return;
	        }
	        const router = this._core.router;
	        function loadRoute() {
	            router.partialRoute = route;
	        }
	        if (!this._container) {
	            // Load on next tick
	            setTimeout(loadRoute);
	        }
	        else {
	            loadRoute();
	        }
	    }
	    /**
	     * Select icon
	     */
	    _selectIcon(icon, select, updateContainer) {
	        const state = this._state;
	        const done = () => {
	            this._selectionLength = state.icons.length;
	            if (updateContainer && this._container) {
	                const update = {
	                    selection: this._selection,
	                    selectionLength: this._selectionLength,
	                };
	                this._container.$set(update);
	            }
	            this._triggerEvent({
	                type: 'selection',
	                icons: state.icons,
	            });
	        };
	        if (!icon) {
	            // De-select everything?
	            if (select === true || state.icons.length !== 1) {
	                return false;
	            }
	            // Reset selection
	            this._selection = Object.create(null);
	            state.icons = [];
	            done();
	            return true;
	        }
	        // Check if icon is selected
	        const selected = !!this._selectionLength && isIconSelected(this._selection, icon);
	        if (selected === select || (selected && select === 'force')) {
	            return false;
	        }
	        if ((!selected && select === 'force') ||
	            !this._registry.config.components.multiSelect) {
	            // Clear selection if multiple icons cannot be selected and icon is not selected
	            this._selection = Object.create(null);
	        }
	        // Toggle icon
	        if (selected) {
	            removeFromSelection(this._selection, icon);
	        }
	        else {
	            addToSelection(this._selection, icon);
	        }
	        // Update stuff
	        state.icons = selectionToArray(this._selection);
	        done();
	        // Reset customisations for multiple icons
	        if (state.icons.length > 1) {
	            let changed = false;
	            const customisations = mergeCustomisations(defaultCustomisations, state.customisations);
	            if (customisations.inline) {
	                customisations.inline = false;
	                changed = true;
	            }
	            if (changed) {
	                this._setCustomisations(customisations);
	            }
	        }
	        return true;
	    }
	    /**
	     * Select icon(s)
	     */
	    selectIcons(icons) {
	        if (this._status === 'destroyed') {
	            return;
	        }
	        const state = this._state;
	        // Reset icons
	        this._selection = Object.create(null);
	        const selection = this._selection;
	        // Add all icons (only last icon if multiple icons cannot be selected)
	        if (icons) {
	            (this._registry.config.components.multiSelect
	                ? icons
	                : icons.slice(-1)).forEach((icon) => {
	                const converted = typeof icon === 'string' ? lib.stringToIcon(icon) : icon;
	                if (converted) {
	                    addToSelection(selection, converted);
	                }
	            });
	        }
	        // Update variables
	        state.icons = selectionToArray(selection);
	        this._selectionLength = state.icons.length;
	        // Update container
	        if (this._container) {
	            const update = {
	                selection: selection,
	                selectionLength: this._selectionLength,
	            };
	            this._container.$set(update);
	        }
	        // Trigger event
	        this._triggerEvent({
	            type: 'selection',
	            icons: state.icons,
	        });
	    }
	    /**
	     * Change customisations
	     */
	    _setCustomisations(customisations) {
	        const state = this._state;
	        if (state.customisations !== void 0 &&
	            lib.compareObjects(state.customisations, customisations)) {
	            return false;
	        }
	        // Save partial customisations in state
	        state.customisations = filterCustomisations(customisations);
	        // Update container
	        if (this._container) {
	            this._container.$set({
	                customisations,
	            });
	        }
	        else {
	            if (!this._params.state) {
	                this._params.state = {};
	            }
	            this._params.state.customisations = customisations;
	        }
	        // Trigger evemt
	        this._triggerEvent({
	            type: 'customisations',
	            customisations,
	        });
	        return true;
	    }
	    /**
	     * Change customisations
	     */
	    setCustomisations(customisations) {
	        if (this._status === 'destroyed') {
	            return;
	        }
	        this._setCustomisations(mergeCustomisations(defaultCustomisations, customisations));
	    }
	}

	// Load icon set
	fetch('./line-md.json')
	    .then((data) => {
	    return data.json();
	})
	    .then((iconSet) => {
	    const container = document.getElementById('container');
	    const prefix = 'line-md';
	    container.innerHTML = '';
	    // Create instance
	    const wrapper = new Wrapper$1({
	        container,
	        callback: (event) => {
	            // console.log('Event:', event);
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
	    document.getElementById('container').innerHTML =
	        'Error fetching icon sets';
	});

}(Iconify));
//# sourceMappingURL=icon-finder.js.map
