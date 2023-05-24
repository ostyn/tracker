import { bindable } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { StatsService } from "resources/services/statsService";
import { IActivity } from "./../elements/activity/activity.interface";
import { ActivityService } from "./../services/activityService";
import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { IStatsDetailEntry } from "resources/services/activity-stats.interface";

@autoinject
export class ActivityDetailDialog {
  activity: IActivity;
  detail: number | string[];
  @bindable newItem: string = "";
  inputBox: Element;
  mfuDetails: IStatsDetailEntry[];
  mruDetails: IStatsDetailEntry[];
  editingNumber = false;
  currentEditDetail: number = undefined;

  constructor(
    public controller: DialogController,
    private activityService: ActivityService,
    private statsService: StatsService,
    private ea: EventAggregator
  ) {}
  newItemChanged() {
    this.loadMru();
  }
  activate({ id, detail, editingNumber }) {
    this.activity = this.activityService.getActivity(id);
    this.detail = detail;
    this.editingNumber = editingNumber;
    this.ea.subscribe("statsUpdated", this.loadMru.bind(this));
    this.loadMru();
  }

  loadMru() {
    if (this.editingNumber) return;
    const map =
      this.statsService.activityStats.get(this.activity.id).detailsUsed ||
      new Map();
    const lowerCaseDetails = (this.detail as string[]).map((str) =>
      str.toLowerCase()
    );
    this.mfuDetails = Array.from(map.values()).filter(
      (frequentlyUsedDetail) =>
        !lowerCaseDetails.includes(frequentlyUsedDetail.text.toLowerCase()) &&
        frequentlyUsedDetail.text
          .toLowerCase()
          .includes(this.newItem.toLowerCase())
    );
    this.mfuDetails = this.mfuDetails.sort((a, b) => {
      return b.count - a.count;
    });
    this.mfuDetails = this.mfuDetails.slice(
      0,
      Math.min(7, this.mfuDetails.length)
    );

    this.mruDetails = Array.from(map.values()).filter(
      (recentlyUsedDetail) =>
        !lowerCaseDetails.includes(recentlyUsedDetail.text.toLowerCase()) &&
        recentlyUsedDetail.text
          .toLowerCase()
          .includes(this.newItem.toLowerCase())
    );
    this.mruDetails = this.mruDetails.sort(
      (a: IStatsDetailEntry, b: IStatsDetailEntry) => {
        return (
          b.dates[0].date.localeCompare(a.dates[0].date) || b.count - a.count
        );
      }
    );
    this.mruDetails = this.mruDetails.slice(
      0,
      Math.min(7, this.mruDetails.length)
    );
  }
  isArray(array) {
    return array?.constructor === Array;
  }
  addDetail(detail) {
    //@ts-ignore
    this.detail.push(detail.trim());
    this.newItem = "";
    this.loadMru();
  }
  addItemOrSubmit() {
    if (this.newItem !== "" && this.newItem !== undefined) {
      this.addDetail(this.newItem);
      this.inputBox.scrollIntoView(true);
    } else {
      this.submitForm();
    }
  }
  removeItem(detail, index) {
    detail.splice(index, 1);
    this.loadMru();
  }
  clear() {
    this.detail = undefined;
    this.controller.ok({
      activityId: this.activity.id,
    });
  }
  submitForm() {
    const payload = {
      activityId: this.activity.id,
      detail: this.editingNumber ? Number(this.detail) : this.detail,
    };
    if (this.editingNumber && this.detail === undefined) delete payload.detail;

    this.controller.ok(payload);
  }
  public add(value: number) {
    this.detail = Number(this.detail) + value;
  }
  isNumeric(str) {
    if (typeof str == "number") return true;
    if (typeof str !== "string") return false; // we only process strings!
    return (
      !isNaN(str as any) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
  }
  isEditing(index) {
    return this.currentEditDetail === index;
  }
  editDetail(index) {
    console.log(index);
    this.currentEditDetail = index;
  }
}

interface ActivityDetail {
  activityId: string;
  detail: number | string[];
}
