import { Router } from "aurelia-router";
import { EntryDao } from "./../../dao/EntryDao";
import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { IEntry } from "../entry/entry.interface";
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
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    this.onMonthChange(month, year).finally(() => {
      this.loading = false;
    });
  }
  getDaysElapsed(month: number, year: number): number {
    if (month > DateTime.now().get("month")) return 0;
    if (month === DateTime.now().get("month")) return DateTime.now().get("day");
    else
      return DateTime.fromObject({ year: year, month: month }).get(
        "daysInMonth"
      );
  }
  onDateSelect(date) {
    this.router.navigateToRoute("entries", {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
    this.controller.cancel();
  }
  onMonthChange(month, year) {
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
        this.daysElapsed = this.getDaysElapsed(month, year);
        this.daysWithActivity = this.relatedEntryMap.size;
      });
  }
}
