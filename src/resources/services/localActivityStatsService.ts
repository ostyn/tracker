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
            this.getDetailArray(activity)
          );
        }
      }
    }
    this.save();
  }
  public getMostRecentDetailsForActivity(activityId) {
    return Array.from(this.getDetailArray(activityId));
  }
  public removeDetailForActivity(detail: string, id: string) {
    this.removeFromArray(detail, this.getDetailArray(id));
    this.save();
  }
  private addActivityDetailsToArray(detail: string, arr: string[]) {
    this.removeFromArray(detail, arr);
    arr.splice(this.MAX_ITEMS - 1, arr.length);
    arr.unshift(detail);
    return arr;
  }
  private getDetailArray(activityId: any): string[] {
    return this.activityDetails[activityId] || [];
  }
  private removeFromArray(detail: string, arr: string[]) {
    const index = arr.findIndex(
      (str) => detail.toLowerCase() === str.toLowerCase()
    );
    if (index >= 0) arr.splice(index, 1);
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
