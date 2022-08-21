import { autoinject } from "aurelia-framework";
import { ActivityDao } from "resources/dao/ActivityDao";
import { EventAggregator } from "aurelia-event-aggregator";
import { IActivity } from "resources/elements/activity/activity.interface";

@autoinject
export class ActivityService {
  isLoaded = false;
  showArchivedActivities: boolean = true;
  originalActivities: IActivity[];
  public init() {
    this.activityDao.setupCacheAndUpdateListener(
      this.notifyListeners.bind(this)
    );
  }
  activitiesCache: IActivity[] = [];
  public activitiesMap: Map<string, IActivity> = new Map();
  categories: Set<string>;
  constructor(private activityDao: ActivityDao, private ea: EventAggregator) {
    if (localStorage.getItem("showArchivedActivities") !== null)
      this.showArchivedActivities =
        localStorage.getItem("showArchivedActivities") === "true";
  }
  notifyListeners() {
    this.fetchActivities().then((activities) => {
      this.originalActivities = activities;
      this.setupActivities(activities);
      this.isLoaded = true;
      this.ea.publish("activitiesUpdated");
    });
  }
  saveActivity(activity) {
    this.activityDao.saveItem(activity);
  }

  toggleArchivedActivitiesThenNotify() {
    this.showArchivedActivities = !this.showArchivedActivities;
    localStorage.setItem(
      "showArchivedActivities",
      this.showArchivedActivities + ""
    );
    this.setupActivities(this.originalActivities);
    this.notifyListeners();
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

  fetchActivities(hitCache = false): Promise<IActivity[]> {
    return this.activityDao.getItems(hitCache).then((activities: IActivity) => {
      return activities;
    });
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
      return resp;
    });
  }
}
