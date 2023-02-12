import { IActivityDetail } from "./../entry/entry.interface";
import { IActivity } from "./activity.interface";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable } from "aurelia-framework";
import { ActivityService } from "resources/services/activityService";
@autoinject
export class Activity {
  @bindable id;
  @bindable detail: IActivityDetail;
  @bindable showName = true;
  activity: IActivity;
  subscribers: any = [];
  isWide: boolean = false;
  isArray = Array.isArray;
  constructor(
    private activityService: ActivityService,
    private ea: EventAggregator
  ) {}

  attached() {
    this.subscribers.push(
      this.ea.subscribe("activitiesUpdated", this.loadActivity.bind(this))
    );
    this.loadActivity();
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }

  loadActivity() {
    this.activity = this.activityService.getActivity(this.id);
    if (
      Array.isArray(this.detail) &&
      (this.detail.length > 3 ||
        this.detail.filter((val) => val.length >= 50).length > 0)
    )
      this.isWide = true;
  }

  isNumeric(str: any): boolean {
    return typeof str === "number";
  }
}
