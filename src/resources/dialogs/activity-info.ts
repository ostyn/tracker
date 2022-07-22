import { Router } from "aurelia-router";
import { EntryDao } from "resources/dao/EntryDao";
import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { IEntry } from "resources/elements/entry/entry.interface";
import { format, getDaysInMonth } from "date-fns";

@autoinject
export class ActivityInfo {
  relatedEntryMap: Map<string, IEntry> = new Map();
  activityId: string;
  loading = true;
  daysElapsed: number;
  daysWithActivity: number;
  totalActivity = 0;
  percentOfDays: string;
  constructor(
    public controller: DialogController,
    private entryDao: EntryDao,
    private router: Router
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
