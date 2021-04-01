import { EntryDao } from "./../../dao/EntryDao";
import { ActivityService } from "resources/services/activityService";
import { autoinject, bindable } from "aurelia-framework";
import { IActivity } from "./activity.interface";
@autoinject
export class ActivityEdit {
  @bindable activity: IActivity;
  workingCopy: IActivity;
  relatedEntries: any;
  constructor(
    private activityService: ActivityService,
    private entryDao: EntryDao
  ) {}
  activityChanged() {
    if (this.activity === undefined) this.resetActiveActivity();
    else {
      this.workingCopy = Object.assign({}, this.activity);
      this.entryDao
        .getEntriesWithSpecificActivity(this.activity.id)
        .then((entries) => {
          this.relatedEntries = entries;
        });
    }
  }

  submitActivity() {
    this.workingCopy.isArchived = this.workingCopy.isArchived == true;
    this.workingCopy.type = this.workingCopy.type || "number";
    this.activityService.saveActivity(this.workingCopy);
    this.resetActiveActivity();
  }

  cancelEdit() {
    this.resetActiveActivity();
  }

  deleteActivity() {
    if (this.workingCopy && this.workingCopy.id !== undefined) {
      this.activityService.deleteActivity(this.workingCopy.id);
      this.resetActiveActivity();
    }
  }

  resetActiveActivity() {
    this.activity = this.workingCopy = undefined;
    this.relatedEntries = [];
  }
}
