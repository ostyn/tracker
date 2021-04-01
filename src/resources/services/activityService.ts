import { autoinject } from "aurelia-framework";
import { ActivityDao } from "resources/dao/ActivityDao";
import { EventAggregator } from "aurelia-event-aggregator";
import { IActivity } from "resources/elements/activity/activity.interface";

@autoinject
export class ActivityService {
  activitiesCache: IActivity[] = [];
  constructor(private activityDao: ActivityDao, private ea: EventAggregator) {
    this.updateCacheThenNotify();
  }
  notifyListeners() {
    this.ea.publish("activitiesUpdated");
  }
  saveActivity(activity) {
    return this.activityDao.saveItem(activity).then((id) => {
      this.updateCacheThenNotify();
    });
  }

  updateCacheThenNotify() {
    this.fetchActivities().then((activities) => {
      this.activitiesCache = activities;
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

  deleteActivity(id) {
    return this.activityDao.deleteItem(id).then((resp) => {
      this.updateCacheThenNotify();
      return resp;
    });
  }
}
