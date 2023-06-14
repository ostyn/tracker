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
  @bindable selectedActivityInfo: Map<string, IActivity>;
  public modCount = 0;

  search: boolean = false;
  categoryToActivityList = new Map();
  uncategorized: IActivity[] = [];
  groupActivities: boolean = true;
  selectedActivities = new Map();
  subscription;

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
  activePopoverId: string = undefined;
  openPopover(event: Event, activity: IActivity) {
    event.stopPropagation();
    this.activePopoverId = activity.id;
  }
  activityClick(event, activity) {
    if (this.activePopoverId !== activity.id) {
      this.onActivityClick({ event: event, activity: activity });
    }
  }
  activityLongClick(event, activity) {
    if (this.activePopoverId === activity.id) {
      this.activePopoverId = undefined;
    } else {
      this.activePopoverId = activity.id;
    }
  }
  public isArray(val) {
    return Array.isArray(val);
  }
  public adjust(activity, amount) {
    const currentValue = this.selectedActivityInfo.get(activity.id);
    if (!this.isArray(currentValue)) {
      const newValue = Number(((currentValue || 0) + amount).toPrecision(12));
      this.activityDetailSet({ event, activity, newValue });
      this.modCount++;
    }
  }
  public clear(activity) {
    this.activityDetailClear({ event, activity });
    this.modCount++;
  }
}
