import { AdSlot } from "../../modules/adslot";
import { Logger } from "../../modules/logger";
import { Util } from "../../helpers/util";

declare var sas: any;
declare var pbjs: any;

export class SmartAdSlot extends AdSlot {
    smartAdId: string;

    constructor(public HTMLElement: HTMLElement) {
        super(HTMLElement);
        let ds = HTMLElement.dataset;

        this.name = HTMLElement.id;
        this.smartAdId = ds['madSmartadId'];
        this.autoRefreshTime = Number(ds['madAutoRefreshInSeconds']) || 0;
        this.autoRefreshLimit = Number(ds['madAutoRefreshLimit']) || 0;
        this.lazyloadOffset = Number(ds['madLazyloadOffset']);

        this.autoRefreshEnabled = this.autoRefreshTime > 0;

        if (this.lazyloadOffset) {
            this.lazyloadOffset = this.lazyloadOffset || 0;
            this.lazyloadEnabled = true;
        }
    }

    refresh(slot:SmartAdSlot) {

      Logger.logWithTime(slot.name, 'started refreshing');

      if (!pbjs) return sas.refresh(this.smartAdId);

      pbjs.que.push(function() {

        pbjs.requestBids({
          timeout: 2000,
          adUnitCodes: [slot.smartAdId],
          bidsBackHandler: function() {

            pbjs.setTargetingForGPTAsync([slot.smartAdId]);
            sas.cmd.push(function() {

              Logger.log("Will perform \"std\" request");

              sas.call("std", {
                siteId: this.options.siteId,
                pageId: this.options.pageId,
                formatId: slot.smartAdId,
                target: Util.valueFor(this.options.target),
              });
            });
          }
        });
      });
    }

    render() {
        if (this.lazyloadEnabled) return;
        sas.render(this.smartAdId);
    }
}
