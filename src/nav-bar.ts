import { ActivityService } from "resources/services/activityService";
import { FirestoreCounter } from "./resources/dao/FirestoreCounter";
import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import nightwind from "nightwind/helper";
@autoinject
export class NavBar {
  FirestoreCounter = FirestoreCounter;
  constructor(
    public router: Router,
    private activityService: ActivityService
  ) {}
  toggleNightMode() {
    nightwind.toggle();
  }
  toggleShowArchived() {
    this.activityService.toggleArchivedActivitiesThenNotify();
  }
}
