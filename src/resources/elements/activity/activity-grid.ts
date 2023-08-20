import { DialogService } from "aurelia-dialog";
import { IActivity } from "resources/elements/activity/activity.interface";
import { bindable, autoinject } from "aurelia-framework";
import { NewActivityPrompt } from "resources/dialogs/new-activity-prompt";
import { EventAggregator } from "aurelia-event-aggregator";
@autoinject
export class ActivityGrid {
  @bindable activities: IActivity[] = [];
  @bindable searchTerm: string = "";
  @bindable activityDetailSet;
  @bindable activityDetailClear;
  @bindable onActivityClick;
  @bindable onActivityLongClick;
  @bindable filterArchived: boolean | string = true;
  @bindable selectedActivityInfo: Map<number, IActivity>;
  @bindable showFilterUnused = false;
  public modCount = 0;

  search: boolean = false;
  categoryToActivityList = new Map();
  groupActivities: boolean = true;
  selectedActivities = new Map();
  subscription;
  filterUnused: boolean = false;

  constructor(
    private dialogService: DialogService,
    private ea: EventAggregator
  ) {}
  getSortedHeaders() {
    return Array.from(this.categoryToActivityList.keys()).sort();
  }

  selectedActivityInfoChanged(newVal) {
    this.modCount++;
    if (newVal)
      this.subscription = this.ea.subscribe(
        "entry-editor-change",
        () => this.modCount++
      );
  }
  detached() {
    this.subscription?.dispose();
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
    this.filterArchived =
      this.filterArchived === true || this.filterArchived === "true";
    newVal.forEach((activity: IActivity) => {
      if (
        (this.filterArchived && activity.isArchived) ||
        (this.filterUnused && !this.selectedActivityInfo.has(activity.id))
      ) {
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
      if (this.groupActivities) {
        const category = activity.category || "uncategorized";
        const currentCategoryList: IActivity[] =
          this.categoryToActivityList.get(category) || [];
        currentCategoryList.push(activity);
        this.categoryToActivityList.set(category, currentCategoryList);
      } else {
        const category = "activities";
        const currentCategoryList: IActivity[] =
          this.categoryToActivityList.get(category) || [];
        currentCategoryList.push(activity);
        this.categoryToActivityList.set(category, currentCategoryList);
      }
    });
    this.categoryToActivityList.forEach((val: IActivity[], key) => {
      val.sort(
        (a, b) => a.isArchived > b.isArchived || a.name.localeCompare(b.name)
      );
    });
  }
  toggleShowArchived() {
    this.filterArchived = !this.filterArchived;
    this.activitiesChanged(this.activities);
  }
  toggleFilterUnused() {
    this.filterUnused = !this.filterUnused;
    this.activitiesChanged(this.activities);
  }
  toggleGroup() {
    this.groupActivities = !this.groupActivities;
    this.activitiesChanged(this.activities);
  }
  activityClick(event, activity) {
    this.onActivityClick({ event: event, activity: activity });
  }
  activityLongClick(event, activity) {
    this.onActivityLongClick({ event, activity });
  }
}
