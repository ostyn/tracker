import { EventAggregator } from "aurelia-event-aggregator";
import { Router } from "aurelia-router";
import { EntryDao } from "resources/dao/EntryDao";
import { autoinject, bindable } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { IEntry } from "resources/elements/entry/entry.interface";
import { format, getDaysInMonth } from "date-fns";
import { IStatsDetailEntry } from "resources/services/activity-stats.interface";
import { StatsService } from "resources/services/statsService";

@autoinject
export class ActivityInfo {
  relatedEntryMap: Map<string, IEntry> = new Map();
  activityId: string;
  loading = true;
  daysElapsed: number;
  daysWithActivity: number;
  totalActivity = 0;
  percentOfDays: string;
  mfuDetails: IStatsDetailEntry[];
  mruDetails: any[];
  @bindable filter: string = "";
  showLists: boolean = true;
  month: number;
  year: number;
  day: number;
  constructor(
    public controller: DialogController,
    private entryDao: EntryDao,
    private router: Router,
    private statsService: StatsService,
    private ea: EventAggregator
  ) {}
  filterChanged() {
    this.loadMru();
  }
  activate({
    id,
    month = new Date().getMonth() + 1,
    year = new Date().getFullYear(),
    day = new Date().getDate(),
  }) {
    this.month = month;
    this.year = year;
    this.day = day;
    this.activityId = id;
    this.onMonthChange(month, year).finally(() => {
      this.loading = false;
    });
    this.ea.subscribe("statsUpdated", this.loadMru.bind(this));
    this.loadMru();
  }
  loadMru() {
    if (!this.statsService.activityStats.get(this.activityId).detailsUsed) {
      this.showLists = false;
      return;
    }
    const map =
      this.statsService.activityStats.get(this.activityId).detailsUsed ||
      new Map();
    this.mfuDetails = Array.from(map.values()).filter((frequentlyUsedDetail) =>
      frequentlyUsedDetail.text
        .toLowerCase()
        .includes(this.filter.toLowerCase())
    );
    this.mfuDetails = this.mfuDetails.sort((a, b) => {
      return b.count - a.count;
    });
    this.mfuDetails = this.mfuDetails.slice(
      0,
      Math.min(7, this.mfuDetails.length)
    );

    this.mruDetails = Array.from(map.values()).filter((recentlyUsedDetail) =>
      recentlyUsedDetail.text.toLowerCase().includes(this.filter.toLowerCase())
    );
    this.mruDetails = this.mruDetails.sort((a, b) => {
      return b.dates[0].localeCompare(a.dates[0]) || b.count - a.count;
    });
    this.mruDetails = this.mruDetails.slice(
      0,
      Math.min(7, this.mruDetails.length)
    );
  }
  public onDateSelect(date: Date | string) {
    date = new Date(date);
    this.router.navigateToRoute("entries", {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
    this.controller.cancel();
  }
  public formatDate(date) {
    return format(date, "yyyy/MM/dd");
  }
  public onMonthChange(month, year) {
    return this.entryDao
      .getEntriesWithSpecificActivityAndDate(this.activityId, month, year)
      .then((entries) => {
        const newEntryMap = new Map();
        this.totalActivity = 0;
        for (let entry of entries) {
          newEntryMap.set(entry.date, entry);
          this.totalActivity +=
            entry.activities.get(this.activityId).length ||
            entry.activities.get(this.activityId);
        }
        this.relatedEntryMap = newEntryMap;
        this.daysElapsed = this.getDaysElapsedInMonth(month, year);
        this.daysWithActivity = this.relatedEntryMap.size;
        this.percentOfDays = this.daysElapsed
          ? ((this.daysWithActivity / this.daysElapsed) * 100).toFixed(2)
          : "0.00";
      });
  }
  private getDaysElapsedInMonth(month: number, year: number): number {
    const currentDate = new Date();
    if (new Date(year, month - 1, 1).getTime() > currentDate.getTime())
      return 0;
    if (
      month === currentDate.getMonth() + 1 &&
      year == currentDate.getFullYear()
    )
      return currentDate.getDate();
    else return getDaysInMonth(new Date(year, month - 1, 1));
  }
}
