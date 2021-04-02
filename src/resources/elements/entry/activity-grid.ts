import { IActivity } from "resources/elements/activity/activity.interface";
import { bindable } from "aurelia-framework";
export class ActivityGrid {
  @bindable activities: IActivity[] = [];
  @bindable onActivityClick;
}
