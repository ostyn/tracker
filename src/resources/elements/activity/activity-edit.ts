import { EventAggregator } from "aurelia-event-aggregator";
import { ActivityInfo } from "resources/dialogs/activity-info";
import { DialogService } from "aurelia-dialog";
import { ActivityService } from "resources/services/activityService";
import { autoinject, bindable } from "aurelia-framework";
import { IActivity } from "./activity.interface";

@autoinject
export class ActivityEdit {
  @bindable activity: IActivity;
  workingCopy: IActivity;
  relatedEntries: any;
  categories: Set<string>;
  subscribers = [];
  constructor(
    private activityService: ActivityService,
    private dialogService: DialogService,
    private ea: EventAggregator
  ) {}

  getCategories = () => {
    this.categories = this.activityService.getCategories();
  };
  categoryComparer = (categoryA, categoryB) => {
    return categoryA === categoryB;
  };
  attached() {
    this.subscribers.push(
      this.ea.subscribe("activitiesUpdated", this.getCategories)
    );
    this.getCategories();
  }
  activityChanged() {
    if (this.activity === undefined) this.resetActiveActivity();
    else {
      this.workingCopy = Object.assign({}, this.activity);
    }
  }

  openInfo(activityId) {
    this.dialogService.open({
      viewModel: ActivityInfo,
      model: activityId,
    });
  }

  submitActivity() {
    this.workingCopy.isArchived = this.workingCopy.isArchived == true;
    if (
      this.workingCopy.category === undefined ||
      this.workingCopy.category === ""
    )
      delete this.workingCopy.category;
    this.activityService.saveActivity(this.workingCopy);
    this.resetActiveActivity();
  }

  newActivity() {
    this.resetActiveActivity();
  }

  deleteActivity() {
    if (
      confirm("Sure you want to delete?") &&
      this.workingCopy &&
      this.workingCopy.id !== undefined
    ) {
      this.activityService.deleteActivity(this.workingCopy.id);
      this.resetActiveActivity();
    }
  }

  resetActiveActivity() {
    this.activity = this.workingCopy = undefined;
    this.relatedEntries = [];
  }
}
