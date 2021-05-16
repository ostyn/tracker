import { Router } from "aurelia-router";
import { EntryDao } from "./../../dao/EntryDao";
import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { IEntry } from "../entry/entry.interface";
@autoinject
export class ActivityInfo {
  relatedEntryMap: Map<string, IEntry> = new Map();
  activityId: string;
  loading = true;
  constructor(
    public controller: DialogController,
    private entryDao: EntryDao,
    private router: Router
  ) {}
  activate(activityId) {
    this.activityId = activityId;
    //TODO fix how we load up calendar information.
    //It's been broken ever since we added userId to everything.
    this.entryDao.getEntriesWithSpecificActivity(activityId).then((entries) => {
      for (let entry of entries) {
        this.relatedEntryMap.set(entry.date, entry);
      }
      this.loading = false;
    });
  }
  onDateSelect(date) {
    this.router.navigateToRoute("entries", {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
    this.controller.cancel();
  }
}
