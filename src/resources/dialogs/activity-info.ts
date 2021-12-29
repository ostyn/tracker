import { StreakService } from "resources/services/streakService";
import { Router } from "aurelia-router";
import { EntryDao } from "resources/dao/EntryDao";
import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { IEntry } from "resources/elements/entry/entry.interface";
import { endOfMonth, format, getDaysInMonth } from "date-fns";

@autoinject
export class ActivityInfo {
  relatedEntryMap: Map<string, IEntry> = new Map();
  activityId: string;
  loading = true;
  daysElapsed: number;
  daysWithActivity: number;
  totalActivity = 0;
  streaks: any[];
  constructor(
    public controller: DialogController,
    private entryDao: EntryDao,
    private router: Router,
    private streakService: StreakService
  ) {}
  activate(activityId) {
    this.activityId = activityId;
    const now = new Date();
    this.onMonthChange(now.getMonth() + 1, now.getFullYear()).finally(() => {
      this.loading = false;
    });
  }
  public onDateSelect(date: Date) {
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
    this.streakService
      .getActivityStreaksCrossingRange(
        this.activityId,
        new Date(year, month - 1, 1),
        endOfMonth(new Date(year, month - 1, 1))
      )
      .then((data) => {
        this.streaks = data;
      });
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
      });
  }
  private getDaysElapsedInMonth(month: number, year: number): number {
    const currentDate = new Date();
    if (month > currentDate.getMonth() + 1) return 0;
    if (month === currentDate.getMonth() + 1) return currentDate.getDate();
    else return getDaysInMonth(new Date(year, month - 1, 1));
  }
}
