import { LocalActivityStatsService } from "./../services/localActivityStatsService";
import { IActivity } from "./../elements/activity/activity.interface";
import { ActivityService } from "./../services/activityService";
import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";

@autoinject
export class ActivityDetailDialog {
  activity: IActivity;
  detail: number | string[];
  newItem: string;
  inputBox: Element;
  mru: string[];

  constructor(
    public controller: DialogController,
    private activityService: ActivityService,
    private localActivityStatsService: LocalActivityStatsService
  ) {}

  activate(activityDetail: ActivityDetail) {
    this.activity = this.activityService.getActivity(activityDetail.activityId);
    this.detail = activityDetail.detail;

    this.loadMru();
  }
  loadMru() {
    const allMru =
      this.localActivityStatsService.getMostRecentDetailsForActivity(
        this.activity.id
      );
    const lowerCaseDetails = (this.detail as string[]).map((str) =>
      str.toLowerCase()
    );
    this.mru = allMru.filter(
      (recentlyUsedDetail) =>
        !lowerCaseDetails.includes(recentlyUsedDetail.toLowerCase())
    );
    console.log(this.mru);
  }
  isArray(array) {
    return array?.constructor === Array;
  }
  addDetailFromMru(detail) {
    //@ts-ignore
    this.detail.push(detail);
    this.loadMru();
  }
  addItemOrSubmit() {
    if (this.newItem !== "" && this.newItem !== undefined) {
      //@ts-ignore
      this.detail.push(this.newItem);
      this.newItem = undefined;
      this.inputBox.scrollIntoView(true);
      this.loadMru();
    } else {
      this.submitForm();
    }
  }
  removeItem(detail, index) {
    detail.splice(index, 1);
    this.loadMru();
  }
  submitForm() {
    this.controller.ok({ activityId: this.activity.id, detail: this.detail });
  }
}

interface ActivityDetail {
  activityId: string;
  detail: number | string[];
}
