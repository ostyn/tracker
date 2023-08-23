import { IActivityDetail } from "./../entry/entry.interface";
import { IActivity } from "./activity.interface";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable } from "aurelia-framework";
import { ActivityService } from "resources/services/activityService";
import { Helpers } from "resources/util/Helpers";
@autoinject
export class Activity {
  @bindable id;
  @bindable detail: IActivityDetail;
  @bindable showName = true;
  @bindable onDetailClick;
  @bindable enableDetailClick;
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
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }
  idChanged() {
    this.loadActivity();
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
  detailClicked(event: Event, detail, id) {
    if (this.enableDetailClick) {
      event.stopPropagation();
      this.onDetailClick({ detail, id });
    }
  }
  public isNumeric = Helpers.isNumeric;
}
