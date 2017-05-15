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
var SmartAdSlot = (function (_super) {
    __extends(SmartAdSlot, _super);
    function SmartAdSlot(HTMLElement) {
        var _this = _super.call(this, HTMLElement) || this;
        _this.HTMLElement = HTMLElement;
        var ds = HTMLElement.dataset;
        _this.name = HTMLElement.id;
        _this.smartAdId = ds['madSmartadId'];
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
    SmartAdSlot.prototype.refresh = function () {
        var self = this;
        sas.cmd.push(function () {
            sas.call("std", {
                siteId: 79174,
                pageId: "578000",
                formatId: self.smartAdId,
                target: ''
            });
        });
        sas.refresh(this.smartAdId);
    };
    SmartAdSlot.prototype.render = function () {
        if (this.lazyloadEnabled)
            return;
        sas.render(this.smartAdId);
    };
    return SmartAdSlot;
}(adslot_1.AdSlot));
exports.SmartAdSlot = SmartAdSlot;

},{"../../modules/adslot":1}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var smart_adslot_1 = require("./smart.adslot");
var logger_1 = require("../../modules/logger");
var viewport_1 = require("../../modules/viewport");
var autorefresh_1 = require("../../modules/autorefresh");
var SmartPlugIn = (function () {
    function SmartPlugIn() {
        this.name = "SmartAdServer";
        this.slots = {};
        this.callbacks = {};
    }
    SmartPlugIn.prototype.init = function (options) {
        var self = this;
        this.callbacks = options.callbacks;
        this.slots = this.getSlots();
        return new Promise(function (resolve, reject) {
            sas.cmd.push(function () {
                sas.call("onecall", {
                    siteId: options.siteId,
                    pageId: options.pageId,
                    formatId: options.formatId,
                    target: options.target
                });
            });
            window['sasCallback'] = function (event) {
                logger_1.Logger.logWithTime(sas.info[event].divId, 'finished slot rendering');
                var slot = self.slots[sas.info[event].divId];
                autorefresh_1.AutoRefresh.start(slot, self.autoRefresh);
                if (options.sasCallback)
                    options.sasCallback(event);
            };
            sas.cmd.push(function () {
                for (var slotName in self.slots) {
                    var slot = self.slots[slotName];
                    self.trigger("beforeRenderFormat", slot.smartAdId);
                    self.slots[slotName].render();
                    logger_1.Logger.log(self.name, 'ad slot rendered: ', self.slots[slotName]);
                }
                resolve();
            });
            self.onScrollRefreshLazyloadedSlots();
        });
    };
    SmartPlugIn.prototype.onScrollRefreshLazyloadedSlots = function () {
        var self = this;
        var refreshAdsIfItIsInViewport = function (event) {
            for (var slotName in self.slots) {
                var slot = self.slots[slotName];
                if (slot.lazyloadEnabled && viewport_1.Viewport.isElementInViewport(slot.HTMLElement, slot.lazyloadOffset)) {
                    self.trigger("beforeRenderFormat", slot.smartAdId);
                    slot.refresh();
                    slot.lazyloadEnabled = false;
                    logger_1.Logger.log(self.name, 'ad slot refreshed: ', self.slots[slotName]);
                }
            }
        };
        refreshAdsIfItIsInViewport(null);
        window.addEventListener('scroll', refreshAdsIfItIsInViewport);
    };
    SmartPlugIn.prototype.trigger = function (callback, params) {
        if (this.callbacks && this.callbacks[callback]) {
            this.callbacks[callback].call(params);
        }
    };
    SmartPlugIn.prototype.autoRefresh = function (slot) {
        logger_1.Logger.logWithTime(slot.name, 'started refreshing');
        slot.refresh();
    };
    SmartPlugIn.prototype.getSlots = function () {
        var slots = {};
        for (var slot in window._molotovAds.slots) {
            var el = window._molotovAds.slots[slot].HTMLElement;
            if (el.dataset.madAdunit === '')
                continue;
            slots[el.id] = new smart_adslot_1.SmartAdSlot(el);
            window._molotovAds.slots[el.id] = slots[el.id];
        }
        return slots;
    };
    return SmartPlugIn;
}());
exports.SmartPlugIn = SmartPlugIn;
window._molotovAds.loadPlugin(new SmartPlugIn());

},{"../../modules/autorefresh":2,"../../modules/logger":3,"../../modules/viewport":4,"./smart.adslot":5}]},{},[5,6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hZHNsb3QuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hdXRvcmVmcmVzaC5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL2xvZ2dlci5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL3ZpZXdwb3J0LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvc21hcnRhZHNlcnZlci9zbWFydC5hZHNsb3QuanMiLCJidWlsZC9zcmMvcGx1Z2lucy9zbWFydGFkc2VydmVyL3NtYXJ0LnBsdWdpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgQWRTbG90ID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBZFNsb3QoSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5IVE1MRWxlbWVudCA9IEhUTUxFbGVtZW50O1xuICAgICAgICB0aGlzLmxhenlsb2FkRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmF1dG9SZWZyZXNoRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmF1dG9SZWZyZXNoQ291bnRlciA9IDE7XG4gICAgfVxuICAgIHJldHVybiBBZFNsb3Q7XG59KCkpO1xuZXhwb3J0cy5BZFNsb3QgPSBBZFNsb3Q7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuL2xvZ2dlclwiKTtcbnZhciB2aWV3cG9ydF8xID0gcmVxdWlyZShcIi4vdmlld3BvcnRcIik7XG52YXIgQXV0b1JlZnJlc2g7XG4oZnVuY3Rpb24gKEF1dG9SZWZyZXNoKSB7XG4gICAgZnVuY3Rpb24gc3RhcnQoc2xvdCwgcmVmcmVzaEZ1bmN0aW9uKSB7XG4gICAgICAgIGlmICghc2xvdC5hdXRvUmVmcmVzaEVuYWJsZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmIChzbG90LmF1dG9SZWZyZXNoQ291bnRlciA8PSBzbG90LmF1dG9SZWZyZXNoTGltaXQpIHtcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoc2xvdC5uYW1lLCAncmVmcmVzaGluZyBpbicsIHNsb3QuYXV0b1JlZnJlc2hUaW1lLCAnc2Vjb25kcyAoJywgc2xvdC5hdXRvUmVmcmVzaENvdW50ZXIsICcvJywgc2xvdC5hdXRvUmVmcmVzaExpbWl0LCAnKScpO1xuICAgICAgICAgICAgc2V0VGltZW91dChyZWZyZXNoU2xvdEZvckF1dG9Sb3RhdGUsIHNsb3QuYXV0b1JlZnJlc2hUaW1lICogMTAwMCwgc2xvdCwgcmVmcmVzaEZ1bmN0aW9uKTtcbiAgICAgICAgICAgIHNsb3QuYXV0b1JlZnJlc2hDb3VudGVyKys7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzbG90LmF1dG9SZWZyZXNoRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmluZm9XaXRoVGltZShzbG90Lm5hbWUsICdhdXRvIHJlZnJlc2ggZW5kZWQnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBBdXRvUmVmcmVzaC5zdGFydCA9IHN0YXJ0O1xuICAgIGZ1bmN0aW9uIHJlZnJlc2hTbG90Rm9yQXV0b1JvdGF0ZShzbG90LCByZWZyZXNoRnVuY3Rpb24pIHtcbiAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKHNsb3QubmFtZSwgJ3N0YXJ0aW5nIHJlZnJlc2ggZm9yIGF1dG8gcm90YXRlJyk7XG4gICAgICAgIEF1dG9SZWZyZXNoLnJlZnJlc2hJZlZpZXdhYmxlKHNsb3QsIHJlZnJlc2hGdW5jdGlvbik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlZnJlc2hJZlZpZXdhYmxlKHNsb3QsIHJlZnJlc2hGdW5jdGlvbikge1xuICAgICAgICBpZiAoZG9jdW1lbnQuaGlkZGVuKSB7XG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnbWFya2VkIGZvciByZWZyZXNoIG9uIHZpc2liaWxpdHljaGFuZ2UnKTtcbiAgICAgICAgICAgIHZhciB2aXNpYmlsaXR5QmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRvUmVmcmVzaC5yZWZyZXNoSWZWaWV3YWJsZShzbG90LCByZWZyZXNoRnVuY3Rpb24pO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCB2aXNpYmlsaXR5QmFjayk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIHZpc2liaWxpdHlCYWNrKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmVlZGVkVmlld2FiaWxpdHlQZXJjZW50YWdlID0gNTA7XG4gICAgICAgIGlmICh2aWV3cG9ydF8xLlZpZXdwb3J0LmdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2Uoc2xvdC5IVE1MRWxlbWVudCkgPj0gbmVlZGVkVmlld2FiaWxpdHlQZXJjZW50YWdlKSB7XG4gICAgICAgICAgICByZWZyZXNoRnVuY3Rpb24oc2xvdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAndmlld2FibGl0eSBsb3dlciB0aGFuIDUwJSwgbm90IHJlZnJlc2hpbmcnKTtcbiAgICAgICAgICAgIHZhciBpbnRlcnZhbEZvclJlZnJlc2ggPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZpZXdwb3J0XzEuVmlld3BvcnQuZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZShzbG90LkhUTUxFbGVtZW50KSA+PSBuZWVkZWRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmcmVzaEZ1bmN0aW9uKHNsb3QpO1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsRm9yUmVmcmVzaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgQXV0b1JlZnJlc2gucmVmcmVzaElmVmlld2FibGUgPSByZWZyZXNoSWZWaWV3YWJsZTtcbn0pKEF1dG9SZWZyZXNoID0gZXhwb3J0cy5BdXRvUmVmcmVzaCB8fCAoZXhwb3J0cy5BdXRvUmVmcmVzaCA9IHt9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBMb2dnZXI7XG4oZnVuY3Rpb24gKExvZ2dlcikge1xuICAgIHZhciBkZXZNb2RlRW5hYmxlZCA9IGxvY2F0aW9uLmhhc2guaW5kZXhPZignZGV2ZWxvcG1lbnQnKSA+PSAwO1xuICAgIGZ1bmN0aW9uIGxvZygpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcbiAgICB9XG4gICAgTG9nZ2VyLmxvZyA9IGxvZztcbiAgICBmdW5jdGlvbiBsb2dXaXRoVGltZSgpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIGxvZyhnZXRDdXJyZW50VGltZVN0cmluZygpLCAnLT4nLCBpdGVtcy5qb2luKCcgJykpO1xuICAgIH1cbiAgICBMb2dnZXIubG9nV2l0aFRpbWUgPSBsb2dXaXRoVGltZTtcbiAgICBmdW5jdGlvbiBpbmZvKCkge1xuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc29sZS5pbmZvLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcbiAgICB9XG4gICAgTG9nZ2VyLmluZm8gPSBpbmZvO1xuICAgIGZ1bmN0aW9uIGluZm9XaXRoVGltZSgpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIGluZm8oZ2V0Q3VycmVudFRpbWVTdHJpbmcoKSwgJy0+JywgaXRlbXMuam9pbignICcpKTtcbiAgICB9XG4gICAgTG9nZ2VyLmluZm9XaXRoVGltZSA9IGluZm9XaXRoVGltZTtcbiAgICBmdW5jdGlvbiB3YXJuKCkge1xuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc29sZS53YXJuLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcbiAgICB9XG4gICAgTG9nZ2VyLndhcm4gPSB3YXJuO1xuICAgIGZ1bmN0aW9uIGVycm9yKCkge1xuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBpdGVtcyk7XG4gICAgfVxuICAgIExvZ2dlci5lcnJvciA9IGVycm9yO1xuICAgIGZ1bmN0aW9uIGNvbnNvbGVXZWxjb21lTWVzc2FnZSgpIHtcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc29sZS5sb2coXCIlYyBfXyAgICAgICBfXyAgIF9fX19fXyAgIF9fX19fX18gIFxcbnwgIFxcXFwgICAgIC8gIFxcXFwgLyAgICAgIFxcXFwgfCAgICAgICBcXFxcIFxcbnwgJCRcXFxcICAgLyAgJCR8ICAkJCQkJCRcXFxcfCAkJCQkJCQkXFxcXFxcbnwgJCQkXFxcXCAvICAkJCR8ICQkX198ICQkfCAkJCAgfCAkJFxcbnwgJCQkJFxcXFwgICQkJCR8ICQkICAgICQkfCAkJCAgfCAkJFxcbnwgJCRcXFxcJCQgJCQgJCR8ICQkJCQkJCQkfCAkJCAgfCAkJFxcbnwgJCQgXFxcXCQkJHwgJCR8ICQkICB8ICQkfCAkJF9fLyAkJFxcbnwgJCQgIFxcXFwkIHwgJCR8ICQkICB8ICQkfCAkJCAgICAkJFxcbiBcXFxcJCQgICAgICBcXFxcJCQgXFxcXCQkICAgXFxcXCQkIFxcXFwkJCQkJCQkXFxuXFxuXCIsIFwiY29sb3I6cmVkO1wiKTtcbiAgICAgICAgY29uc29sZS5sb2coJyVjXFxuTW9sb3RvdiBBZHMgLSBEZXZlbG9wZXIgQ29uc29sZVxcblxcbicsICdjb2xvcjpibHVlOycpO1xuICAgIH1cbiAgICBMb2dnZXIuY29uc29sZVdlbGNvbWVNZXNzYWdlID0gY29uc29sZVdlbGNvbWVNZXNzYWdlO1xuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRUaW1lU3RyaW5nKCkge1xuICAgICAgICB2YXIgdGltZSA9IG5ldyBEYXRlKCkuZ2V0SG91cnMoKSArICc6JyArIG5ldyBEYXRlKCkuZ2V0TWludXRlcygpICsgJzonICsgbmV3IERhdGUoKS5nZXRTZWNvbmRzKCkgKyAnLicgKyBuZXcgRGF0ZSgpLmdldE1pbGxpc2Vjb25kcygpO1xuICAgICAgICByZXR1cm4gdGltZTtcbiAgICB9XG59KShMb2dnZXIgPSBleHBvcnRzLkxvZ2dlciB8fCAoZXhwb3J0cy5Mb2dnZXIgPSB7fSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgVmlld3BvcnQ7XG4oZnVuY3Rpb24gKFZpZXdwb3J0KSB7XG4gICAgZnVuY3Rpb24gaXNFbGVtZW50SW5WaWV3cG9ydChlbGVtZW50LCB0aHJlc2hvbGQpIHtcbiAgICAgICAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICByZXR1cm4gKHJlY3QudG9wID49IDAgJiZcbiAgICAgICAgICAgIHJlY3QubGVmdCA+PSAwICYmXG4gICAgICAgICAgICByZWN0LmJvdHRvbSAtIHRocmVzaG9sZCA8PSAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpICYmXG4gICAgICAgICAgICByZWN0LnJpZ2h0IDw9ICh3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpKTtcbiAgICB9XG4gICAgVmlld3BvcnQuaXNFbGVtZW50SW5WaWV3cG9ydCA9IGlzRWxlbWVudEluVmlld3BvcnQ7XG4gICAgZnVuY3Rpb24gaXNFbGVtZW50VmlzaWJsZShlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiAhIShlbGVtZW50Lm9mZnNldFdpZHRoIHx8IGVsZW1lbnQub2Zmc2V0SGVpZ2h0IHx8IGVsZW1lbnQuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGgpO1xuICAgIH1cbiAgICBWaWV3cG9ydC5pc0VsZW1lbnRWaXNpYmxlID0gaXNFbGVtZW50VmlzaWJsZTtcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHJlY3RUb3AgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcbiAgICAgICAgdmFyIHRvcCA9IHJlY3RUb3AgPiAwID8gd2luZG93LmlubmVySGVpZ2h0IC0gcmVjdFRvcCA6IE1hdGguYWJzKHJlY3RUb3ApO1xuICAgICAgICB2YXIgcmVzdWx0ID0gdG9wIC8gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIHJlc3VsdCA9IHJlY3RUb3AgPiAwID8gcmVzdWx0IDogMSAtIHJlc3VsdDtcbiAgICAgICAgaWYgKHJlc3VsdCA8IDApXG4gICAgICAgICAgICByZXN1bHQgPSAwO1xuICAgICAgICBpZiAocmVzdWx0ID4gMSlcbiAgICAgICAgICAgIHJlc3VsdCA9IDE7XG4gICAgICAgIHJldHVybiByZXN1bHQgKiAxMDA7XG4gICAgfVxuICAgIFZpZXdwb3J0LmdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UgPSBnZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlO1xufSkoVmlld3BvcnQgPSBleHBvcnRzLlZpZXdwb3J0IHx8IChleHBvcnRzLlZpZXdwb3J0ID0ge30pKTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgYWRzbG90XzEgPSByZXF1aXJlKFwiLi4vLi4vbW9kdWxlcy9hZHNsb3RcIik7XG52YXIgU21hcnRBZFNsb3QgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTbWFydEFkU2xvdCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTbWFydEFkU2xvdChIVE1MRWxlbWVudCkge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBIVE1MRWxlbWVudCkgfHwgdGhpcztcbiAgICAgICAgX3RoaXMuSFRNTEVsZW1lbnQgPSBIVE1MRWxlbWVudDtcbiAgICAgICAgdmFyIGRzID0gSFRNTEVsZW1lbnQuZGF0YXNldDtcbiAgICAgICAgX3RoaXMubmFtZSA9IEhUTUxFbGVtZW50LmlkO1xuICAgICAgICBfdGhpcy5zbWFydEFkSWQgPSBkc1snbWFkU21hcnRhZElkJ107XG4gICAgICAgIF90aGlzLmF1dG9SZWZyZXNoVGltZSA9IE51bWJlcihkc1snbWFkQXV0b1JlZnJlc2hJblNlY29uZHMnXSkgfHwgMDtcbiAgICAgICAgX3RoaXMuYXV0b1JlZnJlc2hMaW1pdCA9IE51bWJlcihkc1snbWFkQXV0b1JlZnJlc2hMaW1pdCddKSB8fCAwO1xuICAgICAgICBfdGhpcy5sYXp5bG9hZE9mZnNldCA9IE51bWJlcihkc1snbWFkTGF6eWxvYWRPZmZzZXQnXSk7XG4gICAgICAgIF90aGlzLmF1dG9SZWZyZXNoRW5hYmxlZCA9IF90aGlzLmF1dG9SZWZyZXNoVGltZSA+IDA7XG4gICAgICAgIGlmIChfdGhpcy5sYXp5bG9hZE9mZnNldCkge1xuICAgICAgICAgICAgX3RoaXMubGF6eWxvYWRPZmZzZXQgPSBfdGhpcy5sYXp5bG9hZE9mZnNldCB8fCAwO1xuICAgICAgICAgICAgX3RoaXMubGF6eWxvYWRFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIFNtYXJ0QWRTbG90LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNhcy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzYXMuY2FsbChcInN0ZFwiLCB7XG4gICAgICAgICAgICAgICAgc2l0ZUlkOiA3OTE3NCxcbiAgICAgICAgICAgICAgICBwYWdlSWQ6IFwiNTc4MDAwXCIsXG4gICAgICAgICAgICAgICAgZm9ybWF0SWQ6IHNlbGYuc21hcnRBZElkLFxuICAgICAgICAgICAgICAgIHRhcmdldDogJydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgc2FzLnJlZnJlc2godGhpcy5zbWFydEFkSWQpO1xuICAgIH07XG4gICAgU21hcnRBZFNsb3QucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMubGF6eWxvYWRFbmFibGVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzYXMucmVuZGVyKHRoaXMuc21hcnRBZElkKTtcbiAgICB9O1xuICAgIHJldHVybiBTbWFydEFkU2xvdDtcbn0oYWRzbG90XzEuQWRTbG90KSk7XG5leHBvcnRzLlNtYXJ0QWRTbG90ID0gU21hcnRBZFNsb3Q7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBzbWFydF9hZHNsb3RfMSA9IHJlcXVpcmUoXCIuL3NtYXJ0LmFkc2xvdFwiKTtcbnZhciBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2xvZ2dlclwiKTtcbnZhciB2aWV3cG9ydF8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvdmlld3BvcnRcIik7XG52YXIgYXV0b3JlZnJlc2hfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2F1dG9yZWZyZXNoXCIpO1xudmFyIFNtYXJ0UGx1Z0luID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTbWFydFBsdWdJbigpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gXCJTbWFydEFkU2VydmVyXCI7XG4gICAgICAgIHRoaXMuc2xvdHMgPSB7fTtcbiAgICAgICAgdGhpcy5jYWxsYmFja3MgPSB7fTtcbiAgICB9XG4gICAgU21hcnRQbHVnSW4ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzID0gb3B0aW9ucy5jYWxsYmFja3M7XG4gICAgICAgIHRoaXMuc2xvdHMgPSB0aGlzLmdldFNsb3RzKCk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBzYXMuY21kLnB1c2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNhcy5jYWxsKFwib25lY2FsbFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIHNpdGVJZDogb3B0aW9ucy5zaXRlSWQsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VJZDogb3B0aW9ucy5wYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdElkOiBvcHRpb25zLmZvcm1hdElkLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IG9wdGlvbnMudGFyZ2V0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHdpbmRvd1snc2FzQ2FsbGJhY2snXSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzYXMuaW5mb1tldmVudF0uZGl2SWQsICdmaW5pc2hlZCBzbG90IHJlbmRlcmluZycpO1xuICAgICAgICAgICAgICAgIHZhciBzbG90ID0gc2VsZi5zbG90c1tzYXMuaW5mb1tldmVudF0uZGl2SWRdO1xuICAgICAgICAgICAgICAgIGF1dG9yZWZyZXNoXzEuQXV0b1JlZnJlc2guc3RhcnQoc2xvdCwgc2VsZi5hdXRvUmVmcmVzaCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2FzQ2FsbGJhY2spXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc2FzQ2FsbGJhY2soZXZlbnQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNhcy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgc2xvdE5hbWUgaW4gc2VsZi5zbG90cykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2xvdCA9IHNlbGYuc2xvdHNbc2xvdE5hbWVdO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXIoXCJiZWZvcmVSZW5kZXJGb3JtYXRcIiwgc2xvdC5zbWFydEFkSWQpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnNsb3RzW3Nsb3ROYW1lXS5yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhzZWxmLm5hbWUsICdhZCBzbG90IHJlbmRlcmVkOiAnLCBzZWxmLnNsb3RzW3Nsb3ROYW1lXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2VsZi5vblNjcm9sbFJlZnJlc2hMYXp5bG9hZGVkU2xvdHMoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBTbWFydFBsdWdJbi5wcm90b3R5cGUub25TY3JvbGxSZWZyZXNoTGF6eWxvYWRlZFNsb3RzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciByZWZyZXNoQWRzSWZJdElzSW5WaWV3cG9ydCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgZm9yICh2YXIgc2xvdE5hbWUgaW4gc2VsZi5zbG90cykge1xuICAgICAgICAgICAgICAgIHZhciBzbG90ID0gc2VsZi5zbG90c1tzbG90TmFtZV07XG4gICAgICAgICAgICAgICAgaWYgKHNsb3QubGF6eWxvYWRFbmFibGVkICYmIHZpZXdwb3J0XzEuVmlld3BvcnQuaXNFbGVtZW50SW5WaWV3cG9ydChzbG90LkhUTUxFbGVtZW50LCBzbG90Lmxhenlsb2FkT2Zmc2V0KSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXIoXCJiZWZvcmVSZW5kZXJGb3JtYXRcIiwgc2xvdC5zbWFydEFkSWQpO1xuICAgICAgICAgICAgICAgICAgICBzbG90LnJlZnJlc2goKTtcbiAgICAgICAgICAgICAgICAgICAgc2xvdC5sYXp5bG9hZEVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhzZWxmLm5hbWUsICdhZCBzbG90IHJlZnJlc2hlZDogJywgc2VsZi5zbG90c1tzbG90TmFtZV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmVmcmVzaEFkc0lmSXRJc0luVmlld3BvcnQobnVsbCk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCByZWZyZXNoQWRzSWZJdElzSW5WaWV3cG9ydCk7XG4gICAgfTtcbiAgICBTbWFydFBsdWdJbi5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uIChjYWxsYmFjaywgcGFyYW1zKSB7XG4gICAgICAgIGlmICh0aGlzLmNhbGxiYWNrcyAmJiB0aGlzLmNhbGxiYWNrc1tjYWxsYmFja10pIHtcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzW2NhbGxiYWNrXS5jYWxsKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFNtYXJ0UGx1Z0luLnByb3RvdHlwZS5hdXRvUmVmcmVzaCA9IGZ1bmN0aW9uIChzbG90KSB7XG4gICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICdzdGFydGVkIHJlZnJlc2hpbmcnKTtcbiAgICAgICAgc2xvdC5yZWZyZXNoKCk7XG4gICAgfTtcbiAgICBTbWFydFBsdWdJbi5wcm90b3R5cGUuZ2V0U2xvdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzbG90cyA9IHt9O1xuICAgICAgICBmb3IgKHZhciBzbG90IGluIHdpbmRvdy5fbW9sb3RvdkFkcy5zbG90cykge1xuICAgICAgICAgICAgdmFyIGVsID0gd2luZG93Ll9tb2xvdG92QWRzLnNsb3RzW3Nsb3RdLkhUTUxFbGVtZW50O1xuICAgICAgICAgICAgaWYgKGVsLmRhdGFzZXQubWFkQWR1bml0ID09PSAnJylcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIHNsb3RzW2VsLmlkXSA9IG5ldyBzbWFydF9hZHNsb3RfMS5TbWFydEFkU2xvdChlbCk7XG4gICAgICAgICAgICB3aW5kb3cuX21vbG90b3ZBZHMuc2xvdHNbZWwuaWRdID0gc2xvdHNbZWwuaWRdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzbG90cztcbiAgICB9O1xuICAgIHJldHVybiBTbWFydFBsdWdJbjtcbn0oKSk7XG5leHBvcnRzLlNtYXJ0UGx1Z0luID0gU21hcnRQbHVnSW47XG53aW5kb3cuX21vbG90b3ZBZHMubG9hZFBsdWdpbihuZXcgU21hcnRQbHVnSW4oKSk7XG4iXX0=
