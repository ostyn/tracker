import { IActivity } from "./activity.interface";
import { EventAggregator } from "aurelia-event-aggregator";
import { computedFrom, autoinject, bindable } from "aurelia-framework";
import { ActivityService } from "resources/services/activityService";
@autoinject
export class Activity {
  @bindable id;
  @bindable detail;
  activities: IActivity[] = [];
  subscribers: any = [];
  constructor(
    private activityService: ActivityService,
    private ea: EventAggregator
  ) {}

  attached() {
    this.getActivities();
    this.subscribers.push(
      this.ea.subscribe("activitiesUpdated", this.getActivities)
    );
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }

  getActivities = () => {
    this.activities = this.activityService.getActivities();
  };
  @computedFrom("activities.length", "id")
  get findActivity() {
    return this.activities.find(
      (activity: IActivity) => activity.id === this.id
    );
  }
}
