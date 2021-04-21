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
    private entryDao: EntryDao
  ) {}
  activate(activityId) {
    this.activityId = activityId;
    this.entryDao.getEntriesWithSpecificActivity(activityId).then((entries) => {
      for (let entry of entries) {
        this.relatedEntryMap.set(entry.date, entry);
      }
      this.loading = false;
    });
  }
}
