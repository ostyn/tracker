import { autoinject } from "aurelia-framework";
import { ActivityDao } from "resources/dao/ActivityDao";
import { EventAggregator } from "aurelia-event-aggregator";
import { IActivity } from "resources/elements/activity/activity.interface";

@autoinject
export class ActivityService {
  public init() {
    return this.updateCacheThenNotify();
  }
  activitiesCache: IActivity[] = [];
  activitiesMap: Map<string, IActivity>;
  categories: Set<string>;
  constructor(private activityDao: ActivityDao, private ea: EventAggregator) {}
  notifyListeners() {
    this.ea.publish("activitiesUpdated");
  }
  saveActivity(activity) {
    this.activityDao.saveItem(activity);
    this.updateCacheThenNotify();
  }

  updateCacheThenNotify() {
    this.fetchActivities().then((activities) => {
      this.activitiesCache = activities;
      this.activitiesMap = new Map();
      this.categories = new Set();
      this.activitiesCache.forEach((activity: IActivity) => {
        this.activitiesMap.set(activity.id, activity);
        this.categories.add(activity.category);
      });
      this.notifyListeners();
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
