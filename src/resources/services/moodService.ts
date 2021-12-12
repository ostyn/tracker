import { IMood } from "./../elements/mood/mood.interface";
import { autoinject } from "aurelia-framework";
import { MoodDao } from "resources/dao/MoodDao";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class MoodService {
  private presetMoods: IMood[] = [
    {
      emoji: "🚧",
      id: "0",
      rating: 3,
      name: "TBD",
    },
  ];
  private moodsMap: Map<string, IMood> = new Map();
  public init() {
    return this.updateCacheThenNotify();
  }
  moodsCache = [];
  firstLoad = true;
  constructor(private moodDao: MoodDao, private ea: EventAggregator) {}
  notifyListeners() {
    this.ea.publish("moodsUpdated");
  }

  updateCacheThenNotify() {
    if (this.firstLoad)
      this.fetchMoods(true).then((moods) => {
        this.moodsCache = moods;
        this.moodsMap = new Map();
        this.moodsCache.concat(this.presetMoods).forEach((mood: IMood) => {
          this.moodsMap.set(mood.id, mood);
        });
        this.firstLoad = false;
        this.notifyListeners();
        this.updateCacheThenNotify();
      });
    else
      this.fetchMoods(true).then((moods) => {
        this.moodsCache = moods;
        this.moodsMap = new Map();
        this.moodsCache.concat(this.presetMoods).forEach((mood: IMood) => {
          this.moodsMap.set(mood.id, mood);
        });
        this.firstLoad = false;
        this.notifyListeners();
        this.updateCacheThenNotify();
      });
  }

  saveMood(mood) {
    this.moodDao.saveItem(mood);
    this.updateCacheThenNotify();
  }

  fetchMoods(hitCache) {
    return this.moodDao.getItems(hitCache).then((moods: IMood[]) => {
      moods.push();
      return moods;
    });
  }

  getMood(id) {
    return this.moodsMap.get(id);
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
