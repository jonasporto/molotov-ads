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
    SmartAdSlot.prototype.refresh = function () { };
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
        this.options = options;
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
                var _loop_1 = function (slotName) {
                    var slot = self.slots[slotName];
                    self.trigger("beforeRenderFormat", slot.smartAdId, function () {
                        self.slots[slotName].render();
                    });
                    logger_1.Logger.log(self.name, 'ad slot rendered: ', self.slots[slotName]);
                };
                for (var slotName in self.slots) {
                    _loop_1(slotName);
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
                    self.trigger("beforeRenderFormat", slot.smartAdId, function () {
                        sas.cmd.push(function () {
                            sas.call("std", {
                                siteId: self.options.siteId,
                                pageId: self.options.pageId,
                                formatId: self.options.formatId,
                                target: self.options.target
                            });
                        });
                    });
                    slot.lazyloadEnabled = false;
                    logger_1.Logger.log(self.name, 'ad slot refreshed: ', self.slots[slotName]);
                }
            }
        };
        refreshAdsIfItIsInViewport(null);
        window.addEventListener('scroll', refreshAdsIfItIsInViewport);
    };
    SmartPlugIn.prototype.trigger = function (event, params, callback) {
        if (this.callbacks && this.callbacks[event]) {
            this.callbacks[event].call(this, params, callback);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hZHNsb3QuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hdXRvcmVmcmVzaC5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL2xvZ2dlci5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL3ZpZXdwb3J0LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvc21hcnRhZHNlcnZlci9zbWFydC5hZHNsb3QuanMiLCJidWlsZC9zcmMvcGx1Z2lucy9zbWFydGFkc2VydmVyL3NtYXJ0LnBsdWdpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIEFkU2xvdCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQWRTbG90KEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuSFRNTEVsZW1lbnQgPSBIVE1MRWxlbWVudDtcbiAgICAgICAgdGhpcy5sYXp5bG9hZEVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hdXRvUmVmcmVzaEVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hdXRvUmVmcmVzaENvdW50ZXIgPSAxO1xuICAgIH1cbiAgICByZXR1cm4gQWRTbG90O1xufSgpKTtcbmV4cG9ydHMuQWRTbG90ID0gQWRTbG90O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9sb2dnZXJcIik7XG52YXIgdmlld3BvcnRfMSA9IHJlcXVpcmUoXCIuL3ZpZXdwb3J0XCIpO1xudmFyIEF1dG9SZWZyZXNoO1xuKGZ1bmN0aW9uIChBdXRvUmVmcmVzaCkge1xuICAgIGZ1bmN0aW9uIHN0YXJ0KHNsb3QsIHJlZnJlc2hGdW5jdGlvbikge1xuICAgICAgICBpZiAoIXNsb3QuYXV0b1JlZnJlc2hFbmFibGVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBpZiAoc2xvdC5hdXRvUmVmcmVzaENvdW50ZXIgPD0gc2xvdC5hdXRvUmVmcmVzaExpbWl0KSB7XG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mb1dpdGhUaW1lKHNsb3QubmFtZSwgJ3JlZnJlc2hpbmcgaW4nLCBzbG90LmF1dG9SZWZyZXNoVGltZSwgJ3NlY29uZHMgKCcsIHNsb3QuYXV0b1JlZnJlc2hDb3VudGVyLCAnLycsIHNsb3QuYXV0b1JlZnJlc2hMaW1pdCwgJyknKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQocmVmcmVzaFNsb3RGb3JBdXRvUm90YXRlLCBzbG90LmF1dG9SZWZyZXNoVGltZSAqIDEwMDAsIHNsb3QsIHJlZnJlc2hGdW5jdGlvbik7XG4gICAgICAgICAgICBzbG90LmF1dG9SZWZyZXNoQ291bnRlcisrO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2xvdC5hdXRvUmVmcmVzaEVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoc2xvdC5uYW1lLCAnYXV0byByZWZyZXNoIGVuZGVkJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgQXV0b1JlZnJlc2guc3RhcnQgPSBzdGFydDtcbiAgICBmdW5jdGlvbiByZWZyZXNoU2xvdEZvckF1dG9Sb3RhdGUoc2xvdCwgcmVmcmVzaEZ1bmN0aW9uKSB7XG4gICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICdzdGFydGluZyByZWZyZXNoIGZvciBhdXRvIHJvdGF0ZScpO1xuICAgICAgICBBdXRvUmVmcmVzaC5yZWZyZXNoSWZWaWV3YWJsZShzbG90LCByZWZyZXNoRnVuY3Rpb24pO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZWZyZXNoSWZWaWV3YWJsZShzbG90LCByZWZyZXNoRnVuY3Rpb24pIHtcbiAgICAgICAgaWYgKGRvY3VtZW50LmhpZGRlbikge1xuICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKHNsb3QubmFtZSwgJ21hcmtlZCBmb3IgcmVmcmVzaCBvbiB2aXNpYmlsaXR5Y2hhbmdlJyk7XG4gICAgICAgICAgICB2YXIgdmlzaWJpbGl0eUJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0b1JlZnJlc2gucmVmcmVzaElmVmlld2FibGUoc2xvdCwgcmVmcmVzaEZ1bmN0aW9uKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgdmlzaWJpbGl0eUJhY2spO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCB2aXNpYmlsaXR5QmFjayk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5lZWRlZFZpZXdhYmlsaXR5UGVyY2VudGFnZSA9IDUwO1xuICAgICAgICBpZiAodmlld3BvcnRfMS5WaWV3cG9ydC5nZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlKHNsb3QuSFRNTEVsZW1lbnQpID49IG5lZWRlZFZpZXdhYmlsaXR5UGVyY2VudGFnZSkge1xuICAgICAgICAgICAgcmVmcmVzaEZ1bmN0aW9uKHNsb3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKHNsb3QubmFtZSwgJ3ZpZXdhYmxpdHkgbG93ZXIgdGhhbiA1MCUsIG5vdCByZWZyZXNoaW5nJyk7XG4gICAgICAgICAgICB2YXIgaW50ZXJ2YWxGb3JSZWZyZXNoID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh2aWV3cG9ydF8xLlZpZXdwb3J0LmdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2Uoc2xvdC5IVE1MRWxlbWVudCkgPj0gbmVlZGVkVmlld2FiaWxpdHlQZXJjZW50YWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZnJlc2hGdW5jdGlvbihzbG90KTtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbEZvclJlZnJlc2gpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICB9XG4gICAgfVxuICAgIEF1dG9SZWZyZXNoLnJlZnJlc2hJZlZpZXdhYmxlID0gcmVmcmVzaElmVmlld2FibGU7XG59KShBdXRvUmVmcmVzaCA9IGV4cG9ydHMuQXV0b1JlZnJlc2ggfHwgKGV4cG9ydHMuQXV0b1JlZnJlc2ggPSB7fSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgTG9nZ2VyO1xuKGZ1bmN0aW9uIChMb2dnZXIpIHtcbiAgICB2YXIgZGV2TW9kZUVuYWJsZWQgPSBsb2NhdGlvbi5oYXNoLmluZGV4T2YoJ2RldmVsb3BtZW50JykgPj0gMDtcbiAgICBmdW5jdGlvbiBsb2coKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBpdGVtcyk7XG4gICAgfVxuICAgIExvZ2dlci5sb2cgPSBsb2c7XG4gICAgZnVuY3Rpb24gbG9nV2l0aFRpbWUoKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICBsb2coZ2V0Q3VycmVudFRpbWVTdHJpbmcoKSwgJy0+JywgaXRlbXMuam9pbignICcpKTtcbiAgICB9XG4gICAgTG9nZ2VyLmxvZ1dpdGhUaW1lID0gbG9nV2l0aFRpbWU7XG4gICAgZnVuY3Rpb24gaW5mbygpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnNvbGUuaW5mby5hcHBseShjb25zb2xlLCBpdGVtcyk7XG4gICAgfVxuICAgIExvZ2dlci5pbmZvID0gaW5mbztcbiAgICBmdW5jdGlvbiBpbmZvV2l0aFRpbWUoKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICBpbmZvKGdldEN1cnJlbnRUaW1lU3RyaW5nKCksICctPicsIGl0ZW1zLmpvaW4oJyAnKSk7XG4gICAgfVxuICAgIExvZ2dlci5pbmZvV2l0aFRpbWUgPSBpbmZvV2l0aFRpbWU7XG4gICAgZnVuY3Rpb24gd2FybigpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnNvbGUud2Fybi5hcHBseShjb25zb2xlLCBpdGVtcyk7XG4gICAgfVxuICAgIExvZ2dlci53YXJuID0gd2FybjtcbiAgICBmdW5jdGlvbiBlcnJvcigpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnNvbGUuZXJyb3IuYXBwbHkoY29uc29sZSwgaXRlbXMpO1xuICAgIH1cbiAgICBMb2dnZXIuZXJyb3IgPSBlcnJvcjtcbiAgICBmdW5jdGlvbiBjb25zb2xlV2VsY29tZU1lc3NhZ2UoKSB7XG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnNvbGUubG9nKFwiJWMgX18gICAgICAgX18gICBfX19fX18gICBfX19fX19fICBcXG58ICBcXFxcICAgICAvICBcXFxcIC8gICAgICBcXFxcIHwgICAgICAgXFxcXCBcXG58ICQkXFxcXCAgIC8gICQkfCAgJCQkJCQkXFxcXHwgJCQkJCQkJFxcXFxcXG58ICQkJFxcXFwgLyAgJCQkfCAkJF9ffCAkJHwgJCQgIHwgJCRcXG58ICQkJCRcXFxcICAkJCQkfCAkJCAgICAkJHwgJCQgIHwgJCRcXG58ICQkXFxcXCQkICQkICQkfCAkJCQkJCQkJHwgJCQgIHwgJCRcXG58ICQkIFxcXFwkJCR8ICQkfCAkJCAgfCAkJHwgJCRfXy8gJCRcXG58ICQkICBcXFxcJCB8ICQkfCAkJCAgfCAkJHwgJCQgICAgJCRcXG4gXFxcXCQkICAgICAgXFxcXCQkIFxcXFwkJCAgIFxcXFwkJCBcXFxcJCQkJCQkJFxcblxcblwiLCBcImNvbG9yOnJlZDtcIik7XG4gICAgICAgIGNvbnNvbGUubG9nKCclY1xcbk1vbG90b3YgQWRzIC0gRGV2ZWxvcGVyIENvbnNvbGVcXG5cXG4nLCAnY29sb3I6Ymx1ZTsnKTtcbiAgICB9XG4gICAgTG9nZ2VyLmNvbnNvbGVXZWxjb21lTWVzc2FnZSA9IGNvbnNvbGVXZWxjb21lTWVzc2FnZTtcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50VGltZVN0cmluZygpIHtcbiAgICAgICAgdmFyIHRpbWUgPSBuZXcgRGF0ZSgpLmdldEhvdXJzKCkgKyAnOicgKyBuZXcgRGF0ZSgpLmdldE1pbnV0ZXMoKSArICc6JyArIG5ldyBEYXRlKCkuZ2V0U2Vjb25kcygpICsgJy4nICsgbmV3IERhdGUoKS5nZXRNaWxsaXNlY29uZHMoKTtcbiAgICAgICAgcmV0dXJuIHRpbWU7XG4gICAgfVxufSkoTG9nZ2VyID0gZXhwb3J0cy5Mb2dnZXIgfHwgKGV4cG9ydHMuTG9nZ2VyID0ge30pKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIFZpZXdwb3J0O1xuKGZ1bmN0aW9uIChWaWV3cG9ydCkge1xuICAgIGZ1bmN0aW9uIGlzRWxlbWVudEluVmlld3BvcnQoZWxlbWVudCwgdGhyZXNob2xkKSB7XG4gICAgICAgIHZhciByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgcmV0dXJuIChyZWN0LnRvcCA+PSAwICYmXG4gICAgICAgICAgICByZWN0LmxlZnQgPj0gMCAmJlxuICAgICAgICAgICAgcmVjdC5ib3R0b20gLSB0aHJlc2hvbGQgPD0gKHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KSAmJlxuICAgICAgICAgICAgcmVjdC5yaWdodCA8PSAod2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKSk7XG4gICAgfVxuICAgIFZpZXdwb3J0LmlzRWxlbWVudEluVmlld3BvcnQgPSBpc0VsZW1lbnRJblZpZXdwb3J0O1xuICAgIGZ1bmN0aW9uIGlzRWxlbWVudFZpc2libGUoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gISEoZWxlbWVudC5vZmZzZXRXaWR0aCB8fCBlbGVtZW50Lm9mZnNldEhlaWdodCB8fCBlbGVtZW50LmdldENsaWVudFJlY3RzKCkubGVuZ3RoKTtcbiAgICB9XG4gICAgVmlld3BvcnQuaXNFbGVtZW50VmlzaWJsZSA9IGlzRWxlbWVudFZpc2libGU7XG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZShlbGVtZW50KSB7XG4gICAgICAgIHZhciByZWN0VG9wID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XG4gICAgICAgIHZhciB0b3AgPSByZWN0VG9wID4gMCA/IHdpbmRvdy5pbm5lckhlaWdodCAtIHJlY3RUb3AgOiBNYXRoLmFicyhyZWN0VG9wKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRvcCAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICByZXN1bHQgPSByZWN0VG9wID4gMCA/IHJlc3VsdCA6IDEgLSByZXN1bHQ7XG4gICAgICAgIGlmIChyZXN1bHQgPCAwKVxuICAgICAgICAgICAgcmVzdWx0ID0gMDtcbiAgICAgICAgaWYgKHJlc3VsdCA+IDEpXG4gICAgICAgICAgICByZXN1bHQgPSAxO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICogMTAwO1xuICAgIH1cbiAgICBWaWV3cG9ydC5nZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlID0gZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZTtcbn0pKFZpZXdwb3J0ID0gZXhwb3J0cy5WaWV3cG9ydCB8fCAoZXhwb3J0cy5WaWV3cG9ydCA9IHt9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGFkc2xvdF8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvYWRzbG90XCIpO1xudmFyIFNtYXJ0QWRTbG90ID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoU21hcnRBZFNsb3QsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU21hcnRBZFNsb3QoSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgSFRNTEVsZW1lbnQpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLkhUTUxFbGVtZW50ID0gSFRNTEVsZW1lbnQ7XG4gICAgICAgIHZhciBkcyA9IEhUTUxFbGVtZW50LmRhdGFzZXQ7XG4gICAgICAgIF90aGlzLm5hbWUgPSBIVE1MRWxlbWVudC5pZDtcbiAgICAgICAgX3RoaXMuc21hcnRBZElkID0gZHNbJ21hZFNtYXJ0YWRJZCddO1xuICAgICAgICBfdGhpcy5hdXRvUmVmcmVzaFRpbWUgPSBOdW1iZXIoZHNbJ21hZEF1dG9SZWZyZXNoSW5TZWNvbmRzJ10pIHx8IDA7XG4gICAgICAgIF90aGlzLmF1dG9SZWZyZXNoTGltaXQgPSBOdW1iZXIoZHNbJ21hZEF1dG9SZWZyZXNoTGltaXQnXSkgfHwgMDtcbiAgICAgICAgX3RoaXMubGF6eWxvYWRPZmZzZXQgPSBOdW1iZXIoZHNbJ21hZExhenlsb2FkT2Zmc2V0J10pO1xuICAgICAgICBfdGhpcy5hdXRvUmVmcmVzaEVuYWJsZWQgPSBfdGhpcy5hdXRvUmVmcmVzaFRpbWUgPiAwO1xuICAgICAgICBpZiAoX3RoaXMubGF6eWxvYWRPZmZzZXQpIHtcbiAgICAgICAgICAgIF90aGlzLmxhenlsb2FkT2Zmc2V0ID0gX3RoaXMubGF6eWxvYWRPZmZzZXQgfHwgMDtcbiAgICAgICAgICAgIF90aGlzLmxhenlsb2FkRW5hYmxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBTbWFydEFkU2xvdC5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uICgpIHsgfTtcbiAgICBTbWFydEFkU2xvdC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5sYXp5bG9hZEVuYWJsZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNhcy5yZW5kZXIodGhpcy5zbWFydEFkSWQpO1xuICAgIH07XG4gICAgcmV0dXJuIFNtYXJ0QWRTbG90O1xufShhZHNsb3RfMS5BZFNsb3QpKTtcbmV4cG9ydHMuU21hcnRBZFNsb3QgPSBTbWFydEFkU2xvdDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHNtYXJ0X2Fkc2xvdF8xID0gcmVxdWlyZShcIi4vc21hcnQuYWRzbG90XCIpO1xudmFyIGxvZ2dlcl8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvbG9nZ2VyXCIpO1xudmFyIHZpZXdwb3J0XzEgPSByZXF1aXJlKFwiLi4vLi4vbW9kdWxlcy92aWV3cG9ydFwiKTtcbnZhciBhdXRvcmVmcmVzaF8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvYXV0b3JlZnJlc2hcIik7XG52YXIgU21hcnRQbHVnSW4gPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNtYXJ0UGx1Z0luKCkge1xuICAgICAgICB0aGlzLm5hbWUgPSBcIlNtYXJ0QWRTZXJ2ZXJcIjtcbiAgICAgICAgdGhpcy5zbG90cyA9IHt9O1xuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IHt9O1xuICAgIH1cbiAgICBTbWFydFBsdWdJbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5jYWxsYmFja3MgPSBvcHRpb25zLmNhbGxiYWNrcztcbiAgICAgICAgdGhpcy5zbG90cyA9IHRoaXMuZ2V0U2xvdHMoKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHNhcy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2FzLmNhbGwoXCJvbmVjYWxsXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgc2l0ZUlkOiBvcHRpb25zLnNpdGVJZCxcbiAgICAgICAgICAgICAgICAgICAgcGFnZUlkOiBvcHRpb25zLnBhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0SWQ6IG9wdGlvbnMuZm9ybWF0SWQsXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogb3B0aW9ucy50YXJnZXRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgd2luZG93WydzYXNDYWxsYmFjayddID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKHNhcy5pbmZvW2V2ZW50XS5kaXZJZCwgJ2ZpbmlzaGVkIHNsb3QgcmVuZGVyaW5nJyk7XG4gICAgICAgICAgICAgICAgdmFyIHNsb3QgPSBzZWxmLnNsb3RzW3Nhcy5pbmZvW2V2ZW50XS5kaXZJZF07XG4gICAgICAgICAgICAgICAgYXV0b3JlZnJlc2hfMS5BdXRvUmVmcmVzaC5zdGFydChzbG90LCBzZWxmLmF1dG9SZWZyZXNoKTtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zYXNDYWxsYmFjaylcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5zYXNDYWxsYmFjayhldmVudCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2FzLmNtZC5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uIChzbG90TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2xvdCA9IHNlbGYuc2xvdHNbc2xvdE5hbWVdO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXIoXCJiZWZvcmVSZW5kZXJGb3JtYXRcIiwgc2xvdC5zbWFydEFkSWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLnJlbmRlcigpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhzZWxmLm5hbWUsICdhZCBzbG90IHJlbmRlcmVkOiAnLCBzZWxmLnNsb3RzW3Nsb3ROYW1lXSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzZWxmLnNsb3RzKSB7XG4gICAgICAgICAgICAgICAgICAgIF9sb29wXzEoc2xvdE5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNlbGYub25TY3JvbGxSZWZyZXNoTGF6eWxvYWRlZFNsb3RzKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgU21hcnRQbHVnSW4ucHJvdG90eXBlLm9uU2Nyb2xsUmVmcmVzaExhenlsb2FkZWRTbG90cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgcmVmcmVzaEFkc0lmSXRJc0luVmlld3BvcnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIHNsb3ROYW1lIGluIHNlbGYuc2xvdHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2xvdCA9IHNlbGYuc2xvdHNbc2xvdE5hbWVdO1xuICAgICAgICAgICAgICAgIGlmIChzbG90Lmxhenlsb2FkRW5hYmxlZCAmJiB2aWV3cG9ydF8xLlZpZXdwb3J0LmlzRWxlbWVudEluVmlld3BvcnQoc2xvdC5IVE1MRWxlbWVudCwgc2xvdC5sYXp5bG9hZE9mZnNldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50cmlnZ2VyKFwiYmVmb3JlUmVuZGVyRm9ybWF0XCIsIHNsb3Quc21hcnRBZElkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYXMuY21kLnB1c2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhcy5jYWxsKFwic3RkXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l0ZUlkOiBzZWxmLm9wdGlvbnMuc2l0ZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlSWQ6IHNlbGYub3B0aW9ucy5wYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdElkOiBzZWxmLm9wdGlvbnMuZm9ybWF0SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogc2VsZi5vcHRpb25zLnRhcmdldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzbG90Lmxhenlsb2FkRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nKHNlbGYubmFtZSwgJ2FkIHNsb3QgcmVmcmVzaGVkOiAnLCBzZWxmLnNsb3RzW3Nsb3ROYW1lXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZWZyZXNoQWRzSWZJdElzSW5WaWV3cG9ydChudWxsKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHJlZnJlc2hBZHNJZkl0SXNJblZpZXdwb3J0KTtcbiAgICB9O1xuICAgIFNtYXJ0UGx1Z0luLnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24gKGV2ZW50LCBwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0aGlzLmNhbGxiYWNrcyAmJiB0aGlzLmNhbGxiYWNrc1tldmVudF0pIHtcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzW2V2ZW50XS5jYWxsKHRoaXMsIHBhcmFtcywgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTbWFydFBsdWdJbi5wcm90b3R5cGUuYXV0b1JlZnJlc2ggPSBmdW5jdGlvbiAoc2xvdCkge1xuICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnc3RhcnRlZCByZWZyZXNoaW5nJyk7XG4gICAgICAgIHNsb3QucmVmcmVzaCgpO1xuICAgIH07XG4gICAgU21hcnRQbHVnSW4ucHJvdG90eXBlLmdldFNsb3RzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2xvdHMgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgc2xvdCBpbiB3aW5kb3cuX21vbG90b3ZBZHMuc2xvdHMpIHtcbiAgICAgICAgICAgIHZhciBlbCA9IHdpbmRvdy5fbW9sb3RvdkFkcy5zbG90c1tzbG90XS5IVE1MRWxlbWVudDtcbiAgICAgICAgICAgIGlmIChlbC5kYXRhc2V0Lm1hZEFkdW5pdCA9PT0gJycpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBzbG90c1tlbC5pZF0gPSBuZXcgc21hcnRfYWRzbG90XzEuU21hcnRBZFNsb3QoZWwpO1xuICAgICAgICAgICAgd2luZG93Ll9tb2xvdG92QWRzLnNsb3RzW2VsLmlkXSA9IHNsb3RzW2VsLmlkXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2xvdHM7XG4gICAgfTtcbiAgICByZXR1cm4gU21hcnRQbHVnSW47XG59KCkpO1xuZXhwb3J0cy5TbWFydFBsdWdJbiA9IFNtYXJ0UGx1Z0luO1xud2luZG93Ll9tb2xvdG92QWRzLmxvYWRQbHVnaW4obmV3IFNtYXJ0UGx1Z0luKCkpO1xuIl19
