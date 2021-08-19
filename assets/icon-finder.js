(function () {
    'use strict';

    function noop$1() { }
    function assign$1(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run$1(fn) {
        return fn();
    }
    function blank_object$1() {
        return Object.create(null);
    }
    function run_all$1(fns) {
        fns.forEach(run$1);
    }
    function is_function$1(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal$1(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty$1(obj) {
        return Object.keys(obj).length === 0;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
    }
    function upper_bound(low, high, key, value) {
        // Return first index of value larger than input value in the range [low, high)
        while (low < high) {
            const mid = low + ((high - low) >> 1);
            if (key(mid) <= value) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        return low;
    }
    function init_hydrate(target) {
        if (target.hydrate_init)
            return;
        target.hydrate_init = true;
        // We know that all children have claim_order values since the unclaimed have been detached
        const children = target.childNodes;
        /*
        * Reorder claimed children optimally.
        * We can reorder claimed children optimally by finding the longest subsequence of
        * nodes that are already claimed in order and only moving the rest. The longest
        * subsequence subsequence of nodes that are claimed in order can be found by
        * computing the longest increasing subsequence of .claim_order values.
        *
        * This algorithm is optimal in generating the least amount of reorder operations
        * possible.
        *
        * Proof:
        * We know that, given a set of reordering operations, the nodes that do not move
        * always form an increasing subsequence, since they do not move among each other
        * meaning that they must be already ordered among each other. Thus, the maximal
        * set of nodes that do not move form a longest increasing subsequence.
        */
        // Compute longest increasing subsequence
        // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
        const m = new Int32Array(children.length + 1);
        // Predecessor indices + 1
        const p = new Int32Array(children.length);
        m[0] = -1;
        let longest = 0;
        for (let i = 0; i < children.length; i++) {
            const current = children[i].claim_order;
            // Find the largest subsequence length such that it ends in a value less than our current value
            // upper_bound returns first greater value, so we subtract one
            const seqLen = upper_bound(1, longest + 1, idx => children[m[idx]].claim_order, current) - 1;
            p[i] = m[seqLen] + 1;
            const newLen = seqLen + 1;
            // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
            m[newLen] = i;
            longest = Math.max(newLen, longest);
        }
        // The longest increasing subsequence of nodes (initially reversed)
        const lis = [];
        // The rest of the nodes, nodes that will be moved
        const toMove = [];
        let last = children.length - 1;
        for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
            lis.push(children[cur - 1]);
            for (; last >= cur; last--) {
                toMove.push(children[last]);
            }
            last--;
        }
        for (; last >= 0; last--) {
            toMove.push(children[last]);
        }
        lis.reverse();
        // We sort the nodes being moved to guarantee that their insertion order matches the claim order
        toMove.sort((a, b) => a.claim_order - b.claim_order);
        // Finally, we move the nodes
        for (let i = 0, j = 0; i < toMove.length; i++) {
            while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
                j++;
            }
            const anchor = j < lis.length ? lis[j] : null;
            target.insertBefore(toMove[i], anchor);
        }
    }
    function append$1(target, node) {
        if (is_hydrating) {
            init_hydrate(target);
            if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
                target.actual_end_child = target.firstChild;
            }
            if (node !== target.actual_end_child) {
                target.insertBefore(node, target.actual_end_child);
            }
            else {
                target.actual_end_child = node.nextSibling;
            }
        }
        else if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert$1(target, node, anchor) {
        if (is_hydrating && !anchor) {
            append$1(target, node);
        }
        else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
    }
    function detach$1(node) {
        node.parentNode.removeChild(node);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text$1(data) {
        return document.createTextNode(data);
    }
    function empty$2() {
        return text$1('');
    }
    function attr$1(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr$1(node, key, attributes[key]);
        }
    }
    function children$1(element) {
        return Array.from(element.childNodes);
    }

    let current_component$1;
    function set_current_component$1(component) {
        current_component$1 = component;
    }
    function get_current_component$1() {
        if (!current_component$1)
            throw new Error('Function called outside component initialization');
        return current_component$1;
    }
    function onMount$1(fn) {
        get_current_component$1().$$.on_mount.push(fn);
    }
    function onDestroy$1(fn) {
        get_current_component$1().$$.on_destroy.push(fn);
    }

    const dirty_components$1 = [];
    const binding_callbacks$1 = [];
    const render_callbacks$1 = [];
    const flush_callbacks$1 = [];
    const resolved_promise$1 = Promise.resolve();
    let update_scheduled$1 = false;
    function schedule_update$1() {
        if (!update_scheduled$1) {
            update_scheduled$1 = true;
            resolved_promise$1.then(flush$1);
        }
    }
    function add_render_callback$1(fn) {
        render_callbacks$1.push(fn);
    }
    let flushing$1 = false;
    const seen_callbacks$1 = new Set();
    function flush$1() {
        if (flushing$1)
            return;
        flushing$1 = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components$1.length; i += 1) {
                const component = dirty_components$1[i];
                set_current_component$1(component);
                update$1(component.$$);
            }
            set_current_component$1(null);
            dirty_components$1.length = 0;
            while (binding_callbacks$1.length)
                binding_callbacks$1.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks$1.length; i += 1) {
                const callback = render_callbacks$1[i];
                if (!seen_callbacks$1.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks$1.add(callback);
                    callback();
                }
            }
            render_callbacks$1.length = 0;
        } while (dirty_components$1.length);
        while (flush_callbacks$1.length) {
            flush_callbacks$1.pop()();
        }
        update_scheduled$1 = false;
        flushing$1 = false;
        seen_callbacks$1.clear();
    }
    function update$1($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all$1($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback$1);
        }
    }
    const outroing$1 = new Set();
    function transition_in$1(block, local) {
        if (block && block.i) {
            outroing$1.delete(block);
            block.i(local);
        }
    }

    function get_spread_update$1(levels, updates) {
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
    function mount_component$1(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback$1(() => {
                const new_on_destroy = on_mount.map(run$1).filter(is_function$1);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all$1(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback$1);
    }
    function destroy_component$1(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all$1($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty$1(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components$1.push(component);
            schedule_update$1();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init$1(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component$1;
        set_current_component$1(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object$1(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object$1(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty$1(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all$1($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                start_hydrating();
                const nodes = children$1(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach$1);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in$1(component.$$.fragment);
            mount_component$1(component, options.target, options.anchor, options.customElement);
            end_hydrating();
            flush$1();
        }
        set_current_component$1(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent$1 {
        $destroy() {
            destroy_component$1(this, 1);
            this.$destroy = noop$1;
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
            if (this.$$set && !is_empty$1($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function createCommonjsModule$1(fn, basedir, module) {
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

    var icon$2 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fullIcon = exports.iconDefaults = exports.minifyProps = exports.matchName = void 0;
    /**
     * Expression to test part of icon name.
     */
    exports.matchName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    /**
     * Properties that can be minified
     *
     * Values of all these properties are awalys numbers
     */
    exports.minifyProps = [
        // All IconifyDimenisons properties
        'width',
        'height',
        'top',
        'left',
    ];
    /**
     * Default values for all optional IconifyIcon properties
     */
    exports.iconDefaults = Object.freeze({
        left: 0,
        top: 0,
        width: 16,
        height: 16,
        rotate: 0,
        vFlip: false,
        hFlip: false,
    });
    /**
     * Add optional properties to icon
     */
    function fullIcon(data) {
        return { ...exports.iconDefaults, ...data };
    }
    exports.fullIcon = fullIcon;
    });

    var name$1 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateIcon = exports.stringToIcon = void 0;

    /**
     * Convert string to Icon object.
     */
    const stringToIcon = (value, validate, allowSimpleName, provider = '') => {
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
            const result = {
                // Allow provider without '@': "provider:prefix:name"
                provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
                prefix,
                name,
            };
            return validate && !exports.validateIcon(result) ? null : result;
        }
        // Attempt to split by dash: "prefix-name"
        const name = colonSeparated[0];
        const dashSeparated = name.split('-');
        if (dashSeparated.length > 1) {
            const result = {
                provider: provider,
                prefix: dashSeparated.shift(),
                name: dashSeparated.join('-'),
            };
            return validate && !exports.validateIcon(result) ? null : result;
        }
        // If allowEmpty is set, allow empty provider and prefix, allowing names like "home"
        if (allowSimpleName && provider === '') {
            const result = {
                provider: provider,
                prefix: '',
                name,
            };
            return validate && !exports.validateIcon(result, allowSimpleName)
                ? null
                : result;
        }
        return null;
    };
    exports.stringToIcon = stringToIcon;
    /**
     * Check if icon is valid.
     *
     * This function is not part of stringToIcon because validation is not needed for most code.
     */
    const validateIcon = (icon$1, allowSimpleName) => {
        if (!icon$1) {
            return false;
        }
        return !!((icon$1.provider === '' || icon$1.provider.match(icon$2.matchName)) &&
            ((allowSimpleName && icon$1.prefix === '') ||
                icon$1.prefix.match(icon$2.matchName)) &&
            icon$1.name.match(icon$2.matchName));
    };
    exports.validateIcon = validateIcon;
    });

    var merge = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergeIconData = void 0;

    /**
     * Merge icon and alias
     */
    function mergeIconData(icon$1, alias) {
        const result = { ...icon$1 };
        for (const key in icon$2.iconDefaults) {
            const prop = key;
            if (alias[prop] !== void 0) {
                const value = alias[prop];
                if (result[prop] === void 0) {
                    // Missing value
                    result[prop] = value;
                    continue;
                }
                switch (prop) {
                    case 'rotate':
                        result[prop] =
                            (result[prop] + value) % 4;
                        break;
                    case 'hFlip':
                    case 'vFlip':
                        result[prop] = value !== result[prop];
                        break;
                    default:
                        // Overwrite value
                        result[prop] =
                            value;
                }
            }
        }
        return result;
    }
    exports.mergeIconData = mergeIconData;
    });

    var parse = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseIconSet = void 0;


    /**
     * Get list of defaults keys
     */
    const defaultsKeys = Object.keys(icon$2.iconDefaults);
    /**
     * Resolve alias
     */
    function resolveAlias(alias, icons, aliases, level = 0) {
        const parent = alias.parent;
        if (icons[parent] !== void 0) {
            return merge.mergeIconData(icons[parent], alias);
        }
        if (aliases[parent] !== void 0) {
            if (level > 2) {
                // icon + alias + alias + alias = too much nesting, possibly infinite
                return null;
            }
            const icon = resolveAlias(aliases[parent], icons, aliases, level + 1);
            if (icon) {
                return merge.mergeIconData(icon, alias);
            }
        }
        return null;
    }
    /**
     * Extract icons from an icon set
     */
    function parseIconSet(data, callback, list = 'none') {
        const added = [];
        // Must be an object
        if (typeof data !== 'object') {
            return list === 'none' ? false : added;
        }
        // Check for missing icons list returned by API
        if (data.not_found instanceof Array) {
            data.not_found.forEach((name) => {
                callback(name, null);
                if (list === 'all') {
                    added.push(name);
                }
            });
        }
        // Must have 'icons' object
        if (typeof data.icons !== 'object') {
            return list === 'none' ? false : added;
        }
        // Get default values
        const defaults = Object.create(null);
        defaultsKeys.forEach((key) => {
            if (data[key] !== void 0 && typeof data[key] !== 'object') {
                defaults[key] = data[key];
            }
        });
        // Get icons
        const icons = data.icons;
        Object.keys(icons).forEach((name) => {
            const icon$1 = icons[name];
            if (typeof icon$1.body !== 'string') {
                return;
            }
            // Freeze icon to make sure it will not be modified
            callback(name, Object.freeze({ ...icon$2.iconDefaults, ...defaults, ...icon$1 }));
            added.push(name);
        });
        // Get aliases
        if (typeof data.aliases === 'object') {
            const aliases = data.aliases;
            Object.keys(aliases).forEach((name) => {
                const icon$1 = resolveAlias(aliases[name], icons, aliases, 1);
                if (icon$1) {
                    // Freeze icon to make sure it will not be modified
                    callback(name, Object.freeze({ ...icon$2.iconDefaults, ...defaults, ...icon$1 }));
                    added.push(name);
                }
            });
        }
        return list === 'none' ? added.length > 0 : added;
    }
    exports.parseIconSet = parseIconSet;
    });

    var storage_1 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.listIcons = exports.getIcon = exports.iconExists = exports.addIcon = exports.addIconSet = exports.getStorage = exports.newStorage = void 0;


    /**
     * Storage by provider and prefix
     */
    const storage = Object.create(null);
    /**
     * Create new storage
     */
    function newStorage(provider, prefix) {
        return {
            provider,
            prefix,
            icons: Object.create(null),
            missing: Object.create(null),
        };
    }
    exports.newStorage = newStorage;
    /**
     * Get storage for provider and prefix
     */
    function getStorage(provider, prefix) {
        if (storage[provider] === void 0) {
            storage[provider] = Object.create(null);
        }
        const providerStorage = storage[provider];
        if (providerStorage[prefix] === void 0) {
            providerStorage[prefix] = newStorage(provider, prefix);
        }
        return providerStorage[prefix];
    }
    exports.getStorage = getStorage;
    /**
     * Add icon set to storage
     *
     * Returns array of added icons if 'list' is true and icons were added successfully
     */
    function addIconSet(storage, data, list = 'none') {
        const t = Date.now();
        return parse.parseIconSet(data, (name, icon) => {
            if (icon === null) {
                storage.missing[name] = t;
            }
            else {
                storage.icons[name] = icon;
            }
        }, list);
    }
    exports.addIconSet = addIconSet;
    /**
     * Add icon to storage
     */
    function addIcon(storage, name, icon$1) {
        try {
            if (typeof icon$1.body === 'string') {
                // Freeze icon to make sure it will not be modified
                storage.icons[name] = Object.freeze(icon$2.fullIcon(icon$1));
                return true;
            }
        }
        catch (err) {
            // Do nothing
        }
        return false;
    }
    exports.addIcon = addIcon;
    /**
     * Check if icon exists
     */
    function iconExists(storage, name) {
        return storage.icons[name] !== void 0;
    }
    exports.iconExists = iconExists;
    /**
     * Get icon data
     */
    function getIcon(storage, name) {
        const value = storage.icons[name];
        return value === void 0 ? null : value;
    }
    exports.getIcon = getIcon;
    /**
     * List available icons
     */
    function listIcons(provider, prefix) {
        let allIcons = [];
        // Get providers
        let providers;
        if (typeof provider === 'string') {
            providers = [provider];
        }
        else {
            providers = Object.keys(storage);
        }
        // Get all icons
        providers.forEach((provider) => {
            let prefixes;
            if (typeof provider === 'string' && typeof prefix === 'string') {
                prefixes = [prefix];
            }
            else {
                prefixes =
                    storage[provider] === void 0
                        ? []
                        : Object.keys(storage[provider]);
            }
            prefixes.forEach((prefix) => {
                const storage = getStorage(provider, prefix);
                const icons = Object.keys(storage.icons).map((name) => (provider !== '' ? '@' + provider + ':' : '') +
                    prefix +
                    ':' +
                    name);
                allIcons = allIcons.concat(icons);
            });
        });
        return allIcons;
    }
    exports.listIcons = listIcons;
    });

    var functions$3 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.storageFunctions = exports.addCollection = exports.addIcon = exports.getIconData = exports.allowSimpleNames = void 0;



    /**
     * Allow storing icons without provider or prefix, making it possible to store icons like "home"
     */
    let simpleNames = false;
    function allowSimpleNames(allow) {
        if (typeof allow === 'boolean') {
            simpleNames = allow;
        }
        return simpleNames;
    }
    exports.allowSimpleNames = allowSimpleNames;
    /**
     * Get icon data
     */
    function getIconData(name$1$1) {
        const icon = typeof name$1$1 === 'string' ? name$1.stringToIcon(name$1$1, true, simpleNames) : name$1$1;
        return icon
            ? storage_1.getIcon(storage_1.getStorage(icon.provider, icon.prefix), icon.name)
            : null;
    }
    exports.getIconData = getIconData;
    /**
     * Add one icon
     */
    function addIcon(name$1$1, data) {
        const icon = name$1.stringToIcon(name$1$1, true, simpleNames);
        if (!icon) {
            return false;
        }
        const storage = storage_1.getStorage(icon.provider, icon.prefix);
        return storage_1.addIcon(storage, icon.name, data);
    }
    exports.addIcon = addIcon;
    /**
     * Add icon set
     */
    function addCollection(data, provider) {
        if (typeof data !== 'object') {
            return false;
        }
        // Get provider
        if (typeof provider !== 'string') {
            provider = typeof data.provider === 'string' ? data.provider : '';
        }
        // Check for simple names: requires empty provider and prefix
        if (simpleNames &&
            provider === '' &&
            (typeof data.prefix !== 'string' || data.prefix === '')) {
            // Simple names: add icons one by one
            let added = false;
            parse.parseIconSet(data, (name, icon) => {
                if (icon !== null && addIcon(name, icon)) {
                    added = true;
                }
            });
            return added;
        }
        // Validate provider and prefix
        if (typeof data.prefix !== 'string' ||
            !name$1.validateIcon({
                provider,
                prefix: data.prefix,
                name: 'a',
            })) {
            return false;
        }
        const storage = storage_1.getStorage(provider, data.prefix);
        return !!storage_1.addIconSet(storage, data);
    }
    exports.addCollection = addCollection;
    /**
     * Export
     */
    exports.storageFunctions = {
        // Check if icon exists
        iconExists: (name) => getIconData(name) !== null,
        // Get raw icon data
        getIcon: (name) => {
            const result = getIconData(name);
            return result ? { ...result } : null;
        },
        // List icons
        listIcons: storage_1.listIcons,
        // Add icon
        addIcon,
        // Add icon set
        addCollection,
    };
    });

    var id = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.replaceIDs = void 0;
    /**
     * Regular expression for finding ids
     */
    const regex = /\sid="(\S+)"/g;
    /**
     * Match for allowed characters before and after id in replacement, including () for group
     */
    const replaceValue = '([^A-Za-z0-9_-])';
    /**
     * Escape value for 'new RegExp()'
     */
    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
    /**
     * New random-ish prefix for ids
     */
    const randomPrefix = 'IconifyId-' +
        Date.now().toString(16) +
        '-' +
        ((Math.random() * 0x1000000) | 0).toString(16) +
        '-';
    /**
     * Counter for ids, increasing with every replacement
     */
    let counter = 0;
    /**
     * Replace IDs in SVG output with unique IDs
     * Fast replacement without parsing XML, assuming commonly used patterns and clean XML (icon should have been cleaned up with Iconify Tools or SVGO).
     */
    function replaceIDs(body, prefix = randomPrefix) {
        // Find all IDs
        const ids = [];
        let match;
        while ((match = regex.exec(body))) {
            ids.push(match[1]);
        }
        if (!ids.length) {
            return body;
        }
        // Replace with unique ids
        ids.forEach((id) => {
            const newID = typeof prefix === 'function' ? prefix() : prefix + counter++;
            body = body.replace(new RegExp(replaceValue + '(' + escapeRegExp(id) + ')' + replaceValue, 'g'), '$1' + newID + '$3');
        });
        return body;
    }
    exports.replaceIDs = replaceIDs;
    });

    var size$1 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.calculateSize = void 0;
    /**
     * Regular expressions for calculating dimensions
     */
    const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
    const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
    /**
     * Calculate second dimension when only 1 dimension is set
     *
     * @param {string|number} size One dimension (such as width)
     * @param {number} ratio Width/height ratio.
     *      If size is width, ratio = height/width
     *      If size is height, ratio = width/height
     * @param {number} [precision] Floating number precision in result to minimize output. Default = 2
     * @return {string|number} Another dimension
     */
    function calculateSize(size, ratio, precision) {
        if (ratio === 1) {
            return size;
        }
        precision = precision === void 0 ? 100 : precision;
        if (typeof size === 'number') {
            return Math.ceil(size * ratio * precision) / precision;
        }
        if (typeof size !== 'string') {
            return size;
        }
        // Split code into sets of strings and numbers
        const oldParts = size.split(unitsSplit);
        if (oldParts === null || !oldParts.length) {
            return size;
        }
        const newParts = [];
        let code = oldParts.shift();
        let isNumber = unitsTest.test(code);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (isNumber) {
                const num = parseFloat(code);
                if (isNaN(num)) {
                    newParts.push(code);
                }
                else {
                    newParts.push(Math.ceil(num * ratio * precision) / precision);
                }
            }
            else {
                newParts.push(code);
            }
            // next
            code = oldParts.shift();
            if (code === void 0) {
                return newParts.join('');
            }
            isNumber = !isNumber;
        }
    }
    exports.calculateSize = calculateSize;
    });

    var customisations$2 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergeCustomisations = exports.defaults = void 0;
    /**
     * Default icon customisations values
     */
    exports.defaults = Object.freeze({
        // Display mode
        inline: false,
        // Dimensions
        width: null,
        height: null,
        // Alignment
        hAlign: 'center',
        vAlign: 'middle',
        slice: false,
        // Transformations
        hFlip: false,
        vFlip: false,
        rotate: 0,
    });
    /**
     * Convert IconifyIconCustomisations to FullIconCustomisations
     */
    function mergeCustomisations(defaults, item) {
        const result = {};
        for (const key in defaults) {
            const attr = key;
            // Copy old value
            result[attr] = defaults[attr];
            if (item[attr] === void 0) {
                continue;
            }
            // Validate new value
            const value = item[attr];
            switch (attr) {
                // Boolean attributes that override old value
                case 'inline':
                case 'slice':
                    if (typeof value === 'boolean') {
                        result[attr] = value;
                    }
                    break;
                // Boolean attributes that are merged
                case 'hFlip':
                case 'vFlip':
                    if (value === true) {
                        result[attr] = !result[attr];
                    }
                    break;
                // Non-empty string
                case 'hAlign':
                case 'vAlign':
                    if (typeof value === 'string' && value !== '') {
                        result[attr] = value;
                    }
                    break;
                // Non-empty string / non-zero number / null
                case 'width':
                case 'height':
                    if ((typeof value === 'string' && value !== '') ||
                        (typeof value === 'number' && value) ||
                        value === null) {
                        result[attr] = value;
                    }
                    break;
                // Rotation
                case 'rotate':
                    if (typeof value === 'number') {
                        result[attr] += value;
                    }
                    break;
            }
        }
        return result;
    }
    exports.mergeCustomisations = mergeCustomisations;
    });

    var build$1 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.iconToSVG = void 0;

    /**
     * Get preserveAspectRatio value
     */
    function preserveAspectRatio(props) {
        let result = '';
        switch (props.hAlign) {
            case 'left':
                result += 'xMin';
                break;
            case 'right':
                result += 'xMax';
                break;
            default:
                result += 'xMid';
        }
        switch (props.vAlign) {
            case 'top':
                result += 'YMin';
                break;
            case 'bottom':
                result += 'YMax';
                break;
            default:
                result += 'YMid';
        }
        result += props.slice ? ' slice' : ' meet';
        return result;
    }
    /**
     * Get SVG attributes and content from icon + customisations
     *
     * Does not generate style to make it compatible with frameworks that use objects for style, such as React.
     * Instead, it generates 'inline' value. If true, rendering engine should add verticalAlign: -0.125em to icon.
     *
     * Customisations should be normalised by platform specific parser.
     * Result should be converted to <svg> by platform specific parser.
     * Use replaceIDs to generate unique IDs for body.
     */
    function iconToSVG(icon, customisations) {
        // viewBox
        const box = {
            left: icon.left,
            top: icon.top,
            width: icon.width,
            height: icon.height,
        };
        // Body
        let body = icon.body;
        // Apply transformations
        [icon, customisations].forEach((props) => {
            const transformations = [];
            const hFlip = props.hFlip;
            const vFlip = props.vFlip;
            let rotation = props.rotate;
            // Icon is flipped first, then rotated
            if (hFlip) {
                if (vFlip) {
                    rotation += 2;
                }
                else {
                    // Horizontal flip
                    transformations.push('translate(' +
                        (box.width + box.left) +
                        ' ' +
                        (0 - box.top) +
                        ')');
                    transformations.push('scale(-1 1)');
                    box.top = box.left = 0;
                }
            }
            else if (vFlip) {
                // Vertical flip
                transformations.push('translate(' +
                    (0 - box.left) +
                    ' ' +
                    (box.height + box.top) +
                    ')');
                transformations.push('scale(1 -1)');
                box.top = box.left = 0;
            }
            let tempValue;
            if (rotation < 0) {
                rotation -= Math.floor(rotation / 4) * 4;
            }
            rotation = rotation % 4;
            switch (rotation) {
                case 1:
                    // 90deg
                    tempValue = box.height / 2 + box.top;
                    transformations.unshift('rotate(90 ' + tempValue + ' ' + tempValue + ')');
                    break;
                case 2:
                    // 180deg
                    transformations.unshift('rotate(180 ' +
                        (box.width / 2 + box.left) +
                        ' ' +
                        (box.height / 2 + box.top) +
                        ')');
                    break;
                case 3:
                    // 270deg
                    tempValue = box.width / 2 + box.left;
                    transformations.unshift('rotate(-90 ' + tempValue + ' ' + tempValue + ')');
                    break;
            }
            if (rotation % 2 === 1) {
                // Swap width/height and x/y for 90deg or 270deg rotation
                if (box.left !== 0 || box.top !== 0) {
                    tempValue = box.left;
                    box.left = box.top;
                    box.top = tempValue;
                }
                if (box.width !== box.height) {
                    tempValue = box.width;
                    box.width = box.height;
                    box.height = tempValue;
                }
            }
            if (transformations.length) {
                body =
                    '<g transform="' +
                        transformations.join(' ') +
                        '">' +
                        body +
                        '</g>';
            }
        });
        // Calculate dimensions
        let width, height;
        if (customisations.width === null && customisations.height === null) {
            // Set height to '1em', calculate width
            height = '1em';
            width = size$1.calculateSize(height, box.width / box.height);
        }
        else if (customisations.width !== null &&
            customisations.height !== null) {
            // Values are set
            width = customisations.width;
            height = customisations.height;
        }
        else if (customisations.height !== null) {
            // Height is set
            height = customisations.height;
            width = size$1.calculateSize(height, box.width / box.height);
        }
        else {
            // Width is set
            width = customisations.width;
            height = size$1.calculateSize(width, box.height / box.width);
        }
        // Check for 'auto'
        if (width === 'auto') {
            width = box.width;
        }
        if (height === 'auto') {
            height = box.height;
        }
        // Convert to string
        width = typeof width === 'string' ? width : width + '';
        height = typeof height === 'string' ? height : height + '';
        // Result
        const result = {
            attributes: {
                width,
                height,
                preserveAspectRatio: preserveAspectRatio(customisations),
                viewBox: box.left + ' ' + box.top + ' ' + box.width + ' ' + box.height,
            },
            body,
        };
        if (customisations.inline) {
            result.inline = true;
        }
        return result;
    }
    exports.iconToSVG = iconToSVG;
    });

    var functions$2 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.builderFunctions = void 0;





    /**
     * Exported builder functions
     */
    exports.builderFunctions = {
        replaceIDs: id.replaceIDs,
        calculateSize: size$1.calculateSize,
        buildIcon: (icon$1, customisations$1) => {
            return build$1.iconToSVG(icon$2.fullIcon(icon$1), customisations$2.mergeCustomisations(customisations$2.defaults, customisations$1));
        },
    };
    });

    var modules$1 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.coreModules = void 0;
    exports.coreModules = {};
    });

    var config$1 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultConfig = void 0;
    /**
     * Default RedundancyConfig for API calls
     */
    exports.defaultConfig = {
        resources: [],
        index: 0,
        timeout: 2000,
        rotate: 750,
        random: false,
        dataAfterTimeout: false,
    };
    });

    var query = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sendQuery = void 0;
    /**
     * Send query
     */
    function sendQuery(config, payload, query, done, success) {
        // Get number of resources
        const resourcesCount = config.resources.length;
        // Save start index
        const startIndex = config.random
            ? Math.floor(Math.random() * resourcesCount)
            : config.index;
        // Get resources
        let resources;
        if (config.random) {
            // Randomise array
            let list = config.resources.slice(0);
            resources = [];
            while (list.length > 1) {
                const nextIndex = Math.floor(Math.random() * list.length);
                resources.push(list[nextIndex]);
                list = list.slice(0, nextIndex).concat(list.slice(nextIndex + 1));
            }
            resources = resources.concat(list);
        }
        else {
            // Rearrange resources to start with startIndex
            resources = config.resources
                .slice(startIndex)
                .concat(config.resources.slice(0, startIndex));
        }
        // Counters, status
        const startTime = Date.now();
        let status = 'pending';
        let queriesSent = 0;
        let lastError = void 0;
        // Timer
        let timer = null;
        // Execution queue
        let queue = [];
        // Callbacks to call when query is complete
        let doneCallbacks = [];
        if (typeof done === 'function') {
            doneCallbacks.push(done);
        }
        /**
         * Reset timer
         */
        function resetTimer() {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        }
        /**
         * Abort everything
         */
        function abort() {
            // Change status
            if (status === 'pending') {
                status = 'aborted';
            }
            // Reset timer
            resetTimer();
            // Abort all queued items
            queue.forEach((item) => {
                if (item.abort) {
                    item.abort();
                }
                if (item.status === 'pending') {
                    item.status = 'aborted';
                }
            });
            queue = [];
        }
        /**
         * Add / replace callback to call when execution is complete.
         * This can be used to abort pending query implementations when query is complete or aborted.
         */
        function subscribe(callback, overwrite) {
            if (overwrite) {
                doneCallbacks = [];
            }
            if (typeof callback === 'function') {
                doneCallbacks.push(callback);
            }
        }
        /**
         * Get query status
         */
        function getQueryStatus() {
            return {
                startTime,
                payload,
                status,
                queriesSent,
                queriesPending: queue.length,
                subscribe,
                abort,
            };
        }
        /**
         * Fail query
         */
        function failQuery() {
            status = 'failed';
            // Send notice to all callbacks
            doneCallbacks.forEach((callback) => {
                callback(void 0, lastError);
            });
        }
        /**
         * Clear queue
         */
        function clearQueue() {
            queue = queue.filter((item) => {
                if (item.status === 'pending') {
                    item.status = 'aborted';
                }
                if (item.abort) {
                    item.abort();
                }
                return false;
            });
        }
        /**
         * Got response from module
         */
        function moduleResponse(item, data, error) {
            const isError = data === void 0;
            // Remove item from queue
            queue = queue.filter((queued) => queued !== item);
            // Check status
            switch (status) {
                case 'pending':
                    // Pending
                    break;
                case 'failed':
                    if (isError || !config.dataAfterTimeout) {
                        // Query has already timed out or dataAfterTimeout is disabled
                        return;
                    }
                    // Success after failure
                    break;
                default:
                    // Aborted or completed
                    return;
            }
            // Error
            if (isError) {
                if (error !== void 0) {
                    lastError = error;
                }
                if (!queue.length) {
                    if (!resources.length) {
                        // Nothing else queued, nothing can be queued
                        failQuery();
                    }
                    else {
                        // Queue is empty: run next item immediately
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        execNext();
                    }
                }
                return;
            }
            // Reset timers, abort pending queries
            resetTimer();
            clearQueue();
            // Update index in Redundancy
            if (success && !config.random) {
                const index = config.resources.indexOf(item.resource);
                if (index !== -1 && index !== config.index) {
                    success(index);
                }
            }
            // Mark as completed and call callbacks
            status = 'completed';
            doneCallbacks.forEach((callback) => {
                callback(data);
            });
        }
        /**
         * Execute next query
         */
        function execNext() {
            // Check status
            if (status !== 'pending') {
                return;
            }
            // Reset timer
            resetTimer();
            // Get resource
            const resource = resources.shift();
            if (resource === void 0) {
                // Nothing to execute: wait for final timeout before failing
                if (queue.length) {
                    const timeout = typeof config.timeout === 'function'
                        ? config.timeout(startTime)
                        : config.timeout;
                    if (timeout) {
                        // Last timeout before failing to allow late response
                        timer = setTimeout(() => {
                            resetTimer();
                            if (status === 'pending') {
                                // Clear queue
                                clearQueue();
                                failQuery();
                            }
                        }, timeout);
                        return;
                    }
                }
                // Fail
                failQuery();
                return;
            }
            // Create new item
            const item = {
                getQueryStatus,
                status: 'pending',
                resource,
                done: (data, error) => {
                    moduleResponse(item, data, error);
                },
            };
            // Add to queue
            queue.push(item);
            // Bump next index
            queriesSent++;
            // Get timeout for next item
            const timeout = typeof config.rotate === 'function'
                ? config.rotate(queriesSent, startTime)
                : config.rotate;
            // Create timer
            timer = setTimeout(execNext, timeout);
            // Execute it
            query(resource, payload, item);
        }
        // Execute first query on next tick
        setTimeout(execNext);
        // Return getQueryStatus()
        return getQueryStatus;
    }
    exports.sendQuery = sendQuery;
    });

    var redundancy = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initRedundancy = void 0;


    /**
     * Set configuration
     */
    function setConfig(config) {
        if (typeof config !== 'object' ||
            typeof config.resources !== 'object' ||
            !(config.resources instanceof Array) ||
            !config.resources.length) {
            throw new Error('Invalid Reduncancy configuration');
        }
        const newConfig = Object.create(null);
        let key;
        for (key in config$1.defaultConfig) {
            if (config[key] !== void 0) {
                newConfig[key] = config[key];
            }
            else {
                newConfig[key] = config$1.defaultConfig[key];
            }
        }
        return newConfig;
    }
    /**
     * Redundancy instance
     */
    function initRedundancy(cfg) {
        // Configuration
        const config = setConfig(cfg);
        // List of queries
        let queries = [];
        /**
         * Remove aborted and completed queries
         */
        function cleanup() {
            queries = queries.filter((item) => item().status === 'pending');
        }
        /**
         * Send query
         */
        function query$1(payload, queryCallback, doneCallback) {
            const query$1 = query.sendQuery(config, payload, queryCallback, (data, error) => {
                // Remove query from list
                cleanup();
                // Call callback
                if (doneCallback) {
                    doneCallback(data, error);
                }
            }, (newIndex) => {
                // Update start index
                config.index = newIndex;
            });
            queries.push(query$1);
            return query$1;
        }
        /**
         * Find instance
         */
        function find(callback) {
            const result = queries.find((value) => {
                return callback(value);
            });
            return result !== void 0 ? result : null;
        }
        // Create and return functions
        const instance = {
            query: query$1,
            find,
            setIndex: (index) => {
                config.index = index;
            },
            getIndex: () => config.index,
            cleanup,
        };
        return instance;
    }
    exports.initRedundancy = initRedundancy;
    });

    var sort = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sortIcons = void 0;

    /**
     * Check if icons have been loaded
     */
    function sortIcons(icons) {
        const result = {
            loaded: [],
            missing: [],
            pending: [],
        };
        const storage = Object.create(null);
        // Sort icons alphabetically to prevent duplicates and make sure they are sorted in API queries
        icons.sort((a, b) => {
            if (a.provider !== b.provider) {
                return a.provider.localeCompare(b.provider);
            }
            if (a.prefix !== b.prefix) {
                return a.prefix.localeCompare(b.prefix);
            }
            return a.name.localeCompare(b.name);
        });
        let lastIcon = {
            provider: '',
            prefix: '',
            name: '',
        };
        icons.forEach((icon) => {
            if (lastIcon.name === icon.name &&
                lastIcon.prefix === icon.prefix &&
                lastIcon.provider === icon.provider) {
                return;
            }
            lastIcon = icon;
            // Check icon
            const provider = icon.provider;
            const prefix = icon.prefix;
            const name = icon.name;
            if (storage[provider] === void 0) {
                storage[provider] = Object.create(null);
            }
            const providerStorage = storage[provider];
            if (providerStorage[prefix] === void 0) {
                providerStorage[prefix] = storage_1.getStorage(provider, prefix);
            }
            const localStorage = providerStorage[prefix];
            let list;
            if (localStorage.icons[name] !== void 0) {
                list = result.loaded;
            }
            else if (prefix === '' || localStorage.missing[name] !== void 0) {
                // Mark icons without prefix as missing because they cannot be loaded from API
                list = result.missing;
            }
            else {
                list = result.pending;
            }
            const item = {
                provider,
                prefix,
                name,
            };
            list.push(item);
        });
        return result;
    }
    exports.sortIcons = sortIcons;
    });

    var callbacks = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.storeCallback = exports.updateCallbacks = exports.callbacks = void 0;

    // Records sorted by provider and prefix
    // This export is only for unit testing, should not be used
    exports.callbacks = Object.create(null);
    const pendingUpdates = Object.create(null);
    /**
     * Remove callback
     */
    function removeCallback(sources, id) {
        sources.forEach((source) => {
            const provider = source.provider;
            if (exports.callbacks[provider] === void 0) {
                return;
            }
            const providerCallbacks = exports.callbacks[provider];
            const prefix = source.prefix;
            const items = providerCallbacks[prefix];
            if (items) {
                providerCallbacks[prefix] = items.filter((row) => row.id !== id);
            }
        });
    }
    /**
     * Update all callbacks for provider and prefix
     */
    function updateCallbacks(provider, prefix) {
        if (pendingUpdates[provider] === void 0) {
            pendingUpdates[provider] = Object.create(null);
        }
        const providerPendingUpdates = pendingUpdates[provider];
        if (!providerPendingUpdates[prefix]) {
            providerPendingUpdates[prefix] = true;
            setTimeout(() => {
                providerPendingUpdates[prefix] = false;
                if (exports.callbacks[provider] === void 0 ||
                    exports.callbacks[provider][prefix] === void 0) {
                    return;
                }
                // Get all items
                const items = exports.callbacks[provider][prefix].slice(0);
                if (!items.length) {
                    return;
                }
                const storage = storage_1.getStorage(provider, prefix);
                // Check each item for changes
                let hasPending = false;
                items.forEach((item) => {
                    const icons = item.icons;
                    const oldLength = icons.pending.length;
                    icons.pending = icons.pending.filter((icon) => {
                        if (icon.prefix !== prefix) {
                            // Checking only current prefix
                            return true;
                        }
                        const name = icon.name;
                        if (storage.icons[name] !== void 0) {
                            // Loaded
                            icons.loaded.push({
                                provider,
                                prefix,
                                name,
                            });
                        }
                        else if (storage.missing[name] !== void 0) {
                            // Missing
                            icons.missing.push({
                                provider,
                                prefix,
                                name,
                            });
                        }
                        else {
                            // Pending
                            hasPending = true;
                            return true;
                        }
                        return false;
                    });
                    // Changes detected - call callback
                    if (icons.pending.length !== oldLength) {
                        if (!hasPending) {
                            // All icons have been loaded - remove callback from prefix
                            removeCallback([
                                {
                                    provider,
                                    prefix,
                                },
                            ], item.id);
                        }
                        item.callback(icons.loaded.slice(0), icons.missing.slice(0), icons.pending.slice(0), item.abort);
                    }
                });
            });
        }
    }
    exports.updateCallbacks = updateCallbacks;
    /**
     * Unique id counter for callbacks
     */
    let idCounter = 0;
    /**
     * Add callback
     */
    function storeCallback(callback, icons, pendingSources) {
        // Create unique id and abort function
        const id = idCounter++;
        const abort = removeCallback.bind(null, pendingSources, id);
        if (!icons.pending.length) {
            // Do not store item without pending icons and return function that does nothing
            return abort;
        }
        // Create item and store it for all pending prefixes
        const item = {
            id,
            icons,
            callback,
            abort: abort,
        };
        pendingSources.forEach((source) => {
            const provider = source.provider;
            const prefix = source.prefix;
            if (exports.callbacks[provider] === void 0) {
                exports.callbacks[provider] = Object.create(null);
            }
            const providerCallbacks = exports.callbacks[provider];
            if (providerCallbacks[prefix] === void 0) {
                providerCallbacks[prefix] = [];
            }
            providerCallbacks[prefix].push(item);
        });
        return abort;
    }
    exports.storeCallback = storeCallback;
    });

    var modules = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAPIModule = exports.setAPIModule = void 0;
    /**
     * Local storate types and entries
     */
    const storage = Object.create(null);
    /**
     * Set API module
     */
    function setAPIModule(provider, item) {
        storage[provider] = item;
    }
    exports.setAPIModule = setAPIModule;
    /**
     * Get API module
     */
    function getAPIModule(provider) {
        return storage[provider] === void 0 ? storage[''] : storage[provider];
    }
    exports.getAPIModule = getAPIModule;
    });

    var config$2 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAPIConfig = exports.setAPIConfig = void 0;
    /**
     * Create full API configuration from partial data
     */
    function createConfig(source) {
        let resources;
        if (typeof source.resources === 'string') {
            resources = [source.resources];
        }
        else {
            resources = source.resources;
            if (!(resources instanceof Array) || !resources.length) {
                return null;
            }
        }
        const result = {
            // API hosts
            resources: resources,
            // Root path
            path: source.path === void 0 ? '/' : source.path,
            // URL length limit
            maxURL: source.maxURL ? source.maxURL : 500,
            // Timeout before next host is used.
            rotate: source.rotate ? source.rotate : 750,
            // Timeout before failing query.
            timeout: source.timeout ? source.timeout : 5000,
            // Randomise default API end point.
            random: source.random === true,
            // Start index
            index: source.index ? source.index : 0,
            // Receive data after time out (used if time out kicks in first, then API module sends data anyway).
            dataAfterTimeout: source.dataAfterTimeout !== false,
        };
        return result;
    }
    /**
     * Local storage
     */
    const configStorage = Object.create(null);
    /**
     * Redundancy for API servers.
     *
     * API should have very high uptime because of implemented redundancy at server level, but
     * sometimes bad things happen. On internet 100% uptime is not possible.
     *
     * There could be routing problems. Server might go down for whatever reason, but it takes
     * few minutes to detect that downtime, so during those few minutes API might not be accessible.
     *
     * This script has some redundancy to mitigate possible network issues.
     *
     * If one host cannot be reached in 'rotate' (750 by default) ms, script will try to retrieve
     * data from different host. Hosts have different configurations, pointing to different
     * API servers hosted at different providers.
     */
    const fallBackAPISources = [
        'https://api.simplesvg.com',
        'https://api.unisvg.com',
    ];
    // Shuffle fallback API
    const fallBackAPI = [];
    while (fallBackAPISources.length > 0) {
        if (fallBackAPISources.length === 1) {
            fallBackAPI.push(fallBackAPISources.shift());
        }
        else {
            // Get first or last item
            if (Math.random() > 0.5) {
                fallBackAPI.push(fallBackAPISources.shift());
            }
            else {
                fallBackAPI.push(fallBackAPISources.pop());
            }
        }
    }
    // Add default API
    configStorage[''] = createConfig({
        resources: ['https://api.iconify.design'].concat(fallBackAPI),
    });
    /**
     * Add custom config for provider
     */
    function setAPIConfig(provider, customConfig) {
        const config = createConfig(customConfig);
        if (config === null) {
            return false;
        }
        configStorage[provider] = config;
        return true;
    }
    exports.setAPIConfig = setAPIConfig;
    /**
     * Get API configuration
     */
    const getAPIConfig = (provider) => configStorage[provider];
    exports.getAPIConfig = getAPIConfig;
    });

    var list = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getProviders = exports.listToIcons = void 0;

    /**
     * Convert icons list from string/icon mix to icons and validate them
     */
    function listToIcons(list, validate = true, simpleNames = false) {
        const result = [];
        list.forEach((item) => {
            const icon = typeof item === 'string'
                ? name$1.stringToIcon(item, false, simpleNames)
                : item;
            if (!validate || name$1.validateIcon(icon, simpleNames)) {
                result.push({
                    provider: icon.provider,
                    prefix: icon.prefix,
                    name: icon.name,
                });
            }
        });
        return result;
    }
    exports.listToIcons = listToIcons;
    /**
     * Get all providers
     */
    function getProviders(list) {
        const providers = Object.create(null);
        list.forEach((icon) => {
            providers[icon.provider] = true;
        });
        return Object.keys(providers);
    }
    exports.getProviders = getProviders;
    });

    var api = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.API = exports.getRedundancyCache = void 0;









    // Empty abort callback for loadIcons()
    function emptyCallback() {
        // Do nothing
    }
    const pendingIcons = Object.create(null);
    /**
     * List of icons that are waiting to be loaded.
     *
     * List is passed to API module, then cleared.
     *
     * This list should not be used for any checks, use pendingIcons to check
     * if icons is being loaded.
     *
     * [provider][prefix] = array of icon names
     */
    const iconsToLoad = Object.create(null);
    // Flags to merge multiple synchronous icon requests in one asynchronous request
    const loaderFlags = Object.create(null);
    const queueFlags = Object.create(null);
    const redundancyCache = Object.create(null);
    /**
     * Get Redundancy instance for provider
     */
    function getRedundancyCache(provider) {
        if (redundancyCache[provider] === void 0) {
            const config$1 = config$2.getAPIConfig(provider);
            if (!config$1) {
                // No way to load icons because configuration is not set!
                return;
            }
            const redundancy$1 = redundancy.initRedundancy(config$1);
            const cachedReundancy = {
                config: config$1,
                redundancy: redundancy$1,
            };
            redundancyCache[provider] = cachedReundancy;
        }
        return redundancyCache[provider];
    }
    exports.getRedundancyCache = getRedundancyCache;
    /**
     * Function called when new icons have been loaded
     */
    function loadedNewIcons(provider, prefix) {
        // Run only once per tick, possibly joining multiple API responses in one call
        if (loaderFlags[provider] === void 0) {
            loaderFlags[provider] = Object.create(null);
        }
        const providerLoaderFlags = loaderFlags[provider];
        if (!providerLoaderFlags[prefix]) {
            providerLoaderFlags[prefix] = true;
            setTimeout(() => {
                providerLoaderFlags[prefix] = false;
                callbacks.updateCallbacks(provider, prefix);
            });
        }
    }
    // Storage for errors for loadNewIcons(). Used to avoid spamming log with identical errors.
    const errorsCache = Object.create(null);
    /**
     * Load icons
     */
    function loadNewIcons(provider, prefix, icons) {
        function err() {
            const key = (provider === '' ? '' : '@' + provider + ':') + prefix;
            const time = Math.floor(Date.now() / 60000); // log once in a minute
            if (errorsCache[key] < time) {
                errorsCache[key] = time;
                console.error('Unable to retrieve icons for "' +
                    key +
                    '" because API is not configured properly.');
            }
        }
        // Create nested objects if needed
        if (iconsToLoad[provider] === void 0) {
            iconsToLoad[provider] = Object.create(null);
        }
        const providerIconsToLoad = iconsToLoad[provider];
        if (queueFlags[provider] === void 0) {
            queueFlags[provider] = Object.create(null);
        }
        const providerQueueFlags = queueFlags[provider];
        if (pendingIcons[provider] === void 0) {
            pendingIcons[provider] = Object.create(null);
        }
        const providerPendingIcons = pendingIcons[provider];
        // Add icons to queue
        if (providerIconsToLoad[prefix] === void 0) {
            providerIconsToLoad[prefix] = icons;
        }
        else {
            providerIconsToLoad[prefix] = providerIconsToLoad[prefix]
                .concat(icons)
                .sort();
        }
        // Redundancy item
        let cachedReundancy;
        // Trigger update on next tick, mering multiple synchronous requests into one asynchronous request
        if (!providerQueueFlags[prefix]) {
            providerQueueFlags[prefix] = true;
            setTimeout(() => {
                providerQueueFlags[prefix] = false;
                // Get icons and delete queue
                const icons = providerIconsToLoad[prefix];
                delete providerIconsToLoad[prefix];
                // Get API module
                const api = modules.getAPIModule(provider);
                if (!api) {
                    // No way to load icons!
                    err();
                    return;
                }
                // Get API config and Redundancy instance
                if (cachedReundancy === void 0) {
                    const redundancy = getRedundancyCache(provider);
                    if (redundancy === void 0) {
                        // No way to load icons because configuration is not set!
                        err();
                        return;
                    }
                    cachedReundancy = redundancy;
                }
                // Prepare parameters and run queries
                const params = api.prepare(provider, prefix, icons);
                params.forEach((item) => {
                    cachedReundancy.redundancy.query(item, api.send, (data, error) => {
                        const storage = storage_1.getStorage(provider, prefix);
                        // Check for error
                        if (typeof data !== 'object') {
                            if (error !== 404) {
                                // Do not handle error unless it is 404
                                return;
                            }
                            // Not found: mark as missing
                            const t = Date.now();
                            item.icons.forEach((name) => {
                                storage.missing[name] = t;
                            });
                        }
                        else {
                            // Add icons to storage
                            try {
                                const added = storage_1.addIconSet(storage, data, 'all');
                                if (typeof added === 'boolean') {
                                    return;
                                }
                                // Remove added icons from pending list
                                const pending = providerPendingIcons[prefix];
                                added.forEach((name) => {
                                    delete pending[name];
                                });
                                // Cache API response
                                if (modules$1.coreModules.cache) {
                                    modules$1.coreModules.cache(provider, data);
                                }
                            }
                            catch (err) {
                                console.error(err);
                            }
                        }
                        // Trigger update on next tick
                        loadedNewIcons(provider, prefix);
                    });
                });
            });
        }
    }
    /**
     * Check if icon is being loaded
     */
    const isPending = (icon) => {
        return (pendingIcons[icon.provider] !== void 0 &&
            pendingIcons[icon.provider][icon.prefix] !== void 0 &&
            pendingIcons[icon.provider][icon.prefix][icon.name] !== void 0);
    };
    /**
     * Load icons
     */
    const loadIcons = (icons, callback) => {
        // Clean up and copy icons list
        const cleanedIcons = list.listToIcons(icons, true, functions$3.allowSimpleNames());
        // Sort icons by missing/loaded/pending
        // Pending means icon is either being requsted or is about to be requested
        const sortedIcons = sort.sortIcons(cleanedIcons);
        if (!sortedIcons.pending.length) {
            // Nothing to load
            let callCallback = true;
            if (callback) {
                setTimeout(() => {
                    if (callCallback) {
                        callback(sortedIcons.loaded, sortedIcons.missing, sortedIcons.pending, emptyCallback);
                    }
                });
            }
            return () => {
                callCallback = false;
            };
        }
        // Get all sources for pending icons
        const newIcons = Object.create(null);
        const sources = [];
        let lastProvider, lastPrefix;
        sortedIcons.pending.forEach((icon) => {
            const provider = icon.provider;
            const prefix = icon.prefix;
            if (prefix === lastPrefix && provider === lastProvider) {
                return;
            }
            lastProvider = provider;
            lastPrefix = prefix;
            sources.push({
                provider,
                prefix,
            });
            if (pendingIcons[provider] === void 0) {
                pendingIcons[provider] = Object.create(null);
            }
            const providerPendingIcons = pendingIcons[provider];
            if (providerPendingIcons[prefix] === void 0) {
                providerPendingIcons[prefix] = Object.create(null);
            }
            if (newIcons[provider] === void 0) {
                newIcons[provider] = Object.create(null);
            }
            const providerNewIcons = newIcons[provider];
            if (providerNewIcons[prefix] === void 0) {
                providerNewIcons[prefix] = [];
            }
        });
        // List of new icons
        const time = Date.now();
        // Filter pending icons list: find icons that are not being loaded yet
        // If icon was called before, it must exist in pendingIcons or storage, but because this
        // function is called right after sortIcons() that checks storage, icon is definitely not in storage.
        sortedIcons.pending.forEach((icon) => {
            const provider = icon.provider;
            const prefix = icon.prefix;
            const name = icon.name;
            const pendingQueue = pendingIcons[provider][prefix];
            if (pendingQueue[name] === void 0) {
                // New icon - add to pending queue to mark it as being loaded
                pendingQueue[name] = time;
                // Add it to new icons list to pass it to API module for loading
                newIcons[provider][prefix].push(name);
            }
        });
        // Load icons on next tick to make sure result is not returned before callback is stored and
        // to consolidate multiple synchronous loadIcons() calls into one asynchronous API call
        sources.forEach((source) => {
            const provider = source.provider;
            const prefix = source.prefix;
            if (newIcons[provider][prefix].length) {
                loadNewIcons(provider, prefix, newIcons[provider][prefix]);
            }
        });
        // Store callback and return abort function
        return callback
            ? callbacks.storeCallback(callback, sortedIcons, sources)
            : emptyCallback;
    };
    /**
     * Export module
     */
    exports.API = {
        isPending,
        loadIcons,
    };
    });

    var functions$1 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.APIInternalFunctions = exports.APIFunctions = void 0;



    exports.APIFunctions = {
        loadIcons: api.API.loadIcons,
        addAPIProvider: config$2.setAPIConfig,
    };
    exports.APIInternalFunctions = {
        getAPI: api.getRedundancyCache,
        getAPIConfig: config$2.getAPIConfig,
        setAPIModule: modules.setAPIModule,
    };
    });

    var jsonp = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAPIModule = void 0;
    let rootVar = null;
    /**
     * Endpoint
     */
    let endPoint = '{prefix}.js?icons={icons}&callback={callback}';
    /**
     * Cache: provider:prefix = value
     */
    const maxLengthCache = Object.create(null);
    const pathCache = Object.create(null);
    /**
     * Get hash for query
     *
     * Hash is used in JSONP callback name, so same queries end up with same JSONP callback,
     * allowing response to be cached in browser.
     */
    function hash(str) {
        let total = 0, i;
        for (i = str.length - 1; i >= 0; i--) {
            total += str.charCodeAt(i);
        }
        return total % 999;
    }
    /**
     * Get root object
     */
    function getGlobal() {
        // Create root
        if (rootVar === null) {
            // window
            const globalRoot = self;
            // Test for window.Iconify. If missing, create 'IconifyJSONP'
            let prefix = 'Iconify';
            let extraPrefix = '.cb';
            if (globalRoot[prefix] === void 0) {
                // Use 'IconifyJSONP' global
                prefix = 'IconifyJSONP';
                extraPrefix = '';
                if (globalRoot[prefix] === void 0) {
                    globalRoot[prefix] = Object.create(null);
                }
                rootVar = globalRoot[prefix];
            }
            else {
                // Use 'Iconify.cb'
                const iconifyRoot = globalRoot[prefix];
                if (iconifyRoot.cb === void 0) {
                    iconifyRoot.cb = Object.create(null);
                }
                rootVar = iconifyRoot.cb;
            }
            // Change end point
            endPoint = endPoint.replace('{callback}', prefix + extraPrefix + '.{cb}');
        }
        return rootVar;
    }
    /**
     * Return API module
     */
    const getAPIModule = (getAPIConfig) => {
        /**
         * Calculate maximum icons list length for prefix
         */
        function calculateMaxLength(provider, prefix) {
            // Get config and store path
            const config = getAPIConfig(provider);
            if (!config) {
                return 0;
            }
            // Calculate
            let result;
            if (!config.maxURL) {
                result = 0;
            }
            else {
                let maxHostLength = 0;
                config.resources.forEach((item) => {
                    const host = item;
                    maxHostLength = Math.max(maxHostLength, host.length);
                });
                // Make sure global is set
                getGlobal();
                // Extra width: prefix (3) + counter (4) - '{cb}' (4)
                const extraLength = 3;
                // Get available length
                result =
                    config.maxURL -
                        maxHostLength -
                        config.path.length -
                        endPoint
                            .replace('{provider}', provider)
                            .replace('{prefix}', prefix)
                            .replace('{icons}', '').length -
                        extraLength;
            }
            // Cache stuff and return result
            const cacheKey = provider + ':' + prefix;
            pathCache[cacheKey] = config.path;
            maxLengthCache[cacheKey] = result;
            return result;
        }
        /**
         * Prepare params
         */
        const prepare = (provider, prefix, icons) => {
            const results = [];
            // Get maximum icons list length
            const cacheKey = provider + ':' + prefix;
            let maxLength = maxLengthCache[cacheKey];
            if (maxLength === void 0) {
                maxLength = calculateMaxLength(provider, prefix);
            }
            // Split icons
            let item = {
                provider,
                prefix,
                icons: [],
            };
            let length = 0;
            icons.forEach((name, index) => {
                length += name.length + 1;
                if (length >= maxLength && index > 0) {
                    // Next set
                    results.push(item);
                    item = {
                        provider,
                        prefix,
                        icons: [],
                    };
                    length = name.length;
                }
                item.icons.push(name);
            });
            results.push(item);
            return results;
        };
        /**
         * Load icons
         */
        const send = (host, params, status) => {
            const provider = params.provider;
            const prefix = params.prefix;
            const icons = params.icons;
            const iconsList = icons.join(',');
            const cacheKey = provider + ':' + prefix;
            // Create callback prefix
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cbPrefix = prefix.split('-').shift().slice(0, 3);
            const global = getGlobal();
            // Callback hash
            let cbCounter = hash(provider + ':' + host + ':' + prefix + ':' + iconsList);
            while (global[cbPrefix + cbCounter] !== void 0) {
                cbCounter++;
            }
            const callbackName = cbPrefix + cbCounter;
            const path = pathCache[cacheKey] +
                endPoint
                    .replace('{provider}', provider)
                    .replace('{prefix}', prefix)
                    .replace('{icons}', iconsList)
                    .replace('{cb}', callbackName);
            global[callbackName] = (data) => {
                // Remove callback and complete query
                delete global[callbackName];
                status.done(data);
            };
            // Create URI
            const uri = host + path;
            // console.log('API query:', uri);
            // Create script and append it to head
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = uri;
            document.head.appendChild(script);
        };
        // Return functions
        return {
            prepare,
            send,
        };
    };
    exports.getAPIModule = getAPIModule;
    });

    var fetch_1$1 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAPIModule = exports.setFetch = void 0;
    /**
     * Endpoint
     */
    const endPoint = '{prefix}.json?icons={icons}';
    /**
     * Cache
     */
    const maxLengthCache = Object.create(null);
    const pathCache = Object.create(null);
    /**
     * Fetch function
     *
     * Use this to set 'cross-fetch' in node.js environment if you are retrieving icons on server side.
     * Not needed when using stuff like Next.js or SvelteKit because components use API only on client side.
     */
    let fetchModule = null;
    try {
        fetchModule = fetch;
    }
    catch (err) {
        //
    }
    function setFetch(fetch) {
        fetchModule = fetch;
    }
    exports.setFetch = setFetch;
    /**
     * Return API module
     */
    const getAPIModule = (getAPIConfig) => {
        /**
         * Calculate maximum icons list length for prefix
         */
        function calculateMaxLength(provider, prefix) {
            // Get config and store path
            const config = getAPIConfig(provider);
            if (!config) {
                return 0;
            }
            // Calculate
            let result;
            if (!config.maxURL) {
                result = 0;
            }
            else {
                let maxHostLength = 0;
                config.resources.forEach((item) => {
                    const host = item;
                    maxHostLength = Math.max(maxHostLength, host.length);
                });
                // Get available length
                result =
                    config.maxURL -
                        maxHostLength -
                        config.path.length -
                        endPoint
                            .replace('{provider}', provider)
                            .replace('{prefix}', prefix)
                            .replace('{icons}', '').length;
            }
            // Cache stuff and return result
            const cacheKey = provider + ':' + prefix;
            pathCache[cacheKey] = config.path;
            maxLengthCache[cacheKey] = result;
            return result;
        }
        /**
         * Prepare params
         */
        const prepare = (provider, prefix, icons) => {
            const results = [];
            // Get maximum icons list length
            let maxLength = maxLengthCache[prefix];
            if (maxLength === void 0) {
                maxLength = calculateMaxLength(provider, prefix);
            }
            // Split icons
            let item = {
                provider,
                prefix,
                icons: [],
            };
            let length = 0;
            icons.forEach((name, index) => {
                length += name.length + 1;
                if (length >= maxLength && index > 0) {
                    // Next set
                    results.push(item);
                    item = {
                        provider,
                        prefix,
                        icons: [],
                    };
                    length = name.length;
                }
                item.icons.push(name);
            });
            results.push(item);
            return results;
        };
        /**
         * Load icons
         */
        const send = (host, params, status) => {
            const provider = params.provider;
            const prefix = params.prefix;
            const icons = params.icons;
            const iconsList = icons.join(',');
            const cacheKey = provider + ':' + prefix;
            const path = pathCache[cacheKey] +
                endPoint
                    .replace('{provider}', provider)
                    .replace('{prefix}', prefix)
                    .replace('{icons}', iconsList);
            if (!fetchModule) {
                // Fail: return 424 Failed Dependency (its not meant to be used like that, but it is the best match)
                status.done(void 0, 424);
                return;
            }
            // console.log('API query:', host + path);
            fetchModule(host + path)
                .then((response) => {
                if (response.status !== 200) {
                    status.done(void 0, response.status);
                    return;
                }
                return response.json();
            })
                .then((data) => {
                if (typeof data !== 'object' || data === null) {
                    return;
                }
                // Store cache and complete
                status.done(data);
            })
                .catch((err) => {
                // Error
                status.done(void 0, err.errno);
            });
        };
        // Return functions
        return {
            prepare,
            send,
        };
    };
    exports.getAPIModule = getAPIModule;
    });

    var browserStorage = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.storeCache = exports.loadCache = exports.mock = exports.emptyList = exports.count = exports.config = void 0;

    // After changing configuration change it in tests/*/fake_cache.ts
    // Cache version. Bump when structure changes
    const cacheVersion = 'iconify2';
    // Cache keys
    const cachePrefix = 'iconify';
    const countKey = cachePrefix + '-count';
    const versionKey = cachePrefix + '-version';
    /**
     * Cache expiration
     */
    const hour = 3600000;
    const cacheExpiration = 168; // In hours
    /**
     * Storage configuration
     */
    exports.config = {
        local: true,
        session: true,
    };
    /**
     * Flag to check if storage has been loaded
     */
    let loaded = false;
    /**
     * Items counter
     */
    exports.count = {
        local: 0,
        session: 0,
    };
    /**
     * List of empty items
     */
    exports.emptyList = {
        local: [],
        session: [],
    };
    let _window = typeof window === 'undefined' ? {} : window;
    function mock(fakeWindow) {
        loaded = false;
        _window = fakeWindow;
    }
    exports.mock = mock;
    /**
     * Get global
     *
     * @param key
     */
    function getGlobal(key) {
        const attr = key + 'Storage';
        try {
            if (_window &&
                _window[attr] &&
                typeof _window[attr].length === 'number') {
                return _window[attr];
            }
        }
        catch (err) {
            //
        }
        // Failed - mark as disabled
        exports.config[key] = false;
        return null;
    }
    /**
     * Change current count for storage
     */
    function setCount(storage, key, value) {
        try {
            storage.setItem(countKey, value + '');
            exports.count[key] = value;
            return true;
        }
        catch (err) {
            return false;
        }
    }
    /**
     * Get current count from storage
     *
     * @param storage
     */
    function getCount(storage) {
        const count = storage.getItem(countKey);
        if (count) {
            const total = parseInt(count);
            return total ? total : 0;
        }
        return 0;
    }
    /**
     * Initialize storage
     *
     * @param storage
     * @param key
     */
    function initCache(storage, key) {
        try {
            storage.setItem(versionKey, cacheVersion);
        }
        catch (err) {
            //
        }
        setCount(storage, key, 0);
    }
    /**
     * Destroy old cache
     *
     * @param storage
     */
    function destroyCache(storage) {
        try {
            const total = getCount(storage);
            for (let i = 0; i < total; i++) {
                storage.removeItem(cachePrefix + i);
            }
        }
        catch (err) {
            //
        }
    }
    /**
     * Load icons from cache
     */
    const loadCache = () => {
        if (loaded) {
            return;
        }
        loaded = true;
        // Minimum time
        const minTime = Math.floor(Date.now() / hour) - cacheExpiration;
        // Load data from storage
        function load(key) {
            const func = getGlobal(key);
            if (!func) {
                return;
            }
            // Get one item from storage
            const getItem = (index) => {
                const name = cachePrefix + index;
                const item = func.getItem(name);
                if (typeof item !== 'string') {
                    // Does not exist
                    return false;
                }
                // Get item, validate it
                let valid = true;
                try {
                    // Parse, check time stamp
                    const data = JSON.parse(item);
                    if (typeof data !== 'object' ||
                        typeof data.cached !== 'number' ||
                        data.cached < minTime ||
                        typeof data.provider !== 'string' ||
                        typeof data.data !== 'object' ||
                        typeof data.data.prefix !== 'string') {
                        valid = false;
                    }
                    else {
                        // Add icon set
                        const provider = data.provider;
                        const prefix = data.data.prefix;
                        const storage = storage_1.getStorage(provider, prefix);
                        valid = storage_1.addIconSet(storage, data.data);
                    }
                }
                catch (err) {
                    valid = false;
                }
                if (!valid) {
                    func.removeItem(name);
                }
                return valid;
            };
            try {
                // Get version
                const version = func.getItem(versionKey);
                if (version !== cacheVersion) {
                    if (version) {
                        // Version is set, but invalid - remove old entries
                        destroyCache(func);
                    }
                    // Empty data
                    initCache(func, key);
                    return;
                }
                // Get number of stored items
                let total = getCount(func);
                for (let i = total - 1; i >= 0; i--) {
                    if (!getItem(i)) {
                        // Remove item
                        if (i === total - 1) {
                            // Last item - reduce country
                            total--;
                        }
                        else {
                            // Mark as empty
                            exports.emptyList[key].push(i);
                        }
                    }
                }
                // Update total
                setCount(func, key, total);
            }
            catch (err) {
                //
            }
        }
        for (const key in exports.config) {
            load(key);
        }
    };
    exports.loadCache = loadCache;
    /**
     * Function to cache icons
     */
    const storeCache = (provider, data) => {
        if (!loaded) {
            exports.loadCache();
        }
        function store(key) {
            if (!exports.config[key]) {
                return false;
            }
            const func = getGlobal(key);
            if (!func) {
                return false;
            }
            // Get item index
            let index = exports.emptyList[key].shift();
            if (index === void 0) {
                // Create new index
                index = exports.count[key];
                if (!setCount(func, key, index + 1)) {
                    return false;
                }
            }
            // Create and save item
            try {
                const item = {
                    cached: Math.floor(Date.now() / hour),
                    provider,
                    data,
                };
                func.setItem(cachePrefix + index, JSON.stringify(item));
            }
            catch (err) {
                return false;
            }
            return true;
        }
        // Attempt to store at localStorage first, then at sessionStorage
        if (!store('local')) {
            store('session');
        }
    };
    exports.storeCache = storeCache;
    });

    var functions$4 = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toggleBrowserCache = void 0;

    /**
     * Toggle cache
     */
    function toggleBrowserCache(storage, value) {
        switch (storage) {
            case 'local':
            case 'session':
                browserStorage.config[storage] = value;
                break;
            case 'all':
                for (const key in browserStorage.config) {
                    browserStorage.config[key] = value;
                }
                break;
        }
    }
    exports.toggleBrowserCache = toggleBrowserCache;
    });

    var shorthand = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.alignmentFromString = exports.flipFromString = void 0;
    const separator = /[\s,]+/;
    /**
     * Apply "flip" string to icon customisations
     */
    function flipFromString(custom, flip) {
        flip.split(separator).forEach((str) => {
            const value = str.trim();
            switch (value) {
                case 'horizontal':
                    custom.hFlip = true;
                    break;
                case 'vertical':
                    custom.vFlip = true;
                    break;
            }
        });
    }
    exports.flipFromString = flipFromString;
    /**
     * Apply "align" string to icon customisations
     */
    function alignmentFromString(custom, align) {
        align.split(separator).forEach((str) => {
            const value = str.trim();
            switch (value) {
                case 'left':
                case 'center':
                case 'right':
                    custom.hAlign = value;
                    break;
                case 'top':
                case 'middle':
                case 'bottom':
                    custom.vAlign = value;
                    break;
                case 'slice':
                case 'crop':
                    custom.slice = true;
                    break;
                case 'meet':
                    custom.slice = false;
            }
        });
    }
    exports.alignmentFromString = alignmentFromString;
    });

    var rotate = createCommonjsModule$1(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.rotateFromString = void 0;
    /**
     * Get rotation value
     */
    function rotateFromString(value) {
        const units = value.replace(/^-?[0-9.]*/, '');
        function cleanup(value) {
            while (value < 0) {
                value += 4;
            }
            return value % 4;
        }
        if (units === '') {
            const num = parseInt(value);
            return isNaN(num) ? 0 : cleanup(num);
        }
        else if (units !== value) {
            let split = 0;
            switch (units) {
                case '%':
                    // 25% -> 1, 50% -> 2, ...
                    split = 25;
                    break;
                case 'deg':
                    // 90deg -> 1, 180deg -> 2, ...
                    split = 90;
            }
            if (split) {
                let num = parseFloat(value.slice(0, value.length - units.length));
                if (isNaN(num)) {
                    return 0;
                }
                num = num / split;
                return num % 1 === 0 ? cleanup(num) : 0;
            }
        }
        return 0;
    }
    exports.rotateFromString = rotateFromString;
    });

    /**
     * Default SVG attributes
     */
    const svgDefaults = {
        'xmlns': 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'aria-hidden': true,
        'role': 'img',
    };
    /**
     * Generate icon from properties
     */
    function render(
    // Icon must be validated before calling this function
    icon, 
    // Properties
    props) {
        const customisations$1 = customisations$2.mergeCustomisations(customisations$2.defaults, props);
        const componentProps = Object.assign({}, svgDefaults);
        // Create style if missing
        let style = typeof props.style === 'string' ? props.style : '';
        // Get element properties
        for (let key in props) {
            const value = props[key];
            if (value === void 0) {
                continue;
            }
            switch (key) {
                // Properties to ignore
                case 'icon':
                case 'style':
                case 'onLoad':
                    break;
                // Boolean attributes
                case 'inline':
                case 'hFlip':
                case 'vFlip':
                    customisations$1[key] =
                        value === true || value === 'true' || value === 1;
                    break;
                // Flip as string: 'horizontal,vertical'
                case 'flip':
                    if (typeof value === 'string') {
                        shorthand.flipFromString(customisations$1, value);
                    }
                    break;
                // Alignment as string
                case 'align':
                    if (typeof value === 'string') {
                        shorthand.alignmentFromString(customisations$1, value);
                    }
                    break;
                // Color: copy to style, add extra ';' in case style is missing it
                case 'color':
                    style =
                        style +
                            (style.length > 0 && style.trim().slice(-1) !== ';'
                                ? ';'
                                : '') +
                            'color: ' +
                            value +
                            '; ';
                    break;
                // Rotation as string
                case 'rotate':
                    if (typeof value === 'string') {
                        customisations$1[key] = rotate.rotateFromString(value);
                    }
                    else if (typeof value === 'number') {
                        customisations$1[key] = value;
                    }
                    break;
                // Remove aria-hidden
                case 'ariaHidden':
                case 'aria-hidden':
                    if (value !== true && value !== 'true') {
                        delete componentProps['aria-hidden'];
                    }
                    break;
                // Copy missing property if it does not exist in customisations
                default:
                    if (customisations$2.defaults[key] === void 0) {
                        componentProps[key] = value;
                    }
            }
        }
        // Generate icon
        const item = build$1.iconToSVG(icon, customisations$1);
        // Add icon stuff
        for (let key in item.attributes) {
            componentProps[key] =
                item.attributes[key];
        }
        if (item.inline) {
            // Style overrides it
            style = 'vertical-align: -0.125em; ' + style;
        }
        // Style
        if (style !== '') {
            componentProps.style = style;
        }
        // Counter for ids based on "id" property to render icons consistently on server and client
        let localCounter = 0;
        const id$1 = props.id;
        // Generate HTML
        return {
            attributes: componentProps,
            body: id.replaceIDs(item.body, id$1 ? () => id$1 + '-' + localCounter++ : 'iconify-svelte-'),
        };
    }
    const disableCache = (storage) => functions$4.toggleBrowserCache(storage, false);
    /* Storage functions */
    /**
     * Check if icon exists
     */
    functions$3.storageFunctions.iconExists;
    /**
     * Get icon data
     */
    const getIcon = functions$3.storageFunctions.getIcon;
    /**
     * List available icons
     */
    functions$3.storageFunctions.listIcons;
    /**
     * Add one icon
     */
    functions$3.storageFunctions.addIcon;
    /**
     * Add icon set
     */
    const addCollection = functions$3.storageFunctions.addCollection;
    /* Builder functions */
    /**
     * Calculate icon size
     */
    const calculateSize = functions$2.builderFunctions.calculateSize;
    /**
     * Replace unique ids in content
     */
    functions$2.builderFunctions.replaceIDs;
    /**
     * Build SVG
     */
    functions$2.builderFunctions.buildIcon;
    /* API functions */
    /**
     * Load icons
     */
    const loadIcons = functions$1.APIFunctions.loadIcons;
    /**
     * Add API provider
     */
    const addAPIProvider = functions$1.APIFunctions.addAPIProvider;
    /**
     * Export internal functions that can be used by third party implementations
     */
    const _api = functions$1.APIInternalFunctions;
    /**
     * Initialise stuff
     */
    // Enable short names
    functions$3.allowSimpleNames(true);
    // Set API
    modules$1.coreModules.api = api.API;
    // Use Fetch API by default
    let getAPIModule = fetch_1$1.getAPIModule;
    try {
        if (typeof document !== 'undefined' && typeof window !== 'undefined') {
            // If window and document exist, attempt to load whatever module is available, otherwise use Fetch API
            getAPIModule =
                typeof fetch === 'function' && typeof Promise === 'function'
                    ? fetch_1$1.getAPIModule
                    : jsonp.getAPIModule;
        }
    }
    catch (err) {
        //
    }
    modules.setAPIModule('', getAPIModule(config$2.getAPIConfig));
    /**
     * Function to enable node-fetch for getting icons on server side
     */
    _api.setFetch = (nodeFetch) => {
        fetch_1$1.setFetch(nodeFetch);
        if (getAPIModule !== fetch_1$1.getAPIModule) {
            getAPIModule = fetch_1$1.getAPIModule;
            modules.setAPIModule('', getAPIModule(config$2.getAPIConfig));
        }
    };
    /**
     * Browser stuff
     */
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        // Set cache and load existing cache
        modules$1.coreModules.cache = browserStorage.storeCache;
        browserStorage.loadCache();
        const _window = window;
        // Load icons from global "IconifyPreload"
        if (_window.IconifyPreload !== void 0) {
            const preload = _window.IconifyPreload;
            const err = 'Invalid IconifyPreload syntax.';
            if (typeof preload === 'object' && preload !== null) {
                (preload instanceof Array ? preload : [preload]).forEach((item) => {
                    try {
                        if (
                        // Check if item is an object and not null/array
                        typeof item !== 'object' ||
                            item === null ||
                            item instanceof Array ||
                            // Check for 'icons' and 'prefix'
                            typeof item.icons !== 'object' ||
                            typeof item.prefix !== 'string' ||
                            // Add icon set
                            !addCollection(item)) {
                            console.error(err);
                        }
                    }
                    catch (e) {
                        console.error(err);
                    }
                });
            }
        }
        // Set API from global "IconifyProviders"
        if (_window.IconifyProviders !== void 0) {
            const providers = _window.IconifyProviders;
            if (typeof providers === 'object' && providers !== null) {
                for (let key in providers) {
                    const err = 'IconifyProviders[' + key + '] is invalid.';
                    try {
                        const value = providers[key];
                        if (typeof value !== 'object' ||
                            !value ||
                            value.resources === void 0) {
                            continue;
                        }
                        if (!config$2.setAPIConfig(key, value)) {
                            console.error(err);
                        }
                    }
                    catch (e) {
                        console.error(err);
                    }
                }
            }
        }
    }
    /**
     * Check if component needs to be updated
     */
    function checkIconState(icon$1, state, mounted, callback, onload) {
        // Abort loading icon
        function abortLoading() {
            if (state.loading) {
                state.loading.abort();
                state.loading = null;
            }
        }
        // Icon is an object
        if (typeof icon$1 === 'object' &&
            icon$1 !== null &&
            typeof icon$1.body === 'string') {
            // Stop loading
            state.name = '';
            abortLoading();
            return { data: icon$2.fullIcon(icon$1) };
        }
        // Invalid icon?
        let iconName;
        if (typeof icon$1 !== 'string' ||
            (iconName = name$1.stringToIcon(icon$1, false, true)) === null) {
            abortLoading();
            return null;
        }
        // Load icon
        const data = functions$3.getIconData(iconName);
        if (data === null) {
            // Icon needs to be loaded
            // Do not load icon until component is mounted
            if (mounted && (!state.loading || state.loading.name !== icon$1)) {
                // New icon to load
                abortLoading();
                state.name = '';
                state.loading = {
                    name: icon$1,
                    abort: api.API.loadIcons([iconName], callback),
                };
            }
            return null;
        }
        // Icon data is available
        abortLoading();
        if (state.name !== icon$1) {
            state.name = icon$1;
            if (onload && !state.destroyed) {
                onload(icon$1);
            }
        }
        // Add classes
        const classes = ['iconify'];
        if (iconName.prefix !== '') {
            classes.push('iconify--' + iconName.prefix);
        }
        if (iconName.provider !== '') {
            classes.push('iconify--' + iconName.provider);
        }
        return { data, classes };
    }
    /**
     * Generate icon
     */
    function generateIcon(icon, props) {
        return icon ? render(icon, props) : null;
    }

    /* src/Icon.svelte generated by Svelte v3.38.3 */

    function create_if_block$w(ctx) {
    	let svg;
    	let raw_value = /*data*/ ctx[0].body + "";
    	let svg_levels = [/*data*/ ctx[0].attributes];
    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign$1(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert$1(target, svg, anchor);
    			svg.innerHTML = raw_value;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*data*/ 1 && raw_value !== (raw_value = /*data*/ ctx[0].body + "")) svg.innerHTML = raw_value;			set_svg_attributes(svg, svg_data = get_spread_update$1(svg_levels, [dirty & /*data*/ 1 && /*data*/ ctx[0].attributes]));
    		},
    		d(detaching) {
    			if (detaching) detach$1(svg);
    		}
    	};
    }

    function create_fragment$R(ctx) {
    	let if_block_anchor;
    	let if_block = /*data*/ ctx[0] !== null && create_if_block$w(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$2();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert$1(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (/*data*/ ctx[0] !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$w(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach$1(if_block_anchor);
    		}
    	};
    }

    function instance$R($$self, $$props, $$invalidate) {
    	const state = {
    		// Last icon name
    		name: "",
    		// Loading status
    		loading: null,
    		// Destroyed status
    		destroyed: false
    	};

    	// Mounted status
    	let mounted = false;

    	// Callback counter
    	let counter = 0;

    	// Generated data
    	let data;

    	// Increase counter when loaded to force re-calculation of data
    	function loaded() {
    		$$invalidate(3, counter++, counter);
    	}

    	// Force re-render
    	onMount$1(() => {
    		$$invalidate(2, mounted = true);
    	});

    	// Abort loading when component is destroyed
    	onDestroy$1(() => {
    		$$invalidate(1, state.destroyed = true, state);

    		if (state.loading) {
    			state.loading.abort();
    			$$invalidate(1, state.loading = null, state);
    		}
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign$1(assign$1({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$$.update = () => {
    		{
    			const iconData = checkIconState($$props.icon, state, mounted, loaded, $$props.onLoad);
    			$$invalidate(0, data = iconData ? generateIcon(iconData.data, $$props) : null);

    			if (data && iconData.classes) {
    				// Add classes
    				$$invalidate(
    					0,
    					data.attributes["class"] = (typeof $$props["class"] === "string"
    					? $$props["class"] + " "
    					: "") + iconData.classes.join(" "),
    					data
    				);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [data, state, mounted, counter];
    }

    class Icon extends SvelteComponent$1 {
    	constructor(options) {
    		super();
    		init$1(this, options, instance$R, create_fragment$R, safe_not_equal$1, {});
    	}
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
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
        // Allow synchronous rendering when API data is available?
        syncRender: false,
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

    var iconify = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setIconify = exports.Iconify = void 0;
    exports.Iconify = {};
    /**
     * Set Iconify functions
     *
     * Use this to set Iconify module before doing anything
     */
    function setIconify(functions) {
        // Merge all functions
        [functions, functions._api].forEach((items) => {
            if (typeof items === 'object') {
                for (const key in items) {
                    const value = items[key];
                    if (typeof value === 'function') {
                        exports.Iconify[key] = value;
                    }
                }
            }
        });
    }
    exports.setIconify = setIconify;

    });

    var icon$1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fullIcon = exports.iconDefaults = exports.minifyProps = exports.matchName = void 0;
    /**
     * Expression to test part of icon name.
     */
    exports.matchName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    /**
     * Properties that can be minified
     *
     * Values of all these properties are awalys numbers
     */
    exports.minifyProps = [
        // All IconifyDimenisons properties
        'width',
        'height',
        'top',
        'left',
    ];
    /**
     * Default values for all optional IconifyIcon properties
     */
    exports.iconDefaults = Object.freeze({
        left: 0,
        top: 0,
        width: 16,
        height: 16,
        rotate: 0,
        vFlip: false,
        hFlip: false,
    });
    /**
     * Add optional properties to icon
     */
    function fullIcon(data) {
        return { ...exports.iconDefaults, ...data };
    }
    exports.fullIcon = fullIcon;
    });

    var providers = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.listProviders = exports.addProvider = exports.getProvider = exports.convertProviderData = exports.internalSourceCache = void 0;
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
        svg: '',
    };
    /**
     * Local cache
     */
    // Exported to allow quick manipulation of links. Not meant to be used in any other way
    exports.internalSourceCache = Object.create(null);
    const configuredCache = Object.create(null);
    // Add default provider
    const iconifyRoot = 'https://icon-sets.iconify.design/';
    const iconifyPackage = '@iconify/icons-{prefix}';
    exports.internalSourceCache[''] = {
        config: {},
        title: 'Iconify',
        links: {
            home: iconifyRoot,
            collection: iconifyRoot + '{prefix}/',
            icon: iconifyRoot + '{prefix}/{name}/',
        },
        npm: {
            package: iconifyPackage,
            icon: iconifyPackage + '/{name}',
        },
        svg: 'https://api.iconify.design/{prefix}/{name}.svg',
    };
    /**
     * Defaults
     */
    const defaults = {
        title: '',
        links: defaultAPIDataLinks,
        npm: defaultAPIDataNPM,
        svg: '',
    };
    /**
     * Convert data returned from API
     */
    function convertProviderData(host, raw) {
        const provider = raw.provider;
        if (typeof provider !== 'string' ||
            // Allow empty string
            (provider !== '' && !provider.match(icon$1.matchName))) {
            return null;
        }
        // Clean up raw data
        const data = {};
        for (const key in defaultAPIData) {
            const attr = key;
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
                case 'links': {
                    const defaultValue = defaultAPIData[attr];
                    let resultValue;
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
                case 'svg':
                    data[attr] =
                        typeof raw[attr] === 'string'
                            ? raw[attr]
                            : defaultAPIData[attr];
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
            svg: '',
        };
        return result;
    }
    exports.convertProviderData = convertProviderData;
    /**
     * Get API provider
     */
    function getProvider(provider) {
        if (configuredCache[provider] === void 0) {
            if (exports.internalSourceCache[provider] === void 0) {
                // Missing provider
                return null;
            }
            const source = exports.internalSourceCache[provider];
            // Get Redundancy instance from Iconify
            const data = iconify.Iconify.getAPI ? iconify.Iconify.getAPI(provider) : void 0;
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
        if (!iconify.Iconify.addAPIProvider || exports.internalSourceCache[provider] !== void 0) {
            // addAPIProvider is not set or cannot overwrite provider
            return;
        }
        if (config.title === void 0) {
            // Use provider as name
            config.title = provider;
        }
        exports.internalSourceCache[provider] = config;
        iconify.Iconify.addAPIProvider(provider, config.config);
    }
    exports.addProvider = addProvider;
    /**
     * Get all providers
     */
    function listProviders() {
        return Object.keys(exports.internalSourceCache).sort();
    }
    exports.listProviders = listProviders;

    });

    var base$1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.searchCacheKey = exports.collectionCacheKey = exports.collectionsCacheKey = exports.BaseAPI = exports.mergeQuery = void 0;

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
         * @param cacheKey Key to store provider specific cache, true if key should be generated, false if cache should be ignored
         */
        query(provider, endpoint, params, callback, cacheKey = true) {
            const uri = mergeQuery(endpoint, params);
            const cacheKeyStr = typeof cacheKey === 'string' ? cacheKey : uri;
            // Check for cache
            if (this._cache[provider] === void 0) {
                this._cache[provider] = Object.create(null);
            }
            const providerCache = this._cache[provider];
            if (cacheKey !== false && providerCache[cacheKeyStr] !== void 0) {
                // Return cached data
                const cached = providerCache[cacheKeyStr];
                callback(cached === null ? null : JSON.parse(cached), void 0, true);
                return;
            }
            // Init redundancy
            const redundancy = this._getRedundancy(provider);
            if (!redundancy) {
                // Error
                callback(null, false);
                return;
            }
            // Send query
            const query = redundancy.find((item) => {
                const status = item();
                return status.status === 'pending' && status.payload === uri;
            });
            if (query !== null) {
                // Attach callback to existing query
                query().subscribe((data, error) => {
                    callback(data, error, false);
                });
                return;
            }
            // Create new query
            redundancy.query(uri, this._query.bind(this, provider, cacheKey === false ? null : cacheKeyStr), (data, error) => {
                callback(data, error, false);
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
        _query(provider, cacheKey, host, params, item) {
            // Should be implemented by child classes
            throw new Error('_query() should not be called on base API class');
        }
        /**
         * Store cached data
         */
        storeCache(provider, cacheKey, data) {
            if (this._cache[provider] === void 0) {
                this._cache[provider] = Object.create(null);
            }
            this._cache[provider][cacheKey] =
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
    /**
     * Various cache keys
     */
    function collectionsCacheKey() {
        return 'collections';
    }
    exports.collectionsCacheKey = collectionsCacheKey;
    function collectionCacheKey(prefix) {
        return 'collection.' + prefix;
    }
    exports.collectionCacheKey = collectionCacheKey;
    function searchCacheKey(query, limit) {
        return 'search.' + query + '.' + limit;
    }
    exports.searchCacheKey = searchCacheKey;

    });

    var fetch_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.API = exports.setFetch = void 0;

    /**
     * Fetch function
     *
     * Use this to set 'cross-fetch' in node.js environment if you are retrieving icons on server side.
     * Not needed when using stuff like Next.js or SvelteKit because components use API only on client side.
     */
    let fetchModule = null;
    try {
        fetchModule = fetch;
    }
    catch (err) {
        //
    }
    function setFetch(fetch) {
        fetchModule = fetch;
    }
    exports.setFetch = setFetch;
    /**
     * API class
     */
    class API extends base$1.BaseAPI {
        /**
         * Send API query without provider
         *
         * @param host Host string
         * @param params End point and parameters as string
         * @param callback Callback
         */
        sendQuery(host, params, callback) {
            if (!fetchModule) {
                // Fail: return 424 Failed Dependency (its not meant to be used like that, but it is the best match)
                callback(void 0, 424);
                return;
            }
            fetchModule(host + params)
                .then((response) => {
                if (response.status !== 200) {
                    callback(void 0, response.status);
                    return;
                }
                return response.json();
            })
                .then((data) => {
                if (data === void 0) {
                    // Return from previous then() without Promise
                    return;
                }
                if (typeof data !== 'object' || data === null) {
                    // Error
                    callback(void 0, null);
                    return;
                }
                // Store cache and complete
                callback(data);
            })
                .catch((err) => {
                callback(void 0, err === null || err === void 0 ? void 0 : err.errno);
            });
        }
        /**
         * Send query, callback from Redundancy
         *
         * @param provider Provider string
         * @param cacheKey API cache key, null if data should not be cached
         * @param host Host string
         * @param params End point and parameters as string
         * @param item Query item
         */
        _query(provider, cacheKey, host, params, item) {
            // console.log('API request: ' + host + params);
            this.sendQuery(host, params, (data, error) => {
                if (data !== void 0 && cacheKey !== null) {
                    // Store cache on success
                    this.storeCache(provider, cacheKey, data);
                }
                item.done(data, error);
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
    const getRegistry = (id) => registry[id];
    exports.getRegistry = getRegistry;

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
        icon: '',
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
    const routeParamsToObject = (type, params) => {
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
    exports.routeParamsToObject = routeParamsToObject;
    /**
     * Convert route to object for export, ignoring default values
     */
    const routeToObject = (route) => {
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
    exports.routeToObject = routeToObject;
    /**
     * List of parameters to change to lower case
     */
    const toLowerCaseStrings = ['filter', 'search', 'provider'];
    /**
     * Convert object to RouteParams
     */
    const objectToRouteParams = (type, params) => {
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
            // Exception: null where default value is not null
            if (value === null) {
                if (key === 'page' && type === 'collection') {
                    result[key] = value;
                    continue;
                }
            }
            // Invalid value
            result[key] = defaultValue;
        }
        return result;
    };
    exports.objectToRouteParams = objectToRouteParams;
    /**
     * Convert object to Route, adding missing values
     */
    const objectToRoute = (data, defaultRoute = null) => {
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
    exports.objectToRoute = objectToRoute;

    });

    var base = createCommonjsModule(function (module, exports) {
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
            this._isSync = null;
        }
        /**
         * Set _isSync variable
         */
        _checkSync() {
            if (this._isSync === null) {
                this._isSync = !!storage.getRegistry(this._instance).config.router
                    .syncRender;
            }
            return this._isSync;
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
        /**
         * Start loading
         */
        _startLoading() {
            this._startedLoading = true;
            if (this._checkSync()) {
                this._startLoadingData();
            }
            else {
                setTimeout(() => {
                    this._startLoadingData();
                });
            }
        }
        _startLoadingData() {
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
        _loadAPI(provider, query, params, cacheKey = true) {
            const registry = storage.getRegistry(this._instance);
            const api = registry.api;
            // Send query
            api.query(provider, query, params, (data, error) => {
                if (data === void 0) {
                    // Error
                    if (this.loading) {
                        this.error = error === 404 ? 'not_found' : 'timeout';
                        this.loading = false;
                        this._triggerLoaded();
                    }
                    return;
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
            }, cacheKey);
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
                const update = () => {
                    this.updating = false;
                    const registry = storage.getRegistry(this._instance);
                    const events = registry.events;
                    events.fire('view-updated', this);
                };
                if (this._checkSync()) {
                    update();
                }
                else {
                    setTimeout(update);
                }
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
    const defaultCollectionsFilterBlock = () => {
        return {
            type: 'collections-filter',
            keyword: '',
        };
    };
    exports.defaultCollectionsFilterBlock = defaultCollectionsFilterBlock;
    /**
     * Check if block is empty
     */
    function isCollectionsFilterBlockEmpty(block) {
        return block === void 0 || block === null || block.keyword.trim() === '';
    }
    exports.isCollectionsFilterBlockEmpty = isCollectionsFilterBlockEmpty;

    });

    var info = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.dataToCollectionInfo = void 0;
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

    });

    var collections$2 = createCommonjsModule(function (module, exports) {
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
            const item = info.dataToCollectionInfo(row, prefix);
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
    const defaultFilter = (title) => {
        return {
            title,
            index: 0,
            disabled: false,
        };
    };
    exports.defaultFilter = defaultFilter;
    /**
     * Default value
     */
    const defaultFiltersBlock = () => {
        return {
            type: 'filters',
            filterType: '',
            active: null,
            filters: Object.create(null),
        };
    };
    exports.defaultFiltersBlock = defaultFiltersBlock;
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
    const defaultCollectionsListBlock = () => {
        return {
            type: 'collections-list',
            showCategories: true,
            collections: Object.create(null),
        };
    };
    exports.defaultCollectionsListBlock = defaultCollectionsListBlock;
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
        return collections$2.collectionsPrefixes(block.collections);
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
            collections: collections$2.filterCollections(block.collections, callback, keepEmptyCategories),
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
        return storage[provider] === void 0 || storage[provider][prefix] === void 0
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

    var collection$1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.rawDataToCollection = exports.dataToCollection = void 0;

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
            const titles = Object.create(null);
            Object.keys(dataItem.titles).forEach((match) => {
                if (dataItem.found[match]) {
                    titles[match] = dataItem.titles[match];
                }
            });
            if (dataItem.hasUncategorized) {
                titles[''] = '';
            }
            switch (Object.keys(titles).length) {
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
            const info$1 = info.dataToCollectionInfo(source.info, result.prefix);
            if (info$1 === null) {
                // Invalid info block, so something is wrong
                return null;
            }
            result.info = info$1;
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
            result.name = result.prefix;
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
        const missingAliases = Object.create(null);
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
                    return;
                }
                // Alias is not found. Hidden icon?
                if (missingAliases[name] === void 0) {
                    missingAliases[name] = [];
                }
                missingAliases[name].push(alias);
            });
        }
        // Add hidden icons
        if (source.hidden instanceof Array) {
            let hidden = [];
            source.hidden.forEach((icon) => {
                // Add icon
                hidden.push(icon);
                // Look for aliases of hidden icon
                if (missingAliases[icon] !== void 0) {
                    hidden = hidden.concat(missingAliases[icon]);
                }
            });
            result.hidden = hidden;
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
        const info$1 = info.dataToCollectionInfo(source.info, result.prefix);
        if (info$1 === null) {
            // Invalid info block, so something is wrong
            return null;
        }
        result.info = info$1;
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

    var customSets = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergeCollections = exports.convertCustomSets = exports.emptyConvertedSet = void 0;



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
            const convertedData = collection$1.rawDataToCollection(item);
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
            if (importIcons && iconify.Iconify.addCollection) {
                iconify.Iconify.addCollection(item);
            }
        });
        // Parse collections lists
        Object.keys(rawInfo).forEach((provider) => {
            result.providers[provider].collections = collections$2.dataToCollections(rawInfo[provider]);
        });
        return result;
    }
    exports.convertCustomSets = convertCustomSets;
    /**
     * Merge icon sets from API and custom icon sets
     */
    function mergeCollections(provider, defaultSets, customSets) {
        // Get list of parsed data
        const parsedData = [];
        if (defaultSets) {
            parsedData.push({
                isCustom: false,
                categories: defaultSets,
            });
        }
        if (customSets) {
            const customCollections = customSets.providers[provider].collections;
            // Unshift or push it, depending on merge order
            parsedData[customSets.merge === 'custom-first' ? 'unshift' : 'push']({
                isCustom: true,
                categories: customCollections,
            });
        }
        // Setup result as empty object
        const results = Object.create(null);
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
                            delete results[usedPrefixes[prefix]][prefix];
                        }
                        else {
                            // Do not overwrite: always show set from API in case of duplicate entries
                            return;
                        }
                    }
                    // Add item
                    usedPrefixes[prefix] = category;
                    if (results[category] === void 0) {
                        results[category] = Object.create(null);
                    }
                    results[category][prefix] = categoryItems[prefix];
                });
            });
        });
        return results;
    }
    exports.mergeCollections = mergeCollections;

    });

    var collections = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CollectionsView = void 0;









    /**
     * Class
     */
    class CollectionsView extends base.BaseView {
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
            // Check for cache
            const cache = registry.getCustom('core-cache');
            if (typeof cache === 'object') {
                const providerCache = cache[this.provider];
                if (providerCache && providerCache.collections) {
                    this._data = providerCache.collections;
                }
            }
        }
        /**
         * Start loading
         */
        _startLoadingData() {
            if (this._data || !this._sources.api) {
                this._parseAPIData(null);
                return;
            }
            this._loadAPI(this.provider, '/collections', {}, base$1.collectionsCacheKey());
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
            if (this._sources.api && !data && !this._data) {
                // Error
                this._data = null;
            }
            else if (!this._data) {
                // Convert and merge data
                this._data = customSets.mergeCollections(this.route.params.provider, this._sources.api
                    ? collections$2.dataToCollections(data)
                    : null, this._sources.custom
                    ? storage.getRegistry(this._instance).customIconSets
                    : null);
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
                collections$2.autoIndexCollections(this._data);
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
    const defaultCollectionInfoBlock = () => {
        return {
            type: 'collection-info',
            prefix: '',
            info: null,
        };
    };
    exports.defaultCollectionInfoBlock = defaultCollectionInfoBlock;
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
    const defaultIconsListBlock = () => {
        return {
            type: 'icons-list',
            icons: [],
        };
    };
    exports.defaultIconsListBlock = defaultIconsListBlock;
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
    }
    exports.applyIconFilters = applyIconFilters;

    });

    var pagination = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showPagination = exports.getPageForIndex = exports.maxPage = exports.isPaginationEmpty = exports.defaultPaginationBlock = void 0;
    /**
     * Default values
     */
    const defaultPaginationBlock = () => {
        return {
            type: 'pagination',
            page: 0,
            length: 0,
            perPage: 24,
            more: false,
        };
    };
    exports.defaultPaginationBlock = defaultPaginationBlock;
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

    var search$2 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isSearchBlockEmpty = exports.defaultSearchBlock = void 0;
    /**
     * Default block values
     */
    const defaultSearchBlock = () => {
        return {
            type: 'search',
            keyword: '',
        };
    };
    exports.defaultSearchBlock = defaultSearchBlock;
    /**
     * Check if block is empty
     */
    function isSearchBlockEmpty(block) {
        return block === void 0 || block === null || block.keyword.trim() === '';
    }
    exports.isSearchBlockEmpty = isSearchBlockEmpty;

    });

    var collection = createCommonjsModule(function (module, exports) {
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
    class CollectionView extends base.BaseView {
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
            // Check for cache
            if (!this._data) {
                const cache = registry.getCustom('core-cache');
                if (typeof cache === 'object' && cache[this.provider]) {
                    const collectionCache = cache[this.provider].collection;
                    if (collectionCache && collectionCache[this.prefix]) {
                        this._data = collectionCache[this.prefix];
                    }
                }
            }
        }
        /**
         * Start loading
         */
        _startLoadingData() {
            if (!this._data) {
                const params = {
                    prefix: this.prefix,
                    info: 'true',
                    chars: 'true',
                    aliases: 'true',
                };
                if (this.route.params.icon !== '') {
                    // Ask for hidden icons (icons that were removed from icon set) if route has a
                    // reference icon, in case if reference icon is hidden.
                    params.hidden = 'true';
                }
                this._loadAPI(this.provider, '/collection', params, base$1.collectionCacheKey(this.prefix));
            }
            else {
                this._parseAPIData(null);
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
                // Change reference icon
                case 'icon':
                    if (value === '' || value === null) {
                        // Reset
                        this.route.params.icon = '';
                        break;
                    }
                    // Check type
                    if (typeof value !== 'string') {
                        return;
                    }
                    // Change reference icon and automatically set page
                    this.route.params.icon = value;
                    this.route.params.page = null;
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
         * Find icon in icons list
         *
         * Returns false on failure
         */
        _getIconIndex(icons, name) {
            for (let i = 0; i < icons.length; i++) {
                const icon = icons[i];
                if (icon.name === name) {
                    return i;
                }
                if (icon.aliases) {
                    const aliases = icon.aliases;
                    for (let j = 0; j < aliases.length; j++) {
                        if (aliases[j] === name) {
                            return i;
                        }
                    }
                }
            }
            return false;
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
            iconsList.applyIconFilters(blocks.icons, blocks.filter, filterKeys
                .filter((key) => blocks[key] !== null)
                .map((key) => blocks[key]));
            const iconsBlock = blocks.icons;
            const iconsList$1 = iconsBlock.icons;
            // Get current page
            const perPage = blocks.pagination.perPage;
            const referenceIcon = this.route.params.icon;
            let page;
            if (this.route.params.page !== null) {
                page = this.route.params.page;
            }
            else if (referenceIcon === '') {
                page = 0;
            }
            else {
                const iconIndex = this._getIconIndex(iconsList$1, referenceIcon);
                page =
                    iconIndex === false ? 0 : pagination.getPageForIndex(perPage, iconIndex);
            }
            // Check pagination
            blocks.pagination.length = iconsBlock.icons.length;
            blocks.pagination.page = page;
            const maximumPage = pagination.maxPage(blocks.pagination);
            if (maximumPage < blocks.pagination.page) {
                this.route.params.page = blocks.pagination.page = maximumPage;
            }
            // Apply pagination
            const startIndex = blocks.pagination.page * perPage;
            const nextIndex = Math.min(startIndex + perPage, iconsList$1.length + 1);
            iconsBlock.icons = iconsList$1.slice(startIndex, nextIndex);
            // Navigation
            if (iconsList$1.length > 1) {
                // Add first/last icon
                iconsBlock.first = iconsList$1[0];
                iconsBlock.last = iconsList$1[iconsList$1.length - 1];
                // Add previous/next icon
                iconsBlock.prev =
                    startIndex > 0 ? iconsList$1[startIndex - 1] : iconsBlock.last;
                iconsBlock.next =
                    iconsList$1[nextIndex] === void 0
                        ? iconsBlock.first
                        : iconsList$1[nextIndex];
            }
            else {
                // Nothing to navigate
                delete iconsBlock.first;
                delete iconsBlock.last;
                delete iconsBlock.prev;
                delete iconsBlock.next;
            }
            return this._blocks;
        }
        /**
         * Parse data from API
         *
         * Should be overwritten by child classes
         */
        _parseAPIData(data) {
            if (!this._data && !this._isCustom) {
                this._data = collection$1.dataToCollection(this.provider, data);
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
                filter: Object.assign(search$2.defaultSearchBlock(), {
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
                const page = this.route.params.page;
                pagination$1.page =
                    page === null ? 0 : Math.min(page, pagination.maxPage(pagination$1));
                // Copy full icons list for possible use in UI
                this._blocks.icons.allIcons = parsedData.icons;
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
                        const item = parsedData[dataKey];
                        const isArray = item instanceof Array;
                        const list = (isArray
                            ? item
                            : Object.values(item));
                        const listKeys = isArray
                            ? []
                            : Object.keys(item);
                        if (list instanceof Array && list.length > 1) {
                            // Create empty filters block
                            const filter = filters.defaultFiltersBlock();
                            filter.filterType = key;
                            initialisedBlocks[key] = filter;
                            // Copy all filters
                            list.forEach((tag, index) => {
                                const item = filters.defaultFilter(tag);
                                if (!isArray) {
                                    item.match = listKeys[index];
                                }
                                filter.filters[tag] = item;
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

    var name = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateIcon = exports.stringToIcon = void 0;

    /**
     * Convert string to Icon object.
     */
    const stringToIcon = (value, validate, allowSimpleName, provider = '') => {
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
            const result = {
                // Allow provider without '@': "provider:prefix:name"
                provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
                prefix,
                name,
            };
            return validate && !exports.validateIcon(result) ? null : result;
        }
        // Attempt to split by dash: "prefix-name"
        const name = colonSeparated[0];
        const dashSeparated = name.split('-');
        if (dashSeparated.length > 1) {
            const result = {
                provider: provider,
                prefix: dashSeparated.shift(),
                name: dashSeparated.join('-'),
            };
            return validate && !exports.validateIcon(result) ? null : result;
        }
        // If allowEmpty is set, allow empty provider and prefix, allowing names like "home"
        if (allowSimpleName && provider === '') {
            const result = {
                provider: provider,
                prefix: '',
                name,
            };
            return validate && !exports.validateIcon(result, allowSimpleName)
                ? null
                : result;
        }
        return null;
    };
    exports.stringToIcon = stringToIcon;
    /**
     * Check if icon is valid.
     *
     * This function is not part of stringToIcon because validation is not needed for most code.
     */
    const validateIcon = (icon, allowSimpleName) => {
        if (!icon) {
            return false;
        }
        return !!((icon.provider === '' || icon.provider.match(icon$1.matchName)) &&
            ((allowSimpleName && icon.prefix === '') ||
                icon.prefix.match(icon$1.matchName)) &&
            icon.name.match(icon$1.matchName));
    };
    exports.validateIcon = validateIcon;
    });

    var icon = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.iconToString = exports.compareIcons = exports.validateIcon = exports.stringToIcon = exports.match = void 0;

    Object.defineProperty(exports, "validateIcon", { enumerable: true, get: function () { return name.validateIcon; } });
    /**
     * Expression to test part of icon name.
     */
    exports.match = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    /**
     * Convert string to Icon object.
     */
    const stringToIcon = (value, validate = false, provider = '') => {
        return name.stringToIcon(value, validate, false, provider);
    };
    exports.stringToIcon = stringToIcon;
    /**
     * Compare Icon objects.
     *
     * Note: null means icon is invalid, so null to null comparison = false.
     */
    const compareIcons = (icon1, icon2) => {
        return (icon1 !== null &&
            icon2 !== null &&
            icon1.provider === icon2.provider &&
            icon1.name === icon2.name &&
            icon1.prefix === icon2.prefix);
    };
    exports.compareIcons = compareIcons;
    /**
     * Convert icon to string.
     */
    const iconToString = (icon) => {
        return ((icon.provider === '' ? '' : '@' + icon.provider + ':') +
            icon.prefix +
            ':' +
            icon.name);
    };
    exports.iconToString = iconToString;

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
                const icon$1 = icon.stringToIcon(item, true, provider);
                if (icon$1 === null) {
                    throw new Error('Invalid icon');
                }
                result.icons.push(icon$1);
                const prefix = icon$1.prefix;
                if (result.collections[prefix] === void 0) {
                    // Add collection
                    if (sourceCollections[prefix] === void 0) {
                        throw new Error(`Missing data for prefix ${prefix}`);
                    }
                    const info$1 = info.dataToCollectionInfo(sourceCollections[prefix], prefix);
                    if (info$1 === null) {
                        throw new Error(`Invalid data for prefix ${prefix}`);
                    }
                    result.collections[prefix] = info$1;
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

    var search = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchView = void 0;









    /**
     * Class
     */
    class SearchView extends base.BaseView {
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
            // Check for cache
            const cache = registry.getCustom('core-cache');
            if (typeof cache === 'object' && cache[this.provider]) {
                const searchCache = cache[this.provider].search;
                if (searchCache && searchCache[this.keyword]) {
                    this._data = searchCache[this.keyword];
                    // Only full pages can be cached
                    this.route.params.short = false;
                }
            }
            // Set items limit for query
            this.itemsLimit = this.route.params.short ? this.itemsPerPage * 2 : 999;
        }
        /**
         * Start loading
         */
        _startLoadingData() {
            if (!this._data) {
                const query = this.keyword;
                const limit = this.itemsLimit;
                this._loadAPI(this.provider, '/search', {
                    query,
                    limit,
                }, base$1.searchCacheKey(query, limit));
            }
            else {
                this._parseAPIData(null);
            }
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
            if (!this._data) {
                this._data = search$1.dataToSearchResults(this.provider, data);
            }
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
    class CustomView extends base.BaseView {
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
        _startLoadingData() {
            if (this._data !== null) {
                return;
            }
            const registry = storage.getRegistry(this._instance);
            const events = registry.events;
            // Fire public event, exposed to external code
            events.fire('load-' + this.customType, this.setIcons.bind(this));
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
            iconsList.applyIconFilters(blocks.icons, blocks.filter, [], true);
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
                if (!this._checkSync()) {
                    // Make sure its async unless synchronous loading is enabled
                    setTimeout(() => {
                        this._setIcons(data);
                    });
                }
                else {
                    this._setIcons(data);
                }
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
                filter: Object.assign(search$2.defaultSearchBlock(), {
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
                // Copy full icons list for possible use in UI
                this._blocks.icons.allIcons = parsedData;
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

    var empty$1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EmptyView = void 0;

    /**
     * Class
     */
    class EmptyView extends base.BaseView {
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
        _startLoadingData() {
            this.loading = false;
            this._triggerLoaded();
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
            if (this._visibleView !== view) {
                if (immediate || !view.loading || this._visibleView === null) {
                    // Change visible view immediately and trigger event
                    this._visibleView = view;
                    this._triggerChange(true);
                }
                else {
                    // Start timer that will change visible view and trigger event after delay
                    this._startTimer();
                }
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
                    return new collections.CollectionsView(this._instance, route, parent);
                case 'collection':
                    return new collection.CollectionView(this._instance, route, parent);
                case 'search':
                    return new search.SearchView(this._instance, route, parent);
                case 'custom':
                    return new custom.CustomView(this._instance, route, parent);
                case 'empty':
                    return new empty$1.EmptyView(this._instance, route, parent);
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
                return search$2.isSearchBlockEmpty(block);
            default:
                return true;
        }
    }
    exports.isBlockEmpty = isBlockEmpty;

    });

    var lib = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCoreInstance = exports.IconFinderCore = exports.cloneObject = exports.compareObjects = exports.stringToIcon = exports.compareIcons = exports.validateIcon = exports.iconToString = exports.setComponentsConfig = exports.mergeConfig = exports.customisedConfig = exports.getCollectionTitle = exports.getCollectionInfo = exports.objectToRoute = exports.listProviders = exports.convertProviderData = exports.getProvider = exports.addProvider = exports.setIconify = exports.maxPage = exports.showPagination = exports.iterateCollectionsBlock = exports.getCollectionsBlockPrefixes = exports.getCollectionsBlockCategories = exports.isBlockEmpty = void 0;




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
    /**
     * Export various types and functions that do not depend on core instance
     */
    // Iconify wrapper

    Object.defineProperty(exports, "setIconify", { enumerable: true, get: function () { return iconify.setIconify; } });

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

    var customisations$1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergeCustomisations = exports.defaults = void 0;
    /**
     * Default icon customisations values
     */
    exports.defaults = Object.freeze({
        // Display mode
        inline: false,
        // Dimensions
        width: null,
        height: null,
        // Alignment
        hAlign: 'center',
        vAlign: 'middle',
        slice: false,
        // Transformations
        hFlip: false,
        vFlip: false,
        rotate: 0,
    });
    /**
     * Convert IconifyIconCustomisations to FullIconCustomisations
     */
    function mergeCustomisations(defaults, item) {
        const result = {};
        for (const key in defaults) {
            const attr = key;
            // Copy old value
            result[attr] = defaults[attr];
            if (item[attr] === void 0) {
                continue;
            }
            // Validate new value
            const value = item[attr];
            switch (attr) {
                // Boolean attributes that override old value
                case 'inline':
                case 'slice':
                    if (typeof value === 'boolean') {
                        result[attr] = value;
                    }
                    break;
                // Boolean attributes that are merged
                case 'hFlip':
                case 'vFlip':
                    if (value === true) {
                        result[attr] = !result[attr];
                    }
                    break;
                // Non-empty string
                case 'hAlign':
                case 'vAlign':
                    if (typeof value === 'string' && value !== '') {
                        result[attr] = value;
                    }
                    break;
                // Non-empty string / non-zero number / null
                case 'width':
                case 'height':
                    if ((typeof value === 'string' && value !== '') ||
                        (typeof value === 'number' && value) ||
                        value === null) {
                        result[attr] = value;
                    }
                    break;
                // Rotation
                case 'rotate':
                    if (typeof value === 'number') {
                        result[attr] += value;
                    }
                    break;
            }
        }
        return result;
    }
    exports.mergeCustomisations = mergeCustomisations;
    });

    var customisations = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.filterCustomisations = exports.mergeCustomisations = exports.defaultCustomisations = exports.emptyCustomisations = void 0;

    /**
     * Custom values
     */
    const emptyCustomValues = {
        color: '',
    };
    /**
     * Empty values
     */
    exports.emptyCustomisations = {
        ...customisations$1.defaults,
        ...emptyCustomValues,
    };
    /**
     * Default values
     */
    exports.defaultCustomisations = {
        ...exports.emptyCustomisations,
    };
    /**
     * Add missing values to customisations, creating new object. Function does type checking
     */
    function mergeCustomisations(defaults, values) {
        // Merge default properties
        const result = customisations$1.mergeCustomisations(defaults, values);
        // Merge custom properties
        for (const key in emptyCustomValues) {
            const attr = key;
            // Match type
            result[attr] =
                values && typeof values[attr] === typeof defaults[attr]
                    ? values[attr]
                    : defaults[attr];
        }
        return result;
    }
    exports.mergeCustomisations = mergeCustomisations;
    /**
     * Export only customised attributes
     */
    function filterCustomisations(values) {
        // Function can handle any properties, just needs some type hinting
        const result = {};
        for (const key in exports.defaultCustomisations) {
            const attr = key;
            if (values[attr] !== exports.defaultCustomisations[attr] &&
                values[attr] !== exports.emptyCustomisations[attr]) {
                result[attr] = values[attr];
            }
        }
        return result;
    }
    exports.filterCustomisations = filterCustomisations;

    });

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
    function importThemeIcons() {
        addCollection({
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
    }
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
    /**
     * Class to add to icons
     */
    const iconsClass = 'iconify--line-md';

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
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
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
    function empty() {
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
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
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
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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

    /* src/icon-finder/components/Wrapper.svelte generated by Svelte v3.42.1 */

    function create_fragment$Q(ctx) {
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
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
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

    function instance$Q($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Wrapper$1 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$Q, create_fragment$Q, safe_not_equal, {});
    	}
    }

    /**
     * Can show and add API providers?
     */
    const canAddProviders = false;
    /**
     * Automatically focus search
     *
     * Do not change value to true, comment out code below it. It checks for mobile devices
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
    const phrases$1 = {
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
                timeout: 'Could not connect to Iconify API.',
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
                length: '', //'\nContent: {length} bytes',
            },
            more: 'Find more icons',
            moreAsNumber: false, // True if text above refers to third page, false if text above shows "Find more icons" or similar text
        },
        pagination: {
            prev: 'Previous page',
            next: 'Next page',
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
            headingHidden: 'Show code for "{name}" for developers',
            heading: 'Code for "{name}" for developers',
            childTabTitle: '{key} versions:',
            childTabTitles: {
                react: 'React component versions:',
                svg: 'SVG options:',
            },
            docsDefault: 'Click here for more information about {title} component.',
            docs: {
                iconify: 'Click here for more information about Iconify SVG framework.',
                css: 'Click here for more code examples.',
            },
            intro: {
                'svg-box': 'This SVG contains extra empty rectangle that matches viewBox. It is needed to keep icon dimensions when importing icon in software that ignores viewBox attribute.',
                'svg-uri': 'You can use this as background image or as content for pseudo element in stylesheet.',
                'css': "Add code below to your stylesheet to use icon as background image or as pseudo element's content:",
            },
            component: {
                'install-offline': 'Install component and icon set:',
                'install-simple': 'Install component:',
                'install-addon': 'Install addon:',
                'import-offline': 'Import component and icon data:',
                'import-simple': 'Import component:',
                'vue-offline': 'Add icon data and icon component to your component:',
                'vue-simple': 'Add icon component to your component:',
                'use-in-code': 'Use it in your code:',
                'use-in-html': 'Use it in HTML code:',
                'use-in-template': 'Use component in template:',
                'use-generic': '',
            },
            iconify: {
                intro1: 'Iconify SVG framework makes using icons as easy as icon fonts. To use "{name}" in HTML, add this code to the document:',
                intro2: 'Iconify SVG framework will load icon data from Iconify API and replace that placeholder with SVG.',
                head: 'Make sure you import Iconify SVG framework:',
            },
        },
    };

    /* src/icon-finder/components/ui/UIIcon.svelte generated by Svelte v3.42.1 */

    function create_else_block$9(ctx) {
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
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
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

    // (39:0) {#if iconName !== null}
    function create_if_block$v(ctx) {
    	let icon_1;
    	let if_block_anchor;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				icon: /*iconName*/ ctx[1],
    				class: iconsClass,
    				onLoad: /*loadCallback*/ ctx[2]
    			}
    		});

    	let if_block = !/*loaded*/ ctx[0] && create_if_block_1$h(ctx);

    	return {
    		c() {
    			create_component(icon_1.$$.fragment);
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*iconName*/ 2) icon_1_changes.icon = /*iconName*/ ctx[1];
    			icon_1.$set(icon_1_changes);

    			if (!/*loaded*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*loaded*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$h(ctx);
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
    			transition_in(icon_1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(icon_1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(icon_1, detaching);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (43:26) {#if !loaded}
    function create_if_block_1$h(ctx) {
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
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
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

    function create_fragment$P(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$v, create_else_block$9];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*iconName*/ ctx[1] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
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
    				} else {
    					if_block.p(ctx, dirty);
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
    let firstMount = true;

    function instance$P($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { icon } = $$props;
    	let { onLoad = null } = $$props;

    	// Loaded status
    	let loaded = false;

    	function loadCallback() {
    		$$invalidate(0, loaded = true);

    		if (onLoad) {
    			onLoad();
    		}
    	}

    	// Preload icons only after mount, which is not used in SSR
    	onMount(() => {
    		if (firstMount) {
    			firstMount = false;
    			loadIcons(Object.values(icons).filter(name => !!name));
    		}
    	});

    	// Resolve icon name
    	let iconName;

    	$$self.$$set = $$props => {
    		if ('icon' in $$props) $$invalidate(3, icon = $$props.icon);
    		if ('onLoad' in $$props) $$invalidate(4, onLoad = $$props.onLoad);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 8) {
    			{
    				$$invalidate(1, iconName = typeof icons[icon] === 'string'
    				? icons[icon]
    				: icon.indexOf(':') === -1 ? null : icon);
    			}
    		}
    	};

    	return [loaded, iconName, loadCallback, icon, onLoad, $$scope, slots];
    }

    class UIIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$P, create_fragment$P, safe_not_equal, { icon: 3, onLoad: 4 });
    	}
    }

    /* src/icon-finder/components/ui/Input.svelte generated by Svelte v3.42.1 */

    function create_if_block_2$d(ctx) {
    	let div;
    	let uiicon;
    	let current;

    	uiicon = new UIIcon({
    			props: {
    				icon: /*icon*/ ctx[4],
    				onLoad: /*iconLoaded*/ ctx[11]
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(uiicon.$$.fragment);
    			attr(div, "class", "iif-input-icon");
    			attr(div, "style", /*iconStyle*/ ctx[8]);
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

    			if (!current || dirty & /*iconStyle*/ 256) {
    				attr(div, "style", /*iconStyle*/ ctx[8]);
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

    // (116:2) {#if mounted && value === '' && placeholder !== ''}
    function create_if_block_1$g(ctx) {
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

    // (119:2) {#if mounted && value !== ''}
    function create_if_block$u(ctx) {
    	let a;
    	let uiicon;
    	let current;
    	let mounted;
    	let dispose;

    	uiicon = new UIIcon({
    			props: {
    				icon: "reset",
    				$$slots: { default: [create_default_slot$k] },
    				$$scope: { ctx }
    			}
    		});

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
    				dispose = listen(a, "click", prevent_default(/*resetValue*/ ctx[12]));
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const uiicon_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				uiicon_changes.$$scope = { dirty, ctx };
    			}

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
    			if (detaching) detach(a);
    			destroy_component(uiicon);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (124:4) <UIIcon icon="reset">
    function create_default_slot$k(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("x");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$O(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let input;
    	let input_title_value;
    	let input_inputmode_value;
    	let t1;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*mounted*/ ctx[10] && /*icon*/ ctx[4] !== '' && create_if_block_2$d(ctx);
    	let if_block1 = /*mounted*/ ctx[10] && /*value*/ ctx[0] === '' && /*placeholder*/ ctx[1] !== '' && create_if_block_1$g(ctx);
    	let if_block2 = /*mounted*/ ctx[10] && /*value*/ ctx[0] !== '' && create_if_block$u(ctx);

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

    			attr(input, "spellcheck", false);
    			attr(input, "autocomplete", "off");
    			attr(input, "autocorrect", "off");
    			attr(input, "autocapitalize", "off");
    			attr(input, "inputmode", input_inputmode_value = /*type*/ ctx[5] === 'number' ? 'decimal' : 'text');
    			input.disabled = /*disabled*/ ctx[3];
    			attr(div0, "class", /*className*/ ctx[7]);
    			attr(div1, "class", /*wrapperClassName*/ ctx[6]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t0);
    			append(div0, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			/*input_binding*/ ctx[21](input);
    			append(div0, t1);
    			if (if_block1) if_block1.m(div0, null);
    			append(div0, t2);
    			if (if_block2) if_block2.m(div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[20]),
    					listen(input, "input", /*handleInput*/ ctx[13]),
    					listen(input, "blur", /*handleBlur*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*mounted*/ ctx[10] && /*icon*/ ctx[4] !== '') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*mounted, icon*/ 1040) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$d(ctx);
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

    			if (!current || dirty & /*type*/ 32 && input_inputmode_value !== (input_inputmode_value = /*type*/ ctx[5] === 'number' ? 'decimal' : 'text')) {
    				attr(input, "inputmode", input_inputmode_value);
    			}

    			if (!current || dirty & /*disabled*/ 8) {
    				input.disabled = /*disabled*/ ctx[3];
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (/*mounted*/ ctx[10] && /*value*/ ctx[0] === '' && /*placeholder*/ ctx[1] !== '') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$g(ctx);
    					if_block1.c();
    					if_block1.m(div0, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*mounted*/ ctx[10] && /*value*/ ctx[0] !== '') {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*mounted, value*/ 1025) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$u(ctx);
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

    			if (!current || dirty & /*className*/ 128) {
    				attr(div0, "class", /*className*/ ctx[7]);
    			}

    			if (!current || dirty & /*wrapperClassName*/ 64) {
    				attr(div1, "class", /*wrapperClassName*/ ctx[6]);
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
    			/*input_binding*/ ctx[21](null);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    const baseClass$d = 'iif-input';

    function instance$O($$self, $$props, $$invalidate) {
    	let { placeholder = '' } = $$props;
    	let { title = '' } = $$props;
    	let { value = '' } = $$props;
    	let { disabled = false } = $$props;
    	let { icon = '' } = $$props;
    	let { type = '' } = $$props;
    	let { extra = '' } = $$props;
    	let { onInput = null } = $$props;
    	let { onBlur = null } = $$props;
    	let { autofocus = false } = $$props;

    	// Icon status
    	let hasIcon = false;

    	function iconLoaded() {
    		$$invalidate(19, hasIcon = true);
    	}

    	// Get wrapper class name
    	let wrapperClassName;

    	// Get container class name
    	let className;

    	// Get icon style
    	let iconStyle;

    	// Reset value
    	function resetValue() {
    		$$invalidate(0, value = '');
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

    	let mounted = false;

    	onMount(() => {
    		$$invalidate(10, mounted = true);

    		if (autofocus) {
    			inputRef.focus();
    		}
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputRef = $$value;
    			$$invalidate(9, inputRef);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('placeholder' in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ('icon' in $$props) $$invalidate(4, icon = $$props.icon);
    		if ('type' in $$props) $$invalidate(5, type = $$props.type);
    		if ('extra' in $$props) $$invalidate(15, extra = $$props.extra);
    		if ('onInput' in $$props) $$invalidate(16, onInput = $$props.onInput);
    		if ('onBlur' in $$props) $$invalidate(17, onBlur = $$props.onBlur);
    		if ('autofocus' in $$props) $$invalidate(18, autofocus = $$props.autofocus);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wrapperClassName, value, disabled*/ 73) {
    			{
    				$$invalidate(6, wrapperClassName = baseClass$d + '-wrapper');

    				// Add states
    				$$invalidate(6, wrapperClassName += // Content?
    				' ' + wrapperClassName + (value === '' ? '--empty' : '--has-content') + (// Disabled
    				disabled ? ' ' + wrapperClassName + '--disabled' : ''));
    			}
    		}

    		if ($$self.$$.dirty & /*placeholder, hasIcon, type, disabled*/ 524330) {
    			{
    				$$invalidate(7, className = baseClass$d + // Placeholder
    				' ' + baseClass$d + '--with' + (placeholder === '' ? 'out' : '') + '-placeholder' + (// Icon
    				hasIcon ? ' ' + baseClass$d + '--with-icon' : '') + (// Type
    				type !== '' ? ' ' + baseClass$d + '--' + type : '') + (// Disabled
    				disabled ? ' ' + baseClass$d + '--disabled' : ''));
    			}
    		}

    		if ($$self.$$.dirty & /*type, extra*/ 32800) {
    			{
    				$$invalidate(8, iconStyle = '');

    				if (type === 'color' && extra !== '') {
    					$$invalidate(8, iconStyle = 'opacity: 1; color: ' + extra);
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
    		type,
    		wrapperClassName,
    		className,
    		iconStyle,
    		inputRef,
    		mounted,
    		iconLoaded,
    		resetValue,
    		handleInput,
    		handleBlur,
    		extra,
    		onInput,
    		onBlur,
    		autofocus,
    		hasIcon,
    		input_input_handler,
    		input_binding
    	];
    }

    class Input extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$O, create_fragment$O, safe_not_equal, {
    			placeholder: 1,
    			title: 2,
    			value: 0,
    			disabled: 3,
    			icon: 4,
    			type: 5,
    			extra: 15,
    			onInput: 16,
    			onBlur: 17,
    			autofocus: 18
    		});
    	}
    }

    /* src/icon-finder/components/content/Block.svelte generated by Svelte v3.42.1 */

    function create_fragment$N(ctx) {
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
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
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

    const baseClass$c = 'iif-block';

    function instance$N($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { type = '' } = $$props;
    	let { name = '' } = $$props;
    	let { extra = '' } = $$props;
    	let className;

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(1, type = $$props.type);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('extra' in $$props) $$invalidate(3, extra = $$props.extra);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type, className, name, extra*/ 15) {
    			{
    				$$invalidate(0, className = baseClass$c);

    				if (type !== '') {
    					let typeBase = ' ' + baseClass$c + '--' + type;
    					$$invalidate(0, className += typeBase);

    					if (name !== '') {
    						$$invalidate(0, className += typeBase + '--' + name);
    					}
    				}

    				if (extra !== '') {
    					$$invalidate(0, className += ' ' + baseClass$c + '--' + extra);
    				}
    			} // console.log(`Rendering Block at ${Date.now()}: ${className}`);
    		}
    	};

    	return [className, type, name, extra, $$scope, slots];
    }

    class Block extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$N, create_fragment$N, safe_not_equal, { type: 1, name: 2, extra: 3 });
    	}
    }

    /* src/icon-finder/components/content/blocks/GlobalSearch.svelte generated by Svelte v3.42.1 */

    function get_each_context$l(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (73:2) {#each [focusInput] as autofocus, i (autofocus)}
    function create_each_block$l(key_1, ctx) {
    	let first;
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[6](value);
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
    	binding_callbacks.push(() => bind(input, 'value', input_value_binding));

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(input.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
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
    function create_default_slot$j(ctx) {
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
    		let child_ctx = get_each_context$l(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$l(key, child_ctx));
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
    				each_value = [/*focusInput*/ ctx[1]];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, form, outro_and_destroy_block, create_each_block$l, t0, get_each_context$l);
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

    function create_fragment$M(ctx) {
    	let block;
    	let current;

    	block = new Block({
    			props: {
    				type: "search",
    				name: "global",
    				$$slots: { default: [create_default_slot$j] },
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

    function instance$M($$self, $$props, $$invalidate) {
    	
    	
    	let { viewChanged } = $$props;
    	let { route } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	// Phrases
    	const text = phrases$1.search;

    	// Current keyword
    	let keyword;

    	// Variable to store last change to avoid changing keyword multiple times to same value
    	let lastChange = '';

    	// Check route for keyword
    	function checkRoute(route) {
    		if (route && route.type === 'search' && route.params && (lastChange === '' || lastChange !== route.params.search)) {
    			$$invalidate(0, keyword = route.params.search);
    			lastChange = keyword;
    			return true;
    		}

    		return false;
    	}

    	// Submit form
    	function submitForm() {
    		if (typeof keyword === 'string') {
    			const value = keyword.trim().toLowerCase();

    			if (value !== '') {
    				lastChange = value;
    				registry.router.action('search', value);
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
    		if ('viewChanged' in $$props) $$invalidate(4, viewChanged = $$props.viewChanged);
    		if ('route' in $$props) $$invalidate(5, route = $$props.route);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*keyword, route, viewChanged*/ 49) {
    			// Overwrite keyword on first render or when current view changes to search results
    			{
    				if (keyword === null) {
    					// First render - get keyword from route
    					$$invalidate(0, keyword = '');

    					if (route !== null) {
    						// Get keyword from current route or its parent
    						if (!checkRoute(route) && route.parent) {
    							checkRoute(route.parent);
    						}
    					}
    				} else if (!viewChanged) {
    					lastChange = '';
    				} else {
    					checkRoute(route);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*route*/ 32) {
    			{
    				{
    					$$invalidate(1, focusInput = route
    					? route.type === 'collections' || route.type === 'search'
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
    		init(this, options, instance$M, create_fragment$M, safe_not_equal, { viewChanged: 4, route: 5 });
    	}
    }

    /* src/icon-finder/components/content/blocks/parent/Link.svelte generated by Svelte v3.42.1 */

    function create_fragment$L(ctx) {
    	let div;
    	let uiicon;
    	let t0;
    	let a;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	uiicon = new UIIcon({ props: { icon: "parent" } });

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

    function instance$L($$self, $$props, $$invalidate) {
    	let { text } = $$props;
    	let { onClick } = $$props;

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('onClick' in $$props) $$invalidate(1, onClick = $$props.onClick);
    	};

    	return [text, onClick];
    }

    class Link extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$L, create_fragment$L, safe_not_equal, { text: 0, onClick: 1 });
    	}
    }

    /* src/icon-finder/components/content/blocks/Parent.svelte generated by Svelte v3.42.1 */

    function get_each_context$k(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (71:0) {#if entries.length > 0}
    function create_if_block$t(ctx) {
    	let block;
    	let current;

    	block = new Block({
    			props: {
    				type: "parent",
    				$$slots: { default: [create_default_slot$i] },
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
    function create_each_block$k(key_1, ctx) {
    	let first;
    	let link;
    	let current;

    	function func() {
    		return /*func*/ ctx[3](/*item*/ ctx[7]);
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
    			first = empty();
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
    function create_default_slot$i(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*entries*/ ctx[0];
    	const get_key = ctx => /*item*/ ctx[7].key;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$k(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$k(key, child_ctx));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
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
    				each_value = /*entries*/ ctx[0];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$k, each_1_anchor, get_each_context$k);
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

    function create_fragment$K(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*entries*/ ctx[0].length > 0 && create_if_block$t(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
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

    function instance$K($$self, $$props, $$invalidate) {
    	
    	
    	
    	let { route } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	const parentPhrases = phrases$1.parent;
    	const collections = registry.collections;

    	function handleClick(level) {
    		registry.router.action('parent', level);
    	}

    	let entries;
    	const func = item => handleClick(item.level);

    	$$self.$$set = $$props => {
    		if ('route' in $$props) $$invalidate(2, route = $$props.route);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*entries, route*/ 5) {
    			{
    				function addEntry(route, level) {
    					const routeParams = route.params;

    					// Get text
    					let text = parentPhrases.default;

    					if (route.type === 'custom' && parentPhrases[route.params.customType] !== void 0) {
    						// Text for custom view
    						text = parentPhrases[routeParams.customType];
    					} else if (parentPhrases[route.type] !== void 0) {
    						// Text by view type
    						text = parentPhrases[route.type];

    						if (route.type === 'collection') {
    							// Replace {name} with collection name
    							text = text.replace('{name}', lib.getCollectionTitle(collections, routeParams.provider, routeParams.prefix));
    						}
    					}

    					// Generate unique key
    					let key = route.type + '-' + level + '-';

    					switch (route.type) {
    						case 'collection':
    							key += routeParams.provider + ':' + routeParams.prefix;
    							break;
    						case 'custom':
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
    		init(this, options, instance$K, create_fragment$K, safe_not_equal, { route: 2 });
    	}
    }

    /* src/icon-finder/components/ui/Tabs.svelte generated by Svelte v3.42.1 */

    function get_each_context$j(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (60:2) {#if !listItem.empty}
    function create_if_block$s(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let div_class_value;
    	let current;
    	let each_value_1 = /*listItem*/ ctx[4].items;
    	const get_key = ctx => /*tab*/ ctx[7].key;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr(div, "class", div_class_value = baseClass$b + '-' + /*listItem*/ ctx[4].side);
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
    				each_value_1 = /*listItem*/ ctx[4].items;
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, outro_and_destroy_block, create_each_block_1$1, t, get_each_context_1$1);
    				check_outros();
    			}

    			if (!current || dirty & /*list*/ 1 && div_class_value !== (div_class_value = baseClass$b + '-' + /*listItem*/ ctx[4].side)) {
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
    function create_if_block_2$c(ctx) {
    	let uiicon;
    	let current;
    	uiicon = new UIIcon({ props: { icon: /*tab*/ ctx[7].icon } });

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
    function create_if_block_1$f(ctx) {
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
    function create_each_block_1$1(key_1, ctx) {
    	let a;
    	let t;
    	let a_href_value;
    	let a_class_value;
    	let a_title_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*tab*/ ctx[7].icon && create_if_block_2$c(ctx);
    	let if_block1 = /*tab*/ ctx[7].title !== '' && create_if_block_1$f(ctx);

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
    					if_block0 = create_if_block_2$c(ctx);
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

    			if (/*tab*/ ctx[7].title !== '') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$f(ctx);
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
    function create_each_block$j(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = !/*listItem*/ ctx[4].empty && create_if_block$s(ctx);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!/*listItem*/ ctx[4].empty) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*list*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$s(ctx);
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

    function create_fragment$J(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*list*/ ctx[0];
    	const get_key = ctx => /*listItem*/ ctx[4].side;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$j(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$j(key, child_ctx));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", baseClass$b);
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
    				each_value = /*list*/ ctx[0];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$j, null, get_each_context$j);
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

    const baseClass$b = 'iif-tabs';
    const baseItemClass = 'iif-tab';

    function instance$J($$self, $$props, $$invalidate) {
    	
    	let { tabs } = $$props;
    	let { selected } = $$props;
    	let { onClick } = $$props;

    	// Generate tabs list
    	let list = [];

    	$$self.$$set = $$props => {
    		if ('tabs' in $$props) $$invalidate(1, tabs = $$props.tabs);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('onClick' in $$props) $$invalidate(3, onClick = $$props.onClick);
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
    					const className = baseItemClass + ' ' + baseItemClass + '--' + index + (key === selected
    					? ' ' + baseItemClass + '--selected'
    					: '') + (tab.type ? ' ' + baseItemClass + '--' + tab.type : '');

    					// Generate item
    					const item = {
    						key,
    						className,
    						title: tab.title,
    						index,
    						href: tab.href === void 0 ? '# ' : tab.href,
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
    						side: 'left',
    						items: leftList,
    						empty: !leftList.length
    					},
    					{
    						side: 'right',
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
    		init(this, options, instance$J, create_fragment$J, safe_not_equal, { tabs: 1, selected: 2, onClick: 3 });
    	}
    }

    /* src/icon-finder/components/ui/AddForm.svelte generated by Svelte v3.42.1 */

    function create_if_block_3$8(ctx) {
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
    function create_if_block_2$b(ctx) {
    	let uiicon;
    	let current;
    	uiicon = new UIIcon({ props: { icon: "plus" } });

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
    function create_if_block_1$e(ctx) {
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
    function create_if_block$r(ctx) {
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

    function create_fragment$I(ctx) {
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
    	let if_block0 = /*phrases*/ ctx[1].title && create_if_block_3$8(ctx);

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[10](value);
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
    	binding_callbacks.push(() => bind(input, 'value', input_value_binding));
    	let if_block1 = /*buttonIcon*/ ctx[2] && create_if_block_2$b();
    	let if_block2 = /*status*/ ctx[4] && create_if_block_1$e(ctx);
    	let if_block3 = !/*valid*/ ctx[5] && /*phrases*/ ctx[1].invalid && create_if_block$r(ctx);

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
    					if_block0 = create_if_block_3$8(ctx);
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
    					if_block1 = create_if_block_2$b();
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
    					if_block2 = create_if_block_1$e(ctx);
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
    					if_block3 = create_if_block$r(ctx);
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

    function instance$I($$self, $$props, $$invalidate) {
    	
    	let { phrases } = $$props;
    	let { buttonIcon = false } = $$props;
    	let { inputIcon = '' } = $$props;
    	let { value } = $$props;
    	let { onSubmit } = $$props;
    	let { onValidate = null } = $$props;
    	let { status = '' } = $$props;

    	// Validate value
    	let valid;

    	// Get class for button
    	let buttonClass;

    	/**
     * Validate current value
     */
    	function validateValue(value) {
    		if (typeof onValidate === 'function') {
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
    		if ('phrases' in $$props) $$invalidate(1, phrases = $$props.phrases);
    		if ('buttonIcon' in $$props) $$invalidate(2, buttonIcon = $$props.buttonIcon);
    		if ('inputIcon' in $$props) $$invalidate(3, inputIcon = $$props.inputIcon);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('onSubmit' in $$props) $$invalidate(8, onSubmit = $$props.onSubmit);
    		if ('onValidate' in $$props) $$invalidate(9, onValidate = $$props.onValidate);
    		if ('status' in $$props) $$invalidate(4, status = $$props.status);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 1) {
    			{
    				$$invalidate(5, valid = validateValue(value));
    			}
    		}

    		if ($$self.$$.dirty & /*buttonIcon*/ 4) {
    			{
    				$$invalidate(6, buttonClass = 'iif-form-button iif-form-button--primary' + (buttonIcon ? ' iif-form-button--with-icon' : ''));
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

    		init(this, options, instance$I, create_fragment$I, safe_not_equal, {
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

    /* src/icon-finder/components/content/blocks/Providers.svelte generated by Svelte v3.42.1 */

    function create_if_block$q(ctx) {
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
    				status: /*status*/ ctx[3]
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
    			if (dirty & /*status*/ 8) addform_changes.status = /*status*/ ctx[3];
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
    function create_default_slot$h(ctx) {
    	let tabs;
    	let t;
    	let if_block_anchor;
    	let current;

    	tabs = new Tabs({
    			props: {
    				tabs: /*list*/ ctx[2],
    				selected: /*activeProvider*/ ctx[0],
    				onClick: /*handleClick*/ ctx[5]
    			}
    		});

    	let if_block = /*formVisible*/ ctx[1] && create_if_block$q(ctx);

    	return {
    		c() {
    			create_component(tabs.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
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
    			if (dirty & /*list*/ 4) tabs_changes.tabs = /*list*/ ctx[2];
    			if (dirty & /*activeProvider*/ 1) tabs_changes.selected = /*activeProvider*/ ctx[0];
    			tabs.$set(tabs_changes);

    			if (/*formVisible*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*formVisible*/ 2) {
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

    function create_fragment$H(ctx) {
    	let block;
    	let current;

    	block = new Block({
    			props: {
    				type: "providers",
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

    function instance$H($$self, $$props, $$invalidate) {
    	
    	
    	
    	let { activeProvider } = $$props;
    	let { providers } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	const providersPhrases = phrases$1.providers;
    	let formVisible = false;
    	let status = '';

    	/**
     * Select new provider
     */
    	function handleClick(key) {
    		$$invalidate(1, formVisible = false);
    		registry.router.action('provider', key);
    	}

    	/**
     * Validate possible new provider
     */
    	function validateForm(value) {
    		if (status !== '') {
    			// Reset status on input change
    			$$invalidate(3, status = '');
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

    		$$invalidate(3, status = providersPhrases.status.loading.replace('{host}', host));

    		retrieveProvider(registry, host, (host, success, provider) => {
    			if (!success) {
    				const error = provider;

    				// Use provider as error message
    				$$invalidate(3, status = providersPhrases.status[error].replace('{host}', host));

    				return;
    			}

    			$$invalidate(3, status = '');
    			$$invalidate(1, formVisible = false);
    			registry.router.action('provider', provider);
    		});
    	}

    	// Get items
    	let list;

    	$$self.$$set = $$props => {
    		if ('activeProvider' in $$props) $$invalidate(0, activeProvider = $$props.activeProvider);
    		if ('providers' in $$props) $$invalidate(8, providers = $$props.providers);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*providers, list, formVisible*/ 262) {
    			{
    				$$invalidate(2, list = []);

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
    		list,
    		status,
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
    		init(this, options, instance$H, create_fragment$H, safe_not_equal, { activeProvider: 0, providers: 8 });
    	}
    }

    /* src/icon-finder/components/ui/Filter.svelte generated by Svelte v3.42.1 */

    function create_else_block$8(ctx) {
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
    function create_if_block$p(ctx) {
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

    function create_fragment$G(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*link*/ ctx[3]) return create_if_block$p;
    		return create_else_block$8;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
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

    const baseClass$a = 'iif-filter';

    function instance$G($$self, $$props, $$invalidate) {
    	
    	let { active = false } = $$props;
    	let { hasActive = false } = $$props;
    	let { filter } = $$props;
    	let { title } = $$props;
    	let { onClick } = $$props;
    	let { link = '# ' } = $$props;
    	let className;

    	$$self.$$set = $$props => {
    		if ('active' in $$props) $$invalidate(5, active = $$props.active);
    		if ('hasActive' in $$props) $$invalidate(6, hasActive = $$props.hasActive);
    		if ('filter' in $$props) $$invalidate(0, filter = $$props.filter);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('onClick' in $$props) $$invalidate(2, onClick = $$props.onClick);
    		if ('link' in $$props) $$invalidate(3, link = $$props.link);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*active, hasActive, filter*/ 97) {
    			{
    				$$invalidate(4, className = baseClass$a + (active
    				? ' ' + baseClass$a + '--selected'
    				: hasActive ? ' ' + baseClass$a + '--unselected' : '') + (filter.index
    				? ' ' + baseClass$a + '--' + filter.index % maxIndex
    				: ''));
    			}
    		}
    	};

    	return [filter, title, onClick, link, className, active, hasActive];
    }

    class Filter extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$G, create_fragment$G, safe_not_equal, {
    			active: 5,
    			hasActive: 6,
    			filter: 0,
    			title: 1,
    			onClick: 2,
    			link: 3
    		});
    	}
    }

    /* src/icon-finder/components/content/blocks/Filters.svelte generated by Svelte v3.42.1 */

    function get_each_context$i(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i][0];
    	child_ctx[14] = list[i][1];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (65:0) {#if filters.length > 1}
    function create_if_block$o(ctx) {
    	let block_1;
    	let current;

    	block_1 = new Block({
    			props: {
    				type: "filters",
    				name: /*name*/ ctx[0],
    				extra: /*extra*/ ctx[5],
    				$$slots: { default: [create_default_slot$g] },
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
    function create_if_block_1$d(ctx) {
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
    function create_each_block$i(key_1, ctx) {
    	let first;
    	let filter;
    	let current;

    	function func() {
    		return /*func*/ ctx[11](/*key*/ ctx[13]);
    	}

    	filter = new Filter({
    			props: {
    				active: /*key*/ ctx[13] === /*block*/ ctx[1].active,
    				hasActive: /*block*/ ctx[1].active !== null,
    				filter: /*filter*/ ctx[14],
    				link: /*link*/ ctx[2]
    				? /*link*/ ctx[2].replace('{prefix}', /*key*/ ctx[13])
    				: void 0,
    				title: /*filter*/ ctx[14].title === ''
    				? phrases$1.filters.uncategorised
    				: /*filter*/ ctx[14].title,
    				onClick: func
    			}
    		});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
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
    			? /*link*/ ctx[2].replace('{prefix}', /*key*/ ctx[13])
    			: void 0;

    			if (dirty & /*block*/ 2) filter_changes.title = /*filter*/ ctx[14].title === ''
    			? phrases$1.filters.uncategorised
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
    function create_default_slot$g(ctx) {
    	let t;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let if_block = /*header*/ ctx[3] !== '' && create_if_block_1$d(ctx);
    	let each_value = Object.entries(/*block*/ ctx[1].filters);
    	const get_key = ctx => /*key*/ ctx[13];

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$i(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$i(key, child_ctx));
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
    			if (/*header*/ ctx[3] !== '') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$d(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*Object, block, link, phrases, handleClick*/ 70) {
    				each_value = Object.entries(/*block*/ ctx[1].filters);
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$i, null, get_each_context$i);
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

    function create_fragment$F(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*filters*/ ctx[4].length > 1 && create_if_block$o(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
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
    					if_block = create_if_block$o(ctx);
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

    function instance$F($$self, $$props, $$invalidate) {
    	
    	
    	let { name } = $$props;
    	let { block } = $$props;
    	let { parent = '' } = $$props;
    	let { link = '' } = $$props;
    	let { onClick = null } = $$props;
    	let { showTitle = false } = $$props;
    	let { title = '' } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	// Handle click
    	function handleClick(key) {
    		if (typeof onClick === 'function') {
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
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('block' in $$props) $$invalidate(1, block = $$props.block);
    		if ('parent' in $$props) $$invalidate(7, parent = $$props.parent);
    		if ('link' in $$props) $$invalidate(2, link = $$props.link);
    		if ('onClick' in $$props) $$invalidate(8, onClick = $$props.onClick);
    		if ('showTitle' in $$props) $$invalidate(9, showTitle = $$props.showTitle);
    		if ('title' in $$props) $$invalidate(10, title = $$props.title);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*showTitle, title, name, parent*/ 1665) {
    			{
    				if (showTitle === false) {
    					$$invalidate(3, header = '');
    				} else if (typeof title === 'string') {
    					$$invalidate(3, header = title);
    				} else {
    					let key = name;

    					if (parent !== '') {
    						if (phrases$1.filters[name + '-' + parent] !== void 0) {
    							key = name + '-' + parent;
    						}
    					}

    					$$invalidate(3, header = phrases$1.filters[key] === void 0
    					? ''
    					: phrases$1.filters[key]);
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
    				? ''
    				: 'filters--active');
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

    		init(this, options, instance$F, create_fragment$F, safe_not_equal, {
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

    /* src/icon-finder/components/content/blocks/CollectionsFilter.svelte generated by Svelte v3.42.1 */

    function create_default_slot$f(ctx) {
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[4](value);
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
    	binding_callbacks.push(() => bind(input, 'value', input_value_binding));

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

    function create_fragment$E(ctx) {
    	let block_1;
    	let current;

    	block_1 = new Block({
    			props: {
    				type: "filter",
    				$$slots: { default: [create_default_slot$f] },
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

    function instance$E($$self, $$props, $$invalidate) {
    	
    	
    	let { name } = $$props;
    	let { block } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	// Set initial input value
    	let value = block.keyword;

    	// Get placeholder
    	const text = phrases$1.search;

    	const placeholder = text.placeholder.collections === void 0
    	? text.defaultPlaceholder
    	: text.placeholder.collections;

    	function input_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('block' in $$props) $$invalidate(3, block = $$props.block);
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
    		init(this, options, instance$E, create_fragment$E, safe_not_equal, { name: 2, block: 3 });
    	}
    }

    /* src/icon-finder/components/content/blocks/collections-list/Height.svelte generated by Svelte v3.42.1 */

    function create_if_block$n(ctx) {
    	let html_tag;
    	let html_anchor;

    	return {
    		c() {
    			html_tag = new HtmlTag();
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m(target, anchor) {
    			html_tag.m(/*html*/ ctx[1], target, anchor);
    			insert(target, html_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*html*/ 2) html_tag.p(/*html*/ ctx[1]);
    		},
    		d(detaching) {
    			if (detaching) detach(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};
    }

    function create_fragment$D(ctx) {
    	let if_block_anchor;
    	let if_block = /*mounted*/ ctx[0] && create_if_block$n(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (/*mounted*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$n(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    const unit = 8;

    function instance$D($$self, $$props, $$invalidate) {
    	let { text } = $$props;

    	// Display icon only after mounting component to avoid rendering it on SSR
    	let mounted = false;

    	onMount(() => {
    		$$invalidate(0, mounted = true);
    	});

    	const shapesData = {
    		'0': {
    			paths: [
    				'M24 68h8c6 0 12 6 12 12v32c0 6-6 12-12 12H16c-6 0-12-6-12-12V80c0-6 5-12 12-12h8z'
    			],
    			width: 48
    		},
    		'1': {
    			paths: ['M4 68c6 0 12 6 12 12v44H4h24'],
    			width: 32
    		},
    		'2': {
    			paths: [
    				'M4 80c0-6 6-12 12-12h16c6 0 12 6 12 12v8c0 6-6 12-12 12H16c-6 0-12 6-12 12v12h40'
    			],
    			width: 48
    		},
    		'3': {
    			paths: [
    				'M4 80c0-6 6-12 12-12h16c6 0 12 6 12 12v4c0 6-6 12-12 12h-4 4c6 0 12 6 12 12v4c0 6-6 12-12 12H16c-6 0-12-6-12-12'
    			],
    			width: 48
    		},
    		'4': {
    			paths: ['M4 68v20c0 6 6 12 12 12h16c6 0 12-6 12-12V68v56'],
    			width: 48
    		},
    		'5': {
    			paths: ['M44 68H4v24h28c6 0 12 6 12 12v8c0 6-6 12-12 12H16c-6 0-12-6-12-12'],
    			width: 48
    		},
    		'6': {
    			paths: [
    				'M44 80c0-6-6-12-12-12H16c-6 0-12 6-12 12v32c0 6 6 12 12 12h16c6 0 12-6 12-12v-8c0-6-6-12-12-12H16c-6 0-12 6-12 12'
    			],
    			width: 48
    		},
    		'7': {
    			paths: ['M4 68h28c6 0 12 6 12 12 0 4-6.667 18.667-20 44'],
    			width: 48
    		},
    		'8': {
    			paths: [
    				'M24 68h8c6 0 12 6 12 12v4c0 6-6 12-12 12 6 0 12 6 12 12v4c0 6-6 12-12 12H16c-6 0-12-6-12-12v-4c0-6 6-12 12-12-6 0-12-6-12-12v-4c0-6 6-12 12-12h8z'
    			],
    			width: 48
    		},
    		'9': {
    			paths: [
    				'M44 88c0 6-6 12-12 12H16c-6 0-12-6-12-12v-8c0-6 6-12 12-12h16c6 0 12 6 12 12v32c0 6-6 12-12 12H16c-6 0-12-6-12-12'
    			],
    			width: 48
    		},
    		'|': {
    			paths: [
    				// Top arrow
    				'M4 48l24-24 24 24',
    				// Bottom arrow
    				'M4 144l24 24 24-24',
    				// Middle line
    				'M28 48v96'
    			],
    			width: 56
    		},
    		',': {
    			paths: ['M8 124c-2 0-4-2-4-4s2-4 4-4 4 2 4 4v8c0 2-2 6-4 8'],
    			width: 16
    		},
    		'.': {
    			paths: ['M8 116c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4z'],
    			width: 16
    		}
    	};

    	const defaultOptions = { line: false, animate: false, height: 24 };

    	function iconHeight(text, options) {
    		let width = unit, height = 24 * unit, svg = '', i, char, item, scale;

    		// Convert from number
    		if (typeof text === 'number') {
    			text = '' + text;
    		}

    		// Set options
    		const allOptions = Object.assign({}, defaultOptions, typeof options === 'object' ? options : {});

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
    				if (char === ' ') {
    					width += unit * 2;
    				}

    				continue;
    			}

    			if (char === '|') {
    				// Force line
    				allOptions.line = true;
    			}

    			item = shapesData[char];

    			if (width > unit) {
    				svg += '<g transform="translate(' + width + ')">';
    			}

    			item.paths.forEach(path => {
    				svg += '<path d="' + path + '" />';
    			});

    			if (width > unit) {
    				svg += '</g>';
    			}

    			width += item.width + unit;
    		}

    		// Add line
    		if (allOptions.line) {
    			svg += '<path d="M' + unit / 2 + ' ' + unit / 2 + 'h' + (width - unit) + '" />';
    			svg += '<path d="M' + unit / 2 + ' ' + (height - unit / 2) + 'h' + (width - unit) + '" />';
    		}

    		// Wrap in group
    		svg = '<g stroke-width="' + unit + '" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">' + svg + '</g>';

    		// Wrap in <svg>
    		return '<svg xmlns="http://www.w3.org/2000/svg" focusable="false" width="' + width / scale + '" height="' + height / scale + '" viewBox="0 0 ' + width + ' ' + height + '"> ' + svg + '</svg>';
    	}

    	// Convert to HTML
    	let html;

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(2, text = $$props.text);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*text*/ 4) {
    			{
    				$$invalidate(1, html = iconHeight(text));
    			}
    		}
    	};

    	return [mounted, html, text];
    }

    class Height extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, { text: 2 });
    	}
    }

    /* src/icon-finder/components/content/blocks/collections-list/Item.svelte generated by Svelte v3.42.1 */

    function get_each_context$h(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (90:2) {#if info.author}
    function create_if_block_2$a(ctx) {
    	let small;
    	let t0_value = phrases$1.collection.by + "";
    	let t0;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*info*/ ctx[2].author.url) return create_if_block_3$7;
    		return create_else_block$7;
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

    // (98:4) {:else}
    function create_else_block$7(ctx) {
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

    // (93:4) {#if showCollectionAuthorLink && info.author.url}
    function create_if_block_3$7(ctx) {
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
    				dispose = listen(a, "click", /*onExternalClick*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
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

    // (103:2) {#if samples.length > 0}
    function create_if_block_1$c(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let each_value = /*samples*/ ctx[7];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$h(get_each_context$h(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", div_class_value = "iif-collection-samples" + (/*samplesHeight*/ ctx[8]
    			? ' iif-collection-samples--' + /*samplesHeight*/ ctx[8]
    			: ''));
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*provider, prefix, samples*/ 131) {
    				each_value = /*samples*/ ctx[7];
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
    						each_blocks[i].m(div, null);
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
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (106:4) {#each samples as sample}
    function create_each_block$h(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				class: "iconify",
    				icon: (/*provider*/ ctx[0] === ''
    				? ''
    				: '@' + /*provider*/ ctx[0] + ':') + /*prefix*/ ctx[1] + ':' + /*sample*/ ctx[15]
    			}
    		});

    	return {
    		c() {
    			create_component(icon.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const icon_changes = {};

    			if (dirty & /*provider, prefix*/ 3) icon_changes.icon = (/*provider*/ ctx[0] === ''
    			? ''
    			: '@' + /*provider*/ ctx[0] + ':') + /*prefix*/ ctx[1] + ':' + /*sample*/ ctx[15];

    			icon.$set(icon_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};
    }

    // (113:2) {#if info.height}
    function create_if_block$m(ctx) {
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

    function create_fragment$C(ctx) {
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
    	let if_block0 = /*info*/ ctx[2].author && create_if_block_2$a(ctx);
    	let if_block1 = /*samples*/ ctx[7].length > 0 && create_if_block_1$c(ctx);
    	let if_block2 = /*info*/ ctx[2].height && create_if_block$m(ctx);

    	height_1 = new Height({
    			props: { text: /*info*/ ctx[2].total + '' }
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
    			attr(a, "href", /*link*/ ctx[4]);
    			attr(div0, "class", "iif-collection-text");
    			attr(div1, "class", "iif-collection-total");
    			attr(div2, "class", "iif-collection-data");
    			attr(li, "class", /*className*/ ctx[5]);
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

    			if (!current || dirty & /*link*/ 16) {
    				attr(a, "href", /*link*/ ctx[4]);
    			}

    			if (/*info*/ ctx[2].author) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$a(ctx);
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
    					if_block2 = create_if_block$m(ctx);
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
    			if (dirty & /*info*/ 4) height_1_changes.text = /*info*/ ctx[2].total + '';
    			height_1.$set(height_1_changes);

    			if (!current || dirty & /*className*/ 32) {
    				attr(li, "class", /*className*/ ctx[5]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(height_1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block1);
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

    const baseClass$9 = 'iif-collection';

    function instance$C($$self, $$props, $$invalidate) {
    	
    	
    	let { provider } = $$props;
    	let { prefix } = $$props;
    	let { info } = $$props;
    	let { onClick } = $$props;

    	// Get registry instance
    	const registry = getContext('registry');

    	// on:click event for external links
    	const onExternalClick = registry.link;

    	// Get link
    	let link;

    	// Get container class name
    	let className;

    	// Samples
    	const samples = getSamples();

    	const samplesHeight = getSamplesHeight();

    	// Height
    	const height = '|' + (typeof info.height !== 'object'
    	? info.height
    	: info.height.join(', '));

    	// Block was clicked
    	function handleBlockClick(event) {
    	}

    	function getSamplesHeight() {
    		if (info.displayHeight) {
    			return info.displayHeight;
    		} else if (typeof info.height === 'number') {
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
    		if ('provider' in $$props) $$invalidate(0, provider = $$props.provider);
    		if ('prefix' in $$props) $$invalidate(1, prefix = $$props.prefix);
    		if ('info' in $$props) $$invalidate(2, info = $$props.info);
    		if ('onClick' in $$props) $$invalidate(3, onClick = $$props.onClick);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*provider, prefix, link*/ 19) {
    			{
    				const providerData = lib.getProvider(provider);

    				if (providerData) {
    					$$invalidate(4, link = providerData.links.collection.replace('{prefix}', prefix));

    					if (link === '') {
    						$$invalidate(4, link = '#');
    					}
    				} else {
    					$$invalidate(4, link = '#');
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*prefix, provider, info*/ 7) {
    			{
    				$$invalidate(5, className = baseClass$9 + ' ' + baseClass$9 + '--prefix--' + prefix + (provider === ''
    				? ''
    				: ' ' + baseClass$9 + '--provider--' + provider) + ('') + (info.index
    				? ' ' + baseClass$9 + '--' + info.index % maxIndex
    				: ''));
    			}
    		}
    	};

    	return [
    		provider,
    		prefix,
    		info,
    		onClick,
    		link,
    		className,
    		onExternalClick,
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

    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {
    			provider: 0,
    			prefix: 1,
    			info: 2,
    			onClick: 3
    		});
    	}
    }

    /* src/icon-finder/components/content/blocks/collections-list/Category.svelte generated by Svelte v3.42.1 */

    function get_each_context$g(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i][0];
    	child_ctx[6] = list[i][1];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (16:1) {#if showCategories}
    function create_if_block$l(ctx) {
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

    // (20:2) {#each Object.entries(items) as [prefix, info], i (prefix)}
    function create_each_block$g(key_1, ctx) {
    	let first;
    	let item;
    	let current;

    	item = new Item({
    			props: {
    				provider: /*provider*/ ctx[3],
    				prefix: /*prefix*/ ctx[5],
    				info: /*info*/ ctx[6],
    				onClick: /*onClick*/ ctx[4]
    			}
    		});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(item.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(item, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const item_changes = {};
    			if (dirty & /*provider*/ 8) item_changes.provider = /*provider*/ ctx[3];
    			if (dirty & /*items*/ 4) item_changes.prefix = /*prefix*/ ctx[5];
    			if (dirty & /*items*/ 4) item_changes.info = /*info*/ ctx[6];
    			if (dirty & /*onClick*/ 16) item_changes.onClick = /*onClick*/ ctx[4];
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

    function create_fragment$B(ctx) {
    	let div;
    	let t;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let if_block = /*showCategories*/ ctx[0] && create_if_block$l(ctx);
    	let each_value = Object.entries(/*items*/ ctx[2]);
    	const get_key = ctx => /*prefix*/ ctx[5];

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$g(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$g(key, child_ctx));
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
    					if_block = create_if_block$l(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*provider, Object, items, onClick*/ 28) {
    				each_value = Object.entries(/*items*/ ctx[2]);
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$g, null, get_each_context$g);
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

    function instance$B($$self, $$props, $$invalidate) {
    	
    	let { showCategories } = $$props;
    	let { category = '' } = $$props;
    	let { items } = $$props;
    	let { provider } = $$props;
    	let { onClick } = $$props;

    	$$self.$$set = $$props => {
    		if ('showCategories' in $$props) $$invalidate(0, showCategories = $$props.showCategories);
    		if ('category' in $$props) $$invalidate(1, category = $$props.category);
    		if ('items' in $$props) $$invalidate(2, items = $$props.items);
    		if ('provider' in $$props) $$invalidate(3, provider = $$props.provider);
    		if ('onClick' in $$props) $$invalidate(4, onClick = $$props.onClick);
    	};

    	return [showCategories, category, items, provider, onClick];
    }

    class Category extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {
    			showCategories: 0,
    			category: 1,
    			items: 2,
    			provider: 3,
    			onClick: 4
    		});
    	}
    }

    /* src/icon-finder/components/ui/ContentError.svelte generated by Svelte v3.42.1 */

    function create_fragment$A(ctx) {
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

    function instance$A($$self, $$props, $$invalidate) {
    	let { error } = $$props;

    	$$self.$$set = $$props => {
    		if ('error' in $$props) $$invalidate(0, error = $$props.error);
    	};

    	return [error];
    }

    class ContentError extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, { error: 0 });
    	}
    }

    /* src/icon-finder/components/content/blocks/CollectionsList.svelte generated by Svelte v3.42.1 */

    function get_each_context$f(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i][0];
    	child_ctx[6] = list[i][1];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (30:1) {:else}
    function create_else_block$6(ctx) {
    	let error;
    	let current;

    	error = new ContentError({
    			props: { error: phrases$1.errors.noCollections }
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

    // (23:1) {#each Object.entries(block.collections) as [category, items], i (category)}
    function create_each_block$f(key_1, ctx) {
    	let first;
    	let category;
    	let current;

    	category = new Category({
    			props: {
    				onClick: /*onClick*/ ctx[2],
    				showCategories: /*block*/ ctx[0].showCategories,
    				category: /*category*/ ctx[5],
    				provider: /*provider*/ ctx[1],
    				items: /*items*/ ctx[6]
    			}
    		});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(category.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(category, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const category_changes = {};
    			if (dirty & /*block*/ 1) category_changes.showCategories = /*block*/ ctx[0].showCategories;
    			if (dirty & /*block*/ 1) category_changes.category = /*category*/ ctx[5];
    			if (dirty & /*provider*/ 2) category_changes.provider = /*provider*/ ctx[1];
    			if (dirty & /*block*/ 1) category_changes.items = /*items*/ ctx[6];
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

    // (22:0) <Block type="collections">
    function create_default_slot$e(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = Object.entries(/*block*/ ctx[0].collections);
    	const get_key = ctx => /*category*/ ctx[5];

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$f(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$f(key, child_ctx));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$6();
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();

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
    			if (dirty & /*onClick, block, Object, provider, phrases*/ 7) {
    				each_value = Object.entries(/*block*/ ctx[0].collections);
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$f, each_1_anchor, get_each_context$f);
    				check_outros();

    				if (!each_value.length && each_1_else) {
    					each_1_else.p(ctx, dirty);
    				} else if (!each_value.length) {
    					each_1_else = create_else_block$6();
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

    function create_fragment$z(ctx) {
    	let block_1;
    	let current;

    	block_1 = new Block({
    			props: {
    				type: "collections",
    				$$slots: { default: [create_default_slot$e] },
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

    			if (dirty & /*$$scope, block, provider*/ 515) {
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

    function instance$z($$self, $$props, $$invalidate) {
    	
    	
    	let { name } = $$props;
    	let { block } = $$props;
    	let { provider } = $$props;

    	// Get registry instance
    	const registry = getContext('registry');

    	// Click event
    	function onClick(prefix) {
    		registry.router.action(name, prefix);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('block' in $$props) $$invalidate(0, block = $$props.block);
    		if ('provider' in $$props) $$invalidate(1, provider = $$props.provider);
    	};

    	return [block, provider, onClick, name];
    }

    class CollectionsList extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, { name: 3, block: 0, provider: 1 });
    	}
    }

    /* src/icon-finder/components/content/views/Collections.svelte generated by Svelte v3.42.1 */

    function create_if_block$k(ctx) {
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

    function create_fragment$y(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let collectionsfilterblock;
    	let t1;
    	let collectionslistblock;
    	let current;
    	let if_block = /*blocks*/ ctx[0].categories && create_if_block$k(ctx);

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
    					if_block = create_if_block$k(ctx);
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

    function instance$y($$self, $$props, $$invalidate) {
    	
    	let { blocks } = $$props;
    	let { route } = $$props;

    	$$self.$$set = $$props => {
    		if ('blocks' in $$props) $$invalidate(0, blocks = $$props.blocks);
    		if ('route' in $$props) $$invalidate(1, route = $$props.route);
    	};

    	return [blocks, route];
    }

    class Collections extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, { blocks: 0, route: 1 });
    	}
    }

    /* src/icon-finder/components/content/blocks/CollectionInfo.svelte generated by Svelte v3.42.1 */

    function create_fragment$x(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = false ;

    	return {
    		c() {
    			if_block_anchor = empty();
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

    function instance$x($$self, $$props, $$invalidate) {
    	
    	
    	
    	let { name } = $$props;
    	let { block } = $$props;
    	let { short = false } = $$props;
    	let { showTitle = true } = $$props;
    	const text = phrases$1.collectionInfo;

    	// Registry
    	const registry = getContext('registry');

    	// Callback for external link
    	const onExternalClick = registry.link;

    	// Split info into a separate object
    	let info;

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('block' in $$props) $$invalidate(6, block = $$props.block);
    		if ('short' in $$props) $$invalidate(1, short = $$props.short);
    		if ('showTitle' in $$props) $$invalidate(2, showTitle = $$props.showTitle);
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

    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {
    			name: 0,
    			block: 6,
    			short: 1,
    			showTitle: 2
    		});
    	}
    }

    /* src/icon-finder/components/content/blocks/icons/IconList.svelte generated by Svelte v3.42.1 */

    function get_each_context$e(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (60:3) {#if exists}
    function create_if_block_2$9(ctx) {
    	let iconcomponent;
    	let t;
    	let if_block_anchor;
    	let current;

    	iconcomponent = new Icon({
    			props: {
    				icon: /*name*/ ctx[0],
    				width: "1em",
    				height: "1em"
    			}
    		});

    	let if_block = /*isSelecting*/ ctx[7] && create_if_block_3$6(ctx);

    	return {
    		c() {
    			create_component(iconcomponent.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			mount_component(iconcomponent, target, anchor);
    			insert(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const iconcomponent_changes = {};
    			if (dirty & /*name*/ 1) iconcomponent_changes.icon = /*name*/ ctx[0];
    			iconcomponent.$set(iconcomponent_changes);

    			if (/*isSelecting*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isSelecting*/ 128) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3$6(ctx);
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
    			transition_in(iconcomponent.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(iconcomponent.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(iconcomponent, detaching);
    			if (detaching) detach(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (62:4) {#if isSelecting}
    function create_if_block_3$6(ctx) {
    	let uiicon;
    	let current;

    	uiicon = new UIIcon({
    			props: {
    				icon: /*selected*/ ctx[4]
    				? 'selecting-selected'
    				: 'selecting-unselected'
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

    			if (dirty & /*selected*/ 16) uiicon_changes.icon = /*selected*/ ctx[4]
    			? 'selecting-selected'
    			: 'selecting-unselected';

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

    // (78:2) {#if size}
    function create_if_block_1$b(ctx) {
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

    // (81:2) {#if filters}
    function create_if_block$j(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*filters*/ ctx[8];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$e(get_each_context$e(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*filters, phrases, onClick*/ 320) {
    				each_value = /*filters*/ ctx[8];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$e(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$e(child_ctx);
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

    // (82:3) {#each filters as filter}
    function create_each_block$e(ctx) {
    	let filter;
    	let current;

    	function func() {
    		return /*func*/ ctx[13](/*filter*/ ctx[14]);
    	}

    	filter = new Filter({
    			props: {
    				filter: /*filter*/ ctx[14].item,
    				title: /*filter*/ ctx[14].item.title === ''
    				? phrases$1.filters.uncategorised
    				: /*filter*/ ctx[14].item.title,
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
    			if (dirty & /*filters*/ 256) filter_changes.filter = /*filter*/ ctx[14].item;

    			if (dirty & /*filters*/ 256) filter_changes.title = /*filter*/ ctx[14].item.title === ''
    			? phrases$1.filters.uncategorised
    			: /*filter*/ ctx[14].item.title;

    			if (dirty & /*onClick, filters*/ 320) filter_changes.onClick = func;
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

    function create_fragment$w(ctx) {
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
    	let if_block0 = /*exists*/ ctx[3] && create_if_block_2$9(ctx);
    	let if_block1 = /*size*/ ctx[9] && create_if_block_1$b(ctx);
    	let if_block2 = /*filters*/ ctx[8] && create_if_block$j(ctx);

    	return {
    		c() {
    			li = element("li");
    			div0 = element("div");
    			a0 = element("a");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			a1 = element("a");
    			t1 = text(/*text*/ ctx[2]);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			attr(a0, "href", /*link*/ ctx[5]);
    			attr(a0, "target", "_blank");
    			attr(a0, "title", /*tooltip*/ ctx[1]);
    			attr(div0, "class", "iif-icon-sample");
    			attr(a1, "class", "iif-icon-name");
    			attr(a1, "href", /*link*/ ctx[5]);
    			attr(a1, "title", /*tooltip*/ ctx[1]);
    			attr(div1, "class", div1_class_value = 'iif-icon-data iif-icon-data--filters--' + /*filters*/ ctx[8].length);
    			attr(li, "class", /*className*/ ctx[10]);
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
    					listen(a0, "click", prevent_default(/*handleClick*/ ctx[11])),
    					listen(a1, "click", prevent_default(/*handleClick*/ ctx[11]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*exists*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*exists*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$9(ctx);
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

    			if (!current || dirty & /*link*/ 32) {
    				attr(a0, "href", /*link*/ ctx[5]);
    			}

    			if (!current || dirty & /*tooltip*/ 2) {
    				attr(a0, "title", /*tooltip*/ ctx[1]);
    			}

    			if (!current || dirty & /*text*/ 4) set_data(t1, /*text*/ ctx[2]);

    			if (!current || dirty & /*link*/ 32) {
    				attr(a1, "href", /*link*/ ctx[5]);
    			}

    			if (!current || dirty & /*tooltip*/ 2) {
    				attr(a1, "title", /*tooltip*/ ctx[1]);
    			}

    			if (/*size*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$b(ctx);
    					if_block1.c();
    					if_block1.m(div1, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*filters*/ ctx[8]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*filters*/ 256) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$j(ctx);
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

    			if (!current || dirty & /*filters*/ 256 && div1_class_value !== (div1_class_value = 'iif-icon-data iif-icon-data--filters--' + /*filters*/ ctx[8].length)) {
    				attr(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*className*/ 1024) {
    				attr(li, "class", /*className*/ ctx[10]);
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

    const baseClass$8 = 'iif-icon-list';

    function instance$w($$self, $$props, $$invalidate) {
    	
    	
    	
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
    	let className;

    	// Get size
    	let size = null;

    	// Select icon
    	function handleClick() {
    		onClick(
    			isSelecting
    			? selected ? 'deselect' : 'select'
    			: 'toggle',
    			icon
    		);
    	}

    	const func = filter => onClick(filter.action, filter.value);

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('tooltip' in $$props) $$invalidate(1, tooltip = $$props.tooltip);
    		if ('text' in $$props) $$invalidate(2, text = $$props.text);
    		if ('icon' in $$props) $$invalidate(12, icon = $$props.icon);
    		if ('exists' in $$props) $$invalidate(3, exists = $$props.exists);
    		if ('selected' in $$props) $$invalidate(4, selected = $$props.selected);
    		if ('link' in $$props) $$invalidate(5, link = $$props.link);
    		if ('onClick' in $$props) $$invalidate(6, onClick = $$props.onClick);
    		if ('isSelecting' in $$props) $$invalidate(7, isSelecting = $$props.isSelecting);
    		if ('filters' in $$props) $$invalidate(8, filters = $$props.filters);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*exists, selected*/ 24) {
    			{
    				$$invalidate(10, className = baseClass$8 + ' ' + baseClass$8 + (exists ? '--loaded' : '--loading') + (selected ? ' ' + baseClass$8 + '--selected' : ''));
    			}
    		}

    		if ($$self.$$.dirty & /*exists, name, size*/ 521) {
    			{
    				const newSize = exists ? getIcon(name) : null;

    				if (newSize !== size) {
    					$$invalidate(9, size = newSize);
    				}
    			}
    		}
    	};

    	return [
    		name,
    		tooltip,
    		text,
    		exists,
    		selected,
    		link,
    		onClick,
    		isSelecting,
    		filters,
    		size,
    		className,
    		handleClick,
    		icon,
    		func
    	];
    }

    class IconList extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {
    			name: 0,
    			tooltip: 1,
    			text: 2,
    			icon: 12,
    			exists: 3,
    			selected: 4,
    			link: 5,
    			onClick: 6,
    			isSelecting: 7,
    			filters: 8
    		});
    	}
    }

    /* src/icon-finder/components/content/blocks/icons/IconGrid.svelte generated by Svelte v3.42.1 */

    function create_else_block$5(ctx) {
    	let span;
    	let t_value = /*icon*/ ctx[2].name + "";
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(t_value);
    			attr(span, "class", "iif-icon-loading");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 4 && t_value !== (t_value = /*icon*/ ctx[2].name + "")) set_data(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (45:2) {#if exists}
    function create_if_block$i(ctx) {
    	let iconcomponent;
    	let t;
    	let if_block_anchor;
    	let current;

    	iconcomponent = new Icon({
    			props: {
    				icon: /*name*/ ctx[0],
    				width: "1em",
    				height: "1em"
    			}
    		});

    	let if_block = /*isSelecting*/ ctx[6] && create_if_block_1$a(ctx);

    	return {
    		c() {
    			create_component(iconcomponent.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			mount_component(iconcomponent, target, anchor);
    			insert(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const iconcomponent_changes = {};
    			if (dirty & /*name*/ 1) iconcomponent_changes.icon = /*name*/ ctx[0];
    			iconcomponent.$set(iconcomponent_changes);

    			if (/*isSelecting*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isSelecting*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$a(ctx);
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
    			transition_in(iconcomponent.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(iconcomponent.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(iconcomponent, detaching);
    			if (detaching) detach(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (47:3) {#if isSelecting}
    function create_if_block_1$a(ctx) {
    	let uiicon;
    	let current;

    	uiicon = new UIIcon({
    			props: {
    				icon: /*selected*/ ctx[4]
    				? 'selecting-selected'
    				: 'selecting-unselected'
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

    			if (dirty & /*selected*/ 16) uiicon_changes.icon = /*selected*/ ctx[4]
    			? 'selecting-selected'
    			: 'selecting-unselected';

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

    function create_fragment$v(ctx) {
    	let li;
    	let a;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$i, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*exists*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			li = element("li");
    			a = element("a");
    			if_block.c();
    			attr(a, "href", /*link*/ ctx[5]);
    			attr(a, "target", "_blank");
    			attr(a, "title", /*tooltip*/ ctx[1]);
    			attr(li, "class", /*className*/ ctx[7]);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			if_blocks[current_block_type_index].m(a, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(a, "click", prevent_default(/*handleClick*/ ctx[8]));
    				mounted = true;
    			}
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
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(a, null);
    			}

    			if (!current || dirty & /*link*/ 32) {
    				attr(a, "href", /*link*/ ctx[5]);
    			}

    			if (!current || dirty & /*tooltip*/ 2) {
    				attr(a, "title", /*tooltip*/ ctx[1]);
    			}

    			if (!current || dirty & /*className*/ 128) {
    				attr(li, "class", /*className*/ ctx[7]);
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
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    const baseClass$7 = 'iif-icon-grid';

    function instance$v($$self, $$props, $$invalidate) {
    	
    	let { name } = $$props;
    	let { tooltip } = $$props;
    	let { icon } = $$props;
    	let { exists } = $$props;
    	let { selected } = $$props;
    	let { link } = $$props;
    	let { onClick } = $$props;
    	let { isSelecting } = $$props;
    	let className;

    	// Select icon
    	function handleClick() {
    		onClick(
    			isSelecting
    			? selected ? 'deselect' : 'select'
    			: 'toggle',
    			icon
    		);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('tooltip' in $$props) $$invalidate(1, tooltip = $$props.tooltip);
    		if ('icon' in $$props) $$invalidate(2, icon = $$props.icon);
    		if ('exists' in $$props) $$invalidate(3, exists = $$props.exists);
    		if ('selected' in $$props) $$invalidate(4, selected = $$props.selected);
    		if ('link' in $$props) $$invalidate(5, link = $$props.link);
    		if ('onClick' in $$props) $$invalidate(9, onClick = $$props.onClick);
    		if ('isSelecting' in $$props) $$invalidate(6, isSelecting = $$props.isSelecting);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*exists, selected*/ 24) {
    			{
    				$$invalidate(7, className = baseClass$7 + ' ' + baseClass$7 + (exists ? '--loaded' : '--loading') + (selected ? ' ' + baseClass$7 + '--selected' : ''));
    			}
    		}
    	};

    	return [
    		name,
    		tooltip,
    		icon,
    		exists,
    		selected,
    		link,
    		isSelecting,
    		className,
    		handleClick,
    		onClick
    	];
    }

    class IconGrid extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {
    			name: 0,
    			tooltip: 1,
    			icon: 2,
    			exists: 3,
    			selected: 4,
    			link: 5,
    			onClick: 9,
    			isSelecting: 6
    		});
    	}
    }

    /* src/icon-finder/components/content/blocks/icons/Container.svelte generated by Svelte v3.42.1 */

    function get_each_context$d(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (233:3) {:else}
    function create_else_block$4(ctx) {
    	let icongrid;
    	let current;

    	const icongrid_spread_levels = [
    		/*item*/ ctx[16],
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
    					dirty & /*parsedIcons*/ 4 && get_spread_object(/*item*/ ctx[16]),
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

    // (231:3) {#if isList}
    function create_if_block$h(ctx) {
    	let iconlist;
    	let current;

    	const iconlist_spread_levels = [
    		/*item*/ ctx[16],
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
    					dirty & /*parsedIcons*/ 4 && get_spread_object(/*item*/ ctx[16]),
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

    // (230:2) {#each parsedIcons as item, i (item.name)}
    function create_each_block$d(key_1, ctx) {
    	let first;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$h, create_else_block$4];
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
    			first = empty();
    			if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
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
    				} else {
    					if_block.p(ctx, dirty);
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

    function create_fragment$u(ctx) {
    	let div;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_class_value;
    	let current;
    	let each_value = /*parsedIcons*/ ctx[2];
    	const get_key = ctx => /*item*/ ctx[16].name;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$d(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$d(key, child_ctx));
    	}

    	return {
    		c() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", div_class_value = baseClass$6 + ' ' + baseClass$6 + (/*isList*/ ctx[0] ? '--list' : '--grid') + (/*isSelecting*/ ctx[1]
    			? ' ' + baseClass$6 + '--selecting'
    			: ''));
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
    				each_value = /*parsedIcons*/ ctx[2];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$d, null, get_each_context$d);
    				check_outros();
    			}

    			if (!current || dirty & /*isList, isSelecting*/ 3 && div_class_value !== (div_class_value = baseClass$6 + ' ' + baseClass$6 + (/*isList*/ ctx[0] ? '--list' : '--grid') + (/*isSelecting*/ ctx[1]
    			? ' ' + baseClass$6 + '--selecting'
    			: ''))) {
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

    const baseClass$6 = 'iif-icons';

    function instance$u($$self, $$props, $$invalidate) {
    	
    	
    	
    	let { route } = $$props;
    	let { selection } = $$props;
    	let { blocks } = $$props;
    	let { isList } = $$props;
    	let { isSelecting } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	// List of keys used for filters. Same keys are used in both blocks and icon.
    	const filterKeys = ['tags', 'themePrefixes', 'themeSuffixes'];

    	// Tooltip
    	const tooltipText = phrases$1.icons.tooltip;

    	// Show prefix
    	let showPrefix;

    	// Event listener for loading icons, which should be loaded only when component is mounted
    	// 0 = not mounted, 1 = just mounted, 2 = has been mounted
    	let mounted = 0;

    	let abortLoader = null;
    	let updateCounter = 0;

    	const loadingEvent = () => {
    		$$invalidate(10, updateCounter++, updateCounter);
    	};

    	onMount(() => {
    		$$invalidate(8, mounted = 1);
    	});

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

    			(typeof iconValue === 'string'
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
    		if (route.type === 'search') {
    			const searchBlocks = blocks;

    			if (searchBlocks.collections) {
    				const prefix = item.icon.prefix;

    				if (searchBlocks.collections.filters[prefix]) {
    					filters.push({
    						action: 'collections',
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
    		if (event === 'toggle') {
    			// UISelectionEvent
    			registry.callback({ type: 'selection', icon: value });

    			return;
    		}

    		if (event === 'select' || event === 'deselect') {
    			// UISelectionEvent
    			registry.callback({
    				type: 'selection',
    				icon: value,
    				selected: event === 'select'
    			});

    			return;
    		}

    		registry.router.action(event, value);
    	}

    	// Remove event listener
    	onDestroy(() => {
    		if (abortLoader !== null) {
    			abortLoader();
    			$$invalidate(9, abortLoader = null);
    		}
    	});

    	$$self.$$set = $$props => {
    		if ('route' in $$props) $$invalidate(4, route = $$props.route);
    		if ('selection' in $$props) $$invalidate(5, selection = $$props.selection);
    		if ('blocks' in $$props) $$invalidate(6, blocks = $$props.blocks);
    		if ('isList' in $$props) $$invalidate(0, isList = $$props.isList);
    		if ('isSelecting' in $$props) $$invalidate(1, isSelecting = $$props.isSelecting);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*route*/ 16) {
    			{
    				$$invalidate(7, showPrefix = route.type !== 'collection');
    			}
    		}

    		if ($$self.$$.dirty & /*updateCounter, mounted, parsedIcons, blocks, showPrefix, selection, isList, abortLoader*/ 2021) {
    			{

    				// Reset icons list
    				let newParsedIcons = [];

    				// Parse icons
    				let pending = [];

    				// Map old icons, but only if this code has already been ran
    				const oldKeys = Object.create(null);

    				if (mounted === 2) {
    					parsedIcons.forEach(icon => {
    						oldKeys[icon.name] = icon;
    					});
    				} else if (mounted === 1) {
    					// Mark as mounted + code ran once
    					$$invalidate(8, mounted = 2);
    				}

    				let updated = false;

    				blocks.icons.icons.forEach(icon => {
    					const name = lib.iconToString(icon);
    					const data = getIcon(name);
    					const exists = data !== null;

    					// Icon name, used in list view and tooltip
    					const text = showPrefix ? name : icon.name;

    					// Tooltip
    					let tooltip = text;

    					if (data) {
    						tooltip += tooltipText.size.replace('{size}', data.width + ' x ' + data.height);
    						tooltip += tooltipText.length.replace('{length}', data.body.length + '');

    						if (icon.chars !== void 0) {
    							tooltip += tooltipText.char.replace('{char}', typeof icon.chars === 'string'
    							? icon.chars
    							: icon.chars.join(', '));
    						}

    						tooltip += tooltipText[data.body.indexOf('currentColor') === -1
    						? 'colorful'
    						: 'colorless'];
    					}

    					// Link
    					const providerData = lib.getProvider(icon.provider);

    					let link;

    					if (providerData) {
    						link = providerData.links.icon.replace('{prefix}', icon.prefix).replace('{name}', icon.name);

    						if (link === '') {
    							link = '#';
    						}
    					} else {
    						link = '#';
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

    				// Load pending images, but only after component has been mounted
    				if (mounted > 0 && pending.length) {
    					if (abortLoader !== null) {
    						abortLoader();
    					}

    					$$invalidate(9, abortLoader = loadIcons(pending, loadingEvent));
    				}

    				// Overwrite parseIcons variable only if something was updated, triggering component re-render
    				// Also compare length in case if new set is subset of old set
    				if (updated || parsedIcons.length !== newParsedIcons.length) {
    					$$invalidate(2, parsedIcons = newParsedIcons);
    				}
    			}
    		}
    	};

    	return [
    		isList,
    		isSelecting,
    		parsedIcons,
    		onClick,
    		route,
    		selection,
    		blocks,
    		showPrefix,
    		mounted,
    		abortLoader,
    		updateCounter
    	];
    }

    class Container$2 extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {
    			route: 4,
    			selection: 5,
    			blocks: 6,
    			isList: 0,
    			isSelecting: 1
    		});
    	}
    }

    /* src/icon-finder/components/ui/IconButton.svelte generated by Svelte v3.42.1 */

    function create_fragment$t(ctx) {
    	let button;
    	let uiicon;
    	let current;
    	let mounted;
    	let dispose;
    	uiicon = new UIIcon({ props: { icon: /*icon*/ ctx[0] } });

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

    function instance$t($$self, $$props, $$invalidate) {
    	let { icon } = $$props;
    	let { title } = $$props;
    	let { onClick } = $$props;

    	$$self.$$set = $$props => {
    		if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('onClick' in $$props) $$invalidate(2, onClick = $$props.onClick);
    	};

    	return [icon, title, onClick];
    }

    class IconButton extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, { icon: 0, title: 1, onClick: 2 });
    	}
    }

    /* src/icon-finder/components/content/blocks/icons/Header.svelte generated by Svelte v3.42.1 */

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (40:1) {#if mounted && (canChangeLayout || canSelectMultiple)}
    function create_if_block$g(ctx) {
    	let div;
    	let t;
    	let current;
    	let if_block0 = /*canSelectMultiple*/ ctx[3] && create_if_block_2$8(ctx);
    	let if_block1 = /*canChangeLayout*/ ctx[1] && create_if_block_1$9(ctx);

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
    					if_block0 = create_if_block_2$8(ctx);
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
    					if_block1 = create_if_block_1$9(ctx);
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

    // (42:3) {#if canSelectMultiple}
    function create_if_block_2$8(ctx) {
    	let iconbutton;
    	let current;

    	iconbutton = new IconButton({
    			props: {
    				icon: /*selectionIcon*/ ctx[7],
    				onClick: /*toggleSelection*/ ctx[4],
    				title: /*text*/ ctx[8].select
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
    			if (dirty & /*selectionIcon*/ 128) iconbutton_changes.icon = /*selectionIcon*/ ctx[7];
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

    // (48:3) {#if canChangeLayout}
    function create_if_block_1$9(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = [/*mode*/ ctx[6]];
    	const get_key = ctx => /*icon*/ ctx[11];

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context$c(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$c(key, child_ctx));
    	}

    	return {
    		c() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*mode, changeLayout, text*/ 324) {
    				each_value = [/*mode*/ ctx[6]];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$c, each_1_anchor, get_each_context$c);
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

    // (49:4) {#each [mode] as icon (icon)}
    function create_each_block$c(key_1, ctx) {
    	let first;
    	let iconbutton;
    	let current;

    	iconbutton = new IconButton({
    			props: {
    				icon: /*icon*/ ctx[11],
    				onClick: /*changeLayout*/ ctx[2],
    				title: /*text*/ ctx[8].modes[/*icon*/ ctx[11]]
    			}
    		});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(iconbutton.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(iconbutton, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const iconbutton_changes = {};
    			if (dirty & /*mode*/ 64) iconbutton_changes.icon = /*icon*/ ctx[11];
    			if (dirty & /*changeLayout*/ 4) iconbutton_changes.onClick = /*changeLayout*/ ctx[2];
    			if (dirty & /*mode*/ 64) iconbutton_changes.title = /*text*/ ctx[8].modes[/*icon*/ ctx[11]];
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

    function create_fragment$s(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let current;
    	let if_block = /*mounted*/ ctx[5] && (/*canChangeLayout*/ ctx[1] || /*canSelectMultiple*/ ctx[3]) && create_if_block$g(ctx);

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

    			if (/*mounted*/ ctx[5] && (/*canChangeLayout*/ ctx[1] || /*canSelectMultiple*/ ctx[3])) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*mounted, canChangeLayout, canSelectMultiple*/ 42) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$g(ctx);
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

    function instance$s($$self, $$props, $$invalidate) {
    	
    	let { headerText } = $$props;
    	let { isList } = $$props;
    	let { canChangeLayout } = $$props;
    	let { changeLayout } = $$props;
    	let { canSelectMultiple } = $$props;
    	let { isSelecting } = $$props;
    	let { toggleSelection } = $$props;

    	// Show buttons only when mounted to avoid rendering buttons for SSR
    	let mounted = false;

    	onMount(() => {
    		$$invalidate(5, mounted = true);
    	});

    	// Text
    	const text = phrases$1.icons.header;

    	// Modes
    	let mode;

    	// Selection icon
    	let selectionIcon;

    	$$self.$$set = $$props => {
    		if ('headerText' in $$props) $$invalidate(0, headerText = $$props.headerText);
    		if ('isList' in $$props) $$invalidate(9, isList = $$props.isList);
    		if ('canChangeLayout' in $$props) $$invalidate(1, canChangeLayout = $$props.canChangeLayout);
    		if ('changeLayout' in $$props) $$invalidate(2, changeLayout = $$props.changeLayout);
    		if ('canSelectMultiple' in $$props) $$invalidate(3, canSelectMultiple = $$props.canSelectMultiple);
    		if ('isSelecting' in $$props) $$invalidate(10, isSelecting = $$props.isSelecting);
    		if ('toggleSelection' in $$props) $$invalidate(4, toggleSelection = $$props.toggleSelection);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isList*/ 512) {
    			{
    				$$invalidate(6, mode = isList ? 'grid' : 'list');
    			}
    		}

    		if ($$self.$$.dirty & /*isSelecting*/ 1024) {
    			{
    				$$invalidate(7, selectionIcon = 'check-list' + (isSelecting ? '-checked' : ''));
    			}
    		}
    	};

    	return [
    		headerText,
    		canChangeLayout,
    		changeLayout,
    		canSelectMultiple,
    		toggleSelection,
    		mounted,
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

    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {
    			headerText: 0,
    			isList: 9,
    			canChangeLayout: 1,
    			changeLayout: 2,
    			canSelectMultiple: 3,
    			isSelecting: 10,
    			toggleSelection: 4
    		});
    	}
    }

    /* src/icon-finder/components/content/blocks/Pagination.svelte generated by Svelte v3.42.1 */

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (59:0) {#if pages.length > 0}
    function create_if_block$f(ctx) {
    	let div;
    	let t0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t1;
    	let t2;
    	let current;
    	let if_block0 = /*prevPage*/ ctx[2] !== -1 && create_if_block_4$4(ctx);
    	let each_value = /*pages*/ ctx[1];
    	const get_key = ctx => /*page*/ ctx[13].page;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$b(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$b(key, child_ctx));
    	}

    	let if_block1 = /*block*/ ctx[0].more && create_if_block_2$7(ctx);
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
    					if_block0 = create_if_block_4$4(ctx);
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
    				each_value = /*pages*/ ctx[1];
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$b, t1, get_each_context$b);
    			}

    			if (/*block*/ ctx[0].more) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$7(ctx);
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
    function create_if_block_4$4(ctx) {
    	let a;
    	let uiicon;
    	let current;
    	let mounted;
    	let dispose;

    	uiicon = new UIIcon({
    			props: {
    				icon: "left",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			a = element("a");
    			create_component(uiicon.$$.fragment);
    			attr(a, "href", "# ");
    			attr(a, "class", /*arrowClass*/ ctx[4] + 'prev');
    			attr(a, "title", phrases$1.pagination.prev);
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
    		p(ctx, dirty) {
    			const uiicon_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				uiicon_changes.$$scope = { dirty, ctx };
    			}

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
    			if (detaching) detach(a);
    			destroy_component(uiicon);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (67:4) <UIIcon icon="left">
    function create_default_slot_1$1(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("<");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (71:3) {#if page.dot}
    function create_if_block_3$5(ctx) {
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

    // (70:2) {#each pages as page, i (page.page)}
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
    	let if_block = /*page*/ ctx[13].dot && create_if_block_3$5();

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			if (if_block) if_block.c();
    			t0 = space();
    			a = element("a");
    			t1 = text(t1_value);
    			attr(a, "href", a_href_value = /*page*/ ctx[13].selected ? void 0 : '# ');
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
    					if_block = create_if_block_3$5();
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*pages*/ 2 && t1_value !== (t1_value = /*page*/ ctx[13].text + "")) set_data(t1, t1_value);

    			if (dirty & /*pages*/ 2 && a_href_value !== (a_href_value = /*page*/ ctx[13].selected ? void 0 : '# ')) {
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

    // (79:2) {#if block.more}
    function create_if_block_2$7(ctx) {
    	let a;
    	let t_value = phrases$1.icons.more + "";
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

    // (87:2) {#if nextPage !== -1}
    function create_if_block_1$8(ctx) {
    	let a;
    	let uiicon;
    	let current;
    	let mounted;
    	let dispose;

    	uiicon = new UIIcon({
    			props: {
    				icon: "right",
    				$$slots: { default: [create_default_slot$d] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			a = element("a");
    			create_component(uiicon.$$.fragment);
    			attr(a, "href", "# ");
    			attr(a, "class", /*arrowClass*/ ctx[4] + 'next');
    			attr(a, "title", phrases$1.pagination.next);
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
    		p(ctx, dirty) {
    			const uiicon_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				uiicon_changes.$$scope = { dirty, ctx };
    			}

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
    			if (detaching) detach(a);
    			destroy_component(uiicon);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (93:4) <UIIcon icon="right">
    function create_default_slot$d(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(">");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$r(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*pages*/ ctx[1].length > 0 && create_if_block$f(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
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
    					if_block = create_if_block$f(ctx);
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

    const baseClass$5 = 'iif-page';

    function instance$r($$self, $$props, $$invalidate) {
    	
    	
    	let { name } = $$props;
    	let { block } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	const selectedClass = baseClass$5 + ' ' + baseClass$5 + '--selected';
    	const arrowClass = baseClass$5 + ' ' + baseClass$5 + '--arrow ' + baseClass$5 + '--';
    	const moreClass = baseClass$5 + ' ' + baseClass$5 + '--more';
    	let pages = [];
    	let prevPage;
    	let nextPage;

    	// Change page
    	function setPage(page) {
    		registry.router.action(name, page);
    	}

    	const click_handler = () => setPage(prevPage);
    	const click_handler_1 = () => setPage('more');
    	const click_handler_2 = () => setPage(nextPage);

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(7, name = $$props.name);
    		if ('block' in $$props) $$invalidate(0, block = $$props.block);
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
    							text: page + 1 + '',
    							className: selected ? selectedClass : baseClass$5,
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
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, { name: 7, block: 0 });
    	}
    }

    /* src/icon-finder/components/content/blocks/IconsWithPages.svelte generated by Svelte v3.42.1 */

    function create_else_block$3(ctx) {
    	let block;
    	let current;

    	block = new Block({
    			props: {
    				type: "icons",
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
    function create_if_block$e(ctx) {
    	let contenterror;
    	let current;

    	contenterror = new ContentError({
    			props: { error: phrases$1.errors.noIconsFound }
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
    function create_default_slot$c(ctx) {
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

    	iconscontainer = new Container$2({
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

    function create_fragment$q(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$e, create_else_block$3];
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
    			if_block_anchor = empty();
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
    				} else {
    					if_block.p(ctx, dirty);
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

    function instance$q($$self, $$props, $$invalidate) {
    	
    	
    	
    	let { route } = $$props;
    	let { selection } = $$props;
    	let { blocks } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	// Get config
    	const componentsConfig = registry.config.components;

    	// Get pagination
    	let pagination;

    	// Generate header text
    	function generateHeaderText() {
    		// const pagination = blocks.pagination as ;
    		const total = pagination.length, text = phrases$1.icons;

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
    			registry.callback({ type: 'config' });
    		}
    	}

    	// Select multiple icons
    	const canSelectMultiple = componentsConfig.multiSelect;

    	let isSelecting = false;

    	function toggleSelection() {
    		$$invalidate(7, isSelecting = !isSelecting);
    	}

    	$$self.$$set = $$props => {
    		if ('route' in $$props) $$invalidate(0, route = $$props.route);
    		if ('selection' in $$props) $$invalidate(1, selection = $$props.selection);
    		if ('blocks' in $$props) $$invalidate(2, blocks = $$props.blocks);
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
    					$$invalidate(5, headerText = generateHeaderText().replace('{count}', pagination.length + ''));
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
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, { route: 0, selection: 1, blocks: 2 });
    	}
    }

    /* src/icon-finder/components/content/blocks/Search.svelte generated by Svelte v3.42.1 */

    function create_default_slot$b(ctx) {
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

    function create_fragment$p(ctx) {
    	let block_1;
    	let current;

    	block_1 = new Block({
    			props: {
    				type: "search",
    				name: /*name*/ ctx[0],
    				extra: "search-form",
    				$$slots: { default: [create_default_slot$b] },
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

    function instance$p($$self, $$props, $$invalidate) {
    	
    	
    	let { name } = $$props;
    	let { block } = $$props;
    	let { info = null } = $$props;
    	let { customType = '' } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	// Phrases
    	const searchPhrases = phrases$1.search;

    	// Get placeholder
    	let placeholder;

    	// Submit form
    	function changeValue(value) {
    		registry.router.action(name, value.trim().toLowerCase());
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('block' in $$props) $$invalidate(1, block = $$props.block);
    		if ('info' in $$props) $$invalidate(4, info = $$props.info);
    		if ('customType' in $$props) $$invalidate(5, customType = $$props.customType);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*customType, info*/ 48) {
    			{
    				if (customType !== '' && searchPhrases.placeholder[customType] !== void 0) {
    					$$invalidate(2, placeholder = searchPhrases.placeholder[customType]);
    				} else if (info && info.name && searchPhrases.placeholder.collection !== void 0) {
    					$$invalidate(2, placeholder = searchPhrases.placeholder.collection.replace('{name}', info.name));
    				} else {
    					$$invalidate(2, placeholder = searchPhrases.defaultPlaceholder);
    				}
    			}
    		}
    	};

    	return [name, block, placeholder, changeValue, info, customType];
    }

    class Search$1 extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {
    			name: 0,
    			block: 1,
    			info: 4,
    			customType: 5
    		});
    	}
    }

    /* src/icon-finder/components/content/views/Collection.svelte generated by Svelte v3.42.1 */

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (61:1) {#if blocks.collections}
    function create_if_block_2$6(ctx) {
    	let div;
    	let filters;
    	let current;

    	filters = new Filters({
    			props: {
    				name: "collections",
    				parent: /*route*/ ctx[2].parent
    				? /*route*/ ctx[2].parent.type
    				: 'collections',
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
    			: 'collections';

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
    function create_if_block_1$7(ctx) {
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
    function create_if_block$d(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*filterBlocks*/ ctx[7];
    	const get_key = ctx => /*item*/ ctx[9].key;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$a(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$a(key, child_ctx));
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
    				each_value = /*filterBlocks*/ ctx[7];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$a, null, get_each_context$a);
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
    function create_each_block$a(key_1, ctx) {
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
    			first = empty();
    			create_component(filters.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(filters, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
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

    function create_fragment$o(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let searchblock;
    	let t2;
    	let t3;
    	let iconswithpages;
    	let div_class_value;
    	let current;
    	let if_block0 = /*blocks*/ ctx[1].collections && create_if_block_2$6(ctx);
    	let if_block1 = /*info*/ ctx[5] !== null && create_if_block_1$7(ctx);

    	searchblock = new Search$1({
    			props: {
    				name: "filter",
    				block: /*blocks*/ ctx[1].filter,
    				info: /*info*/ ctx[5]
    			}
    		});

    	let if_block2 = /*filterBlocks*/ ctx[7].length > 0 && create_if_block$d(ctx);

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

    			attr(div, "class", div_class_value = "iif-view " + baseClass$4 + "\n\t\t" + baseClass$4 + "--prefix--" + (/*prefix*/ ctx[4] + (/*provider*/ ctx[3] === ''
    			? ''
    			: ' ' + baseClass$4 + '--provider--' + /*provider*/ ctx[3])));
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
    					if_block0 = create_if_block_2$6(ctx);
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

    			if (/*info*/ ctx[5] !== null) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*info*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$7(ctx);
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
    					if_block2 = create_if_block$d(ctx);
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

    			if (!current || dirty & /*prefix, provider*/ 24 && div_class_value !== (div_class_value = "iif-view " + baseClass$4 + "\n\t\t" + baseClass$4 + "--prefix--" + (/*prefix*/ ctx[4] + (/*provider*/ ctx[3] === ''
    			? ''
    			: ' ' + baseClass$4 + '--provider--' + /*provider*/ ctx[3])))) {
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

    const baseClass$4 = 'iif-view--collection';

    function instance$o($$self, $$props, $$invalidate) {
    	
    	
    	let { selection } = $$props;
    	let { blocks } = $$props;
    	let { route } = $$props;

    	// Filter blocks
    	const filterBlockKeys = ['tags', 'themePrefixes', 'themeSuffixes'];

    	// Provider and prefix from route
    	let provider;

    	let prefix;

    	// Collection info
    	let info;

    	// Collection link
    	let collectionsLink;

    	let filterBlocks;

    	$$self.$$set = $$props => {
    		if ('selection' in $$props) $$invalidate(0, selection = $$props.selection);
    		if ('blocks' in $$props) $$invalidate(1, blocks = $$props.blocks);
    		if ('route' in $$props) $$invalidate(2, route = $$props.route);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*route, provider, blocks*/ 14) {
    			{
    				$$invalidate(3, provider = route.params.provider);

    				if (typeof provider !== 'string') {
    					$$invalidate(3, provider = '');
    				}

    				$$invalidate(4, prefix = route.params.prefix);
    				$$invalidate(5, info = blocks.info === null ? null : blocks.info.info);

    				// Get collection link
    				const providerData = lib.getProvider(provider);

    				if (providerData) {
    					$$invalidate(6, collectionsLink = providerData.links.collection);
    				} else {
    					$$invalidate(6, collectionsLink = '');
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
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { selection: 0, blocks: 1, route: 2 });
    	}
    }

    /* src/icon-finder/components/content/views/Search.svelte generated by Svelte v3.42.1 */

    function create_if_block$c(ctx) {
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

    function create_fragment$n(ctx) {
    	let div;
    	let t;
    	let iconswithpages;
    	let current;
    	let if_block = /*blocks*/ ctx[2].collections && create_if_block$c(ctx);

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
    					if_block = create_if_block$c(ctx);
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

    function instance$n($$self, $$props, $$invalidate) {
    	
    	
    	let { route } = $$props;
    	let { selection } = $$props;
    	let { blocks } = $$props;

    	// Get collection link
    	let collectionsLink;

    	$$self.$$set = $$props => {
    		if ('route' in $$props) $$invalidate(0, route = $$props.route);
    		if ('selection' in $$props) $$invalidate(1, selection = $$props.selection);
    		if ('blocks' in $$props) $$invalidate(2, blocks = $$props.blocks);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*route*/ 1) {
    			{
    				let provider = route.params.provider;

    				if (typeof provider !== 'string') {
    					provider = '';
    				}

    				// Get collection link
    				const providerData = lib.getProvider(provider);

    				if (providerData) {
    					$$invalidate(3, collectionsLink = providerData.links.collection);
    				} else {
    					$$invalidate(3, collectionsLink = '');
    				}
    			}
    		}
    	};

    	return [route, selection, blocks, collectionsLink];
    }

    class Search extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { route: 0, selection: 1, blocks: 2 });
    	}
    }

    /* src/icon-finder/components/content/views/Custom.svelte generated by Svelte v3.42.1 */

    function create_fragment$m(ctx) {
    	let div;
    	let searchblock;
    	let t;
    	let iconswithpages;
    	let div_class_value;
    	let current;

    	searchblock = new Search$1({
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

    function instance$m($$self, $$props, $$invalidate) {
    	
    	
    	let { route } = $$props;
    	let { selection } = $$props;
    	let { blocks } = $$props;

    	$$self.$$set = $$props => {
    		if ('route' in $$props) $$invalidate(0, route = $$props.route);
    		if ('selection' in $$props) $$invalidate(1, selection = $$props.selection);
    		if ('blocks' in $$props) $$invalidate(2, blocks = $$props.blocks);
    	};

    	return [route, selection, blocks];
    }

    class Custom extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { route: 0, selection: 1, blocks: 2 });
    	}
    }

    /* src/icon-finder/components/content/views/Error.svelte generated by Svelte v3.42.1 */

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (55:3) {#if canReturn}
    function create_if_block$b(ctx) {
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
    function create_default_slot$a(ctx) {
    	let uiicon;
    	let t0;
    	let p;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	uiicon = new UIIcon({
    			props: { icon: 'error-' + /*type*/ ctx[7] }
    		});

    	let if_block = /*canReturn*/ ctx[2] && create_if_block$b(ctx);

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
    			if (dirty & /*error*/ 1) uiicon_changes.icon = 'error-' + /*type*/ ctx[7];
    			uiicon.$set(uiicon_changes);
    			if (!current || dirty & /*text*/ 2) set_data(t1, /*text*/ ctx[1]);

    			if (/*canReturn*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$b(ctx);
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
    function create_each_block$9(key_1, ctx) {
    	let first;
    	let block;
    	let current;

    	block = new Block({
    			props: {
    				type: "error",
    				extra: 'error--' + /*type*/ ctx[7],
    				$$slots: { default: [create_default_slot$a] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(block.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(block, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const block_changes = {};
    			if (dirty & /*error*/ 1) block_changes.extra = 'error--' + /*type*/ ctx[7];

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

    function create_fragment$l(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = [/*error*/ ctx[0]];
    	const get_key = ctx => /*type*/ ctx[7];

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context$9(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$9(key, child_ctx));
    	}

    	return {
    		c() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
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
    				each_value = [/*error*/ ctx[0]];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$9, each_1_anchor, get_each_context$9);
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

    function instance$l($$self, $$props, $$invalidate) {
    	
    	
    	let { error } = $$props;
    	let { route } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	// Get text and check if can return
    	const errorPhrases = phrases$1.errors;

    	let text;
    	let canReturn;

    	function handleReturn() {
    		const router = registry.router;

    		if (route && route.type === 'collections') {
    			// Return to default provider
    			router.home('');
    		} else {
    			router.home();
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('error' in $$props) $$invalidate(0, error = $$props.error);
    		if ('route' in $$props) $$invalidate(5, route = $$props.route);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*route, error, text*/ 35) {
    			{
    				$$invalidate(2, canReturn = !!(route && (route.type !== 'collections' || route.parent || route.params && route.params.provider) && errorPhrases.custom.home !== void 0));

    				$$invalidate(1, text = errorPhrases.custom[error] === void 0
    				? errorPhrases.defaultError
    				: errorPhrases.custom[error]);

    				switch (error) {
    					case 'not_found':
    						$$invalidate(1, text = text.replace('{prefix}', route && route.type === 'collection'
    						? '"' + route.params.prefix + '"'
    						: ''));
    						break;
    					case 'bad_route':
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
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { error: 0, route: 5 });
    	}
    }

    /* src/icon-finder/components/content/Content.svelte generated by Svelte v3.42.1 */

    function create_if_block_8$2(ctx) {
    	let providersblock;
    	let current;

    	providersblock = new Providers({
    			props: {
    				providers: /*providers*/ ctx[6],
    				activeProvider: /*activeProvider*/ ctx[9]
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
    			if (dirty & /*providers*/ 64) providersblock_changes.providers = /*providers*/ ctx[6];
    			if (dirty & /*activeProvider*/ 512) providersblock_changes.activeProvider = /*activeProvider*/ ctx[9];
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
    function create_if_block_7$2(ctx) {
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
    function create_if_block_6$2(ctx) {
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
    function create_if_block$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block_1$6,
    		create_if_block_2$5,
    		create_if_block_3$4,
    		create_if_block_4$3,
    		create_if_block_5$2,
    		create_else_block$2
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*error*/ ctx[2] !== '' || !/*route*/ ctx[3]) return 0;
    		if (/*route*/ ctx[3].type === 'collections') return 1;
    		if (/*route*/ ctx[3].type === 'collection') return 2;
    		if (/*route*/ ctx[3].type === 'search') return 3;
    		if (/*route*/ ctx[3].type === 'custom') return 4;
    		return 5;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
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
    				} else {
    					if_block.p(ctx, dirty);
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
    function create_else_block$2(ctx) {
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
    function create_if_block_5$2(ctx) {
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
    function create_if_block_4$3(ctx) {
    	let searchview;
    	let current;

    	searchview = new Search({
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
    function create_if_block_2$5(ctx) {
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
    function create_if_block_1$6(ctx) {
    	let viewerror;
    	let current;

    	viewerror = new Error$1({
    			props: {
    				error: /*error*/ ctx[2] !== '' ? /*error*/ ctx[2] : 'bad_route',
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
    			if (dirty & /*error*/ 4) viewerror_changes.error = /*error*/ ctx[2] !== '' ? /*error*/ ctx[2] : 'bad_route';
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

    function create_fragment$k(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	let if_block0 = /*providersVisible*/ ctx[8] && create_if_block_8$2(ctx);
    	let if_block1 = /*showGlobalSearch*/ ctx[5] && create_if_block_7$2(ctx);
    	let if_block2 = /*route*/ ctx[3]?.parent && create_if_block_6$2(ctx);
    	let if_block3 = (!/*route*/ ctx[3] || /*route*/ ctx[3].type !== 'empty') && create_if_block$a(ctx);

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
    			attr(div, "class", /*className*/ ctx[7]);
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
    			if (/*providersVisible*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*providersVisible*/ 256) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_8$2(ctx);
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

    			if (/*showGlobalSearch*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showGlobalSearch*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_7$2(ctx);
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
    					if_block2 = create_if_block_6$2(ctx);
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

    			if (!/*route*/ ctx[3] || /*route*/ ctx[3].type !== 'empty') {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*route*/ 8) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block$a(ctx);
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

    			if (!current || dirty & /*className*/ 128) {
    				attr(div, "class", /*className*/ ctx[7]);
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

    const baseClass$3 = 'iif-content';

    function instance$k($$self, $$props, $$invalidate) {
    	
    	
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

    	let activeProvider = '';
    	let providers = [''];

    	$$self.$$set = $$props => {
    		if ('selection' in $$props) $$invalidate(0, selection = $$props.selection);
    		if ('viewChanged' in $$props) $$invalidate(1, viewChanged = $$props.viewChanged);
    		if ('error' in $$props) $$invalidate(2, error = $$props.error);
    		if ('route' in $$props) $$invalidate(3, route = $$props.route);
    		if ('blocks' in $$props) $$invalidate(4, blocks = $$props.blocks);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*error, className, route*/ 140) {
    			{
    				// Check class name and search form value
    				$$invalidate(7, className = baseClass$3);

    				if (error !== '') {
    					// View shows error
    					$$invalidate(7, className += ' ' + baseClass$3 + '--error ' + baseClass$3 + '--error--' + error);
    				} else {
    					// View shows something
    					$$invalidate(7, className += ' ' + baseClass$3 + '--view ' + baseClass$3 + '--view--' + route.type);

    					if (route.params && (route.type === 'search' || route.type === 'collections' || route.type === 'collection') && route.params.provider) {
    						// Add provider: '{base}--view--{type}--provider--{provider}'
    						$$invalidate(7, className += ' ' + baseClass$3 + '--view--' + route.type + '--provider--' + route.params.provider);
    					}

    					if (route.type === 'collection') {
    						// Add prefix: '{base}--view--collection--prefix--{prefix}'
    						$$invalidate(7, className += ' ' + baseClass$3 + '--view--collection--prefix--' + route.params.prefix);
    					} else if (route.type === 'custom') {
    						// Add custom type: '{base} {base}--view {base}--view--custom {base}--view--custom--{customType}'
    						$$invalidate(7, className += ' ' + baseClass$3 + '--view--custom--' + route.params.customType);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*route, showGlobalSearch*/ 40) {
    			{
    				$$invalidate(5, showGlobalSearch = false);
    				let item = route;

    				while (!showGlobalSearch && item) {
    					if (item.type === 'collections') {
    						$$invalidate(5, showGlobalSearch = true);
    					} else {
    						item = item.parent;
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*route, providers*/ 72) {
    			{
    				{
    					$$invalidate(8, providersVisible = false);
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
    		showGlobalSearch,
    		providers,
    		className,
    		providersVisible,
    		activeProvider
    	];
    }

    class Content extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			selection: 0,
    			viewChanged: 1,
    			error: 2,
    			route: 3,
    			blocks: 4
    		});
    	}
    }

    /* src/icon-finder/components/content/footers/parts/FooterBlock.svelte generated by Svelte v3.42.1 */

    function create_if_block_1$5(ctx) {
    	let p;
    	let t;
    	let current;
    	let if_block0 = !/*expanded*/ ctx[2] && create_if_block_3$3();

    	function select_block_type(ctx, dirty) {
    		if (/*canExpand*/ ctx[4]) return create_if_block_2$4;
    		return create_else_block$1;
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
    			if (!/*expanded*/ ctx[2]) {
    				if (if_block0) {
    					if (dirty & /*expanded*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$3();
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

    // (49:3) {#if !expanded}
    function create_if_block_3$3(ctx) {
    	let uiicon;
    	let current;
    	uiicon = new UIIcon({ props: { icon: "expand" } });

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

    // (56:3) {:else}
    function create_else_block$1(ctx) {
    	let t_value = /*title*/ ctx[0] + ':' + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*title*/ 1 && t_value !== (t_value = /*title*/ ctx[0] + ':' + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (52:3) {#if canExpand}
    function create_if_block_2$4(ctx) {
    	let a;

    	let t_value = (!/*expanded*/ ctx[2] && /*titleHidden*/ ctx[1] !== ''
    	? /*titleHidden*/ ctx[1]
    	: /*title*/ ctx[0]) + (/*expanded*/ ctx[2] ? ':' : '') + "";

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
    				dispose = listen(a, "click", prevent_default(/*toggle*/ ctx[5]));
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*expanded, titleHidden, title*/ 7 && t_value !== (t_value = (!/*expanded*/ ctx[2] && /*titleHidden*/ ctx[1] !== ''
    			? /*titleHidden*/ ctx[1]
    			: /*title*/ ctx[0]) + (/*expanded*/ ctx[2] ? ':' : '') + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (59:1) {#if expanded}
    function create_if_block$9(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

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
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
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

    function create_fragment$j(ctx) {
    	let div;
    	let t;
    	let current;
    	let if_block0 = /*title*/ ctx[0] !== '' && create_if_block_1$5(ctx);
    	let if_block1 = /*expanded*/ ctx[2] && create_if_block$9(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr(div, "class", /*className*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*title*/ ctx[0] !== '') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*title*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$5(ctx);
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

    			if (/*expanded*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*expanded*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$9(ctx);
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

    			if (!current || dirty & /*className*/ 8) {
    				attr(div, "class", /*className*/ ctx[3]);
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

    const baseClass$2 = 'iif-footer-block';

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	
    	let { name } = $$props;
    	let { title } = $$props;
    	let { titleHidden = '' } = $$props;

    	// Config key
    	let key = name + 'Visible';

    	// Registry
    	const registry = getContext('registry');

    	// Get config
    	const config = registry.config.components;

    	// Check if block can expand
    	const canExpand = canToggleFooterBlocks ;

    	// Check if info block is visible
    	let expanded = canExpand && title !== '' ? config[key] : true;

    	let className;

    	/**
     * Toggle block
     */
    	function toggle() {
    		$$invalidate(2, expanded = config[key] = !expanded);
    		registry.callback({ type: 'config' });
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(6, name = $$props.name);
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('titleHidden' in $$props) $$invalidate(1, titleHidden = $$props.titleHidden);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*name, expanded*/ 68) {
    			{
    				$$invalidate(3, className = baseClass$2 + ' ' + baseClass$2 + '--' + name + ' ' + baseClass$2 + '--' + (expanded ? 'expanded' : 'collapsed'));
    			}
    		}
    	};

    	return [
    		title,
    		titleHidden,
    		expanded,
    		className,
    		canExpand,
    		toggle,
    		name,
    		$$scope,
    		slots
    	];
    }

    class FooterBlock extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { name: 6, title: 0, titleHidden: 1 });
    	}
    }

    var colorKeywords = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendedColorKeywords = exports.baseColorKeywords = void 0;
    /**
     * List of base colors. From https://www.w3.org/TR/css3-color/
     */
    exports.baseColorKeywords = {
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
    exports.extendedColorKeywords = {
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

    });

    var colors = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.colorToString = exports.stringToColor = void 0;

    /**
     * Attempt to convert color to keyword.
     *
     * Assumes that check for alpha === 1 has been completed
     */
    function colorToKeyword(color) {
        // Test all keyword lists
        const lists = [colorKeywords.baseColorKeywords, colorKeywords.extendedColorKeywords];
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
                alphaStr = value.slice(-1);
                alphaStr += alphaStr;
            // eslint-disable-next-line no-fallthrough
            case 3:
                redStr = value.slice(start, ++start);
                redStr += redStr;
                greenStr = value.slice(start, ++start);
                greenStr += greenStr;
                blueStr = value.slice(start, ++start);
                blueStr += blueStr;
                break;
            case 8:
                alphaStr = value.slice(-2);
            // eslint-disable-next-line no-fallthrough
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
        if (colorKeywords.baseColorKeywords[value] !== void 0) {
            return valueToKeyword(colorKeywords.baseColorKeywords[value]);
        }
        if (colorKeywords.extendedColorKeywords[value] !== void 0) {
            return valueToKeyword(colorKeywords.extendedColorKeywords[value]);
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
        if (colors.length !== 3 && colors.length !== 4) {
            return null;
        }
        let alpha = 1;
        // Get alpha
        if (colors.length === 4) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const lastItem = colors.pop();
            alpha = parseFloat(lastItem) * (lastItem.slice(-1) === '%' ? 0.01 : 1);
            if (isNaN(alpha)) {
                return null;
            }
            alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
        }
        // Parse
        let color1; // red or hue
        let color2; // green or saturation
        let color3; // blue or lightness
        let isPercentages;
        let multiplier;
        switch (keyword) {
            case 'rgb':
            case 'rgba':
                // Either all or no components can be percentages
                isPercentages = colors[0].slice(-1) === '%';
                if ((colors[1].slice(-1) === '%') !== isPercentages ||
                    (colors[2].slice(-1) === '%') !== isPercentages) {
                    return null;
                }
                // Convert to numbers and normalize colors
                multiplier = isPercentages ? 2.55 : 1;
                color1 = parseFloat(colors[0]) * multiplier;
                color2 = parseFloat(colors[1]) * multiplier;
                color3 = parseFloat(colors[2]) * multiplier;
                return {
                    r: isNaN(color1) || color1 < 0
                        ? 0
                        : color1 > 255
                            ? 255
                            : color1,
                    g: isNaN(color2) || color2 < 0
                        ? 0
                        : color2 > 255
                            ? 255
                            : color2,
                    b: isNaN(color3) || color3 < 0
                        ? 0
                        : color3 > 255
                            ? 255
                            : color3,
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
                // Convert to numbers and normalize colors
                color1 = parseFloat(colors[0]);
                color2 = parseFloat(colors[1]);
                color3 = parseFloat(colors[2]);
                return {
                    h: isNaN(color1)
                        ? 0
                        : color1 < 0
                            ? (color1 % 360) + 360
                            : color1 >= 360
                                ? color1 % 360
                                : color1,
                    s: isNaN(color2) || color2 < 0
                        ? 0
                        : color2 > 100
                            ? 100
                            : color2,
                    l: isNaN(color3) || color3 < 0
                        ? 0
                        : color3 > 100
                            ? 100
                            : color3,
                    a: alpha,
                };
        }
        return null;
    }
    exports.stringToColor = stringToColor;
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
        const hue = value.h < 0
            ? (value.h % 360) + 360
            : value.h >= 360
                ? value.h % 360
                : value.h;
        const sat = value.s < 0 ? 0 : value.s > 100 ? 1 : value.s / 100;
        const lum = value.l < 0 ? 0 : value.l > 100 ? 1 : value.l / 100;
        let m2;
        if (lum <= 0.5) {
            m2 = lum * (1 + sat);
        }
        else {
            m2 = lum + sat * (1 - lum);
        }
        const m1 = 2 * lum - m2;
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
        // Check precision
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
    exports.colorToString = colorToString;

    });

    /* src/icon-finder/components/content/footers/parts/OptionsBlock.svelte generated by Svelte v3.42.1 */

    function create_fragment$i(ctx) {
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
    			attr(div1, "class", div1_class_value = baseClass$1 + ' ' + baseClass$1 + '--' + /*type*/ ctx[0]);
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
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*type*/ 1 && div1_class_value !== (div1_class_value = baseClass$1 + ' ' + baseClass$1 + '--' + /*type*/ ctx[0])) {
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

    const baseClass$1 = 'iif-footer-options-block';

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { type } = $$props;

    	// Get title
    	let title;

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type*/ 1) {
    			{
    				const text = phrases$1.footerBlocks;

    				$$invalidate(1, title = text[type] === void 0
    				? type.split(' ').map(str => str.slice(0, 1).toUpperCase() + str.slice(1)).join(' ')
    				: text[type]);
    			}
    		}
    	};

    	return [type, title, $$scope, slots];
    }

    class OptionsBlock extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { type: 0 });
    	}
    }

    /* src/icon-finder/components/content/footers/parts/props/Color.svelte generated by Svelte v3.42.1 */

    function create_if_block$8(ctx) {
    	let optionsblock;
    	let current;

    	optionsblock = new OptionsBlock({
    			props: {
    				type: "color",
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(optionsblock.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(optionsblock, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const optionsblock_changes = {};

    			if (dirty & /*$$scope, inputValue, value*/ 2053) {
    				optionsblock_changes.$$scope = { dirty, ctx };
    			}

    			optionsblock.$set(optionsblock_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(optionsblock.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(optionsblock.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(optionsblock, detaching);
    		}
    	};
    }

    // (71:1) <OptionsBlock type="color">
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
    				icon: /*value*/ ctx[0] === void 0 || /*value*/ ctx[0] === ''
    				? 'color'
    				: 'color-filled',
    				extra: /*value*/ ctx[0] === void 0 ? '' : /*value*/ ctx[0],
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

    			if (dirty & /*value*/ 1) input_changes.icon = /*value*/ ctx[0] === void 0 || /*value*/ ctx[0] === ''
    			? 'color'
    			: 'color-filled';

    			if (dirty & /*value*/ 1) input_changes.extra = /*value*/ ctx[0] === void 0 ? '' : /*value*/ ctx[0];
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

    function create_fragment$h(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*hasColor*/ ctx[1] && create_if_block$8(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
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

    function instance$h($$self, $$props, $$invalidate) {
    	var _a;
    	
    	
    	let { icons } = $$props;
    	let { value } = $$props;
    	let { customise } = $$props;

    	// Check if at least one icon has color
    	let hasColor;

    	const title = phrases$1.footerBlocks.color;
    	let lastValue = value;
    	let inputValue = value;

    	// Convert color to valid string
    	function getColor(value, defaultValue) {
    		const color = colors.stringToColor(value);

    		if (!color) {
    			return defaultValue;
    		}

    		const cleanColor = colors.colorToString(color);
    		return cleanColor === '' ? defaultValue : cleanColor;
    	}

    	// Check input
    	function onInput(newValue) {
    		$$invalidate(2, inputValue = newValue);

    		// Check for valid color
    		if (newValue === '') {
    			customise('color', '');
    			return;
    		}

    		const validatedValue = getColor(newValue, null);

    		if (validatedValue !== null) {
    			// Change lastValue to avoid triggering component refresh
    			$$invalidate(9, lastValue = $$invalidate(0, value = validatedValue));

    			customise('color', validatedValue);
    		}
    	}

    	// Reset to last valid value
    	function onBlur() {
    		// Set last value as input value
    		$$invalidate(2, inputValue = value);
    	}

    	$$self.$$set = $$props => {
    		if ('icons' in $$props) $$invalidate(6, icons = $$props.icons);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('customise' in $$props) $$invalidate(7, customise = $$props.customise);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icons, _a*/ 320) {
    			{
    				$$invalidate(1, hasColor = false);

    				for (let i = 0; i < icons.length; i++) {
    					const data = $$invalidate(8, _a = iconify.Iconify.getIcon) === null || _a === void 0
    					? void 0
    					: _a.call(iconify.Iconify, lib.iconToString(icons[i]));

    					if (data && data.body.indexOf('currentColor') !== -1) {
    						$$invalidate(1, hasColor = true);
    						break;
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*lastValue, value*/ 513) {
    			{
    				// Change inputValue when value changes
    				if (lastValue !== value) {
    					$$invalidate(9, lastValue = value);
    					$$invalidate(2, inputValue = value);
    				}
    			}
    		}
    	};

    	return [
    		value,
    		hasColor,
    		inputValue,
    		title,
    		onInput,
    		onBlur,
    		icons,
    		customise,
    		_a,
    		lastValue
    	];
    }

    class Color extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { icons: 6, value: 0, customise: 7 });
    	}
    }

    /* src/icon-finder/components/content/footers/parts/props/SizeInput.svelte generated by Svelte v3.42.1 */

    function create_fragment$g(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: {
    				value: /*inputValue*/ ctx[3],
    				placeholder: /*placeholder*/ ctx[1],
    				title: /*title*/ ctx[2],
    				onInput: /*onInput*/ ctx[4],
    				onBlur: /*onBlur*/ ctx[5],
    				icon: 'icon-' + /*prop*/ ctx[0],
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
    			if (dirty & /*prop*/ 1) input_changes.icon = 'icon-' + /*prop*/ ctx[0];
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

    function instance$g($$self, $$props, $$invalidate) {
    	
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

    		if (newValue !== '') {
    			const num = parseFloat(newValue);
    			cleanValue = '' + num;

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
    		if ('prop' in $$props) $$invalidate(0, prop = $$props.prop);
    		if ('value' in $$props) $$invalidate(6, value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ('customise' in $$props) $$invalidate(7, customise = $$props.customise);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*prop*/ 1) {
    			{
    				$$invalidate(2, title = phrases$1.footerBlocks[prop]);
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

    	return [
    		prop,
    		placeholder,
    		title,
    		inputValue,
    		onInput,
    		onBlur,
    		value,
    		customise,
    		lastValue
    	];
    }

    class SizeInput extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			prop: 0,
    			value: 6,
    			placeholder: 1,
    			customise: 7
    		});
    	}
    }

    /* src/icon-finder/components/content/footers/parts/props/Size.svelte generated by Svelte v3.42.1 */

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (124:1) {#each props as prop, i (prop)}
    function create_each_block$8(key_1, ctx) {
    	let first;
    	let sizeinput;
    	let current;

    	sizeinput = new SizeInput({
    			props: {
    				prop: /*prop*/ ctx[8],
    				value: /*customisations*/ ctx[0][/*prop*/ ctx[8]] === null
    				? ''
    				: /*customisations*/ ctx[0][/*prop*/ ctx[8]] + '',
    				placeholder: /*placeholders*/ ctx[2][/*prop*/ ctx[8]],
    				customise: /*customise*/ ctx[1]
    			}
    		});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(sizeinput.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(sizeinput, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const sizeinput_changes = {};

    			if (dirty & /*customisations*/ 1) sizeinput_changes.value = /*customisations*/ ctx[0][/*prop*/ ctx[8]] === null
    			? ''
    			: /*customisations*/ ctx[0][/*prop*/ ctx[8]] + '';

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

    // (123:0) <OptionsBlock {type}>
    function create_default_slot$8(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*props*/ ctx[4];
    	const get_key = ctx => /*prop*/ ctx[8];

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$8(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$8(key, child_ctx));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
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
    				each_value = /*props*/ ctx[4];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$8, each_1_anchor, get_each_context$8);
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

    function create_fragment$f(ctx) {
    	let optionsblock;
    	let current;

    	optionsblock = new OptionsBlock({
    			props: {
    				type: /*type*/ ctx[3],
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(optionsblock.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(optionsblock, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const optionsblock_changes = {};

    			if (dirty & /*$$scope, customisations, placeholders, customise*/ 2055) {
    				optionsblock_changes.$$scope = { dirty, ctx };
    			}

    			optionsblock.$set(optionsblock_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(optionsblock.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(optionsblock.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(optionsblock, detaching);
    		}
    	};
    }

    function instance$f($$self, $$props, $$invalidate) {
    	
    	
    	let { icons } = $$props;
    	let { customisations } = $$props;
    	let { customise } = $$props;

    	// Get customisation type (constants because they cannot be changed at run time)
    	const type = 'size'
    	;

    	const props = ['width', 'height']
    	;

    	const defaultSize = {
    		width: defaultWidth,
    		height: defaultHeight
    	};

    	let data;
    	let placeholders;

    	$$self.$$set = $$props => {
    		if ('icons' in $$props) $$invalidate(5, icons = $$props.icons);
    		if ('customisations' in $$props) $$invalidate(0, customisations = $$props.customisations);
    		if ('customise' in $$props) $$invalidate(1, customise = $$props.customise);
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
    					var _a;

    					if (!hasWidth && !hasHeight) {
    						return;
    					}

    					const name = lib.iconToString(icon);

    					const data = (_a = iconify.Iconify.getIcon) === null || _a === void 0
    					? void 0
    					: _a.call(iconify.Iconify, name);

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
    				$$invalidate(2, placeholders = { width: '', height: '' });

    				// Check if icon is rotated
    				const rotated = !!(customisations.rotate && customisations.rotate % 2 === 1);

    				// Get placeholder for both sides
    				if (data.ratio !== 0) {
    					const keys = ['width', 'height'];

    					keys.forEach((key, index) => {
    						const altKey = keys[1 - index];
    						const placeholderKey = rotated ? altKey : key;
    						let size = '';
    						let scale = false;
    						const customised2 = customisations[rotated ? key : altKey];

    						if (customised2) {
    							// Another property is customised, use it for ratio
    							size = customised2;

    							scale = true;
    						} else if (defaultSize[key] !== '') {
    							// Use default size, do not scale
    							size = defaultSize[key];
    						} else if (defaultSize[altKey] !== '') {
    							// Use default size for other property
    							size = defaultSize[altKey];

    							scale = true;
    						} else if (data[key]) {
    							// Use icon size
    							size = data[key];
    						}

    						// Scale placeholder using size ratio
    						// console.log(`Size for ${key} is ${size}`);
    						if (size !== '') {
    							$$invalidate(
    								2,
    								placeholders[placeholderKey] = (scale
    								? calculateSize(size, key === 'width' ? data.ratio : 1 / data.ratio)
    								: size) + '',
    								placeholders
    							);
    						}
    					});
    				}
    			} // console.log('Placeholders:', JSON.stringify(placeholders));
    		}
    	};

    	return [customisations, customise, placeholders, type, props, icons, data];
    }

    class Size extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			icons: 5,
    			customisations: 0,
    			customise: 1
    		});
    	}
    }

    /* src/icon-finder/components/ui/OptionButton.svelte generated by Svelte v3.42.1 */

    function create_if_block$7(ctx) {
    	let uiicon;
    	let current;
    	uiicon = new UIIcon({ props: { icon: /*icon*/ ctx[0] } });

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

    function create_fragment$e(ctx) {
    	let button;
    	let t0;
    	let span;
    	let t1_value = (/*text*/ ctx[3] ? /*text*/ ctx[3] : /*title*/ ctx[2]) + "";
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[0] && create_if_block$7(ctx);

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
    					if_block = create_if_block$7(ctx);
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

    const baseClass = 'iif-option-button';

    function instance$e($$self, $$props, $$invalidate) {
    	let { icon = '' } = $$props;
    	let { onClick } = $$props;
    	let { title } = $$props;
    	let { text = null } = $$props;
    	let { textOptional = false } = $$props;
    	let { status = '' } = $$props;
    	let className;

    	$$self.$$set = $$props => {
    		if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
    		if ('onClick' in $$props) $$invalidate(1, onClick = $$props.onClick);
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    		if ('text' in $$props) $$invalidate(3, text = $$props.text);
    		if ('textOptional' in $$props) $$invalidate(5, textOptional = $$props.textOptional);
    		if ('status' in $$props) $$invalidate(6, status = $$props.status);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon, text, textOptional, status*/ 105) {
    			{
    				$$invalidate(4, className = baseClass + ' ' + baseClass + (icon ? '--with-icon' : '--without-icon') + ' ' + baseClass + (text && !textOptional || !icon
    				? '--with-text'
    				: '--without-text') + (status === '' ? '' : ' ' + baseClass + '--' + status));
    			}
    		}
    	};

    	return [icon, onClick, title, text, className, textOptional, status];
    }

    class OptionButton extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			icon: 0,
    			onClick: 1,
    			title: 2,
    			text: 3,
    			textOptional: 5,
    			status: 6
    		});
    	}
    }

    /* src/icon-finder/components/content/footers/parts/props/Rotate.svelte generated by Svelte v3.42.1 */

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i].count;
    	child_ctx[7] = list[i].key;
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (45:1) {#each list as { count, key }
    function create_each_block$7(key_1, ctx) {
    	let first;
    	let button;
    	let current;

    	function func() {
    		return /*func*/ ctx[5](/*count*/ ctx[6]);
    	}

    	button = new OptionButton({
    			props: {
    				icon: 'rotate' + /*count*/ ctx[6],
    				title: /*buttonPhrases*/ ctx[2].rotateTitle.replace('{num}', /*count*/ ctx[6] * 90 + ''),
    				text: /*buttonPhrases*/ ctx[2].rotate.replace('{num}', /*count*/ ctx[6] * 90 + ''),
    				status: /*value*/ ctx[0] === /*count*/ ctx[6]
    				? 'checked'
    				: 'unchecked',
    				onClick: func
    			}
    		});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
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
    			if (dirty & /*list*/ 2) button_changes.icon = 'rotate' + /*count*/ ctx[6];
    			if (dirty & /*list*/ 2) button_changes.title = /*buttonPhrases*/ ctx[2].rotateTitle.replace('{num}', /*count*/ ctx[6] * 90 + '');
    			if (dirty & /*list*/ 2) button_changes.text = /*buttonPhrases*/ ctx[2].rotate.replace('{num}', /*count*/ ctx[6] * 90 + '');

    			if (dirty & /*value, list*/ 3) button_changes.status = /*value*/ ctx[0] === /*count*/ ctx[6]
    			? 'checked'
    			: 'unchecked';

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

    // (44:0) <OptionsBlock type="rotate">
    function create_default_slot$7(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*list*/ ctx[1];
    	const get_key = ctx => /*key*/ ctx[7];

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$7(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$7(key, child_ctx));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
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
    				each_value = /*list*/ ctx[1];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$7, each_1_anchor, get_each_context$7);
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

    function create_fragment$d(ctx) {
    	let optionsblock;
    	let current;

    	optionsblock = new OptionsBlock({
    			props: {
    				type: "rotate",
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(optionsblock.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(optionsblock, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const optionsblock_changes = {};

    			if (dirty & /*$$scope, list, value*/ 1027) {
    				optionsblock_changes.$$scope = { dirty, ctx };
    			}

    			optionsblock.$set(optionsblock_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(optionsblock.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(optionsblock.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(optionsblock, detaching);
    		}
    	};
    }

    function addItem$1(count, selected, temp) {
    	return {
    		count,
    		key: count + '-' + temp,
    		selected,
    		temp
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	
    	let { value } = $$props;
    	let { customise } = $$props;

    	// Get text
    	const buttonPhrases = phrases$1.footerOptionButtons;

    	let list;

    	function rotateClicked(count) {
    		if (!count && !value) {
    			return;
    		}

    		customise('rotate', count === value ? 0 : count);
    	}

    	const func = count => rotateClicked(count);

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('customise' in $$props) $$invalidate(4, customise = $$props.customise);
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
    						newList.push(addItem$1(i, value === i, list && list[i] ? list[i].temp + 1 : 0));
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
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { value: 0, customise: 4 });
    	}
    }

    /* src/icon-finder/components/content/footers/parts/props/Flip.svelte generated by Svelte v3.42.1 */

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (32:1) {#each list as item, i (item.key)}
    function create_each_block$6(key_1, ctx) {
    	let first;
    	let button;
    	let current;

    	function func() {
    		return /*func*/ ctx[4](/*item*/ ctx[6]);
    	}

    	button = new OptionButton({
    			props: {
    				icon: /*item*/ ctx[6].icon,
    				title: /*item*/ ctx[6].title,
    				status: /*customisations*/ ctx[0][/*item*/ ctx[6].prop]
    				? 'checked'
    				: 'unchecked',
    				onClick: func
    			}
    		});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
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
    			? 'checked'
    			: 'unchecked';

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

    // (31:0) <OptionsBlock type="flip">
    function create_default_slot$6(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*list*/ ctx[1];
    	const get_key = ctx => /*item*/ ctx[6].key;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$6(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$6(key, child_ctx));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
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
    				each_value = /*list*/ ctx[1];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$6, each_1_anchor, get_each_context$6);
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

    function create_fragment$c(ctx) {
    	let optionsblock;
    	let current;

    	optionsblock = new OptionsBlock({
    			props: {
    				type: "flip",
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(optionsblock.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(optionsblock, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const optionsblock_changes = {};

    			if (dirty & /*$$scope, list, customisations*/ 515) {
    				optionsblock_changes.$$scope = { dirty, ctx };
    			}

    			optionsblock.$set(optionsblock_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(optionsblock.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(optionsblock.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(optionsblock, detaching);
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	
    	let { customisations } = $$props;
    	let { customise } = $$props;
    	let list;

    	function addItem(key, selected) {
    		const prop = key + 'Flip';

    		return {
    			prop,
    			icon: key + '-flip',
    			key: key + 'Flip' + (selected ? '!' : ''),
    			title: phrases$1.footerOptionButtons[prop]
    		};
    	}

    	// Toggle
    	function flipClicked(type) {
    		customise(type, !customisations[type]);
    	}

    	const func = item => flipClicked(item.prop);

    	$$self.$$set = $$props => {
    		if ('customisations' in $$props) $$invalidate(0, customisations = $$props.customisations);
    		if ('customise' in $$props) $$invalidate(3, customise = $$props.customise);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*customisations*/ 1) {
    			{
    				$$invalidate(1, list = [addItem('h', customisations.hFlip), addItem('v', customisations.vFlip)]);
    			}
    		}
    	};

    	return [customisations, list, flipClicked, customise, func];
    }

    class Flip extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { customisations: 0, customise: 3 });
    	}
    }

    /* src/icon-finder/components/content/footers/parts/props/Inline.svelte generated by Svelte v3.42.1 */

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i].mode;
    	child_ctx[6] = list[i].inline;
    	child_ctx[7] = list[i].key;
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (45:1) {#each list as { mode, inline, key }
    function create_each_block$5(key_1, ctx) {
    	let first;
    	let button;
    	let current;

    	button = new OptionButton({
    			props: {
    				icon: 'mode-' + /*mode*/ ctx[5],
    				text: /*buttonPhrases*/ ctx[2][/*mode*/ ctx[5]],
    				title: /*buttonPhrases*/ ctx[2][/*mode*/ ctx[5] + 'Hint'],
    				status: /*value*/ ctx[0] === /*inline*/ ctx[6]
    				? 'checked'
    				: 'unchecked',
    				textOptional: true,
    				onClick: /*inlineClicked*/ ctx[3]
    			}
    		});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
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
    			if (dirty & /*list*/ 2) button_changes.icon = 'mode-' + /*mode*/ ctx[5];
    			if (dirty & /*list*/ 2) button_changes.text = /*buttonPhrases*/ ctx[2][/*mode*/ ctx[5]];
    			if (dirty & /*list*/ 2) button_changes.title = /*buttonPhrases*/ ctx[2][/*mode*/ ctx[5] + 'Hint'];

    			if (dirty & /*value, list*/ 3) button_changes.status = /*value*/ ctx[0] === /*inline*/ ctx[6]
    			? 'checked'
    			: 'unchecked';

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

    // (44:0) <OptionsBlock type="mode">
    function create_default_slot$5(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*list*/ ctx[1];
    	const get_key = ctx => /*key*/ ctx[7];

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
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
    				each_value = /*list*/ ctx[1];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$5, each_1_anchor, get_each_context$5);
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

    function create_fragment$b(ctx) {
    	let optionsblock;
    	let current;

    	optionsblock = new OptionsBlock({
    			props: {
    				type: "mode",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(optionsblock.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(optionsblock, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const optionsblock_changes = {};

    			if (dirty & /*$$scope, list, value*/ 1027) {
    				optionsblock_changes.$$scope = { dirty, ctx };
    			}

    			optionsblock.$set(optionsblock_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(optionsblock.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(optionsblock.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(optionsblock, detaching);
    		}
    	};
    }

    function addItem(inline, selected, temp) {
    	const mode = inline ? 'inline' : 'block';

    	return {
    		mode,
    		inline,
    		key: mode + temp,
    		selected,
    		temp
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	
    	let { value } = $$props;
    	let { customise } = $$props;

    	// Phrases
    	const buttonPhrases = phrases$1.footerOptionButtons;

    	let list;

    	function inlineClicked() {
    		customise('inline', !value);
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('customise' in $$props) $$invalidate(4, customise = $$props.customise);
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
    						newList.push(addItem(inline, value === inline, list && list[i] ? list[i].temp + 1 : 0));
    					}
    				}

    				$$invalidate(1, list = newList);
    			}
    		}
    	};

    	return [value, list, buttonPhrases, inlineClicked, customise];
    }

    class Inline$1 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { value: 0, customise: 4 });
    	}
    }

    /* src/icon-finder/components/content/footers/parts/Properties.svelte generated by Svelte v3.42.1 */

    function create_if_block_4$2(ctx) {
    	let colorblock;
    	let current;

    	colorblock = new Color({
    			props: {
    				icons: /*icons*/ ctx[0],
    				value: typeof /*customisations*/ ctx[1].color === 'string'
    				? /*customisations*/ ctx[1].color
    				: '',
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

    			if (dirty & /*customisations*/ 2) colorblock_changes.value = typeof /*customisations*/ ctx[1].color === 'string'
    			? /*customisations*/ ctx[1].color
    			: '';

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

    // (34:2) {#if customiseWidth || customiseHeight}
    function create_if_block_3$2(ctx) {
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

    // (37:2) {#if customiseFlip}
    function create_if_block_2$3(ctx) {
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

    // (40:2) {#if customiseRotate}
    function create_if_block_1$4(ctx) {
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

    // (43:2) {#if customiseInline && icons.length === 1}
    function create_if_block$6(ctx) {
    	let inlineblock;
    	let current;

    	inlineblock = new Inline$1({
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

    // (26:0) <FooterBlock name="props" {title}>
    function create_default_slot$4(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;
    	let if_block0 = create_if_block_4$2(ctx);
    	let if_block1 = create_if_block_3$2(ctx);
    	let if_block2 = create_if_block_2$3(ctx);
    	let if_block3 = create_if_block_1$4(ctx);
    	let if_block4 = /*icons*/ ctx[0].length === 1 && create_if_block$6(ctx);

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

    			if (/*icons*/ ctx[0].length === 1) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty & /*icons*/ 1) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block$6(ctx);
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

    function create_fragment$a(ctx) {
    	let footerblock;
    	let current;

    	footerblock = new FooterBlock({
    			props: {
    				name: "props",
    				title: /*title*/ ctx[3],
    				$$slots: { default: [create_default_slot$4] },
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

    function instance$a($$self, $$props, $$invalidate) {
    	
    	
    	let { icons } = $$props;
    	let { customisations } = $$props;
    	let { customise } = $$props;

    	// Title
    	let title;

    	$$self.$$set = $$props => {
    		if ('icons' in $$props) $$invalidate(0, icons = $$props.icons);
    		if ('customisations' in $$props) $$invalidate(1, customisations = $$props.customisations);
    		if ('customise' in $$props) $$invalidate(2, customise = $$props.customise);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icons*/ 1) {
    			{
    				$$invalidate(3, title = '');
    			}
    		}
    	};

    	return [icons, customisations, customise, title];
    }

    class Properties extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
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
            height = calculateSize(width, rotated ? ratio : 1 / ratio);
        }
        else {
            width = calculateSize(height, rotated ? 1 / ratio : ratio);
        }
        return {
            width,
            height,
        };
    }

    /* src/icon-finder/components/content/footers/parts/samples/Full.svelte generated by Svelte v3.42.1 */

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (126:1) {#each [data] as icon (icon.name)}
    function create_each_block$4(key_1, ctx) {
    	let first;
    	let iconcomponent;
    	let current;
    	const iconcomponent_spread_levels = [{ icon: /*icon*/ ctx[0].name }, /*props*/ ctx[3]];
    	let iconcomponent_props = {};

    	for (let i = 0; i < iconcomponent_spread_levels.length; i += 1) {
    		iconcomponent_props = assign(iconcomponent_props, iconcomponent_spread_levels[i]);
    	}

    	iconcomponent = new Icon({ props: iconcomponent_props });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(iconcomponent.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(iconcomponent, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			const iconcomponent_changes = (dirty & /*data, props*/ 10)
    			? get_spread_update(iconcomponent_spread_levels, [
    					dirty & /*data*/ 2 && { icon: /*icon*/ ctx[0].name },
    					dirty & /*props*/ 8 && get_spread_object(/*props*/ ctx[3])
    				])
    			: {};

    			iconcomponent.$set(iconcomponent_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(iconcomponent.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(iconcomponent.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(iconcomponent, detaching);
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = [/*data*/ ctx[1]];
    	const get_key = ctx => /*icon*/ ctx[0].name;

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", "iif-foote\n\tr-sample iif-footer-sample--block iif-footer-sample--loaded");
    			attr(div, "style", /*style*/ ctx[2]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*data, props*/ 10) {
    				each_value = [/*data*/ ctx[1]];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$4, null, get_each_context$4);
    				check_outros();
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr(div, "style", /*style*/ ctx[2]);
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
    			if (detaching) detach(div);

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	
    	
    	
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
    		if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
    		if ('customisations' in $$props) $$invalidate(4, customisations = $$props.customisations);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon, customisations*/ 17) {
    			{
    				// Get name
    				const name = lib.iconToString(icon);

    				// Get data (both getIcon and icon data are available: check is done in footer)
    				const iconData = iconify.Iconify.getIcon(name);

    				// Check if icon is rotated (for width/height calculations)
    				const rotated = !!(iconData.width !== iconData.height && customisations.rotate && customisations.rotate % 2 === 1);

    				// Width / height ratio
    				const ratio = iconData.width / iconData.height;

    				$$invalidate(1, data = { name, data: iconData, rotated, ratio });
    			}
    		}

    		if ($$self.$$.dirty & /*customisations, style, data*/ 22) {
    			{
    				$$invalidate(2, style = '');

    				// Add color
    				if (customisations.color) {
    					$$invalidate(2, style += 'color: ' + customisations.color + ';');
    				} else {
    					$$invalidate(2, style += 'color: ' + defaultColor + ';');
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

    					$$invalidate(2, style += 'font-size: ' + size.height + 'px;');
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*customisations, data*/ 18) {
    			{
    				$$invalidate(3, props = {});

    				['hFlip', 'vFlip', 'rotate'].forEach(key => {
    					const prop = key;

    					if (customisations[prop]) {
    						$$invalidate(3, props[prop] = customisations[prop], props);
    					}
    				});

    				let size;
    				const customisedWidth = customisations.width;
    				const customisedHeight = customisations.height;

    				if (customisedWidth || customisedHeight) {
    					size = getDimensions(customisedWidth ? customisedWidth : '', customisedHeight ? customisedHeight : '', data.ratio, data.rotated);
    				}

    				if (size !== void 0) {
    					scaleSample(size, false);
    					$$invalidate(3, props.width = size.width + '', props);
    					$$invalidate(3, props.height = size.height + '', props);
    				}
    			}
    		}
    	};

    	return [icon, data, style, props, customisations];
    }

    class Full$1 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { icon: 0, customisations: 4 });
    	}
    }

    /* src/icon-finder/components/content/footers/parts/samples/Inline.svelte generated by Svelte v3.42.1 */

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (62:3) {#each [props] as iconProps (iconProps.icon)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let iconcomponent;
    	let current;
    	const iconcomponent_spread_levels = [/*iconProps*/ ctx[7]];
    	let iconcomponent_props = {};

    	for (let i = 0; i < iconcomponent_spread_levels.length; i += 1) {
    		iconcomponent_props = assign(iconcomponent_props, iconcomponent_spread_levels[i]);
    	}

    	iconcomponent = new Icon({ props: iconcomponent_props });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(iconcomponent.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(iconcomponent, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			const iconcomponent_changes = (dirty & /*props*/ 1)
    			? get_spread_update(iconcomponent_spread_levels, [get_spread_object(/*iconProps*/ ctx[7])])
    			: {};

    			iconcomponent.$set(iconcomponent_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(iconcomponent.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(iconcomponent.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(iconcomponent, detaching);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	let div;
    	let p;
    	let t0_value = /*samplePhrases*/ ctx[2].before + "";
    	let t0;
    	let t1;
    	let span;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let t3_value = /*samplePhrases*/ ctx[2].after + "";
    	let t3;
    	let current;
    	let each_value = [/*props*/ ctx[0]];
    	const get_key = ctx => /*iconProps*/ ctx[7].icon;

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	return {
    		c() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

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

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(span, null);
    			}

    			append(p, t2);
    			append(p, t3);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*props*/ 1) {
    				each_value = [/*props*/ ctx[0]];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, span, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    				check_outros();
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr(span, "style", /*style*/ ctx[1]);
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
    			if (detaching) detach(div);

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	
    	
    	
    	let { icon } = $$props;
    	let { customisations } = $$props;
    	const samplePhrases = phrases$1.footer.inlineSample;

    	// Get maximum width/height from options
    	const maxWidth = iconSampleSize.width;

    	const maxHeight = iconSampleSize.height;

    	// Get HTML
    	let props;

    	let style;

    	$$self.$$set = $$props => {
    		if ('icon' in $$props) $$invalidate(3, icon = $$props.icon);
    		if ('customisations' in $$props) $$invalidate(4, customisations = $$props.customisations);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon, customisations, props*/ 25) {
    			{
    				$$invalidate(0, props = { icon: lib.iconToString(icon) });
    				$$invalidate(1, style = '');

    				// Customisations
    				Object.keys(customisations).forEach(key => {
    					const attr = key;
    					const value = customisations[attr];

    					if (value !== void 0 && value !== '' && value !== 0 && value !== false) {
    						if (attr === 'color') {
    							$$invalidate(1, style = 'color: ' + value + ';');
    						} else {
    							$$invalidate(0, props[attr] = value, props);
    						}
    					}
    				});

    				// Adjust width and height
    				if (props.width || props.height) {
    					const rotated = !!(customisations.rotate % 2);

    					// Check maxWidth
    					let key = rotated ? 'height' : 'width';

    					if (props[key] && props[key] > maxWidth) {
    						$$invalidate(0, props[key] = maxWidth, props);
    					}

    					// Check maxHeight
    					key = !rotated ? 'height' : 'width';

    					if (props[key] && props[key] > maxHeight) {
    						$$invalidate(0, props[key] = maxHeight, props);
    					}
    				}
    			}
    		}
    	};

    	return [props, style, samplePhrases, icon, customisations];
    }

    class Inline extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { icon: 3, customisations: 4 });
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

    /* src/icon-finder/components/content/footers/parts/Icons.svelte generated by Svelte v3.42.1 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (108:5) {#if !onSelect}
    function create_if_block_1$3(ctx) {
    	let span;
    	let uiicon;
    	let current;
    	uiicon = new UIIcon({ props: { icon: "reset" } });

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

    // (114:4) {#if onSelect}
    function create_if_block$5(ctx) {
    	let a;
    	let uiicon;
    	let a_title_value;
    	let current;
    	let mounted;
    	let dispose;
    	uiicon = new UIIcon({ props: { icon: "reset" } });

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[10](/*item*/ ctx[13]);
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

    // (99:2) {#each items as item, i (item.name)}
    function create_each_block$2(key_1, ctx) {
    	let li;
    	let a;
    	let iconcomponent;
    	let t0;
    	let a_title_value;
    	let t1;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	const iconcomponent_spread_levels = [{ icon: /*item*/ ctx[13].name }, /*props*/ ctx[2]];
    	let iconcomponent_props = {};

    	for (let i = 0; i < iconcomponent_spread_levels.length; i += 1) {
    		iconcomponent_props = assign(iconcomponent_props, iconcomponent_spread_levels[i]);
    	}

    	iconcomponent = new Icon({ props: iconcomponent_props });
    	let if_block0 = !/*onSelect*/ ctx[0] && create_if_block_1$3();

    	function click_handler() {
    		return /*click_handler*/ ctx[9](/*item*/ ctx[13]);
    	}

    	let if_block1 = /*onSelect*/ ctx[0] && create_if_block$5(ctx);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			li = element("li");
    			a = element("a");
    			create_component(iconcomponent.$$.fragment);
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
    			mount_component(iconcomponent, a, null);
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

    			const iconcomponent_changes = (dirty & /*items, props*/ 6)
    			? get_spread_update(iconcomponent_spread_levels, [
    					dirty & /*items*/ 2 && { icon: /*item*/ ctx[13].name },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			iconcomponent.$set(iconcomponent_changes);

    			if (!/*onSelect*/ ctx[0]) {
    				if (if_block0) {
    					if (dirty & /*onSelect*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$3();
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
    					if_block1 = create_if_block$5(ctx);
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
    			transition_in(iconcomponent.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(iconcomponent.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			destroy_component(iconcomponent);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (97:0) <OptionsBlock type="icons">
    function create_default_slot$3(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*items*/ ctx[1];
    	const get_key = ctx => /*item*/ ctx[13].name;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
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
    				each_value = /*items*/ ctx[1];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
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

    function create_fragment$7(ctx) {
    	let optionsblock;
    	let current;

    	optionsblock = new OptionsBlock({
    			props: {
    				type: "icons",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(optionsblock.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(optionsblock, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const optionsblock_changes = {};

    			if (dirty & /*$$scope, style, items, onSelect, props*/ 65551) {
    				optionsblock_changes.$$scope = { dirty, ctx };
    			}

    			optionsblock.$set(optionsblock_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(optionsblock.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(optionsblock.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(optionsblock, detaching);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	
    	
    	
    	
    	let { icons } = $$props;
    	let { customisations } = $$props;
    	let { route } = $$props;
    	let { selected = '' } = $$props;
    	let { onSelect = null } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	let items;

    	// Copy customisations
    	const transformations = ['rotate', 'hFlip', 'vFlip'];

    	let props;
    	let style;

    	// Toggle icon
    	function onClick(select, icon) {
    		if (select && onSelect) {
    			onSelect(icon);
    			return;
    		}

    		registry.callback({ type: 'selection', icon, selected: false });
    	}

    	const click_handler = item => {
    		onClick(true, item.icon);
    	};

    	const click_handler_1 = item => {
    		onClick(false, item.icon);
    	};

    	$$self.$$set = $$props => {
    		if ('icons' in $$props) $$invalidate(5, icons = $$props.icons);
    		if ('customisations' in $$props) $$invalidate(6, customisations = $$props.customisations);
    		if ('route' in $$props) $$invalidate(7, route = $$props.route);
    		if ('selected' in $$props) $$invalidate(8, selected = $$props.selected);
    		if ('onSelect' in $$props) $$invalidate(0, onSelect = $$props.onSelect);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icons, route, onSelect, selected, items*/ 419) {
    			{
    				$$invalidate(1, items = []);

    				icons.forEach(icon => {
    					// Full name
    					const name = lib.iconToString(icon);

    					// Do not show prefix if viewing collection
    					const text = shortenIconName(route, icon, name)
    					;

    					// Hint
    					const removeTitle = phrases$1.footer.remove.replace('{name}', text);

    					const selectTitle = onSelect
    					? phrases$1.footer.select.replace('{name}', text)
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
    				if (typeof customisations.height === 'number' && customisations.height < 32) {
    					$$invalidate(2, props.height = customisations.height, props);

    					// Width, but only if height is set
    					if (customisations.width) {
    						$$invalidate(2, props.width = customisations.width, props);
    					}
    				}

    				// Color
    				$$invalidate(3, style = '');

    				if (customisations.color !== '') {
    					$$invalidate(3, style = 'color: ' + customisations.color + ';');
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

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			icons: 5,
    			customisations: 6,
    			route: 7,
    			selected: 8,
    			onSelect: 0
    		});
    	}
    }

    /* src/icon-finder/components/content/footers/parts/name/Simple.svelte generated by Svelte v3.42.1 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (28:3) {#each [iconName] as iconName (iconName)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let iconcomponent;
    	let current;
    	iconcomponent = new Icon({ props: { icon: /*iconName*/ ctx[0] } });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(iconcomponent.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(iconcomponent, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const iconcomponent_changes = {};
    			if (dirty & /*iconName*/ 1) iconcomponent_changes.icon = /*iconName*/ ctx[0];
    			iconcomponent.$set(iconcomponent_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(iconcomponent.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(iconcomponent.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(iconcomponent, detaching);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let dl;
    	let dt;
    	let dd;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t1;
    	let div0;
    	let span;
    	let t2;
    	let current;
    	let each_value = [/*iconName*/ ctx[0]];
    	const get_key = ctx => /*iconName*/ ctx[0];

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	return {
    		c() {
    			div1 = element("div");
    			dl = element("dl");
    			dt = element("dt");
    			dt.textContent = `${phrases$1.footer.iconName}`;
    			dd = element("dd");

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

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

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(dd, null);
    			}

    			append(dd, t1);
    			append(dd, div0);
    			append(div0, span);
    			append(span, t2);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*iconName*/ 1) {
    				each_value = [/*iconName*/ ctx[0]];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, dd, outro_and_destroy_block, create_each_block$1, t1, get_each_context$1);
    				check_outros();
    			}

    			if (!current || dirty & /*text*/ 2) set_data(t2, /*text*/ ctx[1]);
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
    			if (detaching) detach(div1);

    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	
    	let { icon } = $$props;
    	let { route } = $$props;

    	// Get icon name
    	let iconName;

    	let text;

    	$$self.$$set = $$props => {
    		if ('icon' in $$props) $$invalidate(2, icon = $$props.icon);
    		if ('route' in $$props) $$invalidate(3, route = $$props.route);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon, route, iconName*/ 13) {
    			{
    				// Full name
    				$$invalidate(0, iconName = lib.iconToString(icon));

    				// Do not show prefix if viewing collection
    				$$invalidate(1, text = shortenIconName(route, icon, iconName)
    				);
    			}
    		}
    	};

    	return [iconName, text, icon, route];
    }

    class Simple extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { icon: 2, route: 3 });
    	}
    }

    var capitalize_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.capitalize = void 0;
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
    exports.capitalize = capitalize;

    });

    var phrases = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.translateCodeSampleTitles = exports.capitalizeCodeSampleTitle = exports.codeSampleTitles = void 0;

    /**
     * Code sample tab and mode titles
     *
     * This list contains only items that require custom text.
     * Everything else will be capitalized using capitalizeCodeSampleTitle() function, such as 'vue2' changed to 'Vue 2'
     */
    exports.codeSampleTitles = {
        'iconify': 'SVG Framework',
        'html': 'HTML',
        'css': 'CSS',
        'svg': 'SVG',
        'svg-raw': 'SVG',
        'svg-box': 'SVG with viewBox rectangle',
        'svg-uri': 'SVG as data: URI',
        'react-offline': 'React (offline)',
        'react-api': 'React',
        'vue2-offline': 'Vue 2 (offline)',
        'vue2-api': 'Vue 2',
        'offline': '(offline)',
    };
    /**
     * Capitalize code sample title
     */
    function capitalizeCodeSampleTitle(key) {
        const customValue = exports.codeSampleTitles[key];
        if (customValue !== void 0) {
            return customValue;
        }
        // Check for '-offline' and '-api'
        const parts = key.split('-');
        if (parts.length > 1) {
            const lastPart = parts.pop();
            const testKey = parts.join('-');
            switch (lastPart) {
                case 'offline':
                    return (capitalizeCodeSampleTitle(testKey) +
                        ' ' +
                        exports.codeSampleTitles.offline);
                case 'api':
                    return capitalizeCodeSampleTitle(testKey);
            }
        }
        // Return capitalised value
        return capitalize_1.capitalize(key);
    }
    exports.capitalizeCodeSampleTitle = capitalizeCodeSampleTitle;
    /**
     * Add / replace custom sample titles
     */
    function translateCodeSampleTitles(translation) {
        for (const key in translation) {
            const attr = key;
            exports.codeSampleTitles[attr] = translation[attr];
        }
    }
    exports.translateCodeSampleTitles = translateCodeSampleTitles;

    });

    var tree = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCodeSamplesTree = void 0;


    const rawCodeTabs = {
        html: {
            iconify: 'api',
            css: 'svg',
        },
        react: {
            'react-api': 'api',
            'react-offline': 'offline',
        },
        vue: {
            'vue3-api': 'api',
            'vue2-api': 'api',
            'vue3-offline': 'offline',
            'vue2-offline': 'offline',
        },
        svelte: {
            'svelte-api': 'api',
            'svelte-offline': 'offline',
        },
        ember: 'api',
        svg: {
            'svg-raw': 'raw',
            'svg-box': 'raw',
            'svg-uri': 'raw',
        },
    };
    /**
     * Get code samples tree
     */
    function getCodeSamplesTree(config) {
        const results = [];
        /**
         * Check if code sample can be shown
         */
        function canUse(mode, type) {
            // Check for required functions
            switch (mode) {
                case 'svg-box':
                case 'svg-raw':
                case 'svg-uri':
                    if (!iconify.Iconify.getIcon) {
                        return false;
                    }
            }
            // Check type
            switch (type) {
                case 'raw':
                    return config[type];
                case 'api':
                    return config.api;
                case 'svg':
                    return config.svg !== void 0;
                case 'offline':
                    return config.npmES !== void 0 || config.npmCJS !== void 0;
            }
        }
        /**
         * Get title
         */
        function getTitle(mode) {
            if (phrases.codeSampleTitles[mode] !== void 0) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return phrases.codeSampleTitles[mode];
            }
            return phrases.capitalizeCodeSampleTitle(mode);
        }
        for (const key in rawCodeTabs) {
            // Using weird type casting because TypeScript can't property resolve it
            const attr = key;
            const item = rawCodeTabs[key];
            // Item without children
            if (typeof item === 'string') {
                const mode = attr;
                if (canUse(mode, item)) {
                    // Add item without children
                    const newItem = {
                        mode,
                        type: item,
                        title: getTitle(attr),
                    };
                    results.push(newItem);
                }
                else {
                    console.error('Cannot use mode:', mode, item);
                }
                continue;
            }
            // Item with children
            const children = [];
            for (const key2 in item) {
                const mode = key2;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const type = item[mode];
                if (canUse(mode, type)) {
                    const newItem = {
                        mode,
                        type,
                        title: getTitle(mode),
                    };
                    children.push(newItem);
                }
            }
            let firstChild;
            const tab = attr;
            const title = getTitle(tab);
            switch (children.length) {
                case 0:
                    break;
                case 1:
                    // Merge children
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    firstChild = children[0];
                    results.push({
                        tab,
                        mode: firstChild.mode,
                        type: firstChild.type,
                        title,
                    });
                    break;
                default:
                    // Add all children
                    results.push({
                        tab,
                        children,
                        title,
                    });
            }
        }
        return results;
    }
    exports.getCodeSamplesTree = getCodeSamplesTree;

    });

    /**
     * Configuration for API providers for code samples
     */
    const codeConfig = {
        providers: Object.create(null),
        // Default configuration
        defaultProvider: {
            api: true,
            raw: true,
        },
    };
    // Add default provider
    codeConfig.providers[''] = {
        // Show packages that use API
        api: true,
        // NPM packages for React, Vue, Svelte components
        npmES: {
            package: '@iconify-icons/{prefix}',
            file: '/{name}',
        },
        npmCJS: {
            package: '@iconify/icons-{prefix}',
            file: '/{name}',
        },
        // Allow generating SVG
        raw: true,
        // Remote SVGs
        svg: 'https://api.iconify.design/{prefix}/{name}.svg',
    };

    var common = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergeAttributes = exports.mergeAttr = exports.addEmberAttr = exports.addVueAttr = exports.addReactAttr = exports.addDynamicAttr = exports.addAttr = exports.npmIconImport = exports.getCustomisationsList = exports.docsBase = exports.getCustomisationAttributes = exports.toString = exports.degrees = exports.isNumber = exports.iconToVarName = void 0;

    /**
     * Convert icon name to variable
     */
    function iconToVarName(iconName) {
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
    exports.iconToVarName = iconToVarName;
    /**
     * Check if string contains units
     */
    function isNumber(value) {
        return typeof value === 'number'
            ? true
            : typeof value === 'string'
                ? !!value.match(/^-?[0-9.]+$/)
                : false;
    }
    exports.isNumber = isNumber;
    /**
     * Convert number to degrees string
     */
    function degrees(value) {
        return value * 90 + 'deg';
    }
    exports.degrees = degrees;
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
    exports.toString = toString;
    /**
     * List of attributes
     */
    const baseCustomisationAttributes = [
        'width',
        'height',
        'rotate',
        'hFlip',
        'vFlip',
        'hAlign',
        'vAlign',
        'slice',
    ];
    function getCustomisationAttributes(color, inline) {
        const results = baseCustomisationAttributes.slice(0);
        if (color) {
            results.push('color');
        }
        if (inline) {
            results.push('inline');
        }
        return results;
    }
    exports.getCustomisationAttributes = getCustomisationAttributes;
    /**
     * Documentation
     */
    exports.docsBase = 'https://docs.iconify.design/icon-components/';
    function getCustomisationsList(customisations$1) {
        const results = new Set();
        // Add color
        if (customisations$1.color !== '') {
            results.add('color');
        }
        // Add dimensions
        const width = customisations$1.width;
        const hasWidth = width !== null && width !== '';
        const height = customisations$1.height;
        const hasHeight = height !== null && height !== '';
        if (hasWidth) {
            results.add('width');
        }
        if (hasHeight) {
            results.add(hasWidth || height === 'auto' ? 'height' : 'onlyHeight');
        }
        // Transformations and alignment
        ['rotate', 'hFlip', 'vFlip', 'hAlign', 'vAlign', 'slice'].forEach((prop) => {
            const key = prop;
            const value = customisations$1[key];
            if (value !== void 0 && value !== customisations.emptyCustomisations[key]) {
                results.add(key);
            }
        });
        // Inline
        if (customisations$1.inline) {
            results.add('inline');
        }
        return results;
    }
    exports.getCustomisationsList = getCustomisationsList;
    function npmIconImport(icon, name, providerConfig, preferES) {
        const npm = preferES
            ? providerConfig.npmES
                ? providerConfig.npmES
                : providerConfig.npmCJS
            : providerConfig.npmCJS
                ? providerConfig.npmCJS
                : providerConfig.npmES;
        if (!npm) {
            return null;
        }
        const packageName = typeof npm.package === 'string'
            ? npm.package.replace('{prefix}', icon.prefix)
            : typeof npm.package === 'function'
                ? npm.package(providerConfig, icon)
                : null;
        if (typeof packageName !== 'string') {
            return null;
        }
        const file = typeof npm.file === 'string'
            ? npm.file.replace('{name}', icon.name)
            : typeof npm.file === 'function'
                ? npm.file(providerConfig, icon)
                : null;
        if (typeof file !== 'string') {
            return null;
        }
        const code = 'import ' + name + " from '" + packageName + file + "';";
        return {
            name,
            package: packageName,
            file,
            code,
        };
    }
    exports.npmIconImport = npmIconImport;
    function addAttr(list, key, value) {
        list[key] = {
            key,
            value,
        };
    }
    exports.addAttr = addAttr;
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
    exports.addDynamicAttr = addDynamicAttr;
    function addReactAttr(list, key, value) {
        if (typeof value === 'string' && key !== 'icon') {
            addAttr(list, key, value);
        }
        else {
            addDynamicAttr(list, key, value, '{var}={{value}}');
        }
    }
    exports.addReactAttr = addReactAttr;
    function addVueAttr(list, key, value) {
        if (typeof value === 'string' && key !== 'icon') {
            addAttr(list, key, value);
        }
        else {
            addDynamicAttr(list, key, value, ':{var}="{value}"');
        }
    }
    exports.addVueAttr = addVueAttr;
    function addEmberAttr(list, key, value) {
        if (typeof value === 'string') {
            addAttr(list, '@' + key, value);
        }
        else {
            addDynamicAttr(list, key, value, '@{var}={{{value}}}');
        }
    }
    exports.addEmberAttr = addEmberAttr;
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
    exports.mergeAttr = mergeAttr;
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
    exports.mergeAttributes = mergeAttributes;

    });

    var css = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cssParser = void 0;
    // Documentation links
    const docs = {
        type: 'css',
        href: common.docsBase + 'css.html',
    };
    /**
     * Code output for CSS
     */
    const cssParser = (icon, customisations, providerConfig) => {
        if (typeof providerConfig.svg !== 'string') {
            return null;
        }
        // Parse all customisations
        const list = {};
        common.getCustomisationsList(customisations).forEach((attr) => {
            switch (attr) {
                // Ignore
                case 'inline':
                    break;
                // Color
                case 'color':
                    common.addAttr(list, 'color', customisations[attr]);
                    break;
                // Dimensions
                case 'width':
                case 'height':
                    common.addAttr(list, attr, common.toString(customisations[attr]));
                    break;
                case 'onlyHeight':
                    common.addAttr(list, 'height', common.toString(customisations.height));
                    break;
                // Transformations
                case 'rotate':
                    common.addAttr(list, attr, common.degrees(customisations[attr]));
                    break;
                case 'hFlip':
                    common.mergeAttr(list, 'flip', 'horizontal', ',');
                    break;
                case 'vFlip':
                    common.mergeAttr(list, 'flip', 'vertical', ',');
                    break;
                // Alignment
                case 'hAlign':
                case 'vAlign':
                    common.mergeAttr(list, 'align', customisations[attr], ',');
                    break;
                case 'slice':
                    common.mergeAttr(list, 'align', attr, ',');
                    break;
            }
        });
        // Generate params
        const params = Object.keys(list)
            .map((key) => {
            const item = list[key];
            if (typeof item === 'object') {
                return item.key + '=' + encodeURIComponent(item.value);
            }
            return key + '=' + encodeURIComponent(item);
        })
            .join('&');
        // Get URL
        const url = providerConfig.svg
            .replace('{prefix}', icon.prefix)
            .replace('{name}', icon.name) + (params ? '?' + params : '');
        const result = {
            raw: [
                "background: url('" + url + "') no-repeat center center / contain;",
                "content: url('" + url + "');",
            ],
            isAPI: true,
            docs,
        };
        return result;
    };
    exports.cssParser = cssParser;

    });

    var versions = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getComponentInstall = exports.componentPackages = exports.iconifyVersion = void 0;
    // Iconify version (do not edit it, replaced during build!)
    exports.iconifyVersion = '2.0.3';
    exports.componentPackages = {
        react: {
            name: '@iconify/react',
        },
        vue2: {
            name: '@iconify/vue2',
        },
        vue3: {
            name: '@iconify/vue',
        },
        svelte: {
            name: '@iconify/svelte',
        },
        ember: {
            name: '@iconify/ember',
        },
    };
    /**
     * Get package name to install
     */
    function getComponentInstall(key, dev) {
        const item = exports.componentPackages[key];
        let result = item.name;
        if (item.version !== void 0) {
            result += item.version;
        }
        if (typeof dev === 'boolean') {
            return 'npm install --save' + (dev ? '-dev ' : ' ') + result;
        }
        return result;
    }
    exports.getComponentInstall = getComponentInstall;

    });

    var ember = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.emberParser = void 0;



    // Documentation links
    const docs = {
        type: 'ember',
        href: common.docsBase + 'ember/',
    };
    // Code cache
    const installCode = versions.getComponentInstall('ember', true);
    /**
     * Code output for API component
     */
    const emberParser = (icon$1, customisations, providerConfig) => {
        if (!providerConfig.api) {
            return null;
        }
        // List of attributes
        const list = {};
        // Add icon name
        common.addEmberAttr(list, 'icon', icon.iconToString(icon$1));
        // Params
        common.getCustomisationsList(customisations).forEach((attr) => {
            switch (attr) {
                case 'onlyHeight': {
                    const value = customisations.height;
                    common.addEmberAttr(list, 'height', value);
                    break;
                }
                default:
                    common.addEmberAttr(list, attr, customisations[attr]);
            }
        });
        // Generate code
        const code = '<IconifyIcon ' + common.mergeAttributes(list) + ' />';
        const result = {
            component: {
                'install-addon': installCode,
                'use-in-template': code,
            },
            isAPI: true,
            docs,
        };
        return result;
    };
    exports.emberParser = emberParser;

    });

    var react = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reactOfflineParser = exports.reactParser = void 0;



    // Documentation links
    const docs = {
        type: 'react',
        href: common.docsBase + 'react/',
    };
    // Code cache
    const installCode = versions.getComponentInstall('react', true);
    const importCode = "import { Icon } from '" + versions.componentPackages.react.name + "';";
    /**
     * Add properties and generate code
     */
    function generateCode(list, customisations) {
        // Parse all customisations
        common.getCustomisationsList(customisations).forEach((attr) => {
            switch (attr) {
                case 'onlyHeight': {
                    const value = customisations.height;
                    common.addReactAttr(list, 'height', value);
                    break;
                }
                default:
                    common.addReactAttr(list, attr, customisations[attr]);
            }
        });
        return '<Icon ' + common.mergeAttributes(list) + ' />';
    }
    /**
     * Code output for API component
     */
    const reactParser = (icon$1, customisations, providerConfig) => {
        if (!providerConfig.api) {
            return null;
        }
        // List of attributes
        const list = {};
        // Add icon name
        common.addAttr(list, 'icon', icon.iconToString(icon$1));
        // Generate code
        const code = generateCode(list, customisations);
        const result = {
            component: {
                'install-simple': installCode,
                'import-simple': importCode,
                'use-in-template': code,
            },
            isAPI: true,
            docs,
        };
        return result;
    };
    exports.reactParser = reactParser;
    /**
     * Code output for offline component
     */
    const reactOfflineParser = (icon, customisations, providerConfig) => {
        if (!providerConfig.npmCJS && !providerConfig.npmES) {
            return null;
        }
        // Variable name
        const varName = common.iconToVarName(icon.name);
        // Import statement
        const npmImport = common.npmIconImport(icon, varName, providerConfig, false);
        if (!npmImport) {
            return null;
        }
        // List of attributes
        const list = {};
        // Add icon name
        common.addReactAttr(list, 'icon', varName);
        // Generate code
        const code = generateCode(list, customisations);
        const result = {
            component: {
                'install-offline': installCode + ' ' + npmImport.package,
                'import-offline': importCode + '\n' + npmImport.code,
                'use-in-template': code,
            },
            isAPI: false,
            docs,
        };
        return result;
    };
    exports.reactOfflineParser = reactOfflineParser;

    });

    var svelte = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.svelteOfflineParser = exports.svelteParser = void 0;



    // Documentation links
    const docs = {
        type: 'svelte',
        href: common.docsBase + 'svelte/',
    };
    // Code cache
    const installCode = versions.getComponentInstall('svelte', true);
    const importCode = "import Icon from '" + versions.componentPackages.svelte.name + "';";
    /**
     * Add properties and generate code
     */
    function generateCode(list, customisations) {
        // Parse all customisations
        common.getCustomisationsList(customisations).forEach((attr) => {
            switch (attr) {
                case 'onlyHeight': {
                    const value = customisations.height;
                    common.addReactAttr(list, 'height', value);
                    break;
                }
                default:
                    common.addReactAttr(list, attr, customisations[attr]);
            }
        });
        return '<Icon ' + common.mergeAttributes(list) + ' />';
    }
    /**
     * Code output for API component
     */
    const svelteParser = (icon$1, customisations, providerConfig) => {
        if (!providerConfig.api) {
            return null;
        }
        // List of attributes
        const list = {};
        // Add icon name
        common.addAttr(list, 'icon', icon.iconToString(icon$1));
        // Generate code
        const code = generateCode(list, customisations);
        const result = {
            component: {
                'install-simple': installCode,
                'import-simple': importCode,
                'use-in-template': code,
            },
            isAPI: true,
            docs,
        };
        return result;
    };
    exports.svelteParser = svelteParser;
    /**
     * Code output for offline component
     */
    const svelteOfflineParser = (icon, customisations, providerConfig) => {
        if (!providerConfig.npmCJS && !providerConfig.npmES) {
            return null;
        }
        // Variable name
        const varName = common.iconToVarName(icon.name);
        // Import statement
        const npmImport = common.npmIconImport(icon, varName, providerConfig, false);
        if (!npmImport) {
            return null;
        }
        // List of attributes
        const list = {};
        // Add icon name
        common.addReactAttr(list, 'icon', varName);
        // Generate code
        const code = generateCode(list, customisations);
        const result = {
            component: {
                'install-offline': installCode + ' ' + npmImport.package,
                'import-offline': importCode + '\n' + npmImport.code,
                'use-in-template': code,
            },
            isAPI: false,
            docs,
        };
        return result;
    };
    exports.svelteOfflineParser = svelteOfflineParser;

    });

    var size = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.calculateSize = void 0;
    /**
     * Regular expressions for calculating dimensions
     */
    const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
    const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
    /**
     * Calculate second dimension when only 1 dimension is set
     *
     * @param {string|number} size One dimension (such as width)
     * @param {number} ratio Width/height ratio.
     *      If size is width, ratio = height/width
     *      If size is height, ratio = width/height
     * @param {number} [precision] Floating number precision in result to minimize output. Default = 2
     * @return {string|number} Another dimension
     */
    function calculateSize(size, ratio, precision) {
        if (ratio === 1) {
            return size;
        }
        precision = precision === void 0 ? 100 : precision;
        if (typeof size === 'number') {
            return Math.ceil(size * ratio * precision) / precision;
        }
        if (typeof size !== 'string') {
            return size;
        }
        // Split code into sets of strings and numbers
        const oldParts = size.split(unitsSplit);
        if (oldParts === null || !oldParts.length) {
            return size;
        }
        const newParts = [];
        let code = oldParts.shift();
        let isNumber = unitsTest.test(code);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (isNumber) {
                const num = parseFloat(code);
                if (isNaN(num)) {
                    newParts.push(code);
                }
                else {
                    newParts.push(Math.ceil(num * ratio * precision) / precision);
                }
            }
            else {
                newParts.push(code);
            }
            // next
            code = oldParts.shift();
            if (code === void 0) {
                return newParts.join('');
            }
            isNumber = !isNumber;
        }
    }
    exports.calculateSize = calculateSize;
    });

    var build = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.iconToSVG = void 0;

    /**
     * Get preserveAspectRatio value
     */
    function preserveAspectRatio(props) {
        let result = '';
        switch (props.hAlign) {
            case 'left':
                result += 'xMin';
                break;
            case 'right':
                result += 'xMax';
                break;
            default:
                result += 'xMid';
        }
        switch (props.vAlign) {
            case 'top':
                result += 'YMin';
                break;
            case 'bottom':
                result += 'YMax';
                break;
            default:
                result += 'YMid';
        }
        result += props.slice ? ' slice' : ' meet';
        return result;
    }
    /**
     * Get SVG attributes and content from icon + customisations
     *
     * Does not generate style to make it compatible with frameworks that use objects for style, such as React.
     * Instead, it generates 'inline' value. If true, rendering engine should add verticalAlign: -0.125em to icon.
     *
     * Customisations should be normalised by platform specific parser.
     * Result should be converted to <svg> by platform specific parser.
     * Use replaceIDs to generate unique IDs for body.
     */
    function iconToSVG(icon, customisations) {
        // viewBox
        const box = {
            left: icon.left,
            top: icon.top,
            width: icon.width,
            height: icon.height,
        };
        // Body
        let body = icon.body;
        // Apply transformations
        [icon, customisations].forEach((props) => {
            const transformations = [];
            const hFlip = props.hFlip;
            const vFlip = props.vFlip;
            let rotation = props.rotate;
            // Icon is flipped first, then rotated
            if (hFlip) {
                if (vFlip) {
                    rotation += 2;
                }
                else {
                    // Horizontal flip
                    transformations.push('translate(' +
                        (box.width + box.left) +
                        ' ' +
                        (0 - box.top) +
                        ')');
                    transformations.push('scale(-1 1)');
                    box.top = box.left = 0;
                }
            }
            else if (vFlip) {
                // Vertical flip
                transformations.push('translate(' +
                    (0 - box.left) +
                    ' ' +
                    (box.height + box.top) +
                    ')');
                transformations.push('scale(1 -1)');
                box.top = box.left = 0;
            }
            let tempValue;
            if (rotation < 0) {
                rotation -= Math.floor(rotation / 4) * 4;
            }
            rotation = rotation % 4;
            switch (rotation) {
                case 1:
                    // 90deg
                    tempValue = box.height / 2 + box.top;
                    transformations.unshift('rotate(90 ' + tempValue + ' ' + tempValue + ')');
                    break;
                case 2:
                    // 180deg
                    transformations.unshift('rotate(180 ' +
                        (box.width / 2 + box.left) +
                        ' ' +
                        (box.height / 2 + box.top) +
                        ')');
                    break;
                case 3:
                    // 270deg
                    tempValue = box.width / 2 + box.left;
                    transformations.unshift('rotate(-90 ' + tempValue + ' ' + tempValue + ')');
                    break;
            }
            if (rotation % 2 === 1) {
                // Swap width/height and x/y for 90deg or 270deg rotation
                if (box.left !== 0 || box.top !== 0) {
                    tempValue = box.left;
                    box.left = box.top;
                    box.top = tempValue;
                }
                if (box.width !== box.height) {
                    tempValue = box.width;
                    box.width = box.height;
                    box.height = tempValue;
                }
            }
            if (transformations.length) {
                body =
                    '<g transform="' +
                        transformations.join(' ') +
                        '">' +
                        body +
                        '</g>';
            }
        });
        // Calculate dimensions
        let width, height;
        if (customisations.width === null && customisations.height === null) {
            // Set height to '1em', calculate width
            height = '1em';
            width = size.calculateSize(height, box.width / box.height);
        }
        else if (customisations.width !== null &&
            customisations.height !== null) {
            // Values are set
            width = customisations.width;
            height = customisations.height;
        }
        else if (customisations.height !== null) {
            // Height is set
            height = customisations.height;
            width = size.calculateSize(height, box.width / box.height);
        }
        else {
            // Width is set
            width = customisations.width;
            height = size.calculateSize(width, box.height / box.width);
        }
        // Check for 'auto'
        if (width === 'auto') {
            width = box.width;
        }
        if (height === 'auto') {
            height = box.height;
        }
        // Convert to string
        width = typeof width === 'string' ? width : width + '';
        height = typeof height === 'string' ? height : height + '';
        // Result
        const result = {
            attributes: {
                width,
                height,
                preserveAspectRatio: preserveAspectRatio(customisations),
                viewBox: box.left + ' ' + box.top + ' ' + box.width + ' ' + box.height,
            },
            body,
        };
        if (customisations.inline) {
            result.inline = true;
        }
        return result;
    }
    exports.iconToSVG = iconToSVG;
    });

    var html = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderHTML = void 0;

    function renderHTML(icon, customisations, className) {
        const buildResult = build.iconToSVG(icon, customisations);
        // Style
        const style = [];
        if (customisations.inline) {
            style.push('vertical-align: -0.125em');
        }
        /*
        if (customisations.color !== '') {
            style.push('color: ' + customisations.color);
        }
        */
        const customAttributes = {};
        if (typeof className === 'string' && className !== '') {
            customAttributes['class'] = className;
        }
        if (style.length) {
            customAttributes['style'] = style.join('; ') + ';';
        }
        // Generate SVG attributes
        const attributes = {
            // Default SVG stuff
            'xmlns': 'http://www.w3.org/2000/svg',
            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
            'aria-hidden': 'true',
            'role': 'img',
            // Custom attributes
            ...customAttributes,
            // Attributes from build result
            ...buildResult.attributes,
        };
        // Replace color inside SVG
        let body = buildResult.body;
        if (customisations.color !== '') {
            body = body.replace(/currentColor/g, customisations.color);
        }
        // Generate HTML
        return ('<svg ' +
            Object.keys(attributes)
                .map((key) => {
                // There should be no quotes in content, so nothing to encode
                return key + '="' + attributes[key] + '"';
            })
                .join(' ') +
            '>' +
            body +
            '</svg>');
    }
    exports.renderHTML = renderHTML;

    });

    var svg = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.svgParser = void 0;



    /**
     * Code output for API component
     */
    function svgParser(lang, icon$1, customisations, providerConfig) {
        var _a;
        if (!providerConfig.raw) {
            return null;
        }
        const iconName = icon.iconToString(icon$1);
        const data = (_a = iconify.Iconify.getIcon) === null || _a === void 0 ? void 0 : _a.call(iconify.Iconify, iconName);
        if (!data) {
            return null;
        }
        let str = html.renderHTML(data, customisations);
        switch (lang) {
            case 'svg-box':
                // Add empty rectangle before shapes
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                str = str.replace('>', '><rect x="' +
                    data.left +
                    '" y="' +
                    data.top +
                    '" width="' +
                    data.width +
                    '" height="' +
                    data.height +
                    '" fill="none" stroke="none" />');
                break;
            case 'svg-uri': {
                // Remove unused attributes
                const parts = str.split('>');
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                let firstTag = parts.shift();
                ['aria-hidden', 'focusable', 'role', 'class', 'style'].forEach((attr) => {
                    firstTag = firstTag.replace(new RegExp('\\s' + attr + '="[^"]*"'), '');
                });
                parts.unshift(firstTag);
                str = parts.join('>');
                // Encode
                str = "url('data:image/svg+xml," + encodeURIComponent(str) + "')";
                break;
            }
        }
        const result = {
            raw: [str],
            isAPI: false,
        };
        return result;
    }
    exports.svgParser = svgParser;

    });

    var svgFramework = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.svgFrameworkParser = void 0;
    // Documentation links
    const docs = {
        type: 'iconify',
        href: common.docsBase + 'svg-framework/',
    };
    // Head section
    let head;
    /**
     * Code output for SVG Framework
     */
    const svgFrameworkParser = (icon$1, customisations, providerConfig) => {
        if (!providerConfig.api) {
            return null;
        }
        // List of attributes
        const list = {};
        // Add class
        common.addAttr(list, 'class', customisations.inline ? 'iconify-inline' : 'iconify');
        // Add icon name
        common.addAttr(list, 'data-icon', icon.iconToString(icon$1));
        // Parse all customisations
        common.getCustomisationsList(customisations).forEach((attr) => {
            switch (attr) {
                case 'inline':
                    break;
                // Color
                case 'color':
                    common.mergeAttr(list, 'style', 'color: ' + customisations[attr] + ';', ' ');
                    break;
                // Dimensions
                case 'width':
                    common.addAttr(list, 'data-width', common.toString(customisations[attr]));
                    break;
                case 'onlyHeight': {
                    const value = customisations.height;
                    common.mergeAttr(list, 'style', 'font-size: ' + value + (common.isNumber(value) ? 'px;' : ';'), ' ');
                    break;
                }
                case 'height':
                    common.addAttr(list, 'data-height', common.toString(customisations[attr]));
                    break;
                // Transformations
                case 'rotate':
                    common.addAttr(list, 'data-rotate', common.degrees(customisations[attr]));
                    break;
                case 'hFlip':
                    common.mergeAttr(list, 'data-flip', 'horizontal', ',');
                    break;
                case 'vFlip':
                    common.mergeAttr(list, 'data-flip', 'vertical', ',');
                    break;
                // Alignment
                case 'hAlign':
                case 'vAlign':
                    common.mergeAttr(list, 'data-align', customisations[attr], ',');
                    break;
                case 'slice':
                    common.mergeAttr(list, 'data-align', attr, ',');
                    break;
            }
        });
        // Generate HTML
        const html = '<span ' + common.mergeAttributes(list) + '></span>';
        // Head script
        if (head === void 0) {
            const str = iconify.Iconify.getVersion ? iconify.Iconify.getVersion() : versions.iconifyVersion;
            head =
                '<script src="https://code.iconify.design/' +
                    str.split('.').shift() +
                    '/' +
                    str +
                    '/iconify.min.js"><' +
                    '/script>';
        }
        const result = {
            iconify: {
                head,
                html,
            },
            isAPI: true,
            docs,
        };
        return result;
    };
    exports.svgFrameworkParser = svgFrameworkParser;

    });

    var vue = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.vueOfflineParser = exports.vueParser = void 0;



    // Documentation links
    const docs2 = {
        type: 'vue',
        href: common.docsBase + 'vue2/',
    };
    const docs3 = {
        type: 'vue',
        href: common.docsBase + 'vue/',
    };
    // Code cache
    const installCode2 = versions.getComponentInstall('vue2', true);
    const installCode3 = versions.getComponentInstall('vue3', true);
    const importCode2 = "import { Icon } from '" + versions.componentPackages.vue2.name + "';";
    const importCode3 = "import { Icon } from '" + versions.componentPackages.vue3.name + "';";
    const scriptCode = 'export default {\n\tcomponents: {\n\t\tIcon,\n\t},\n});';
    const scriptOfflineCode = 'export default {\n\tcomponents: {\n\t\tIcon,\n\t},\n\tdata() {\n\t\treturn {\n\t\t\ticons: {\n\t\t\t\t{varName},\n\t\t\t},\n\t\t};\n\t},\n});';
    /**
     * Add properties and generate code
     */
    function generateCode(list, customisations) {
        // Parse all customisations
        common.getCustomisationsList(customisations).forEach((attr) => {
            switch (attr) {
                case 'onlyHeight': {
                    const value = customisations.height;
                    common.addVueAttr(list, 'height', value);
                    break;
                }
                case 'hFlip':
                case 'vFlip':
                case 'hAlign':
                case 'vAlign': {
                    common.addVueAttr(list, (attr.slice(0, 1) === 'h' ? 'horizontal' : 'vertical') +
                        attr.slice(1), customisations[attr]);
                    break;
                }
                default:
                    common.addVueAttr(list, attr, customisations[attr]);
            }
        });
        return '<Icon ' + common.mergeAttributes(list) + ' />';
    }
    /**
     * Code output for API component
     */
    function vueParser(vue3, icon$1, customisations, providerConfig) {
        if (!providerConfig.api) {
            return null;
        }
        // List of attributes
        const list = {};
        // Add icon name
        common.addAttr(list, 'icon', icon.iconToString(icon$1));
        // Generate code
        const code = generateCode(list, customisations);
        const result = {
            component: {
                'install-simple': vue3 ? installCode3 : installCode2,
                'import-simple': vue3 ? importCode3 : importCode2,
                'use-in-template': code,
                'vue-simple': scriptCode,
            },
            isAPI: true,
            docs: vue3 ? docs3 : docs2,
        };
        return result;
    }
    exports.vueParser = vueParser;
    /**
     * Code output for offline component
     */
    function vueOfflineParser(vue3, icon, customisations, providerConfig) {
        if (!providerConfig.npmCJS && !providerConfig.npmES) {
            return null;
        }
        // Variable name
        const varName = common.iconToVarName(icon.name);
        // Import statement
        const npmImport = common.npmIconImport(icon, varName, providerConfig, vue3);
        if (!npmImport) {
            return null;
        }
        // List of attributes
        const list = {};
        // Add icon name
        common.addVueAttr(list, 'icon', 'icons.' + varName);
        // Generate code
        const code = generateCode(list, customisations);
        const result = {
            component: {
                'install-offline': (vue3 ? installCode3 : installCode2) + ' ' + npmImport.package,
                'import-offline': (vue3 ? importCode3 : importCode2) + '\n' + npmImport.code,
                'use-in-template': code,
                'vue-offline': scriptOfflineCode.replace('{varName}', varName),
            },
            isAPI: false,
            docs: vue3 ? docs3 : docs2,
        };
        return result;
    }
    exports.vueOfflineParser = vueOfflineParser;

    });

    var code = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIconCode = exports.codeOutputComponentKeys = void 0;
    /**
     * Output
     */
    exports.codeOutputComponentKeys = [
        'install-simple',
        'install-addon',
        'install-offline',
        'import-simple',
        'import-offline',
        'vue-simple',
        'vue-offline',
        // Usage
        'use-in-code',
        'use-in-template',
        'use-in-html',
        'use-generic',
    ];
    /**
     * Get code for icon
     */
    function getIconCode(lang, icon, customisations, providerConfig) {
        let parser;
        switch (lang) {
            // SVG Framework
            case 'iconify':
                parser = svgFramework.svgFrameworkParser;
                break;
            // CSS
            case 'css':
                parser = css.cssParser;
                break;
            // React
            case 'react-api':
                parser = react.reactParser;
                break;
            case 'react-offline':
                parser = react.reactOfflineParser;
                break;
            // Vue
            case 'vue2-api':
                parser = vue.vueParser.bind(null, false);
                break;
            case 'vue2-offline':
                parser = vue.vueOfflineParser.bind(null, false);
                break;
            case 'vue3-api':
                parser = vue.vueParser.bind(null, true);
                break;
            case 'vue3-offline':
                parser = vue.vueOfflineParser.bind(null, true);
                break;
            // Svelte
            case 'svelte-api':
                parser = svelte.svelteParser;
                break;
            case 'svelte-offline':
                parser = svelte.svelteOfflineParser;
                break;
            // Ember
            case 'ember':
                parser = ember.emberParser;
                break;
            // SVG
            case 'svg-box':
            case 'svg-raw':
            case 'svg-uri':
                parser = svg.svgParser.bind(null, lang);
                break;
            default:
                return null;
        }
        return parser(icon, customisations, providerConfig);
    }
    exports.getIconCode = getIconCode;

    });

    /* src/icon-finder/components/content/footers/parts/code/Sample.svelte generated by Svelte v3.42.1 */

    function create_if_block_1$2(ctx) {
    	let a;
    	let uiicon;
    	let a_title_value;
    	let current;
    	let mounted;
    	let dispose;
    	uiicon = new UIIcon({ props: { icon: "clipboard" } });

    	return {
    		c() {
    			a = element("a");
    			create_component(uiicon.$$.fragment);
    			attr(a, "title", a_title_value = /*text*/ ctx[4].copy);
    			attr(a, "href", "# ");
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			mount_component(uiicon, a, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(a, "click", prevent_default(/*copy*/ ctx[5]));
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

    // (78:1) {#if mounted && notice > 0}
    function create_if_block$4(ctx) {
    	let div;
    	let uiicon;
    	let t0;
    	let t1_value = /*text*/ ctx[4].copied + "";
    	let t1;
    	let div_class_value;
    	let current;
    	uiicon = new UIIcon({ props: { icon: "confirm" } });

    	return {
    		c() {
    			div = element("div");
    			create_component(uiicon.$$.fragment);
    			t0 = space();
    			t1 = text(t1_value);
    			attr(div, "class", div_class_value = baseClassName + '-notice');
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

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	let if_block0 = /*mounted*/ ctx[3] && create_if_block_1$2(ctx);
    	let if_block1 = /*mounted*/ ctx[3] && /*notice*/ ctx[1] > 0 && create_if_block$4(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*content*/ ctx[0]);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr(div0, "class", baseClassName + '-content');
    			attr(div1, "class", /*className*/ ctx[2]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, t0);
    			append(div1, t1);
    			if (if_block0) if_block0.m(div1, null);
    			append(div1, t2);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*content*/ 1) set_data(t0, /*content*/ ctx[0]);

    			if (/*mounted*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*mounted*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*mounted*/ ctx[3] && /*notice*/ ctx[1] > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*mounted, notice*/ 10) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*className*/ 4) {
    				attr(div1, "class", /*className*/ ctx[2]);
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
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    const baseClassName = 'iif-input-sample';

    function instance$5($$self, $$props, $$invalidate) {
    	let { content } = $$props;
    	const text = phrases$1.codeSamples;

    	// Notice counter
    	let notice = 0;

    	let className = baseClassName;

    	/**
     * Copy code to clipboard
     */
    	function copy() {
    		const node = document.body;
    		const textarea = document.createElement('textarea');
    		const style = textarea.style;
    		textarea.value = content;
    		style.position = 'absolute';

    		try {
    			style.left = window.pageXOffset + 'px';
    			style.top = window.pageYOffset + 'px';
    		} catch(err) {
    			
    		}

    		style.height = '0';
    		node.appendChild(textarea);
    		textarea.focus();
    		textarea.select();
    		let copied = false;

    		try {
    			// Modern way
    			if (!document.execCommand || !document.execCommand('copy')) {
    				const w = window;

    				if (w.clipboardData) {
    					w.clipboardData.setData('Text', content);
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

    	// SSR render
    	let mounted = false;

    	onMount(() => {
    		$$invalidate(3, mounted = true);
    	});

    	$$self.$$set = $$props => {
    		if ('content' in $$props) $$invalidate(0, content = $$props.content);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*notice*/ 2) {
    			{
    				$$invalidate(2, className = baseClassName + (notice > 0 ? ' ' + baseClassName + '--with-notice' : ''));
    			}
    		}
    	};

    	return [content, notice, className, mounted, text, copy];
    }

    class Sample extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { content: 0 });
    	}
    }

    /* src/icon-finder/components/content/footers/parts/code/Code.svelte generated by Svelte v3.42.1 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (69:0) {#if output}
    function create_if_block$3(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let if_block6_anchor;
    	let current;
    	let if_block0 = /*output*/ ctx[2].header && create_if_block_11(ctx);
    	let if_block1 = /*codePhrases*/ ctx[5].intro[/*mode*/ ctx[1]] && create_if_block_10(ctx);
    	let if_block2 = /*output*/ ctx[2].iconify && create_if_block_9(ctx);
    	let if_block3 = /*output*/ ctx[2].raw && create_if_block_8$1(ctx);
    	let if_block4 = /*output*/ ctx[2].component && create_if_block_5$1(ctx);
    	let if_block5 = /*output*/ ctx[2].footer && create_if_block_2$2(ctx);
    	let if_block6 = /*output*/ ctx[2].docs && create_if_block_1$1(ctx);

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
    			if_block6_anchor = empty();
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
    					if_block0 = create_if_block_11(ctx);
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
    					if_block1 = create_if_block_10(ctx);
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
    					if_block2 = create_if_block_9(ctx);
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
    					if_block3 = create_if_block_8$1(ctx);
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
    					if_block5 = create_if_block_2$2(ctx);
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
    					if_block6 = create_if_block_1$1(ctx);
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

    // (70:1) {#if output.header}
    function create_if_block_11(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*output*/ ctx[2].header.text && create_if_block_13(ctx);
    	let if_block1 = /*output*/ ctx[2].header.code && create_if_block_12(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
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
    					if_block0 = create_if_block_13(ctx);
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
    					if_block1 = create_if_block_12(ctx);
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

    // (71:2) {#if output.header.text}
    function create_if_block_13(ctx) {
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

    // (74:2) {#if output.header.code}
    function create_if_block_12(ctx) {
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

    // (79:1) {#if codePhrases.intro[mode]}
    function create_if_block_10(ctx) {
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

    // (83:1) {#if output.iconify}
    function create_if_block_9(ctx) {
    	let p0;
    	let t0_value = /*codePhrases*/ ctx[5].iconify.intro1.replace('{name}', /*icon*/ ctx[0].name) + "";
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
    			if ((!current || dirty & /*icon*/ 1) && t0_value !== (t0_value = /*codePhrases*/ ctx[5].iconify.intro1.replace('{name}', /*icon*/ ctx[0].name) + "")) set_data(t0, t0_value);
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

    // (91:1) {#if output.raw}
    function create_if_block_8$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*output*/ ctx[2].raw;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
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
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
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

    // (92:2) {#each output.raw as code}
    function create_each_block_1(ctx) {
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

    // (97:1) {#if output.component}
    function create_if_block_5$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = code.codeOutputComponentKeys;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
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
    				each_value = code.codeOutputComponentKeys;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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

    // (99:3) {#if output.component[key]}
    function create_if_block_6$1(ctx) {
    	let t;
    	let sampleinput;
    	let current;
    	let if_block = /*codePhrases*/ ctx[5].component[/*key*/ ctx[9]] && create_if_block_7$1(ctx);

    	sampleinput = new Sample({
    			props: {
    				content: /*output*/ ctx[2].component[/*key*/ ctx[9]]
    			}
    		});

    	return {
    		c() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(sampleinput.$$.fragment);
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t, anchor);
    			mount_component(sampleinput, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*codePhrases*/ ctx[5].component[/*key*/ ctx[9]]) if_block.p(ctx, dirty);
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(t);
    			destroy_component(sampleinput, detaching);
    		}
    	};
    }

    // (100:4) {#if codePhrases.component[key]}
    function create_if_block_7$1(ctx) {
    	let p;
    	let t_value = /*codePhrases*/ ctx[5].component[/*key*/ ctx[9]] + "";
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
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(p);
    		}
    	};
    }

    // (98:2) {#each codeOutputComponentKeys as key}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*output*/ ctx[2].component[/*key*/ ctx[9]] && create_if_block_6$1(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
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

    // (108:1) {#if output.footer}
    function create_if_block_2$2(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*output*/ ctx[2].footer.text && create_if_block_4$1(ctx);
    	let if_block1 = /*output*/ ctx[2].footer.code && create_if_block_3$1(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
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
    					if_block0 = create_if_block_4$1(ctx);
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
    					if_block1 = create_if_block_3$1(ctx);
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

    // (109:2) {#if output.footer.text}
    function create_if_block_4$1(ctx) {
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

    // (112:2) {#if output.footer.code}
    function create_if_block_3$1(ctx) {
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

    // (117:1) {#if output.docs}
    function create_if_block_1$1(ctx) {
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
    	uiicon0 = new UIIcon({ props: { icon: "docs" } });
    	uiicon1 = new UIIcon({ props: { icon: "link" } });

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

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*output*/ ctx[2] && create_if_block$3(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	
    	
    	
    	
    	
    	let { icon } = $$props;
    	let { customisations } = $$props;
    	let { providerConfig } = $$props;
    	let { mode } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	// Callback for external link
    	const onExternalClick = registry.link;

    	// Get text
    	const codePhrases = phrases$1.codeSamples;

    	// Get mode specific data and text
    	/*
        Actual type: "CodeOutput | null", but Svelte language tools cannot handle nested conditional
        statements in template, so intentionally using wrong type to get rid of warnings.
    */
    	let output;

    	let docsText;

    	$$self.$$set = $$props => {
    		if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
    		if ('customisations' in $$props) $$invalidate(6, customisations = $$props.customisations);
    		if ('providerConfig' in $$props) $$invalidate(7, providerConfig = $$props.providerConfig);
    		if ('mode' in $$props) $$invalidate(1, mode = $$props.mode);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*mode, icon, customisations, providerConfig, output*/ 199) {
    			{
    				$$invalidate(2, output = code.getIconCode(mode, icon, customisations, providerConfig));

    				// Get title for docs
    				if (output && output.docs) {
    					const docsType = output.docs.type;

    					$$invalidate(3, docsText = codePhrases.docs[docsType]
    					? codePhrases.docs[docsType]
    					: codePhrases.docsDefault.replace('{title}', phrases.capitalizeCodeSampleTitle(docsType)));
    				} else {
    					$$invalidate(3, docsText = '');
    				}

    				// Add line-md stylesheet
    				if (mode !== 'svg-uri') {
    					// Add link to footer
    					$$invalidate(
    						2,
    						output.footer = {
    							text: 'Do not forget to add stylesheet to your page if you want animated icons:',
    							code: '<link rel="stylesheet" href="https://code.iconify.design/css/line-md.css">'
    						},
    						output
    					);

    					// Modify code
    					if (output.component) {
    						if (typeof output.component.use === 'string') {
    							// Add class
    							$$invalidate(
    								2,
    								output.component.use = output.component.use.// Rect and Svelte
    								replace('Icon icon={', 'Icon class' + (mode === 'svelte' ? '' : 'Name') + '="iconify--line-md" icon={').// Vue
    								replace('Icon :icon', 'Icon class="iconify--line-md" :icon'),
    								output
    							);
    						}
    					}
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

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			icon: 0,
    			customisations: 6,
    			providerConfig: 7,
    			mode: 1
    		});
    	}
    }

    /* src/icon-finder/components/content/footers/parts/code/Container.svelte generated by Svelte v3.42.1 */

    function create_if_block$2(ctx) {
    	let footerblock;
    	let current;

    	footerblock = new FooterBlock({
    			props: {
    				name: "code",
    				title: /*codePhrases*/ ctx[6].heading.replace('{name}', /*icon*/ ctx[0].name),
    				titleHidden: /*codePhrases*/ ctx[6].headingHidden.replace('{name}', /*icon*/ ctx[0].name),
    				$$slots: { default: [create_default_slot$2] },
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
    			if (dirty & /*icon*/ 1) footerblock_changes.title = /*codePhrases*/ ctx[6].heading.replace('{name}', /*icon*/ ctx[0].name);
    			if (dirty & /*icon*/ 1) footerblock_changes.titleHidden = /*codePhrases*/ ctx[6].headingHidden.replace('{name}', /*icon*/ ctx[0].name);

    			if (dirty & /*$$scope, currentTab, icon, customisations, childFilters, childTabsTitle, parentFilters*/ 32831) {
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

    // (265:4) {#if parentFilters}
    function create_if_block_2$1(ctx) {
    	let filterscomponent;
    	let current;

    	filterscomponent = new Filters({
    			props: {
    				name: "code",
    				block: /*parentFilters*/ ctx[3],
    				onClick: /*changeTab*/ ctx[8]
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
    			if (dirty & /*parentFilters*/ 8) filterscomponent_changes.block = /*parentFilters*/ ctx[3];
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

    // (271:4) {#if childFilters}
    function create_if_block_1(ctx) {
    	let filterscomponent;
    	let current;

    	filterscomponent = new Filters({
    			props: {
    				name: "code",
    				block: /*childFilters*/ ctx[4],
    				onClick: /*changeTab*/ ctx[8],
    				title: /*childTabsTitle*/ ctx[5]
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
    			if (dirty & /*childFilters*/ 16) filterscomponent_changes.block = /*childFilters*/ ctx[4];
    			if (dirty & /*childTabsTitle*/ 32) filterscomponent_changes.title = /*childTabsTitle*/ ctx[5];
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

    // (259:1) <FooterBlock   name="code"   title={codePhrases.heading.replace('{name}', icon.name)}   titleHidden={codePhrases.headingHidden.replace('{name}', icon.name)}>
    function create_default_slot$2(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let codecomponent;
    	let current;
    	let if_block0 = /*parentFilters*/ ctx[3] && create_if_block_2$1(ctx);
    	let if_block1 = /*childFilters*/ ctx[4] && create_if_block_1(ctx);

    	codecomponent = new Code({
    			props: {
    				mode: /*currentTab*/ ctx[2],
    				icon: /*icon*/ ctx[0],
    				customisations: /*customisations*/ ctx[1],
    				providerConfig: /*getProviderData*/ ctx[7](/*icon*/ ctx[0].provider).config
    			}
    		});

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			create_component(codecomponent.$$.fragment);
    			attr(div0, "class", "iif-filters");
    			attr(div1, "class", "iif-code");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t0);
    			if (if_block1) if_block1.m(div0, null);
    			append(div1, t1);
    			mount_component(codecomponent, div1, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*parentFilters*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*parentFilters*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
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

    			if (/*childFilters*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*childFilters*/ 16) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const codecomponent_changes = {};
    			if (dirty & /*currentTab*/ 4) codecomponent_changes.mode = /*currentTab*/ ctx[2];
    			if (dirty & /*icon*/ 1) codecomponent_changes.icon = /*icon*/ ctx[0];
    			if (dirty & /*customisations*/ 2) codecomponent_changes.customisations = /*customisations*/ ctx[1];
    			if (dirty & /*icon*/ 1) codecomponent_changes.providerConfig = /*getProviderData*/ ctx[7](/*icon*/ ctx[0].provider).config;
    			codecomponent.$set(codecomponent_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(codecomponent.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(codecomponent.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(codecomponent);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*currentTab*/ ctx[2] && create_if_block$2(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*currentTab*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*currentTab*/ 4) {
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

    function instance$3($$self, $$props, $$invalidate) {
    	
    	
    	
    	
    	
    	let { icon } = $$props;
    	let { customisations } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	const codePhrases = phrases$1.codeSamples;
    	const componentsConfig = registry.config.components;

    	// Cache
    	const providerCache = Object.create(null);

    	const data = {
    		lastProvider: null,
    		lastParent: null,
    		lastChild: null
    	};

    	// Currently selected tab
    	let currentTab;

    	// Filters
    	let parentFilters = null;

    	let childFilters = null;
    	let childTabsTitle = '';

    	/**
     * Get data for provider
     */
    	function getProviderData(provider) {
    		if (providerCache[provider] === void 0) {
    			// Update cached data
    			const config = codeConfig.providers[provider] === void 0
    			? codeConfig.defaultProvider
    			: codeConfig.providers[provider];

    			const tree$1 = tree.getCodeSamplesTree(config);

    			// Disable CSS and SVG as URI
    			for (let i = 0; i < tree$1.length; i++) {
    				const tab = tree$1[i];

    				switch (tab.tab) {
    					case 'html':
    						// Disable CSS: move first child as root
    						tree$1[i] = tab.children[0];
    						break;
    					case 'svg':
    						// Remove SVG as URI
    						tab.children = tab.children.filter(item => item.mode !== 'svg-uri');
    						break;
    				}
    			}

    			providerCache[provider] = { config, tree: tree$1 };
    		}

    		return providerCache[provider];
    	}

    	/**
     * Update current tab
     */
    	function updateCurrentTab(item) {
    		function createFilters(items, active, startIndex = 0) {
    			if (items.length < 2) {
    				return null;
    			}

    			const block = {
    				type: 'filters',
    				filterType: 'code-tabs',
    				active,
    				filters: Object.create(null)
    			};

    			for (let i = 0; i < items.length; i++) {
    				const item = items[i];
    				const key = item.tab ? item.tab : item.mode;
    				block.filters[key] = { title: item.title, index: i + startIndex };
    			}

    			return block;
    		}

    		const tab = item.tab;

    		if (currentTab !== tab) {
    			// Change tab
    			$$invalidate(2, currentTab = $$invalidate(9, componentsConfig.codeTab = tab, componentsConfig));

    			// UIConfigEvent
    			registry.callback({ type: 'config' });
    		} else if (data.lastParent === item.parent && data.lastParent === item.child) {
    			// Nothing to change
    			return;
    		}

    		if (tab === '') {
    			// Nothing to display
    			$$invalidate(3, parentFilters = $$invalidate(4, childFilters = $$invalidate(10, data.lastChild = $$invalidate(10, data.lastParent = null, data), data)));

    			return;
    		}

    		// Update filters
    		const providerData = getProviderData(icon.provider);

    		const tree = providerData.tree;
    		const parent = item.parent; // Cannot be empty
    		const child = item.child;

    		if (data.lastParent === parent) {
    			// Only change active tab
    			if (parentFilters) {
    				$$invalidate(3, parentFilters.active = parent.tab ? parent.tab : parent.mode, parentFilters);
    			}
    		} else {
    			// Create new filters
    			$$invalidate(3, parentFilters = createFilters(tree, parent.tab ? parent.tab : parent.mode));
    		}

    		// Child filters
    		if (data.lastChild === child) {
    			// Only change active tab
    			if (childFilters) {
    				$$invalidate(4, childFilters.active = child.mode, childFilters);
    			}
    		} else {
    			// Create new child filters
    			$$invalidate(4, childFilters = child
    			? createFilters(parent.children, child.mode, item.parentIndex + 1)
    			: null);
    		}

    		// Update text
    		if (childFilters && parentFilters) {
    			const key = parent.tab;

    			$$invalidate(5, childTabsTitle = codePhrases.childTabTitles[key] === void 0
    			? codePhrases.childTabTitle.replace('{key}', key)
    			: codePhrases.childTabTitles[key]);
    		} else {
    			$$invalidate(5, childTabsTitle = '');
    		}

    		// Store last items to avoid re-rendering if items do not change
    		$$invalidate(10, data.lastParent = parent, data);

    		$$invalidate(10, data.lastChild = child, data);
    	}

    	/**
     * Check currentTab, return new value
     */
    	function checkCurrentTab(tab, useDefault) {
    		const providerData = getProviderData(icon.provider);
    		const tree = providerData.tree;

    		if (typeof tab === 'string') {
    			for (let parentIndex = 0; parentIndex < tree.length; parentIndex++) {
    				const parent = tree[parentIndex];

    				if (parent.mode === tab || parent.tab === tab) {
    					if (parent.children) {
    						// Has children: return first child
    						const child = parent.children[0];

    						return {
    							tab: child.mode,
    							parent,
    							parentIndex,
    							child
    						};
    					}

    					// No children, must have mode
    					return {
    						tab: parent.mode,
    						parent,
    						parentIndex,
    						child: null
    					};
    				}

    				// Check children
    				if (parent.children) {
    					for (let j = 0; j < parent.children.length; j++) {
    						const child = parent.children[j];

    						if (child.mode === tab) {
    							return { tab, parent, parentIndex, child };
    						}
    					}
    				}
    			}
    		}

    		// No match: use first item
    		if (useDefault) {
    			const parent = tree[0];

    			if (!parent) {
    				// No modes available
    				return {
    					tab: '',
    					parent: null,
    					parentIndex: 0,
    					child: null
    				};
    			}

    			if (parent.children) {
    				// Has child items: use first item
    				const child = parent.children[0];

    				return {
    					tab: child.mode,
    					parent,
    					parentIndex: 0,
    					child
    				};
    			}

    			// Tab without children
    			return {
    				tab: parent.mode,
    				parent,
    				parentIndex: 0,
    				child: null
    			};
    		}

    		return {
    			tab: '',
    			parent: null,
    			parentIndex: 0,
    			child: null
    		};
    	}

    	// Change current tab
    	function changeTab(tab) {
    		const item = checkCurrentTab(tab, false);

    		if (item.tab === currentTab || item.tab === '' && currentTab !== '') {
    			// Do not change tab if it wasn't changed or if it doesn't exist
    			return;
    		}

    		updateCurrentTab(item);
    	}

    	$$self.$$set = $$props => {
    		if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
    		if ('customisations' in $$props) $$invalidate(1, customisations = $$props.customisations);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon, data, currentTab, componentsConfig*/ 1541) {
    			// API provider for current icon
    			{
    				const provider = icon.provider;

    				if (provider !== data.lastProvider) {
    					// Changed API provider
    					$$invalidate(10, data.lastProvider = provider, data);

    					getProviderData(provider);

    					// Get current tab
    					let tab = typeof currentTab !== 'string'
    					? componentsConfig.codeTab
    					: currentTab;

    					// Update current tab
    					updateCurrentTab(checkCurrentTab(tab, true));
    				}
    			}
    		}
    	};

    	return [
    		icon,
    		customisations,
    		currentTab,
    		parentFilters,
    		childFilters,
    		childTabsTitle,
    		codePhrases,
    		getProviderData,
    		changeTab,
    		componentsConfig,
    		data
    	];
    }

    class Container$1 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { icon: 0, customisations: 1 });
    	}
    }

    /* src/icon-finder/components/content/footers/Full.svelte generated by Svelte v3.42.1 */

    function create_if_block$1(ctx) {
    	let block;
    	let current;

    	block = new Block({
    			props: {
    				type: "footer",
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

    // (103:3) {#if icon}
    function create_if_block_7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_8, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*customisations*/ ctx[2].inline) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
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
    				} else {
    					if_block.p(ctx, dirty);
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

    // (106:4) {:else}
    function create_else_block(ctx) {
    	let sample;
    	let current;

    	sample = new Full$1({
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

    // (104:4) {#if customiseInline && customisations.inline}
    function create_if_block_8(ctx) {
    	let inlinesample;
    	let current;

    	inlinesample = new Inline({
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

    // (113:23) 
    function create_if_block_6(ctx) {
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

    // (111:4) {#if icon}
    function create_if_block_5(ctx) {
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

    // (116:4) {#if infoBlock}
    function create_if_block_4(ctx) {
    	let footerblock;
    	let current;

    	footerblock = new FooterBlock({
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

    // (117:5) <FooterBlock name="info" title={infoBlockTitle}>
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

    // (125:4) {#if showCustomisatons && hasIcons}
    function create_if_block_3(ctx) {
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

    // (128:4) {#if showCode && icon}
    function create_if_block_2(ctx) {
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

    // (101:1) <Block type="footer">
    function create_default_slot$1(ctx) {
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
    	let if_block0 = /*icon*/ ctx[4] && create_if_block_7(ctx);
    	const if_block_creators = [create_if_block_5, create_if_block_6];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*icon*/ ctx[4]) return 0;
    		if (/*hasIcons*/ ctx[5]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block2 = /*infoBlock*/ ctx[6] && create_if_block_4(ctx);
    	let if_block3 = /*hasIcons*/ ctx[5] && create_if_block_3(ctx);
    	let if_block4 = /*icon*/ ctx[4] && create_if_block_2(ctx);
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
    			attr(div0, "class", div0_class_value = /*icon*/ ctx[4] ? 'iif-footer-full-content' : '');
    			attr(div1, "class", div1_class_value = /*icon*/ ctx[4] ? 'iif-footer-full' : '');
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
    					if_block0 = create_if_block_7(ctx);
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
    					} else {
    						if_block1.p(ctx, dirty);
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
    					if_block2 = create_if_block_4(ctx);
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

    			if (/*hasIcons*/ ctx[5]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*hasIcons*/ 32) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_3(ctx);
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

    			if (/*icon*/ ctx[4]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty & /*icon*/ 16) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_2(ctx);
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

    			if (!current || dirty & /*icon*/ 16 && div0_class_value !== (div0_class_value = /*icon*/ ctx[4] ? 'iif-footer-full-content' : '')) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*icon*/ 16 && div1_class_value !== (div1_class_value = /*icon*/ ctx[4] ? 'iif-footer-full' : '')) {
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

    function create_fragment$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*hasIcons*/ ctx[5]) && create_if_block$1(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*hasIcons*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*hasIcons*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
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

    function instance$2($$self, $$props, $$invalidate) {
    	
    	
    	
    	let { icons } = $$props;
    	let { customise } = $$props;
    	let { customisations } = $$props;
    	let { route } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	// Check if icons are selected, get first icon
    	let icon;

    	let hasIcons;

    	// Check if info block should be shown
    	let infoBlock;

    	let infoBlockTitle;

    	$$self.$$set = $$props => {
    		if ('icons' in $$props) $$invalidate(0, icons = $$props.icons);
    		if ('customise' in $$props) $$invalidate(1, customise = $$props.customise);
    		if ('customisations' in $$props) $$invalidate(2, customisations = $$props.customisations);
    		if ('route' in $$props) $$invalidate(3, route = $$props.route);
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
    				let provider = '';

    				let prefix = '';

    				{
    					// Disabled
    					showInfo = false;
    				}

    				// Check route
    				if (showInfo && route.type === 'collection' && provider === route.params.provider && prefix === route.params.prefix) {
    					// Already showing info for the same icon set above icons list
    					showInfo = false;
    				}

    				// Get data
    				if (showInfo) {
    					const info = lib.getCollectionInfo(registry.collections, provider, prefix);

    					if (!info) {
    						$$invalidate(6, infoBlock = null);
    						$$invalidate(7, infoBlockTitle = '');
    					} else {
    						$$invalidate(6, infoBlock = { type: 'collection-info', prefix, info });
    						$$invalidate(7, infoBlockTitle = phrases$1.footer.about.replace('{title}', info.name));
    					}
    				} else {
    					$$invalidate(6, infoBlock = null);
    					$$invalidate(7, infoBlockTitle = '');
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

    class Full extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			icons: 0,
    			customise: 1,
    			customisations: 2,
    			route: 3
    		});
    	}
    }

    /* src/icon-finder/components/content/Footer.svelte generated by Svelte v3.42.1 */

    function create_fragment$1(ctx) {
    	let footer;
    	let current;

    	footer = new Full({
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

    function instance$1($$self, $$props, $$invalidate) {
    	
    	
    	
    	
    	
    	let { selection } = $$props;
    	let { selectionLength } = $$props;
    	let { customisations } = $$props;
    	let { route } = $$props;

    	// Registry
    	const registry = getContext('registry');

    	// Change icon customisation value
    	function customise(prop, value) {
    		// Convert empty width/height to null
    		switch (prop) {
    			case 'width':
    			case 'height':
    				if (value === '' || value === 0) {
    					value = null;
    				}
    				break;
    		}

    		if (customisations[prop] !== void 0 && customisations[prop] !== value) {
    			// Change value then change object to force Svelte update components
    			const changed = { [prop]: value };

    			// Send event: UICustomisationEvent
    			registry.callback({
    				type: 'customisation',
    				changed,
    				customisations: Object.assign(Object.assign({}, customisations), changed)
    			});
    		}
    	}

    	// Event listener
    	let mounted = false;

    	let updateCounter = 0;
    	let abortLoader = null;

    	function loadingEvent() {
    		$$invalidate(7, updateCounter++, updateCounter);
    	}

    	onMount(() => {
    		$$invalidate(6, mounted = true);
    	});

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
    		if ('selection' in $$props) $$invalidate(4, selection = $$props.selection);
    		if ('selectionLength' in $$props) $$invalidate(5, selectionLength = $$props.selectionLength);
    		if ('customisations' in $$props) $$invalidate(0, customisations = $$props.customisations);
    		if ('route' in $$props) $$invalidate(1, route = $$props.route);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*updateCounter, selectionLength, selection, icons, abortLoader, pending, mounted*/ 1012) {
    			{

    				// Filter icons
    				$$invalidate(2, icons = []);

    				const newPending = [];
    				const toLoad = [];
    				const list = selectionLength ? selectionToArray(selection) : [];

    				list.forEach(icon => {
    					var _a;
    					const name = lib.iconToString(icon);

    					if ((_a = iconify.Iconify.getIcon) === null || _a === void 0
    					? void 0
    					: _a.call(iconify.Iconify, name)) {
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

    				// Update pending list and load icons after component is mounted
    				$$invalidate(9, pending = newPending);

    				if (toLoad.length && mounted) {
    					// Load new icons
    					if (abortLoader !== null) {
    						abortLoader();
    					}

    					$$invalidate(8, abortLoader = loadIcons(toLoad, loadingEvent));
    				}
    			}
    		}
    	};

    	return [
    		customisations,
    		route,
    		icons,
    		customise,
    		selection,
    		selectionLength,
    		mounted,
    		updateCounter,
    		abortLoader,
    		pending
    	];
    }

    class Footer_1 extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			selection: 4,
    			selectionLength: 5,
    			customisations: 0,
    			route: 1
    		});
    	}
    }

    /* src/icon-finder/components/Container.svelte generated by Svelte v3.42.1 */

    function create_if_block(ctx) {
    	let wrapper;
    	let current;

    	wrapper = new Wrapper$1({
    			props: {
    				$$slots: { default: [create_default_slot] },
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
    function create_default_slot(ctx) {
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

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*hidden*/ ctx[3] !== true && create_if_block(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
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
    					if_block = create_if_block(ctx);
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

    function instance($$self, $$props, $$invalidate) {
    	
    	
    	
    	
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
    	setContext('registry', registry);

    	$$self.$$set = $$props => {
    		if ('registry' in $$props) $$invalidate(8, registry = $$props.registry);
    		if ('selection' in $$props) $$invalidate(0, selection = $$props.selection);
    		if ('selectionLength' in $$props) $$invalidate(1, selectionLength = $$props.selectionLength);
    		if ('customisations' in $$props) $$invalidate(2, customisations = $$props.customisations);
    		if ('hidden' in $$props) $$invalidate(3, hidden = $$props.hidden);
    		if ('viewChanged' in $$props) $$invalidate(4, viewChanged = $$props.viewChanged);
    		if ('error' in $$props) $$invalidate(5, error = $$props.error);
    		if ('route' in $$props) $$invalidate(6, route = $$props.route);
    		if ('blocks' in $$props) $$invalidate(7, blocks = $$props.blocks);
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

    class Container extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance, create_fragment, safe_not_equal, {
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-empty-function
    function assertNever(s) { }
    // Set SVG framework
    // getVersion() will will use hardcoded version number generated when building core
    const functions = {
        getIcon,
        addCollection,
        getAPI: _api.getAPI,
        addAPIProvider,
    };
    lib.setIconify(functions);
    // Import theme icons
    importThemeIcons();
    // Add components configuration to config object
    lib.setComponentsConfig(defaultComponentsConfig);
    /**
     * Wrapper class
     */
    class Wrapper {
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
            disableCache('all');
            // Init core
            const core = (this._core = new lib.IconFinderCore(coreParams));
            const registry = (this._registry = core.registry);
            // Enable synchronous loading
            registry.config.router.syncRender = true;
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
                customisations: customisations.mergeCustomisations(customisations.defaultCustomisations, state.customisations ? state.customisations : {}),
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
            return new Container(params);
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
                const customisations$1 = customisations.mergeCustomisations(customisations.defaultCustomisations, state.customisations);
                if (customisations$1.inline) {
                    customisations$1.inline = false;
                    changed = true;
                }
                if (changed) {
                    this._setCustomisations(customisations$1);
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
        _setCustomisations(customisations$1) {
            const state = this._state;
            if (state.customisations !== void 0 &&
                lib.compareObjects(state.customisations, customisations$1)) {
                return false;
            }
            // Save partial customisations in state
            state.customisations = customisations.filterCustomisations(customisations$1);
            // Update container
            if (this._container) {
                this._container.$set({
                    customisations: customisations$1,
                });
            }
            else {
                if (!this._params.state) {
                    this._params.state = {};
                }
                this._params.state.customisations = customisations$1;
            }
            // Trigger evemt
            this._triggerEvent({
                type: 'customisations',
                customisations: customisations$1,
            });
            return true;
        }
        /**
         * Change customisations
         */
        setCustomisations(customisations$1) {
            if (this._status === 'destroyed') {
                return;
            }
            this._setCustomisations(customisations.mergeCustomisations(customisations.defaultCustomisations, customisations$1));
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
        new Wrapper({
            container,
            callback: (event) => {
                // console.log('Event:', event);
                switch (event.type) {
                    case 'selection': {
                        if (event.icons.length === 1) {
                            // Scroll to icon
                            setTimeout(() => {
                                try {
                                    const footer = container.querySelector('div.iif-footer-full');
                                    footer === null || footer === void 0 ? void 0 : footer.scrollIntoView({
                                        behavior: 'smooth',
                                    });
                                }
                                catch (err) {
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
        document.getElementById('container').innerHTML =
            'Error fetching icon sets';
    });

}());
//# sourceMappingURL=icon-finder.js.map
