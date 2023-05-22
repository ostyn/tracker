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
  moodsCache: IMood[] = [];
  constructor(private moodDao: MoodDao, private ea: EventAggregator) {}
  notifyListeners() {
    this.fetchMoods().then((moods) => {
      this.moodsCache = moods;
      this.moodsMap = new Map();
      this.moodsCache.sort((a, b) => b.rating - a.rating);
      this.moodsCache.concat(this.presetMoods).forEach((mood: IMood) => {
        this.moodsMap.set(mood.id, mood);
      });
      this.isLoaded = true;
      this.ea.publish("moodsUpdated");
    });
  }

  saveMood(mood: IMood) {
    this.moodDao.saveItem(mood);
  }

  fetchMoods(): Promise<IMood[]> {
    return this.moodDao.getItems().then((moods: IMood[]) => {
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
  getAllUserCreatedMoods(): IMood[] {
    return this.moodsCache;
  }

  deleteMood(id) {
    return this.moodDao.deleteItem(id).then((resp) => {
      return resp;
    });
  }
}
