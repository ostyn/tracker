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

  constructor(
    public controller: DialogController,
    private activityService: ActivityService
  ) {}

  activate(activityDetail: ActivityDetail) {
    this.activity = this.activityService.getActivity(activityDetail.activityId);
    this.detail = activityDetail.detail;
  }
  isArray(array) {
    return array?.constructor === Array;
  }
  addItemOrSubmit() {
    if (this.newItem !== "" && this.newItem !== undefined) {
      //@ts-ignore
      this.detail.push(this.newItem);
      this.newItem = undefined;
      this.inputBox.scrollIntoView(true);
    } else {
      this.submitForm();
    }
  }
  submitForm() {
    this.controller.ok({ activityId: this.activity.id, detail: this.detail });
  }
}

interface ActivityDetail {
  activityId: string;
  detail: number | string[];
}
