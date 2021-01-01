import { autoinject } from "aurelia-framework";
import { EntryDao } from "resources/dao/EntryDao";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class EntryService {
  entries: any;
  constructor(private entryDao: EntryDao, private ea: EventAggregator) {}
  notifyListeners() {
    this.ea.publish("entriesUpdated");
  }
  addEntry(entry) {
    this.entryDao.saveItem(entry).then((id) => {
      this.notifyListeners();
    });
  }

  getEntries(year, month) {
    return this.entryDao
      .getEntriesFromYearAndMonth(year, month)
      .then((entries) => {
        return entries;
      });
  }

  getEntry(id) {
    return this.entries.get(id);
  }

  deleteEntry(id) {
    return this.entryDao.deleteItem(id).then((resp) => {
      this.notifyListeners();
      return resp;
    });
  }
}
