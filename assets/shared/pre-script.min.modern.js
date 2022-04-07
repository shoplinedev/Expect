(() => {
    "use strict";
    const isIE = "undefined" !== typeof document && document.documentMode;
    const support = type => window && window[type];
    const isElementType = (element, type) => element.nodeName.toLowerCase() === type;
    function isSupportWebp() {
        return new Promise((resolve => {
            const img = new Image;
            img.onload = () => {
                const result = img.width > 0 && img.height > 0;
                resolve(result);
            };
            img.onerror = () => {
                resolve(false);
            };
            img.src = `data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA`;
        }));
    }
    const isGif = url => /^.+\.gif(\?.*){0,1}$/.test(url);
    const isS3FileUrl = url => /\.cloudfront\./.test(url) || /img\.myshopline\.com/.test(url) || /img-.*\.myshopline\.com/.test(url);
    const isLoaded = element => "true" === element.getAttribute("data-loaded");
    const makeIsLoaded = element => element.setAttribute("data-loaded", true);
    const concatStr = (strs, symbol) => strs.filter(Boolean).join(symbol);
    const transformSrcset = (srcset, transformer) => srcset.split(",").filter((str => "" !== str)).map((str => concatStr(transformer(...str.trim().split(" ")), " "))).join(",");
    const getElements = (selector, root = document) => {
        if (selector instanceof Element) return [ selector ];
        if (selector instanceof NodeList) return selector;
        return root.querySelectorAll(selector);
    };
    class SLFile {
        constructor(url, base) {
            const uri = new URL(url, base);
            const paths = uri.pathname.split("/");
            const filename = paths[paths.length - 1];
            const [name, suffix] = filename.split(".");
            const [originName, ...modifiers] = name.split("_");
            this.uri = uri;
            this.paths = paths;
            this.name = originName;
            this.suffix = suffix;
            this.querys = this.uri.searchParams;
            this.modifiers = modifiers;
        }
        toString() {
            this.uri.pathname = concatStr([ ...this.paths.slice(0, -1), concatStr([ [ this.name, ...this.modifiers ].join("_"), this.suffix ], ".") ], "/");
            return this.uri.toString();
        }
    }
    function getValidAttrSet(plugins) {
        return Array.from(Array.from(plugins).reduce(((attrSet, plugin) => {
            var _plugin$attributes;
            null === (_plugin$attributes = plugin.attributes) || void 0 === _plugin$attributes ? void 0 : _plugin$attributes.forEach((attr => attrSet.add(attr)));
            return attrSet;
        }), new Set));
    }
    function getHook(plugins, name, normalHook) {
        const hooks = [ normalHook, ...plugins.map((plugin => plugin[name])) ].filter(Boolean);
        return (...args) => hooks.map((hook => hook.apply(this, args)));
    }
    function getHooks(plugins, normalHooks) {
        return {
            init: getHook(plugins, "init", normalHooks.init),
            prepare: getHook(plugins, "prepare", normalHooks.prepare),
            beforeLoad: getHook(plugins, "beforeLoad", normalHooks.beforeLoad),
            load: getHook(plugins, "load", normalHooks.load),
            loaded: getHook(plugins, "loaded", normalHooks.loaded)
        };
    }
    function getIntersectionObserver(options, loader) {
        if (support("IntersectionObserver")) {
            const {root, rootMargin, threshold} = options;
            return new IntersectionObserver(((entries, observer) => {
                entries.forEach((entry => {
                    if (entry.intersectionRatio > 0 || entry.isIntersecting) {
                        observer.unobserve(entry.target);
                        if (!isLoaded(entry.target)) loader(entry.target);
                    }
                }));
            }), {
                root,
                rootMargin,
                threshold
            });
        }
    }
    function getMutationObserver(options, loader, validAttrSet) {
        if (support("MutationObserver") && options.enableAutoReload) return new MutationObserver((entries => {
            entries.forEach((entry => {
                if (isLoaded(entry.target) && "attributes" === entry.type && validAttrSet.has(entry.attributeName)) loader(entry.target);
            }));
        }));
    }
    function lozad(selector = ".lozad", options = {}) {
        const currOpts = {
            rootMargin: "0px",
            threshold: 0,
            enableAutoReload: false,
            ...options
        };
        const validAttrSet = getValidAttrSet(lozad.plugins);
        const hooks = getHooks(lozad.plugins, currOpts);
        const pluginsInitState = Promise.all(hooks.init());
        const run = action => pluginsInitState.then(action);
        const loadElement = element => run((() => {
            hooks.beforeLoad(element);
            hooks.load(element);
            hooks.loaded(element);
        }));
        const observer = getIntersectionObserver(currOpts, loadElement);
        const mutationObserver = getMutationObserver(currOpts, loadElement, validAttrSet);
        run((() => {
            const elements = getElements(selector, currOpts.root);
            for (let i = 0; i < elements.length; i++) if (!isLoaded(elements[i])) hooks.prepare(elements[i]);
        }));
        return {
            observer,
            mutationObserver,
            observe() {
                const elements = getElements(selector, currOpts.root);
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    if (isLoaded(element)) continue;
                    if (mutationObserver) mutationObserver.observe(elements[i], {
                        subtree: true,
                        attributes: true,
                        attributeFilter: Array.from(validAttrSet)
                    });
                    if (observer) {
                        observer.observe(element);
                        continue;
                    }
                    loadElement(element);
                }
            },
            triggerLoad(element) {
                if (isLoaded(element)) return;
                loadElement(element);
            }
        };
    }
    lozad.plugins = [];
    lozad.use = function(plugin) {
        lozad.plugins = Array.from(new Set([ ...lozad.plugins, plugin ]));
    };
    const core = lozad;
    const EnumAttributes = {
        Iesrc: "data-iesrc",
        Alt: "data-alt",
        Src: "data-src",
        Srcset: "data-srcset",
        Poster: "data-poster",
        ToggleClass: "data-toggle-class",
        BackgroundImage: "data-background-image",
        BackgroundImageSet: "data-background-image-set",
        PlaceholderBackground: "data-placeholder-background"
    };
    const normal = {
        attributes: [ EnumAttributes.Alt, EnumAttributes.Src, EnumAttributes.Iesrc, EnumAttributes.Srcset, EnumAttributes.Poster, EnumAttributes.ToggleClass, EnumAttributes.BackgroundImage, EnumAttributes.BackgroundImageSet ],
        prepare(element) {
            const plBg = element.getAttribute(EnumAttributes.PlaceholderBackground);
            if (plBg) element.style.background = plBg;
        },
        beforeLoad() {},
        load(element) {
            if ("picture" === element.nodeName.toLowerCase()) {
                let img = element.querySelector("img");
                let append = false;
                if (null === img) {
                    img = document.createElement("img");
                    append = true;
                }
                if (isIE && element.getAttribute(EnumAttributes.Iesrc)) img.src = element.getAttribute(EnumAttributes.Iesrc);
                if (element.getAttribute(EnumAttributes.Alt)) img.alt = element.getAttribute(EnumAttributes.Alt);
                if (append) element.append(img);
            }
            if ("video" === element.nodeName.toLowerCase() && !element.getAttribute(EnumAttributes.Src)) if (element.children) {
                const childs = element.children;
                let childSrc;
                for (let i = 0; i <= childs.length - 1; i++) {
                    childSrc = childs[i].getAttribute(EnumAttributes.Src);
                    if (childSrc) childs[i].src = childSrc;
                }
                element.load();
            }
            if (element.getAttribute(EnumAttributes.Poster)) element.poster = element.getAttribute(EnumAttributes.Poster);
            if (element.getAttribute(EnumAttributes.Srcset)) element.setAttribute("srcset", element.getAttribute(EnumAttributes.Srcset));
            if (element.getAttribute(EnumAttributes.Src)) element.src = element.getAttribute(EnumAttributes.Src);
            let backgroundImageDelimiter = ",";
            if (element.getAttribute("data-background-delimiter")) backgroundImageDelimiter = element.getAttribute("data-background-delimiter");
            if (element.getAttribute(EnumAttributes.BackgroundImage)) element.style.backgroundImage = `url('${element.getAttribute(EnumAttributes.BackgroundImage).split(backgroundImageDelimiter).join("'),url('")}')`; else if (element.getAttribute(EnumAttributes.BackgroundImageSet)) {
                const imageSetLinks = element.getAttribute(EnumAttributes.BackgroundImageSet).split(backgroundImageDelimiter);
                let firstUrlLink = imageSetLinks[0].substr(0, imageSetLinks[0].indexOf(" ")) || imageSetLinks[0];
                firstUrlLink = -1 === firstUrlLink.indexOf("url(") ? `url(${firstUrlLink})` : firstUrlLink;
                if (1 === imageSetLinks.length) element.style.backgroundImage = firstUrlLink; else element.setAttribute("style", `${element.getAttribute("style") || ""}background-image: ${firstUrlLink}; background-image: -webkit-image-set(${imageSetLinks}); background-image: image-set(${imageSetLinks})`);
            }
            if (element.getAttribute(EnumAttributes.ToggleClass)) element.classList.toggle(element.getAttribute(EnumAttributes.ToggleClass));
        },
        loaded(element) {
            makeIsLoaded(element);
        }
    };
    function transformImageUrlToWebp(fileOrUrl, ignoreSetting = false) {
        const file = "string" === typeof fileOrUrl ? new SLFile(fileOrUrl, window.location.href) : fileOrUrl;
        if (!file.querys.has("t") || ignoreSetting) if (window.__isSupportWebp__) file.querys.set("t", "webp"); else if (file.suffix) file.querys.set("t", file.suffix);
        return file.toString();
    }
    const image_transform_webp = {
        init() {
            return isSupportWebp().then((flag => {
                window.__isSupportWebp__ = flag;
            }));
        },
        beforeLoad(element) {
            if (isElementType(element, "img")) {
                const src = element.getAttribute(EnumAttributes.Src);
                if (src) element.setAttribute(EnumAttributes.Src, isS3FileUrl(src) ? transformImageUrlToWebp(src) : src);
                const srcset = element.getAttribute(EnumAttributes.Srcset);
                if (srcset) element.setAttribute(EnumAttributes.Srcset, transformSrcset(srcset, ((url, breakpoint) => [ isS3FileUrl(url) ? transformImageUrlToWebp(url) : url, breakpoint ])));
            }
        }
    };
    function getPosterUrl(url) {
        if (!isGif(url) || !isS3FileUrl(url)) return;
        const file = new SLFile(url, window.location.href);
        if ("1" !== file.querys.get("_f")) return;
        if ("poster" === file.modifiers[0]) return;
        file.modifiers.unshift("poster");
        file.suffix = "png";
        return transformImageUrlToWebp(file, true);
    }
    function getPosterData({src, srcset}) {
        const data = {};
        if (src) data.src = getPosterUrl(src);
        if (srcset) {
            let srcsetHasPoster = false;
            data.srcset = transformSrcset(srcset, ((url, breakpoint) => {
                const posterUrl = getPosterUrl(url);
                if (posterUrl) {
                    srcsetHasPoster = true;
                    return [ posterUrl, breakpoint ];
                }
                return [ url, breakpoint ];
            }));
            if (!srcsetHasPoster) delete data.srcset;
        }
        if (data.src || data.srcset) return data;
    }
    const image_gif_poster = {
        attributes: [],
        load(element) {
            if (isElementType(element, "img")) {
                const src = element.getAttribute(EnumAttributes.Src);
                const srcset = element.getAttribute(EnumAttributes.Srcset);
                const sizes = element.getAttribute("sizes");
                let isSeted = false;
                const setImageData = ({src, srcset}, img = new Image) => {
                    if (sizes) img.sizes = sizes;
                    if (srcset) img.srcset = srcset;
                    if (src) img.src = src;
                    return img;
                };
                const setImageSrc = () => {
                    if (isSeted) return;
                    setImageData({
                        src,
                        srcset
                    }, element);
                    isSeted = true;
                };
                const posterData = getPosterData({
                    src,
                    srcset
                });
                if (posterData) {
                    const bgImg = setImageData({
                        src,
                        srcset
                    });
                    const posterBgImage = setImageData(posterData);
                    bgImg.onload = setImageSrc;
                    posterBgImage.onerror = setImageSrc;
                    setImageData(posterData, element);
                } else setImageSrc();
            }
        }
    };
    core.use(normal);
    core.use(image_transform_webp);
    core.use(image_gif_poster);
    const utils_lozad = core;
    const observer = utils_lozad(".lozad", {
        loaded(el) {
            el.className += " lazyloaded";
        },
        rootMargin: "100px"
    });
    observer.observe();
    window.lozadObserver = observer;
})();