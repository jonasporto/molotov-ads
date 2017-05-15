(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AdSlot = (function () {
    function AdSlot(HTMLElement) {
        this.HTMLElement = HTMLElement;
        this.lazyloadEnabled = false;
        this.autoRefreshEnabled = false;
        this.autoRefreshCounter = 1;
    }
    return AdSlot;
}());
exports.AdSlot = AdSlot;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
var viewport_1 = require("./viewport");
var AutoRefresh;
(function (AutoRefresh) {
    function start(slot, refreshFunction) {
        if (!slot.autoRefreshEnabled)
            return;
        if (slot.autoRefreshCounter <= slot.autoRefreshLimit) {
            logger_1.Logger.infoWithTime(slot.name, 'refreshing in', slot.autoRefreshTime, 'seconds (', slot.autoRefreshCounter, '/', slot.autoRefreshLimit, ')');
            setTimeout(refreshSlotForAutoRotate, slot.autoRefreshTime * 1000, slot, refreshFunction);
            slot.autoRefreshCounter++;
        }
        else {
            slot.autoRefreshEnabled = false;
            logger_1.Logger.infoWithTime(slot.name, 'auto refresh ended');
        }
    }
    AutoRefresh.start = start;
    function refreshSlotForAutoRotate(slot, refreshFunction) {
        logger_1.Logger.logWithTime(slot.name, 'starting refresh for auto rotate');
        AutoRefresh.refreshIfViewable(slot, refreshFunction);
    }
    function refreshIfViewable(slot, refreshFunction) {
        if (document.hidden) {
            logger_1.Logger.logWithTime(slot.name, 'marked for refresh on visibilitychange');
            var visibilityBack = function () {
                AutoRefresh.refreshIfViewable(slot, refreshFunction);
                document.removeEventListener('visibilitychange', visibilityBack);
            };
            document.addEventListener('visibilitychange', visibilityBack);
            return;
        }
        var neededViewabilityPercentage = 50;
        if (viewport_1.Viewport.getCurrentViewabilityPercentage(slot.HTMLElement) >= neededViewabilityPercentage) {
            refreshFunction(slot);
        }
        else {
            logger_1.Logger.logWithTime(slot.name, 'viewablity lower than 50%, not refreshing');
            var intervalForRefresh = setInterval(function () {
                if (viewport_1.Viewport.getCurrentViewabilityPercentage(slot.HTMLElement) >= neededViewabilityPercentage) {
                    refreshFunction(slot);
                    clearInterval(intervalForRefresh);
                }
            }, 5000);
        }
    }
    AutoRefresh.refreshIfViewable = refreshIfViewable;
})(AutoRefresh = exports.AutoRefresh || (exports.AutoRefresh = {}));

},{"./logger":3,"./viewport":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logger;
(function (Logger) {
    var devModeEnabled = location.hash.indexOf('development') >= 0;
    function log() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        if (!devModeEnabled)
            return;
        console.log.apply(console, items);
    }
    Logger.log = log;
    function logWithTime() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        log(getCurrentTimeString(), '->', items.join(' '));
    }
    Logger.logWithTime = logWithTime;
    function info() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        if (!devModeEnabled)
            return;
        console.info.apply(console, items);
    }
    Logger.info = info;
    function infoWithTime() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        info(getCurrentTimeString(), '->', items.join(' '));
    }
    Logger.infoWithTime = infoWithTime;
    function warn() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        if (!devModeEnabled)
            return;
        console.warn.apply(console, items);
    }
    Logger.warn = warn;
    function error() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        if (!devModeEnabled)
            return;
        console.error.apply(console, items);
    }
    Logger.error = error;
    function consoleWelcomeMessage() {
        if (!devModeEnabled)
            return;
        console.log("%c __       __   ______   _______  \n|  \\     /  \\ /      \\ |       \\ \n| $$\\   /  $$|  $$$$$$\\| $$$$$$$\\\n| $$$\\ /  $$$| $$__| $$| $$  | $$\n| $$$$\\  $$$$| $$    $$| $$  | $$\n| $$\\$$ $$ $$| $$$$$$$$| $$  | $$\n| $$ \\$$$| $$| $$  | $$| $$__/ $$\n| $$  \\$ | $$| $$  | $$| $$    $$\n \\$$      \\$$ \\$$   \\$$ \\$$$$$$$\n\n", "color:red;");
        console.log('%c\nMolotov Ads - Developer Console\n\n', 'color:blue;');
    }
    Logger.consoleWelcomeMessage = consoleWelcomeMessage;
    function getCurrentTimeString() {
        var time = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + '.' + new Date().getMilliseconds();
        return time;
    }
})(Logger = exports.Logger || (exports.Logger = {}));

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Viewport;
(function (Viewport) {
    function isElementInViewport(element, threshold) {
        var rect = element.getBoundingClientRect();
        return (rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom - threshold <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth));
    }
    Viewport.isElementInViewport = isElementInViewport;
    function isElementVisible(element) {
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    }
    Viewport.isElementVisible = isElementVisible;
    function getCurrentViewabilityPercentage(element) {
        var rectTop = element.getBoundingClientRect().top;
        var top = rectTop > 0 ? window.innerHeight - rectTop : Math.abs(rectTop);
        var result = top / element.clientHeight;
        result = rectTop > 0 ? result : 1 - result;
        if (result < 0)
            result = 0;
        if (result > 1)
            result = 1;
        return result * 100;
    }
    Viewport.getCurrentViewabilityPercentage = getCurrentViewabilityPercentage;
})(Viewport = exports.Viewport || (exports.Viewport = {}));

},{}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var adslot_1 = require("../../modules/adslot");
var DoubleClickAdSlot = (function (_super) {
    __extends(DoubleClickAdSlot, _super);
    function DoubleClickAdSlot(HTMLElement) {
        var _this = _super.call(this, HTMLElement) || this;
        _this.HTMLElement = HTMLElement;
        var ds = HTMLElement.dataset;
        var size = eval(ds['madSize']);
        _this.adUnit = ds['madAdunit'];
        _this.name = HTMLElement.id;
        _this.size = size;
        _this.isOutOfPage = Boolean(ds['madOutOfPage']);
        _this.autoRefreshTime = Number(ds['madAutoRefreshInSeconds']) || 0;
        _this.autoRefreshLimit = Number(ds['madAutoRefreshLimit']) || 0;
        _this.lazyloadOffset = Number(ds['madLazyloadOffset']);
        _this.autoRefreshEnabled = _this.autoRefreshTime > 0;
        if (_this.lazyloadOffset) {
            _this.lazyloadOffset = _this.lazyloadOffset || 0;
            _this.lazyloadEnabled = true;
        }
        return _this;
    }
    DoubleClickAdSlot.prototype.defineSlot = function () {
        if (this.isOutOfPage) {
            this.doubleclickAdSlot = googletag.defineOutOfPageSlot(this.adUnit, this.name).addService(googletag.pubads());
        }
        else {
            this.doubleclickAdSlot = googletag.defineSlot(this.adUnit, this.size, this.name).addService(googletag.pubads());
        }
    };
    DoubleClickAdSlot.prototype.display = function () {
        googletag.display(this.name);
        if (this.lazyloadEnabled)
            return;
        this.refresh();
    };
    DoubleClickAdSlot.prototype.refresh = function () {
        googletag.pubads().refresh([this.doubleclickAdSlot]);
    };
    DoubleClickAdSlot.prototype.getDoubleclickAdSlot = function () {
        return this.doubleclickAdSlot;
    };
    return DoubleClickAdSlot;
}(adslot_1.AdSlot));
exports.DoubleClickAdSlot = DoubleClickAdSlot;

},{"../../modules/adslot":1}],6:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var doubleclick_adslot_1 = require("../doubleclick/doubleclick.adslot");
var RubiconFastlaneDfpAdSlot = (function (_super) {
    __extends(RubiconFastlaneDfpAdSlot, _super);
    function RubiconFastlaneDfpAdSlot(HTMLElement) {
        var _this = _super.call(this, HTMLElement) || this;
        _this.HTMLElement = HTMLElement;
        _this.rubiconPosition = HTMLElement.dataset.madRubiconPosition;
        return _this;
    }
    RubiconFastlaneDfpAdSlot.prototype.defineSlot = function () {
        this.rubiconAdSlot = rubicontag.defineSlot(this.adUnit, this.size, this.name)
            .setPosition(this.rubiconPosition)
            .setFPI('adunit', this.adUnit.substring(this.adUnit.lastIndexOf('/') + 1))
            .setFPI('position', this.rubiconPosition);
    };
    RubiconFastlaneDfpAdSlot.prototype.defineSlotDoubleclick = function () {
        _super.prototype.defineSlot.call(this);
    };
    RubiconFastlaneDfpAdSlot.prototype.setTargetingForGPTSlot = function () {
        rubicontag.setTargetingForGPTSlot(_super.prototype.getDoubleclickAdSlot.call(this));
    };
    return RubiconFastlaneDfpAdSlot;
}(doubleclick_adslot_1.DoubleClickAdSlot));
exports.RubiconFastlaneDfpAdSlot = RubiconFastlaneDfpAdSlot;

},{"../doubleclick/doubleclick.adslot":5}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var viewport_1 = require("../../modules/viewport");
var rubicon_fastlane_dfp_adslot_1 = require("./rubicon.fastlane.dfp.adslot");
var logger_1 = require("../../modules/logger");
var autorefresh_1 = require("../../modules/autorefresh");
var RubiconFastlaneDfp = (function () {
    function RubiconFastlaneDfp() {
        this.name = "RubiconFastlaneDfp";
        this.slots = {};
        this.loaded = false;
    }
    RubiconFastlaneDfp.prototype.init = function (options) {
        this.slots = this.getSlots();
        var self = this;
        return new Promise(function (resolve, reject) {
            googletag.cmd.push(function () {
                googletag.pubads().disableInitialLoad();
            });
            rubicontag.cmd.push(function () {
                for (var slotName in self.slots) {
                    if (!self.slots[slotName].rubiconPosition)
                        continue;
                    self.slots[slotName].defineSlot();
                    logger_1.Logger.log(self.name, 'Rubicon ad slot defined: ', self.slots[slotName]);
                }
                for (var item in options.setFPI) {
                    var value = options.setFPI[item];
                    logger_1.Logger.log(self.name, 'targeting FPI', item, 'as', value);
                    rubicontag.setFPI(item, value);
                }
                for (var item in options.setFPV) {
                    var value = options.setFPV[item];
                    logger_1.Logger.log(self.name, 'targeting FPV', item, 'as', value);
                    rubicontag.setFPV(item, value);
                }
                rubicontag.run(function () {
                    if (options.rubicontagRun)
                        options.rubicontagRun();
                    self.refreshAds();
                    self.loaded = true;
                });
                googletag.cmd.push(function () {
                    for (var slotName in self.slots) {
                        self.slots[slotName].defineSlotDoubleclick();
                        logger_1.Logger.log(self.name, 'DFP ad slot defined: ', self.slots[slotName]);
                    }
                    for (var item in options.customTargets) {
                        var value = options.customTargets[item];
                        logger_1.Logger.log('targeting', item, 'as', value);
                        googletag.pubads().setTargeting(item, [value]);
                    }
                    googletag.pubads().addEventListener('slotRenderEnded', function (event) {
                        logger_1.Logger.logWithTime(event.slot.getSlotElementId(), 'finished slot rendering');
                        var slot = self.slots[event.slot.getSlotElementId()];
                        autorefresh_1.AutoRefresh.start(slot, self.autoRefresh);
                        if (options.onSlotRenderEnded)
                            options.onSlotRenderEnded(event);
                    });
                    logger_1.Logger.info('enabling services');
                    googletag.enableServices();
                    for (var slotName in self.slots) {
                        googletag.display(self.slots[slotName].name);
                        logger_1.Logger.logWithTime(self.slots[slotName].name, 'started displaying');
                    }
                    self.onScrollRefreshLazyloadedSlots();
                    setTimeout(function () {
                        if (self.loaded)
                            return;
                        self.refreshAds();
                    }, 1500);
                    resolve();
                });
            });
        });
    };
    RubiconFastlaneDfp.prototype.refreshAds = function () {
        for (var slotName in this.slots) {
            var slot = this.slots[slotName];
            if (slot.lazyloadEnabled)
                continue;
            slot.setTargetingForGPTSlot();
            slot.refresh();
        }
    };
    RubiconFastlaneDfp.prototype.onScrollRefreshLazyloadedSlots = function () {
        var self = this;
        window.addEventListener('scroll', function refreshAdsIfItIsInViewport(event) {
            for (var slotName in self.slots) {
                var slot = self.slots[slotName];
                if (slot.lazyloadEnabled && viewport_1.Viewport.isElementInViewport(slot.HTMLElement, slot.lazyloadOffset)) {
                    slot.setTargetingForGPTSlot();
                    slot.refresh();
                    slot.lazyloadEnabled = false;
                }
            }
        });
    };
    RubiconFastlaneDfp.prototype.autoRefresh = function (slot) {
        logger_1.Logger.logWithTime(slot.name, 'started refreshing');
        if (slot.rubiconPosition) {
            rubicontag.cmd.push(function () {
                slot.defineSlot();
                logger_1.Logger.log(self.name, 'Rubicon ad slot defined: ', slot);
                rubicontag.run(function () {
                    slot.setTargetingForGPTSlot();
                    slot.refresh();
                }, { slots: [slot.rubiconAdSlot] });
            });
        }
        else {
            slot.refresh();
        }
    };
    RubiconFastlaneDfp.prototype.getSlots = function () {
        var slots = {};
        for (var slot in window._molotovAds.slots) {
            var el = window._molotovAds.slots[slot].HTMLElement;
            if (!el.dataset.madAdunit && !el.dataset.madRubicon)
                continue;
            slots[el.id] = new rubicon_fastlane_dfp_adslot_1.RubiconFastlaneDfpAdSlot(el);
            window._molotovAds.slots[el.id] = slots[el.id];
        }
        return slots;
    };
    return RubiconFastlaneDfp;
}());
exports.RubiconFastlaneDfp = RubiconFastlaneDfp;
window._molotovAds.loadPlugin(new RubiconFastlaneDfp());

},{"../../modules/autorefresh":2,"../../modules/logger":3,"../../modules/viewport":4,"./rubicon.fastlane.dfp.adslot":6}]},{},[6,7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hZHNsb3QuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hdXRvcmVmcmVzaC5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL2xvZ2dlci5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL3ZpZXdwb3J0LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvZG91YmxlY2xpY2svZG91YmxlY2xpY2suYWRzbG90LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvcnViaWNvbi1mYXN0bGFuZS1kZnAvcnViaWNvbi5mYXN0bGFuZS5kZnAuYWRzbG90LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvcnViaWNvbi1mYXN0bGFuZS1kZnAvcnViaWNvbi5mYXN0bGFuZS5kZnAucGx1Z2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgQWRTbG90ID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBZFNsb3QoSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5IVE1MRWxlbWVudCA9IEhUTUxFbGVtZW50O1xuICAgICAgICB0aGlzLmxhenlsb2FkRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmF1dG9SZWZyZXNoRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmF1dG9SZWZyZXNoQ291bnRlciA9IDE7XG4gICAgfVxuICAgIHJldHVybiBBZFNsb3Q7XG59KCkpO1xuZXhwb3J0cy5BZFNsb3QgPSBBZFNsb3Q7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuL2xvZ2dlclwiKTtcbnZhciB2aWV3cG9ydF8xID0gcmVxdWlyZShcIi4vdmlld3BvcnRcIik7XG52YXIgQXV0b1JlZnJlc2g7XG4oZnVuY3Rpb24gKEF1dG9SZWZyZXNoKSB7XG4gICAgZnVuY3Rpb24gc3RhcnQoc2xvdCwgcmVmcmVzaEZ1bmN0aW9uKSB7XG4gICAgICAgIGlmICghc2xvdC5hdXRvUmVmcmVzaEVuYWJsZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmIChzbG90LmF1dG9SZWZyZXNoQ291bnRlciA8PSBzbG90LmF1dG9SZWZyZXNoTGltaXQpIHtcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoc2xvdC5uYW1lLCAncmVmcmVzaGluZyBpbicsIHNsb3QuYXV0b1JlZnJlc2hUaW1lLCAnc2Vjb25kcyAoJywgc2xvdC5hdXRvUmVmcmVzaENvdW50ZXIsICcvJywgc2xvdC5hdXRvUmVmcmVzaExpbWl0LCAnKScpO1xuICAgICAgICAgICAgc2V0VGltZW91dChyZWZyZXNoU2xvdEZvckF1dG9Sb3RhdGUsIHNsb3QuYXV0b1JlZnJlc2hUaW1lICogMTAwMCwgc2xvdCwgcmVmcmVzaEZ1bmN0aW9uKTtcbiAgICAgICAgICAgIHNsb3QuYXV0b1JlZnJlc2hDb3VudGVyKys7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzbG90LmF1dG9SZWZyZXNoRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmluZm9XaXRoVGltZShzbG90Lm5hbWUsICdhdXRvIHJlZnJlc2ggZW5kZWQnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBBdXRvUmVmcmVzaC5zdGFydCA9IHN0YXJ0O1xuICAgIGZ1bmN0aW9uIHJlZnJlc2hTbG90Rm9yQXV0b1JvdGF0ZShzbG90LCByZWZyZXNoRnVuY3Rpb24pIHtcbiAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKHNsb3QubmFtZSwgJ3N0YXJ0aW5nIHJlZnJlc2ggZm9yIGF1dG8gcm90YXRlJyk7XG4gICAgICAgIEF1dG9SZWZyZXNoLnJlZnJlc2hJZlZpZXdhYmxlKHNsb3QsIHJlZnJlc2hGdW5jdGlvbik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlZnJlc2hJZlZpZXdhYmxlKHNsb3QsIHJlZnJlc2hGdW5jdGlvbikge1xuICAgICAgICBpZiAoZG9jdW1lbnQuaGlkZGVuKSB7XG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnbWFya2VkIGZvciByZWZyZXNoIG9uIHZpc2liaWxpdHljaGFuZ2UnKTtcbiAgICAgICAgICAgIHZhciB2aXNpYmlsaXR5QmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRvUmVmcmVzaC5yZWZyZXNoSWZWaWV3YWJsZShzbG90LCByZWZyZXNoRnVuY3Rpb24pO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCB2aXNpYmlsaXR5QmFjayk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIHZpc2liaWxpdHlCYWNrKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmVlZGVkVmlld2FiaWxpdHlQZXJjZW50YWdlID0gNTA7XG4gICAgICAgIGlmICh2aWV3cG9ydF8xLlZpZXdwb3J0LmdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2Uoc2xvdC5IVE1MRWxlbWVudCkgPj0gbmVlZGVkVmlld2FiaWxpdHlQZXJjZW50YWdlKSB7XG4gICAgICAgICAgICByZWZyZXNoRnVuY3Rpb24oc2xvdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAndmlld2FibGl0eSBsb3dlciB0aGFuIDUwJSwgbm90IHJlZnJlc2hpbmcnKTtcbiAgICAgICAgICAgIHZhciBpbnRlcnZhbEZvclJlZnJlc2ggPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZpZXdwb3J0XzEuVmlld3BvcnQuZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZShzbG90LkhUTUxFbGVtZW50KSA+PSBuZWVkZWRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmcmVzaEZ1bmN0aW9uKHNsb3QpO1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsRm9yUmVmcmVzaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgQXV0b1JlZnJlc2gucmVmcmVzaElmVmlld2FibGUgPSByZWZyZXNoSWZWaWV3YWJsZTtcbn0pKEF1dG9SZWZyZXNoID0gZXhwb3J0cy5BdXRvUmVmcmVzaCB8fCAoZXhwb3J0cy5BdXRvUmVmcmVzaCA9IHt9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBMb2dnZXI7XG4oZnVuY3Rpb24gKExvZ2dlcikge1xuICAgIHZhciBkZXZNb2RlRW5hYmxlZCA9IGxvY2F0aW9uLmhhc2guaW5kZXhPZignZGV2ZWxvcG1lbnQnKSA+PSAwO1xuICAgIGZ1bmN0aW9uIGxvZygpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcbiAgICB9XG4gICAgTG9nZ2VyLmxvZyA9IGxvZztcbiAgICBmdW5jdGlvbiBsb2dXaXRoVGltZSgpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIGxvZyhnZXRDdXJyZW50VGltZVN0cmluZygpLCAnLT4nLCBpdGVtcy5qb2luKCcgJykpO1xuICAgIH1cbiAgICBMb2dnZXIubG9nV2l0aFRpbWUgPSBsb2dXaXRoVGltZTtcbiAgICBmdW5jdGlvbiBpbmZvKCkge1xuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc29sZS5pbmZvLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcbiAgICB9XG4gICAgTG9nZ2VyLmluZm8gPSBpbmZvO1xuICAgIGZ1bmN0aW9uIGluZm9XaXRoVGltZSgpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIGluZm8oZ2V0Q3VycmVudFRpbWVTdHJpbmcoKSwgJy0+JywgaXRlbXMuam9pbignICcpKTtcbiAgICB9XG4gICAgTG9nZ2VyLmluZm9XaXRoVGltZSA9IGluZm9XaXRoVGltZTtcbiAgICBmdW5jdGlvbiB3YXJuKCkge1xuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc29sZS53YXJuLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcbiAgICB9XG4gICAgTG9nZ2VyLndhcm4gPSB3YXJuO1xuICAgIGZ1bmN0aW9uIGVycm9yKCkge1xuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBpdGVtcyk7XG4gICAgfVxuICAgIExvZ2dlci5lcnJvciA9IGVycm9yO1xuICAgIGZ1bmN0aW9uIGNvbnNvbGVXZWxjb21lTWVzc2FnZSgpIHtcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc29sZS5sb2coXCIlYyBfXyAgICAgICBfXyAgIF9fX19fXyAgIF9fX19fX18gIFxcbnwgIFxcXFwgICAgIC8gIFxcXFwgLyAgICAgIFxcXFwgfCAgICAgICBcXFxcIFxcbnwgJCRcXFxcICAgLyAgJCR8ICAkJCQkJCRcXFxcfCAkJCQkJCQkXFxcXFxcbnwgJCQkXFxcXCAvICAkJCR8ICQkX198ICQkfCAkJCAgfCAkJFxcbnwgJCQkJFxcXFwgICQkJCR8ICQkICAgICQkfCAkJCAgfCAkJFxcbnwgJCRcXFxcJCQgJCQgJCR8ICQkJCQkJCQkfCAkJCAgfCAkJFxcbnwgJCQgXFxcXCQkJHwgJCR8ICQkICB8ICQkfCAkJF9fLyAkJFxcbnwgJCQgIFxcXFwkIHwgJCR8ICQkICB8ICQkfCAkJCAgICAkJFxcbiBcXFxcJCQgICAgICBcXFxcJCQgXFxcXCQkICAgXFxcXCQkIFxcXFwkJCQkJCQkXFxuXFxuXCIsIFwiY29sb3I6cmVkO1wiKTtcbiAgICAgICAgY29uc29sZS5sb2coJyVjXFxuTW9sb3RvdiBBZHMgLSBEZXZlbG9wZXIgQ29uc29sZVxcblxcbicsICdjb2xvcjpibHVlOycpO1xuICAgIH1cbiAgICBMb2dnZXIuY29uc29sZVdlbGNvbWVNZXNzYWdlID0gY29uc29sZVdlbGNvbWVNZXNzYWdlO1xuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRUaW1lU3RyaW5nKCkge1xuICAgICAgICB2YXIgdGltZSA9IG5ldyBEYXRlKCkuZ2V0SG91cnMoKSArICc6JyArIG5ldyBEYXRlKCkuZ2V0TWludXRlcygpICsgJzonICsgbmV3IERhdGUoKS5nZXRTZWNvbmRzKCkgKyAnLicgKyBuZXcgRGF0ZSgpLmdldE1pbGxpc2Vjb25kcygpO1xuICAgICAgICByZXR1cm4gdGltZTtcbiAgICB9XG59KShMb2dnZXIgPSBleHBvcnRzLkxvZ2dlciB8fCAoZXhwb3J0cy5Mb2dnZXIgPSB7fSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgVmlld3BvcnQ7XG4oZnVuY3Rpb24gKFZpZXdwb3J0KSB7XG4gICAgZnVuY3Rpb24gaXNFbGVtZW50SW5WaWV3cG9ydChlbGVtZW50LCB0aHJlc2hvbGQpIHtcbiAgICAgICAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICByZXR1cm4gKHJlY3QudG9wID49IDAgJiZcbiAgICAgICAgICAgIHJlY3QubGVmdCA+PSAwICYmXG4gICAgICAgICAgICByZWN0LmJvdHRvbSAtIHRocmVzaG9sZCA8PSAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpICYmXG4gICAgICAgICAgICByZWN0LnJpZ2h0IDw9ICh3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpKTtcbiAgICB9XG4gICAgVmlld3BvcnQuaXNFbGVtZW50SW5WaWV3cG9ydCA9IGlzRWxlbWVudEluVmlld3BvcnQ7XG4gICAgZnVuY3Rpb24gaXNFbGVtZW50VmlzaWJsZShlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiAhIShlbGVtZW50Lm9mZnNldFdpZHRoIHx8IGVsZW1lbnQub2Zmc2V0SGVpZ2h0IHx8IGVsZW1lbnQuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGgpO1xuICAgIH1cbiAgICBWaWV3cG9ydC5pc0VsZW1lbnRWaXNpYmxlID0gaXNFbGVtZW50VmlzaWJsZTtcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHJlY3RUb3AgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcbiAgICAgICAgdmFyIHRvcCA9IHJlY3RUb3AgPiAwID8gd2luZG93LmlubmVySGVpZ2h0IC0gcmVjdFRvcCA6IE1hdGguYWJzKHJlY3RUb3ApO1xuICAgICAgICB2YXIgcmVzdWx0ID0gdG9wIC8gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIHJlc3VsdCA9IHJlY3RUb3AgPiAwID8gcmVzdWx0IDogMSAtIHJlc3VsdDtcbiAgICAgICAgaWYgKHJlc3VsdCA8IDApXG4gICAgICAgICAgICByZXN1bHQgPSAwO1xuICAgICAgICBpZiAocmVzdWx0ID4gMSlcbiAgICAgICAgICAgIHJlc3VsdCA9IDE7XG4gICAgICAgIHJldHVybiByZXN1bHQgKiAxMDA7XG4gICAgfVxuICAgIFZpZXdwb3J0LmdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UgPSBnZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlO1xufSkoVmlld3BvcnQgPSBleHBvcnRzLlZpZXdwb3J0IHx8IChleHBvcnRzLlZpZXdwb3J0ID0ge30pKTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgYWRzbG90XzEgPSByZXF1aXJlKFwiLi4vLi4vbW9kdWxlcy9hZHNsb3RcIik7XG52YXIgRG91YmxlQ2xpY2tBZFNsb3QgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhEb3VibGVDbGlja0FkU2xvdCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBEb3VibGVDbGlja0FkU2xvdChIVE1MRWxlbWVudCkge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBIVE1MRWxlbWVudCkgfHwgdGhpcztcbiAgICAgICAgX3RoaXMuSFRNTEVsZW1lbnQgPSBIVE1MRWxlbWVudDtcbiAgICAgICAgdmFyIGRzID0gSFRNTEVsZW1lbnQuZGF0YXNldDtcbiAgICAgICAgdmFyIHNpemUgPSBldmFsKGRzWydtYWRTaXplJ10pO1xuICAgICAgICBfdGhpcy5hZFVuaXQgPSBkc1snbWFkQWR1bml0J107XG4gICAgICAgIF90aGlzLm5hbWUgPSBIVE1MRWxlbWVudC5pZDtcbiAgICAgICAgX3RoaXMuc2l6ZSA9IHNpemU7XG4gICAgICAgIF90aGlzLmlzT3V0T2ZQYWdlID0gQm9vbGVhbihkc1snbWFkT3V0T2ZQYWdlJ10pO1xuICAgICAgICBfdGhpcy5hdXRvUmVmcmVzaFRpbWUgPSBOdW1iZXIoZHNbJ21hZEF1dG9SZWZyZXNoSW5TZWNvbmRzJ10pIHx8IDA7XG4gICAgICAgIF90aGlzLmF1dG9SZWZyZXNoTGltaXQgPSBOdW1iZXIoZHNbJ21hZEF1dG9SZWZyZXNoTGltaXQnXSkgfHwgMDtcbiAgICAgICAgX3RoaXMubGF6eWxvYWRPZmZzZXQgPSBOdW1iZXIoZHNbJ21hZExhenlsb2FkT2Zmc2V0J10pO1xuICAgICAgICBfdGhpcy5hdXRvUmVmcmVzaEVuYWJsZWQgPSBfdGhpcy5hdXRvUmVmcmVzaFRpbWUgPiAwO1xuICAgICAgICBpZiAoX3RoaXMubGF6eWxvYWRPZmZzZXQpIHtcbiAgICAgICAgICAgIF90aGlzLmxhenlsb2FkT2Zmc2V0ID0gX3RoaXMubGF6eWxvYWRPZmZzZXQgfHwgMDtcbiAgICAgICAgICAgIF90aGlzLmxhenlsb2FkRW5hYmxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUuZGVmaW5lU2xvdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNPdXRPZlBhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuZG91YmxlY2xpY2tBZFNsb3QgPSBnb29nbGV0YWcuZGVmaW5lT3V0T2ZQYWdlU2xvdCh0aGlzLmFkVW5pdCwgdGhpcy5uYW1lKS5hZGRTZXJ2aWNlKGdvb2dsZXRhZy5wdWJhZHMoKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRvdWJsZWNsaWNrQWRTbG90ID0gZ29vZ2xldGFnLmRlZmluZVNsb3QodGhpcy5hZFVuaXQsIHRoaXMuc2l6ZSwgdGhpcy5uYW1lKS5hZGRTZXJ2aWNlKGdvb2dsZXRhZy5wdWJhZHMoKSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIERvdWJsZUNsaWNrQWRTbG90LnByb3RvdHlwZS5kaXNwbGF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBnb29nbGV0YWcuZGlzcGxheSh0aGlzLm5hbWUpO1xuICAgICAgICBpZiAodGhpcy5sYXp5bG9hZEVuYWJsZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH07XG4gICAgRG91YmxlQ2xpY2tBZFNsb3QucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGdvb2dsZXRhZy5wdWJhZHMoKS5yZWZyZXNoKFt0aGlzLmRvdWJsZWNsaWNrQWRTbG90XSk7XG4gICAgfTtcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUuZ2V0RG91YmxlY2xpY2tBZFNsb3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRvdWJsZWNsaWNrQWRTbG90O1xuICAgIH07XG4gICAgcmV0dXJuIERvdWJsZUNsaWNrQWRTbG90O1xufShhZHNsb3RfMS5BZFNsb3QpKTtcbmV4cG9ydHMuRG91YmxlQ2xpY2tBZFNsb3QgPSBEb3VibGVDbGlja0FkU2xvdDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgZG91YmxlY2xpY2tfYWRzbG90XzEgPSByZXF1aXJlKFwiLi4vZG91YmxlY2xpY2svZG91YmxlY2xpY2suYWRzbG90XCIpO1xudmFyIFJ1Ymljb25GYXN0bGFuZURmcEFkU2xvdCA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFJ1Ymljb25GYXN0bGFuZURmcEFkU2xvdCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBSdWJpY29uRmFzdGxhbmVEZnBBZFNsb3QoSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgSFRNTEVsZW1lbnQpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLkhUTUxFbGVtZW50ID0gSFRNTEVsZW1lbnQ7XG4gICAgICAgIF90aGlzLnJ1Ymljb25Qb3NpdGlvbiA9IEhUTUxFbGVtZW50LmRhdGFzZXQubWFkUnViaWNvblBvc2l0aW9uO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIFJ1Ymljb25GYXN0bGFuZURmcEFkU2xvdC5wcm90b3R5cGUuZGVmaW5lU2xvdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5ydWJpY29uQWRTbG90ID0gcnViaWNvbnRhZy5kZWZpbmVTbG90KHRoaXMuYWRVbml0LCB0aGlzLnNpemUsIHRoaXMubmFtZSlcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbih0aGlzLnJ1Ymljb25Qb3NpdGlvbilcbiAgICAgICAgICAgIC5zZXRGUEkoJ2FkdW5pdCcsIHRoaXMuYWRVbml0LnN1YnN0cmluZyh0aGlzLmFkVW5pdC5sYXN0SW5kZXhPZignLycpICsgMSkpXG4gICAgICAgICAgICAuc2V0RlBJKCdwb3NpdGlvbicsIHRoaXMucnViaWNvblBvc2l0aW9uKTtcbiAgICB9O1xuICAgIFJ1Ymljb25GYXN0bGFuZURmcEFkU2xvdC5wcm90b3R5cGUuZGVmaW5lU2xvdERvdWJsZWNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBfc3VwZXIucHJvdG90eXBlLmRlZmluZVNsb3QuY2FsbCh0aGlzKTtcbiAgICB9O1xuICAgIFJ1Ymljb25GYXN0bGFuZURmcEFkU2xvdC5wcm90b3R5cGUuc2V0VGFyZ2V0aW5nRm9yR1BUU2xvdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcnViaWNvbnRhZy5zZXRUYXJnZXRpbmdGb3JHUFRTbG90KF9zdXBlci5wcm90b3R5cGUuZ2V0RG91YmxlY2xpY2tBZFNsb3QuY2FsbCh0aGlzKSk7XG4gICAgfTtcbiAgICByZXR1cm4gUnViaWNvbkZhc3RsYW5lRGZwQWRTbG90O1xufShkb3VibGVjbGlja19hZHNsb3RfMS5Eb3VibGVDbGlja0FkU2xvdCkpO1xuZXhwb3J0cy5SdWJpY29uRmFzdGxhbmVEZnBBZFNsb3QgPSBSdWJpY29uRmFzdGxhbmVEZnBBZFNsb3Q7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciB2aWV3cG9ydF8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvdmlld3BvcnRcIik7XG52YXIgcnViaWNvbl9mYXN0bGFuZV9kZnBfYWRzbG90XzEgPSByZXF1aXJlKFwiLi9ydWJpY29uLmZhc3RsYW5lLmRmcC5hZHNsb3RcIik7XG52YXIgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi4vLi4vbW9kdWxlcy9sb2dnZXJcIik7XG52YXIgYXV0b3JlZnJlc2hfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2F1dG9yZWZyZXNoXCIpO1xudmFyIFJ1Ymljb25GYXN0bGFuZURmcCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUnViaWNvbkZhc3RsYW5lRGZwKCkge1xuICAgICAgICB0aGlzLm5hbWUgPSBcIlJ1Ymljb25GYXN0bGFuZURmcFwiO1xuICAgICAgICB0aGlzLnNsb3RzID0ge307XG4gICAgICAgIHRoaXMubG9hZGVkID0gZmFsc2U7XG4gICAgfVxuICAgIFJ1Ymljb25GYXN0bGFuZURmcC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuc2xvdHMgPSB0aGlzLmdldFNsb3RzKCk7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGdvb2dsZXRhZy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZ29vZ2xldGFnLnB1YmFkcygpLmRpc2FibGVJbml0aWFsTG9hZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBydWJpY29udGFnLmNtZC5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzZWxmLnNsb3RzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc2VsZi5zbG90c1tzbG90TmFtZV0ucnViaWNvblBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLmRlZmluZVNsb3QoKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhzZWxmLm5hbWUsICdSdWJpY29uIGFkIHNsb3QgZGVmaW5lZDogJywgc2VsZi5zbG90c1tzbG90TmFtZV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIG9wdGlvbnMuc2V0RlBJKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG9wdGlvbnMuc2V0RlBJW2l0ZW1dO1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nKHNlbGYubmFtZSwgJ3RhcmdldGluZyBGUEknLCBpdGVtLCAnYXMnLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJ1Ymljb250YWcuc2V0RlBJKGl0ZW0sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBvcHRpb25zLnNldEZQVikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBvcHRpb25zLnNldEZQVltpdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhzZWxmLm5hbWUsICd0YXJnZXRpbmcgRlBWJywgaXRlbSwgJ2FzJywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBydWJpY29udGFnLnNldEZQVihpdGVtLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJ1Ymljb250YWcucnVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucnViaWNvbnRhZ1J1bilcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucnViaWNvbnRhZ1J1bigpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnJlZnJlc2hBZHMoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHNsb3ROYW1lIGluIHNlbGYuc2xvdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLmRlZmluZVNsb3REb3VibGVjbGljaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhzZWxmLm5hbWUsICdERlAgYWQgc2xvdCBkZWZpbmVkOiAnLCBzZWxmLnNsb3RzW3Nsb3ROYW1lXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBvcHRpb25zLmN1c3RvbVRhcmdldHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG9wdGlvbnMuY3VzdG9tVGFyZ2V0c1tpdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2coJ3RhcmdldGluZycsIGl0ZW0sICdhcycsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5wdWJhZHMoKS5zZXRUYXJnZXRpbmcoaXRlbSwgW3ZhbHVlXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xldGFnLnB1YmFkcygpLmFkZEV2ZW50TGlzdGVuZXIoJ3Nsb3RSZW5kZXJFbmRlZCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKGV2ZW50LnNsb3QuZ2V0U2xvdEVsZW1lbnRJZCgpLCAnZmluaXNoZWQgc2xvdCByZW5kZXJpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzbG90ID0gc2VsZi5zbG90c1tldmVudC5zbG90LmdldFNsb3RFbGVtZW50SWQoKV07XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvcmVmcmVzaF8xLkF1dG9SZWZyZXNoLnN0YXJ0KHNsb3QsIHNlbGYuYXV0b1JlZnJlc2gpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMub25TbG90UmVuZGVyRW5kZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNsb3RSZW5kZXJFbmRlZChldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mbygnZW5hYmxpbmcgc2VydmljZXMnKTtcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xldGFnLmVuYWJsZVNlcnZpY2VzKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHNsb3ROYW1lIGluIHNlbGYuc2xvdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5kaXNwbGF5KHNlbGYuc2xvdHNbc2xvdE5hbWVdLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKHNlbGYuc2xvdHNbc2xvdE5hbWVdLm5hbWUsICdzdGFydGVkIGRpc3BsYXlpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzZWxmLm9uU2Nyb2xsUmVmcmVzaExhenlsb2FkZWRTbG90cygpO1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLmxvYWRlZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlZnJlc2hBZHMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMTUwMCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFJ1Ymljb25GYXN0bGFuZURmcC5wcm90b3R5cGUucmVmcmVzaEFkcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgc2xvdE5hbWUgaW4gdGhpcy5zbG90cykge1xuICAgICAgICAgICAgdmFyIHNsb3QgPSB0aGlzLnNsb3RzW3Nsb3ROYW1lXTtcbiAgICAgICAgICAgIGlmIChzbG90Lmxhenlsb2FkRW5hYmxlZClcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIHNsb3Quc2V0VGFyZ2V0aW5nRm9yR1BUU2xvdCgpO1xuICAgICAgICAgICAgc2xvdC5yZWZyZXNoKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFJ1Ymljb25GYXN0bGFuZURmcC5wcm90b3R5cGUub25TY3JvbGxSZWZyZXNoTGF6eWxvYWRlZFNsb3RzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmdW5jdGlvbiByZWZyZXNoQWRzSWZJdElzSW5WaWV3cG9ydChldmVudCkge1xuICAgICAgICAgICAgZm9yICh2YXIgc2xvdE5hbWUgaW4gc2VsZi5zbG90cykge1xuICAgICAgICAgICAgICAgIHZhciBzbG90ID0gc2VsZi5zbG90c1tzbG90TmFtZV07XG4gICAgICAgICAgICAgICAgaWYgKHNsb3QubGF6eWxvYWRFbmFibGVkICYmIHZpZXdwb3J0XzEuVmlld3BvcnQuaXNFbGVtZW50SW5WaWV3cG9ydChzbG90LkhUTUxFbGVtZW50LCBzbG90Lmxhenlsb2FkT2Zmc2V0KSkge1xuICAgICAgICAgICAgICAgICAgICBzbG90LnNldFRhcmdldGluZ0ZvckdQVFNsb3QoKTtcbiAgICAgICAgICAgICAgICAgICAgc2xvdC5yZWZyZXNoKCk7XG4gICAgICAgICAgICAgICAgICAgIHNsb3QubGF6eWxvYWRFbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFJ1Ymljb25GYXN0bGFuZURmcC5wcm90b3R5cGUuYXV0b1JlZnJlc2ggPSBmdW5jdGlvbiAoc2xvdCkge1xuICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnc3RhcnRlZCByZWZyZXNoaW5nJyk7XG4gICAgICAgIGlmIChzbG90LnJ1Ymljb25Qb3NpdGlvbikge1xuICAgICAgICAgICAgcnViaWNvbnRhZy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2xvdC5kZWZpbmVTbG90KCk7XG4gICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhzZWxmLm5hbWUsICdSdWJpY29uIGFkIHNsb3QgZGVmaW5lZDogJywgc2xvdCk7XG4gICAgICAgICAgICAgICAgcnViaWNvbnRhZy5ydW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzbG90LnNldFRhcmdldGluZ0ZvckdQVFNsb3QoKTtcbiAgICAgICAgICAgICAgICAgICAgc2xvdC5yZWZyZXNoKCk7XG4gICAgICAgICAgICAgICAgfSwgeyBzbG90czogW3Nsb3QucnViaWNvbkFkU2xvdF0gfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNsb3QucmVmcmVzaCgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBSdWJpY29uRmFzdGxhbmVEZnAucHJvdG90eXBlLmdldFNsb3RzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2xvdHMgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgc2xvdCBpbiB3aW5kb3cuX21vbG90b3ZBZHMuc2xvdHMpIHtcbiAgICAgICAgICAgIHZhciBlbCA9IHdpbmRvdy5fbW9sb3RvdkFkcy5zbG90c1tzbG90XS5IVE1MRWxlbWVudDtcbiAgICAgICAgICAgIGlmICghZWwuZGF0YXNldC5tYWRBZHVuaXQgJiYgIWVsLmRhdGFzZXQubWFkUnViaWNvbilcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIHNsb3RzW2VsLmlkXSA9IG5ldyBydWJpY29uX2Zhc3RsYW5lX2RmcF9hZHNsb3RfMS5SdWJpY29uRmFzdGxhbmVEZnBBZFNsb3QoZWwpO1xuICAgICAgICAgICAgd2luZG93Ll9tb2xvdG92QWRzLnNsb3RzW2VsLmlkXSA9IHNsb3RzW2VsLmlkXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2xvdHM7XG4gICAgfTtcbiAgICByZXR1cm4gUnViaWNvbkZhc3RsYW5lRGZwO1xufSgpKTtcbmV4cG9ydHMuUnViaWNvbkZhc3RsYW5lRGZwID0gUnViaWNvbkZhc3RsYW5lRGZwO1xud2luZG93Ll9tb2xvdG92QWRzLmxvYWRQbHVnaW4obmV3IFJ1Ymljb25GYXN0bGFuZURmcCgpKTtcbiJdfQ==
