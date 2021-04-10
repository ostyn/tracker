import { EntryDao } from "./../../dao/EntryDao";
import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { IEntry } from "../entry/entry.interface";
@autoinject
export class ActivityInfo {
  relatedEntries: IEntry[];
  activityId: string;

  constructor(
    public controller: DialogController,
    private entryDao: EntryDao
  ) {}
  activate(activityId) {
    this.activityId = activityId;
    this.entryDao.getEntriesWithSpecificActivity(activityId).then((entries) => {
      this.relatedEntries = entries;
    });
  }
}
