import { IEntry } from "resources/elements/entry/entry.interface";
import { autoinject } from "aurelia-framework";
import { ActivityService } from "resources/services/activityService";
import { EntryDao } from "resources/dao/EntryDao";

@autoinject
export class SearchRoute {
  public needle: string;
  public entries: IEntry[];

  constructor(
    private entryDao: EntryDao,
    private activityService: ActivityService
  ) {}

  public search(): void {
    this.entryDao.getEntriesFromYearAndMonth().then((entries: IEntry[]) => {
      this.entries = entries.filter((entry) => {
        let regex = new RegExp(this.needle, "i");

        return (
          regex.test(entry.note) ||
          regex.test(entry.createdBy) ||
          regex.test(entry.lastUpdatedBy) ||
          Array.from(entry.activities.values())
            .filter((activity) => Array.isArray(activity))
            .some((activityDetail) =>
              (activityDetail as string[]).some(
                (detail) => !this.isNumeric(detail) && regex.test(detail)
              )
            ) ||
          entry.activitiesArray.some((activityId) =>
            regex.test(this.activityService.activitiesMap.get(activityId).name)
          ) ||
          regex.test(entry.date)
        );
      });
    });
  }
  isNumeric(str) {
    if (typeof str == "number") return true;
    if (typeof str !== "string") return false; // we only process strings!
    return (
      !isNaN(str as any) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
  }
}
