import { EventAggregator } from "aurelia-event-aggregator";
import { StatsService } from "resources/services/statsService";
import { IActivity } from "./../elements/activity/activity.interface";
import { ActivityService } from "./../services/activityService";
import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { IStatsDetailEntry } from "resources/services/activity-stats.interface";

@autoinject
export class ActivityDetailDialog {
  activity: IActivity;
  detail: number | string[];
  newItem: string;
  inputBox: Element;
  mfuDetails: IStatsDetailEntry[];
  mruDetails: any[];

  constructor(
    public controller: DialogController,
    private activityService: ActivityService,
    private statsService: StatsService,
    private ea: EventAggregator
  ) {}

  activate(activityDetail: ActivityDetail) {
    this.activity = this.activityService.getActivity(activityDetail.activityId);
    this.detail = activityDetail.detail;
    this.ea.subscribe("statsUpdated", this.loadMru.bind(this));
    this.loadMru();
  }

  loadMru() {
    const map =
      this.statsService.activityStats.get(this.activity.id).detailsUsed ||
      new Map();
    const lowerCaseDetails = (this.detail as string[]).map((str) =>
      str.toLowerCase()
    );
    this.mfuDetails = Array.from(map.values()).filter(
      (recentlyUsedDetail) =>
        !lowerCaseDetails.includes(recentlyUsedDetail.text.toLowerCase())
    );
    this.mfuDetails = this.mfuDetails.sort((a, b) => {
      return b.count - a.count;
    });
    this.mfuDetails = this.mfuDetails.slice(
      0,
      Math.min(7, this.mfuDetails.length)
    );

    this.mruDetails = Array.from(map.values()).filter(
      (recentlyUsedDetail) =>
        !lowerCaseDetails.includes(recentlyUsedDetail.text.toLowerCase())
    );
    this.mruDetails = this.mruDetails.sort((a, b) => {
      return b.dates[0].localeCompare(a.dates[0]) || b.count - a.count;
    });
    this.mruDetails = this.mruDetails.slice(
      0,
      Math.min(7, this.mruDetails.length)
    );
  }
  isArray(array) {
    return array?.constructor === Array;
  }
  addDetail(detail) {
    //@ts-ignore
    this.detail.push(detail);
    this.loadMru();
  }
  addItemOrSubmit() {
    if (this.newItem !== "" && this.newItem !== undefined) {
      //@ts-ignore
      this.detail.push(this.newItem);
      this.newItem = undefined;
      this.inputBox.scrollIntoView(true);
      this.loadMru();
    } else {
      this.submitForm();
    }
  }
  removeItem(detail, index) {
    detail.splice(index, 1);
    this.loadMru();
  }
  submitForm() {
    this.controller.ok({ activityId: this.activity.id, detail: this.detail });
  }
}

interface ActivityDetail {
  activityId: string;
  detail: number | string[];
}
