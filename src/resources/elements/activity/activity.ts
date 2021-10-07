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

  loadActivity() {
    this.activity = this.activityService.getActivity(this.id);
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }
}
