import { StatsService } from "resources/services/statsService";
import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { ActivityService } from "resources/services/activityService";
import { IActivity } from "resources/elements/activity/activity.interface";

@autoinject
export class ActivityDetailSelectDialog {
  activity: IActivity;
  details: string[];
  constructor(
    public controller: DialogController,
    private statsService: StatsService,
    private activityService: ActivityService
  ) {}

  activate({ id }) {
    this.activity = this.activityService.getActivity(id);
    this.details = Array.from(
      this.statsService.activityStats
        .get(this.activity.id)
        ?.detailsUsed?.keys() || []
    );
  }
  clickDetail(detail) {
    this.controller.ok(detail);
  }
}
