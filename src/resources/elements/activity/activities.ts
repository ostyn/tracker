import { autoinject } from "aurelia-framework";
import { ActivityService } from "resources/services/activityService";
import { EventAggregator } from "aurelia-event-aggregator";
@autoinject
export class Activities {
  subscribers = [];
  activities;
  activity;
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
  setCurrentActivity(activity) {
    this.activity = activity;
  }
}
