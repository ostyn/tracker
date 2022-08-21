import { IMood } from "./../elements/mood/mood.interface";
import { autoinject } from "aurelia-framework";
import { MoodDao } from "resources/dao/MoodDao";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class MoodService {
  public isLoaded = false;
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
    this.moodDao.setupCacheAndUpdateListener(this.notifyListeners.bind(this));
  }
  moodsCache = [];
  constructor(private moodDao: MoodDao, private ea: EventAggregator) {}
  notifyListeners() {
    this.fetchMoods().then((moods) => {
      this.moodsCache = moods;
      this.moodsMap = new Map();
      this.moodsCache.concat(this.presetMoods).forEach((mood: IMood) => {
        this.moodsMap.set(mood.id, mood);
      });
      this.isLoaded = true;
      this.ea.publish("moodsUpdated");
    });
  }

  saveMood(mood) {
    this.moodDao.saveItem(mood);
  }

  fetchMoods(hitCache = false) {
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
      return resp;
    });
  }
}
