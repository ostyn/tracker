import { summary } from "date-streaks";
import { EntryDao } from "resources/dao/EntryDao";
import { autoinject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { IEntry } from "resources/elements/entry/entry.interface";
import { IStatsActivityEntry } from "./activity-stats.interface";
import { ActivityService } from "./activityService";
import { MoodService } from "./moodService";

@autoinject
export class StatsService {
  streakSummary: {
    currentStreak: number;
    longestStreak: number;
    streaks: number[];
    todayInStreak: boolean;
    withinCurrentStreak: boolean;
  };
  pending: boolean = false;
  activityStats: Map<string, IStatsActivityEntry>;
  public init() {
    this.ea.subscribe("entriesUpdated", this.updateCacheThenNotify.bind(this));
    return this.updateCacheThenNotify();
  }
  constructor(
    private entryDao: EntryDao,
    private activityService: ActivityService,
    private moodService: MoodService,
    private ea: EventAggregator
  ) {}
  notifyListeners() {
    this.ea.publish("statsUpdated");
  }

  updateCacheThenNotify() {
    if (!this.pending) {
      console.log("scheduled");
      this.pending = true;
      setTimeout(this.processStats.bind(this), 3000);
    } else {
      console.log("squashed");
    }
  }

  private processStats() {
    let start = new Date().getTime();
    return this.entryDao
      .getEntriesFromYearAndMonth()
      .then((entries: IEntry[]) => {
        this.activityStats = new Map<string, IStatsActivityEntry>();
        const startProcessing = new Date().getTime();
        console.log("Collection: ", startProcessing - start);

        let dates: { date: string; entry: IEntry }[] = [];
        entries.forEach((entry: IEntry) => {
          dates.push({ date: entry.date, entry });
          for (let [activityId, detail] of entry.activities.entries()) {
            if (!this.activityStats.has(activityId)) {
              this.activityStats.set(activityId, { count: 0, dates: [] });
            }
            let activity = this.activityStats.get(activityId);
            activity.count++;
            activity.dates.push({ date: entry.date, entry });
            if (Array.isArray(detail)) {
              if (!activity.detailsUsed) {
                activity.detailsUsed = new Map();
              }
              let currentActivityDetails = activity.detailsUsed;
              detail.forEach((detailItem) => {
                if (!currentActivityDetails.has(detailItem))
                  currentActivityDetails.set(detailItem, {
                    count: 0,
                    text: detailItem,
                    dates: [],
                  });
                let currentDetailItem = currentActivityDetails.get(detailItem);
                currentDetailItem.count++;
                currentDetailItem.dates.push({ date: entry.date, entry });
              });
            }
          }
        });

        this.streakSummary = summary({ dates: dates.map((date) => date.date) });
        this.pending = false;
        console.log("Processing: ", new Date().getTime() - startProcessing);
        this.notifyListeners();
      });
  }
  getStreakSummary() {
    return this.streakSummary;
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
}
