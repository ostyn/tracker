import { MoodService } from "./moodService";
import { ActivityService } from "./activityService";
import { IEntry } from "./../elements/entry/entry.interface";
import { autoinject } from "aurelia-framework";
import { EntryDao } from "resources/dao/EntryDao";
import { EventAggregator } from "aurelia-event-aggregator";
import { LocalActivityStatsService } from "./localActivityStatsService";
import { summary } from "date-streaks";

@autoinject
export class EntryService {
  constructor(
    private entryDao: EntryDao,
    private ea: EventAggregator,
    private activityService: ActivityService,
    private moodService: MoodService,
    private localActivityStatsService: LocalActivityStatsService
  ) {}
  public init() {
    this.entryDao.setupCacheAndUpdateListener(this.notifyListeners.bind(this));
  }
  notifyListeners() {
    this.ea.publish("entriesUpdated");
  }
  addEntry(entry: IEntry) {
    this.localActivityStatsService.updateWithEntry(entry);
    this.entryDao.saveItem(entry);
    this.notifyListeners();
  }

  getEntries(year, month) {
    return this.entryDao.getEntriesFromYearAndMonth(year, month);
  }

  public generateStats() {
    let start = new Date().getTime();
    return this.entryDao.getEntriesFromYearAndMonth().then((entries) => {
      let dates = [];
      entries.forEach((entry: IEntry) => {
        dates.push(new Date(entry.date));
      });
      console.log(new Date().getTime() - start);
      return summary({ dates });
    });
  }

  private createRows(entries: IEntry[]): string {
    const activities = this.activityService.getActivities();
    let rows = [];
    let headers = ["mood"];
    activities.forEach((activity) => headers.push(activity.name));
    rows.push(headers.join(","));
    entries.forEach((entry) => {
      rows.push(this.createRow(entry, activities));
    });
    return rows.join("\r\n");
  }

  private createRow(entry: IEntry, activities): string {
    let row = [];
    row.push(this.moodService.getMood(entry.mood).rating);
    activities.forEach((activity) => {
      let currentActivity = entry.activities.get(activity.id);
      if (currentActivity?.constructor === Array)
        row.push(currentActivity.length);
      else row.push(currentActivity);
    });
    return row.join(",");
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
