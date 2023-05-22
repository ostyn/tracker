import { DialogService } from "aurelia-dialog";
import { IActivity } from "resources/elements/activity/activity.interface";
import { bindable, autoinject } from "aurelia-framework";
import { NewActivityPrompt } from "resources/dialogs/new-activity-prompt";
@autoinject
export class ActivityGrid {
  @bindable activities: IActivity[] = [];
  @bindable searchTerm: string = "";
  @bindable onActivityClick;
  @bindable onActivityLongClick;
  @bindable filterArchived: boolean | string = true;
  search: boolean = false;
  categoryToActivityList = new Map();
  uncategorized: IActivity[] = [];
  groupActivities: boolean = true;
  constructor(private dialogService: DialogService) {}
  getSortedHeaders() {
    return Array.from(this.categoryToActivityList.keys()).sort();
  }

  public createNewActivity(category) {
    this.dialogService.open({
      viewModel: NewActivityPrompt,
      model: { category },
    });
  }
  searchTermChanged(newVal) {
    this.activitiesChanged(this.activities);
  }
  activitiesChanged(newVal) {
    this.categoryToActivityList = new Map();
    this.uncategorized = [];
    this.filterArchived =
      this.filterArchived === true || this.filterArchived === "true";
    newVal.forEach((activity: IActivity) => {
      if (this.filterArchived && activity.isArchived) {
        return;
      }
      if (
        !activity.name.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
        !activity.category
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) &&
        !activity.emoji.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
        return;
      if (this.groupActivities && activity.category) {
        const currentCategoryList: IActivity[] =
          this.categoryToActivityList.get(activity.category) || [];
        currentCategoryList.push(activity);
        this.categoryToActivityList.set(activity.category, currentCategoryList);
      } else {
        this.uncategorized.push(activity);
      }
    });
    this.categoryToActivityList.forEach((val: IActivity[], key) => {
      val.sort(
        (a, b) => a.isArchived > b.isArchived || a.name.localeCompare(b.name)
      );
    });
    this.uncategorized.sort(
      (a, b) => a.isArchived > b.isArchived || a.name.localeCompare(b.name)
    );
  }
  toggleShowArchived() {
    this.filterArchived = !this.filterArchived;
    this.activitiesChanged(this.activities);
  }
  toggleGroup() {
    this.groupActivities = !this.groupActivities;
    this.activitiesChanged(this.activities);
  }
}
