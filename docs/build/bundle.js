
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
            mount_component(component, options.target, options.anchor);
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const HELP_INFO = `HELP INFO
type following commands to use console.
:help help
:about about this console
:exit exit console `;
    const ABOUT_INFO = `this is a console by candy water. ver 0.0.1
visit https://github.com/candywater/svelte-terminal/ for more info. `;
    const EXIT_INFO = `have a nice day! `;
    const ERROR_INFO = `command not found. Type :help for help. `;

    function consoleCommand(input, closeWin = ()=>{}){
      let str = input.trim();
      switch (str) {
        case ":help":
        case "help":
          return HELP_INFO
        case ":about":
        case "about":
          return ABOUT_INFO 
        case ":exit":
        case "exit":
          setTimeout(closeWin, 350);
          return EXIT_INFO
        default:
          return ERROR_INFO
      }
    }

    /* node_modules/svelte-terminal/src/Terminal.svelte generated by Svelte v3.32.3 */
    const file = "node_modules/svelte-terminal/src/Terminal.svelte";

    // (71:0) {#if show_terminal}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let span0;
    	let t0;
    	let span1;
    	let t1;
    	let span2;
    	let t2;
    	let span3;
    	let t3;
    	let t4;
    	let div1_style_value;
    	let mounted;
    	let dispose;
    	let if_block = /*minimize_terminal*/ ctx[2] === false && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = space();
    			span1 = element("span");
    			t1 = space();
    			span2 = element("span");
    			t2 = space();
    			span3 = element("span");
    			t3 = text(/*title*/ ctx[0]);
    			t4 = space();
    			if (if_block) if_block.c();
    			attr_dev(span0, "class", "bullet bullet-red svelte-19270b2");
    			add_location(span0, file, 73, 6, 1779);
    			attr_dev(span1, "class", "bullet bullet-yellow svelte-19270b2");
    			add_location(span1, file, 74, 6, 1849);
    			attr_dev(span2, "class", "bullet bullet-green svelte-19270b2");
    			add_location(span2, file, 75, 6, 1923);
    			attr_dev(span3, "class", "title");
    			add_location(span3, file, 76, 6, 1996);
    			attr_dev(div0, "class", "header svelte-19270b2");
    			add_location(div0, file, 72, 4, 1752);
    			attr_dev(div1, "class", "terminal svelte-19270b2");
    			attr_dev(div1, "style", div1_style_value = "" + (/*font_style*/ ctx[4] + /*max_style*/ ctx[3]));
    			add_location(div1, file, 71, 2, 1693);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t0);
    			append_dev(div0, span1);
    			append_dev(div0, t1);
    			append_dev(div0, span2);
    			append_dev(div0, t2);
    			append_dev(div0, span3);
    			append_dev(span3, t3);
    			append_dev(div1, t4);
    			if (if_block) if_block.m(div1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*onCloseClick*/ ctx[7], false, false, false),
    					listen_dev(span1, "click", /*onMinimizeWin*/ ctx[9], false, false, false),
    					listen_dev(span2, "click", /*onMaximizeWin*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t3, /*title*/ ctx[0]);

    			if (/*minimize_terminal*/ ctx[2] === false) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*font_style, max_style*/ 24 && div1_style_value !== (div1_style_value = "" + (/*font_style*/ ctx[4] + /*max_style*/ ctx[3]))) {
    				attr_dev(div1, "style", div1_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(71:0) {#if show_terminal}",
    		ctx
    	});

    	return block;
    }

    // (79:4) {#if minimize_terminal === false}
    function create_if_block_1(ctx) {
    	let div1;
    	let pre;
    	let t0;
    	let t1;
    	let div0;
    	let textarea;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			pre = element("pre");
    			t0 = text(/*console_info*/ ctx[5]);
    			t1 = space();
    			div0 = element("div");
    			textarea = element("textarea");
    			attr_dev(pre, "class", "svelte-19270b2");
    			add_location(pre, file, 80, 8, 2115);
    			attr_dev(textarea, "class", "cli svelte-19270b2");
    			attr_dev(textarea, "rows", "2");
    			textarea.autofocus = true;
    			add_location(textarea, file, 85, 12, 2262);
    			attr_dev(div0, "class", "terminal-prompt svelte-19270b2");
    			add_location(div0, file, 83, 8, 2169);
    			attr_dev(div1, "class", "window svelte-19270b2");
    			add_location(div1, file, 79, 6, 2086);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, pre);
    			append_dev(pre, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, textarea);
    			set_input_value(textarea, /*input_value*/ ctx[6]);
    			textarea.focus();

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "keyup", /*onKeyDown*/ ctx[8], false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*console_info*/ 32) set_data_dev(t0, /*console_info*/ ctx[5]);

    			if (dirty & /*input_value*/ 64) {
    				set_input_value(textarea, /*input_value*/ ctx[6]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(79:4) {#if minimize_terminal === false}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let if_block = /*show_terminal*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*show_terminal*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
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
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const DEFAULT_TITLE = "~/svelte-terminal/index.js";
    const PREFIX_SYMBOL_DOLLER = "$";
    const PREFIX_SYMBOL_BIG = ">";
    const PREFIX_SYMBOL_SHARP = "#";
    const DEFAULT_FONT_SIZE = "0.85rem";

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Terminal", slots, []);
    	const DEFAULT_CONSOLE_INFO = `type :help to show commands. \n`;
    	let { title } = $$props;
    	let { commands } = $$props;

    	// prefix symbol cannot changed, because .terminal-prompt::before cannot change
    	let prefix_symbol;

    	let { fontsize } = $$props;
    	let { fontfamily } = $$props;
    	let show_terminal = true;
    	let minimize_terminal = false;
    	let maximize_terminal = false;
    	let max_style = "";
    	let font_style = "";
    	let console_info = DEFAULT_CONSOLE_INFO;
    	let input_value = "";
    	onLoad();

    	function onLoad() {
    		if (!title) $$invalidate(0, title = DEFAULT_TITLE);
    		if (!commands) $$invalidate(11, commands = consoleCommand);
    		if (!prefix_symbol) prefix_symbol = PREFIX_SYMBOL_DOLLER;
    		if (fontsize) $$invalidate(4, font_style += `font-size:${fontsize};`);
    		if (fontfamily) $$invalidate(4, font_style += `font-family:${fontfamily};`);
    	}

    	function onCloseClick() {
    		closeWin();
    	}

    	function onKeyDown(e) {
    		if (e.key === "Enter") {
    			$$invalidate(5, console_info += prefix_symbol + input_value); // include enter(\n)
    			$$invalidate(5, console_info += commands(input_value, closeWin) + "\n");
    			$$invalidate(6, input_value = "");
    		}
    	}

    	function closeWin() {
    		$$invalidate(1, show_terminal = false);
    		$$invalidate(5, console_info = DEFAULT_CONSOLE_INFO);
    		$$invalidate(6, input_value = "");
    	}

    	function onMinimizeWin() {
    		$$invalidate(2, minimize_terminal = !minimize_terminal);
    	}

    	function onMaximizeWin() {
    		maximize_terminal = !maximize_terminal;

    		if (maximize_terminal) {
    			$$invalidate(3, max_style = "position: fixed; top: 0; left: 0;");
    		} else {
    			$$invalidate(3, max_style = "");
    		}
    	}

    	const writable_props = ["title", "commands", "fontsize", "fontfamily"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Terminal> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		input_value = this.value;
    		$$invalidate(6, input_value);
    	}

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("commands" in $$props) $$invalidate(11, commands = $$props.commands);
    		if ("fontsize" in $$props) $$invalidate(12, fontsize = $$props.fontsize);
    		if ("fontfamily" in $$props) $$invalidate(13, fontfamily = $$props.fontfamily);
    	};

    	$$self.$capture_state = () => ({
    		consoleCommand,
    		DEFAULT_CONSOLE_INFO,
    		DEFAULT_TITLE,
    		PREFIX_SYMBOL_DOLLER,
    		PREFIX_SYMBOL_BIG,
    		PREFIX_SYMBOL_SHARP,
    		DEFAULT_FONT_SIZE,
    		title,
    		commands,
    		prefix_symbol,
    		fontsize,
    		fontfamily,
    		show_terminal,
    		minimize_terminal,
    		maximize_terminal,
    		max_style,
    		font_style,
    		console_info,
    		input_value,
    		onLoad,
    		onCloseClick,
    		onKeyDown,
    		closeWin,
    		onMinimizeWin,
    		onMaximizeWin
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("commands" in $$props) $$invalidate(11, commands = $$props.commands);
    		if ("prefix_symbol" in $$props) prefix_symbol = $$props.prefix_symbol;
    		if ("fontsize" in $$props) $$invalidate(12, fontsize = $$props.fontsize);
    		if ("fontfamily" in $$props) $$invalidate(13, fontfamily = $$props.fontfamily);
    		if ("show_terminal" in $$props) $$invalidate(1, show_terminal = $$props.show_terminal);
    		if ("minimize_terminal" in $$props) $$invalidate(2, minimize_terminal = $$props.minimize_terminal);
    		if ("maximize_terminal" in $$props) maximize_terminal = $$props.maximize_terminal;
    		if ("max_style" in $$props) $$invalidate(3, max_style = $$props.max_style);
    		if ("font_style" in $$props) $$invalidate(4, font_style = $$props.font_style);
    		if ("console_info" in $$props) $$invalidate(5, console_info = $$props.console_info);
    		if ("input_value" in $$props) $$invalidate(6, input_value = $$props.input_value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		show_terminal,
    		minimize_terminal,
    		max_style,
    		font_style,
    		console_info,
    		input_value,
    		onCloseClick,
    		onKeyDown,
    		onMinimizeWin,
    		onMaximizeWin,
    		commands,
    		fontsize,
    		fontfamily,
    		textarea_input_handler
    	];
    }

    class Terminal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			title: 0,
    			commands: 11,
    			fontsize: 12,
    			fontfamily: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Terminal",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<Terminal> was created without expected prop 'title'");
    		}

    		if (/*commands*/ ctx[11] === undefined && !("commands" in props)) {
    			console.warn("<Terminal> was created without expected prop 'commands'");
    		}

    		if (/*fontsize*/ ctx[12] === undefined && !("fontsize" in props)) {
    			console.warn("<Terminal> was created without expected prop 'fontsize'");
    		}

    		if (/*fontfamily*/ ctx[13] === undefined && !("fontfamily" in props)) {
    			console.warn("<Terminal> was created without expected prop 'fontfamily'");
    		}
    	}

    	get title() {
    		throw new Error("<Terminal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Terminal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get commands() {
    		throw new Error("<Terminal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set commands(value) {
    		throw new Error("<Terminal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontsize() {
    		throw new Error("<Terminal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontsize(value) {
    		throw new Error("<Terminal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontfamily() {
    		throw new Error("<Terminal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontfamily(value) {
    		throw new Error("<Terminal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.3 */
    const file$1 = "src/App.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let terminal;
    	let current;
    	terminal = new Terminal({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(terminal.$$.fragment);
    			attr_dev(main, "class", "svelte-1h6otfa");
    			add_location(main, file$1, 4, 0, 61);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(terminal, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(terminal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(terminal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(terminal);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Terminal });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
