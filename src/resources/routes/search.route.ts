import { IEntry } from "resources/elements/entry/entry.interface";
import { autoinject, bindable } from "aurelia-framework";
import { ActivityService } from "resources/services/activityService";
import { EntryDao } from "resources/dao/EntryDao";

@autoinject
export class SearchRoute {
  @bindable public needle: string;
  public entries: IEntry[];
  public entryPage: IEntry[];
  public currentPage = 0;
  private pageSize = 20;
  public lastPageIndex = 0;
  public firstEntryIndex = 0;
  public lastEntryIndex = 0;

  constructor(
    private entryDao: EntryDao,
    private activityService: ActivityService
  ) {}
  resetState() {
    this.entries = undefined;
    this.entryPage = undefined;
    this.currentPage = 0;
    this.pageSize = 20;
    this.lastPageIndex = 0;
    this.firstEntryIndex = 0;
    this.lastEntryIndex = 0;
  }
  needleChanged() {
    this.currentPage = 0;
    this.search();
  }
  nextPage() {
    if (this.currentPage < this.lastPageIndex) {
      this.currentPage++;
      this.resliceEntries();
      console.log(this.lastPageIndex, this.currentPage);
    }
  }
  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.resliceEntries();
      console.log(this.lastPageIndex, this.currentPage);
    }
  }

  public search(): void {
    this.entryDao.getEntriesFromYearAndMonth().then((entries: IEntry[]) => {
      if (!this.needle) {
        this.resetState();
        return;
      }
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
            regex.test(this.activityService.activitiesMap?.get(activityId).name)
          ) ||
          regex.test(entry.date)
        );
      });
      this.lastPageIndex = Math.ceil(this.entries.length / this.pageSize) - 1;
      this.resliceEntries();
    });
  }
  private resliceEntries() {
    if (this.entries.length) {
      this.firstEntryIndex = this.currentPage * this.pageSize;
      this.lastEntryIndex = Math.min(
        (this.currentPage + 1) * this.pageSize,
        this.entries.length
      );
      this.entryPage = this.entries.slice(
        this.firstEntryIndex,
        this.lastEntryIndex
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
