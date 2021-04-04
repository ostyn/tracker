import { IActivity } from "resources/elements/activity/activity.interface";
import { bindable } from "aurelia-framework";
export class ActivityGrid {
  @bindable activities: IActivity[] = [];
  @bindable onActivityClick;
  @bindable filterArchived: any = true;
  categoryToActivityList = new Map();
  uncategorized: IActivity[] = [];
  sortActivities: boolean = true;
  groupActivities: boolean = true;

  activitiesChanged(newVal) {
    this.categoryToActivityList = new Map();
    this.uncategorized = [];
    this.filterArchived =
      this.filterArchived === true || this.filterArchived === "true";
    newVal.forEach((activity: IActivity) => {
      if (this.filterArchived && activity.isArchived) {
        return;
      }
      if (this.groupActivities && activity.category) {
        const currentCategoryList: IActivity[] =
          this.categoryToActivityList.get(activity.category) || [];
        currentCategoryList.push(activity);
        this.categoryToActivityList.set(activity.category, currentCategoryList);
      } else {
        this.uncategorized.push(activity);
      }
    });
    if (this.sortActivities) {
      this.categoryToActivityList.forEach((val: IActivity[], key) => {
        val.sort((a, b) => a.name.localeCompare(b.name));
      });
      this.uncategorized.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
  toggleShowArchived() {
    this.filterArchived = !this.filterArchived;
    this.activitiesChanged(this.activities);
  }
  toggleGroup() {
    this.groupActivities = !this.groupActivities;
    this.activitiesChanged(this.activities);
  }
  toggleSort() {
    this.sortActivities = !this.sortActivities;
    this.activitiesChanged(this.activities);
  }
}
