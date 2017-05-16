import { SmartAdSlot } from "./smart.adslot";
import { PlugInInterface } from "../../interfaces/plugin.interface";
import { Logger } from "../../modules/logger";
import { Viewport } from "../../modules/viewport";
import { AutoRefresh } from "../../modules/autorefresh";
import { Util } from "../../helpers/util";

declare var sas: any;

export class SmartPlugIn implements PlugInInterface {
    name: string = "SmartAdServer";

    slots: {} = {};

    init(options: any): Promise<void> {
        let self = this;

        this.slots = this.getSlots();

        return new Promise<void>(function(resolve, reject) {

            window['adserverCall'] = function() {

                sas.cmd.push(function() {
                    Logger.log("Will perform \"onecall\" request");

                    sas.call("onecall", {
                        siteId: options.siteId,
                        pageId: options.pageId,
                        formatId: options.formatId,
                        target: Util.valueFor(options.target)
                    });
                });

                sas.cmd.push(function() {
                    Logger.log("Will perform render");

                    for (let slotName in self.slots) {
                        self.slots[slotName].render();
                        Logger.log(self.name, 'ad slot rendered: ', self.slots[slotName]);
                    }

                    resolve();
                });
            }

            window['sasCallback'] = function(event) {
                Logger.logWithTime(sas.info[event].divId, 'finished slot rendering');

                let slot = self.slots[sas.info[event].divId];
                AutoRefresh.start(slot, self.autoRefresh);

                if (options.sasCallback)
                    options.sasCallback(event);
            };

            self.onScrollRefreshLazyloadedSlots();

        });
    }

    private onScrollRefreshLazyloadedSlots() {
        let self = this;
        window.addEventListener('scroll', function refreshAdsIfItIsInViewport(event) {
            for (let slotName in self.slots) {
                let slot: SmartAdSlot = self.slots[slotName];
                if (slot.lazyloadEnabled && Viewport.isElementInViewport(slot.HTMLElement, slot.lazyloadOffset)) {
                    slot.refresh(slot);
                    slot.lazyloadEnabled = false;
                }
            }
        });
    }

    private autoRefresh(slot: SmartAdSlot) {
        Logger.logWithTime(slot.name, 'started refreshing');
        slot.refresh(slot);
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
