import { Router } from "aurelia-router";
import { EntryDao } from "resources/dao/EntryDao";
import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { IEntry } from "resources/elements/entry/entry.interface";
import { DateTime } from "luxon";

@autoinject
export class ActivityInfo {
  relatedEntryMap: Map<string, IEntry> = new Map();
  activityId: string;
  loading = true;
  daysElapsed: number;
  daysWithActivity: number;
  totalActivity = 0;
  constructor(
    public controller: DialogController,
    private entryDao: EntryDao,
    private router: Router
  ) {}
  activate(activityId) {
    this.activityId = activityId;
    const currentDate = DateTime.now();
    this.onMonthChange(currentDate.month, currentDate.year).finally(() => {
      this.loading = false;
    });
  }
  public onDateSelect({ year, month, day }: DateTime) {
    this.router.navigateToRoute("entries", {
      year,
      month,
      day,
    });
    this.controller.cancel();
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
      });
  }
  private getDaysElapsedInMonth(month: number, year: number): number {
    const currentDate = DateTime.now();
    if (month > currentDate.month) return 0;
    if (month === currentDate.month) return currentDate.day;
    else
      return DateTime.fromObject({ year: year, month: month }).get(
        "daysInMonth"
      );
  }
}
