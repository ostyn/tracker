import { autoinject } from "aurelia-framework";
import { ActivityService } from "resources/services/activityService";
import { EventAggregator } from "aurelia-event-aggregator";
import { IActivity } from "resources/elements/activity/activity.interface";
@autoinject
export class ActivitiesRoute {
  subscribers = [];
  activities: IActivity[] = [];
  activity: IActivity;
  constructor(
    private activityService: ActivityService,
    private ea: EventAggregator
  ) {}

  getActivities = () => {
    this.activities = this.activityService.getActivities();
  };

  attached() {
    this.subscribers.push(
      this.ea.subscribe("activitiesUpdated", this.getActivities)
    );
    this.getActivities();
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }
  setCurrentActivity(activity: IActivity) {
    this.activity = activity;
  }
}
