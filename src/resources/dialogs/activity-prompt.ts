import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { ActivityService } from "resources/services/activityService";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class ActivityPromptDialog {
  activities: any[] = [];
  subscribers: any[] = [];
  constructor(
    public controller: DialogController,
    private activityService: ActivityService,
    private ea: EventAggregator
  ) {}

  getActivities = () => {
    this.activities = this.activityService.getActivities();
  };

  activate() {
    this.subscribers.push(
      this.ea.subscribe("activitiesUpdated", this.getActivities)
    );

    this.getActivities();
  }

  deactivate() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }
  clickActivity(activityId) {
    this.controller.ok(activityId);
  }
}
