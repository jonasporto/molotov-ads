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
var logger_1 = require("../../modules/logger");
var util_1 = require("../../helpers/util");
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
    SmartAdSlot.prototype.refresh = function (slot) {
        logger_1.Logger.logWithTime(slot.name, 'started refreshing');
        if (!pbjs)
            return sas.refresh(this.smartAdId);
        pbjs.que.push(function () {
            pbjs.requestBids({
                timeout: 2000,
                adUnitCodes: [slot.smartAdId],
                bidsBackHandler: function () {
                    pbjs.setTargetingForGPTAsync([slot.smartAdId]);
                    sas.cmd.push(function () {
                        logger_1.Logger.log("Will perform \"std\" request");
                        sas.call("std", {
                            siteId: this.options.siteId,
                            pageId: this.options.pageId,
                            formatId: slot.smartAdId,
                            target: util_1.Util.valueFor(this.options.target),
                        });
                    });
                }
            });
        });
    };
    SmartAdSlot.prototype.render = function () {
        if (this.lazyloadEnabled)
            return;
        sas.render(this.smartAdId);
    };
    return SmartAdSlot;
}(adslot_1.AdSlot));
exports.SmartAdSlot = SmartAdSlot;
