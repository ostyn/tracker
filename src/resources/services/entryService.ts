import { IEntry } from "./../elements/entry/entry.interface";
import { autoinject } from "aurelia-framework";
import { EntryDao } from "resources/dao/EntryDao";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class EntryService {
  cache: Map<string, IEntry[]> = new Map();
  constructor(private entryDao: EntryDao, private ea: EventAggregator) {}
  public init() {
    this.entryDao.setupCacheAndUpdateListener(this.notifyListeners.bind(this));
  }
  notifyListeners() {
    this.cache.clear();
    this.ea.publish("entriesUpdated");
  }
  addEntry(entry: IEntry) {
    this.entryDao.saveItem(entry);
    this.notifyListeners();
  }

  getEntries(year: number, month: number): Promise<IEntry[]> {
    let cachedCopy = this.getCache(year, month);
    if (cachedCopy) return Promise.resolve(cachedCopy);
    return this.entryDao
      .getEntriesFromYearAndMonth(year, month)
      .then((entries) => {
        this.cache.set(`${year}-${month}`, entries);
        return entries;
      });
  }
  getCache(year: number, month: number) {
    return this.cache.get(`${year}-${month}`);
  }

  getEntry(id) {
    return this.entryDao.getItem(id).then((entry) => entry);
  }

  deleteEntry(id) {
    return this.entryDao.deleteItem(id).then((resp) => {
      this.notifyListeners();
      return resp;
    });
  }
}
