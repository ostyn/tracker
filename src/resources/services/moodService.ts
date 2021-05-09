import { IMood } from "./../elements/mood/mood.interface";
import { autoinject } from "aurelia-framework";
import { MoodDao } from "resources/dao/MoodDao";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class MoodService {
  presetMoods: IMood[] = [
    {
      emoji: "🚧",
      id: "0",
      rating: 3,
      name: "TBD",
    },
  ];
  public init() {
    return this.updateCacheThenNotify();
  }
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
    this.moodDao.saveItem(mood);
    this.updateCacheThenNotify();
  }

  fetchMoods() {
    return this.moodDao.getItems().then((moods: IMood[]) => {
      moods.push();
      return moods;
    });
  }

  getMood(id) {
    return (
      this.moodsCache.find((mood) => mood.id === id) ||
      this.presetMoods.find((mood) => mood.id === id)
    );
  }

  getAllMoods(): IMood[] {
    return [].concat(this.moodsCache, this.presetMoods);
  }
  getAllUserCreatedMoods() {
    return this.moodsCache;
  }

  deleteMood(id) {
    return this.moodDao.deleteItem(id).then((resp) => {
      this.updateCacheThenNotify();
      return resp;
    });
  }
}
