import { ActivityInfo } from "./activity-info";
import { DialogService } from "aurelia-dialog";
import { ActivityDao } from "resources/dao/ActivityDao";
import { ActivityService } from "resources/services/activityService";
import { autoinject, bindable } from "aurelia-framework";
import { IActivity } from "./activity.interface";
@autoinject
export class ActivityEdit {
  @bindable activity: IActivity;
  workingCopy: IActivity;
  relatedEntries: any;
  categories: Set<string>;
  constructor(
    private activityService: ActivityService,
    private activityDao: ActivityDao,
    private dialogService: DialogService
  ) {}
  categoryComparer = (categoryA, categoryB) => {
    return categoryA === categoryB;
  };
  activityChanged() {
    this.activityDao.getAllCategories().then((categories) => {
      this.categories = categories;
    });
    if (this.activity === undefined) this.resetActiveActivity();
    else {
      this.workingCopy = Object.assign({}, this.activity);
    }
  }

  openInfo(activityId) {
    this.dialogService.open({
      viewModel: ActivityInfo,
      model: activityId,
      lock: false,
    });
  }

  submitActivity() {
    this.workingCopy.isArchived = this.workingCopy.isArchived == true;
    this.workingCopy.type = this.workingCopy.type || "number";
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
