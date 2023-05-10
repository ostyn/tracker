import { ActivityService } from "resources/services/activityService";
import { FirestoreCounter } from "./resources/dao/FirestoreCounter";
import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
@autoinject
export class NavBar2 {
  toStr = console.log;
  FirestoreCounter = FirestoreCounter;
  constructor(public router: Router, private activityService: ActivityService) {
    let theme = localStorage.getItem("theme");
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }
  goTo(href) {
    this.router.navigate(href);
  }
  toggleNightMode() {
    let theme = localStorage.getItem("theme");
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }
  toggleShowArchived() {
    this.activityService.toggleArchivedActivitiesThenNotify();
  }
}
