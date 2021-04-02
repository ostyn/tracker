import { IActivity } from "resources/elements/activity/activity.interface";
import { bindable } from "aurelia-framework";
export class ActivityGrid {
  @bindable activities: IActivity[] = [];
  @bindable onActivityClick;
  @bindable filterArchived: any = true;
  categoryToActivityList = new Map();
  uncategorized: IActivity[] = [];

  activitiesChanged(newVal) {
    this.categoryToActivityList = new Map();
    this.uncategorized = [];
    this.filterArchived =
      this.filterArchived === true || this.filterArchived === "true";
    newVal.forEach((activity: IActivity) => {
      if (this.filterArchived && activity.isArchived) {
        return;
      }
      if (activity.category) {
        const currentCategoryList: IActivity[] =
          this.categoryToActivityList.get(activity.category) || [];
        currentCategoryList.push(activity);
        this.categoryToActivityList.set(activity.category, currentCategoryList);
      } else {
        this.uncategorized.push(activity);
      }
    });
  }
  toggleShowArchived() {
    this.filterArchived = !this.filterArchived;
    this.activitiesChanged(this.activities);
  }
}
