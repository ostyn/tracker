import { IEntry } from "./../elements/entry/entry.interface";
import { autoinject } from "aurelia-framework";
import { EntryDao } from "resources/dao/EntryDao";
import { EventAggregator } from "aurelia-event-aggregator";
import { LocalActivityStatsService } from "./localActivityStatsService";

@autoinject
export class EntryService {
  constructor(
    private localActivityStatsService: LocalActivityStatsService
  ) {}
  firstLoad = true;
  notifyListeners() {
    this.ea.publish("entriesUpdated");
  }
  addEntry(entry: IEntry) {
    this.localActivityStatsService.updateWithEntry(entry);
    this.entryDao.saveItem(entry);
    this.notifyListeners();
  }

  getEntries(year, month) {
    if (this.firstLoad) {
      return this.entryDao
        .getEntriesFromYearAndMonth(year, month, undefined, true)
        .then((entries) => {
          this.firstLoad = false;
          this.notifyListeners();
          return entries;
        });
    }

    return this.entryDao
      .getEntriesFromYearAndMonth(year, month)
      .then((entries) => {
        return entries;
      });
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
