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
