import { IActivityDetail } from "./../elements/entry/entry.interface";
import { EventAggregator } from "aurelia-event-aggregator";
import { Router } from "aurelia-router";
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
  daysElapsed: number;
  daysWithActivity: number;
  totalActivity = 0;
  percentOfDays: string;
  mfuDetails: IStatsDetailEntry[];
  mruDetails: IStatsDetailEntry[];
  @bindable filter: string = "";
  showLists: boolean = true;
  month: number;
  year: number;
  day: number;
  selectedTextItem: string;
  isArray = Array.isArray;
  constructor(
    public controller: DialogController,
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
    this.onMonthChange(month, year);
    this.ea.subscribe("statsUpdated", this.loadMru.bind(this));
    this.loadMru();
  }
  loadMru() {
    if (!this.statsService.activityStats.get(this.activityId).detailsUsed) {
      this.showLists = false;
      return;
    }
    const map: Map<string, IStatsDetailEntry> =
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

    this.mruDetails = Array.from(map.values()).filter(
      (recentlyUsedDetail: IStatsDetailEntry) =>
        recentlyUsedDetail.text
          .toLowerCase()
          .includes(this.filter.toLowerCase())
    );
    this.mruDetails = this.mruDetails.sort(
      (a: IStatsDetailEntry, b: IStatsDetailEntry) => {
        return (
          b.dates[0].date.localeCompare(a.dates[0].date) || b.count - a.count
        );
      }
    );
    this.mruDetails = this.mruDetails.slice(
      0,
      Math.min(7, this.mruDetails.length)
    );
  }
  public onDateSelect(date) {
    const [year, month, day] = date.split("-");
    this.router.navigateToRoute("entries", {
      year,
      month,
      day,
    });
    this.controller.cancel();
  }
  public formatDate(date) {
    return format(date, "yyyy/MM/dd");
  }
  public onMonthChange(month, year) {
    this.month = month;
    this.year = year;
    let affectedDates = this.statsService.activityStats.get(this.activityId);
    if (this.selectedTextItem)
      affectedDates = this.statsService.activityStats
        .get(this.activityId)
        .detailsUsed.get(this.selectedTextItem);
    const entryDates = affectedDates.dates.filter(
      (date) => date.entry.month === month && date.entry.year === year
    );
    const newEntryMap = new Map();
    this.totalActivity = 0;
    for (let entryDate of entryDates) {
      newEntryMap.set(entryDate.date, entryDate.entry);
      const activityDetail: IActivityDetail = entryDate.entry.activities.get(
        this.activityId
      );
      this.totalActivity += Array.isArray(activityDetail)
        ? activityDetail.length
        : activityDetail;
    }
    this.relatedEntryMap = newEntryMap;
    this.daysElapsed = this.getDaysElapsedInMonth(month, year);
    this.daysWithActivity = this.relatedEntryMap.size;
    this.percentOfDays = this.daysElapsed
      ? ((this.daysWithActivity / this.daysElapsed) * 100).toFixed(2)
      : "0.00";
  }
  public selectTextItem(textItem) {
    this.selectedTextItem =
      textItem === this.selectedTextItem ? undefined : textItem;
    this.onMonthChange(this.month, this.year);
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
