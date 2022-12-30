import { IActivity } from "./activity.interface";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable } from "aurelia-framework";
import { ActivityService } from "resources/services/activityService";
@autoinject
export class Activity {
  @bindable id;
  @bindable detail;
  activity: IActivity;
  subscribers: any = [];
  isWide: boolean = false;
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
  isArray(detail) {
    return detail?.constructor === Array;
  }
  loadActivity() {
    this.activity = this.activityService.getActivity(this.id);
    if (
      this.isArray(this.detail) &&
      (this.detail.length > 3 ||
        this.detail.filter((val) => val.length >= 50).length > 0)
    )
      this.isWide = true;
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }
}
