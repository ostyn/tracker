import { autoinject } from "aurelia-framework";
import { MoodDao } from "resources/dao/MoodDao";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class MoodService {
  moodsCache = [];
  constructor(private moodDao: MoodDao, private ea: EventAggregator) {
    this.updateCacheThenNotify();
  }
  notifyListeners() {
    this.ea.publish("moodsUpdated");
  }

  updateCacheThenNotify() {
    this.fetchMoods().then((moods) => {
      this.moodsCache = moods;
      this.notifyListeners();
    });
  }

  saveMood(mood) {
    return this.moodDao.saveItem(mood).then((id) => {
      this.updateCacheThenNotify();
    });
  }

  fetchMoods() {
    return this.moodDao.getItems().then((moods) => moods);
  }

  getMoods() {
    return this.moodsCache;
  }

  deleteMood(id) {
    return this.moodDao.deleteItem(id).then((resp) => {
      this.updateCacheThenNotify();
      return resp;
    });
  }
}
