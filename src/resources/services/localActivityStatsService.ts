import { IEntry } from "resources/elements/entry/entry.interface";

export class LocalActivityStatsService {
  private activityDetails: Record<string, string[]> = {};
  private MAX_ITEMS = 15;
  init() {
    this.load();
  }
  public updateWithEntry(entry: IEntry) {
    for (let [activity, details] of Array.from(entry.activities.entries())) {
      if (this.isArray(details)) {
        for (let detail of details) {
          this.activityDetails[activity] = this.addActivityDetailsToArray(
            detail,
            this.activityDetails[activity] || []
          );
        }
      }
    }
    this.save();
  }
  public getMostRecentDetailsForActivity(activityId) {
    return Array.from(this.activityDetails[activityId] || []);
  }
  addActivityDetailsToArray(detail: string, arr: string[]) {
    const index = arr.findIndex(
      (str) => detail.toLowerCase() === str.toLowerCase()
    );
    if (index >= 0) arr.splice(index, 1);
    arr.splice(this.MAX_ITEMS - 1, arr.length);
    arr.unshift(detail);
    return arr;
  }
  load() {
    this.activityDetails =
      JSON.parse(localStorage.getItem("mruActivityDetails")) || {};
  }
  save() {
    localStorage.setItem(
      "mruActivityDetails",
      JSON.stringify(this.activityDetails)
    );
  }
  isArray(array) {
    return array?.constructor === Array;
  }
}
