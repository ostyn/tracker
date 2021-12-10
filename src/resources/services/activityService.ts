import { autoinject } from "aurelia-framework";
import { ActivityDao } from "resources/dao/ActivityDao";
import { EventAggregator } from "aurelia-event-aggregator";
import { IActivity } from "resources/elements/activity/activity.interface";

@autoinject
export class ActivityService {
  showArchivedActivities: boolean = true;
  originalActivities: IActivity[];
  public init() {
    return this.updateCacheThenNotify();
  }
  activitiesCache: IActivity[] = [];
  public activitiesMap: Map<string, IActivity> = new Map();
  categories: Set<string>;
  constructor(private activityDao: ActivityDao, private ea: EventAggregator) {}
  notifyListeners() {
    this.ea.publish("activitiesUpdated");
  }
  saveActivity(activity) {
    this.activityDao.saveItem(activity);
    this.updateCacheThenNotify();
  }

  toggleArchivedActivitiesThenNotify() {
    this.showArchivedActivities = !this.showArchivedActivities;
    this.setupActivities(this.originalActivities);
    this.notifyListeners();
  }

  updateCacheThenNotify() {
    this.fetchActivities().then((activities) => {
      this.originalActivities = activities;
      this.setupActivities(activities);
      this.notifyListeners();
    });
  }

  private setupActivities(activities: IActivity[]) {
    this.activitiesCache = [];
    this.activitiesMap = new Map();
    this.categories = new Set();
    activities.forEach((activity: IActivity) => {
      if (!activity.isArchived || this.showArchivedActivities) {
        this.activitiesCache.push(activity);
        this.activitiesMap.set(activity.id, activity);
        this.categories.add(activity.category);
      }
    });
  }

  fetchActivities(): Promise<IActivity[]> {
    return this.activityDao
      .getItems()
      .then((activities: IActivity) => activities);
  }

  getActivities(): IActivity[] {
    return this.activitiesCache;
  }
  getCategories(): Set<string> {
    return this.categories;
  }
  getActivity(id): IActivity {
    return this.activitiesMap.get(id);
  }

  deleteActivity(id) {
    return this.activityDao.deleteItem(id).then((resp) => {
      this.updateCacheThenNotify();
      return resp;
    });
  }
}
