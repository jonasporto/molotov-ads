import { SmartAdSlot } from "./smart.adslot";
import { PlugInInterface } from "../../interfaces/plugin.interface";
import { Logger } from "../../modules/logger";
import { Viewport } from "../../modules/viewport";
import { AutoRefresh } from "../../modules/autorefresh";

declare var sas: any;

export class SmartPlugIn implements PlugInInterface {
    name: string = "SmartAdServer";

    slots: {} = {};
    callbacks: any = {};

    init(options: any): Promise<void> {
        let self = this;
        this.callbacks = options.callbacks;
        this.slots = this.getSlots();

        return new Promise<void>(function(resolve, reject) {

            sas.cmd.push(function() {
                sas.call("onecall", {
                    siteId: options.siteId,
                    pageId: options.pageId,
                    formatId: options.formatId,
                    target: options.target
                });
            });

            window['sasCallback'] = function(event) {
                Logger.logWithTime(sas.info[event].divId, 'finished slot rendering');

                let slot = self.slots[sas.info[event].divId];
                AutoRefresh.start(slot, self.autoRefresh);

                if (options.sasCallback)
                    options.sasCallback(event);
            };

            sas.cmd.push(function() {
                for (let slotName in self.slots) {
                    let slot: SmartAdSlot = self.slots[slotName];

                    self.trigger("beforeRenderFormat", slot.smartAdId);
                    self.slots[slotName].render();

                    Logger.log(self.name, 'ad slot rendered: ', self.slots[slotName]);
                }
                resolve();
            });

            self.onScrollRefreshLazyloadedSlots();
        });
    }

    private onScrollRefreshLazyloadedSlots() {
        let self = this;

        let refreshAdsIfItIsInViewport = function(event) {

            for (let slotName in self.slots) {
                let slot: SmartAdSlot = self.slots[slotName];

                if (slot.lazyloadEnabled && Viewport.isElementInViewport(slot.HTMLElement, slot.lazyloadOffset)) {
                    self.trigger("beforeRenderFormat", slot.smartAdId);
                    slot.refresh();
                    slot.lazyloadEnabled = false;

                    Logger.log(self.name, 'ad slot refreshed: ', self.slots[slotName]);
                }
            }
        }

        refreshAdsIfItIsInViewport(null);

        window.addEventListener('scroll', refreshAdsIfItIsInViewport);
    }

    private trigger(callback, params) {
        if (this.callbacks && this.callbacks[callback]) {
            this.callbacks[callback].call(params);
        }
    }

    private autoRefresh(slot: SmartAdSlot) {
        Logger.logWithTime(slot.name, 'started refreshing');
        slot.refresh();
    }

    private getSlots() {
        let slots = {};

        for (let slot in window._molotovAds.slots) {
            let el = window._molotovAds.slots[slot].HTMLElement;

            if(el.dataset.madAdunit === '') continue;

            slots[el.id] = new SmartAdSlot(el);

            window._molotovAds.slots[el.id] = slots[el.id];
        }

        return slots;
    }
}

window._molotovAds.loadPlugin(new SmartPlugIn());
