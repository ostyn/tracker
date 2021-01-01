import { autoinject } from "aurelia-framework";
import { ActivityDao } from "resources/dao/ActivityDao";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class ActivityService {
  activitiesCache = [];
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

  fetchActivities() {
    return this.activityDao.getItems().then((activities) => activities);
  }

  getActivities() {
    return this.activitiesCache;
  }

  deleteActivity(id) {
    return this.activityDao.deleteItem(id).then((resp) => {
      this.updateCacheThenNotify();
      return resp;
    });
  }
}
