import { EntryDao } from "resources/dao/EntryDao";
import { bindable, autoinject } from "aurelia-framework";
import { ActivityService } from "resources/services/activityService";
import { EventAggregator } from "aurelia-event-aggregator";
@autoinject
export class Activities {
  @bindable showActivities = true;
  subscribers = [];
  activities;
  activity;
  relatedEntries: any;
  constructor(
    private activityService: ActivityService,
    private ea: EventAggregator,
    private entryDao: EntryDao
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
    this.entryDao
      .getEntriesWithSpecificActivity(activity.id)
      .then((entries) => {
        this.relatedEntries = entries;
      });
  }
}
