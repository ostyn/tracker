import { ActivityService } from "resources/services/activityService";
import { FirestoreCounter } from "./resources/dao/FirestoreCounter";
import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
@autoinject
export class NavBar2 {
  toStr = console.log;
  FirestoreCounter = FirestoreCounter;
  darkModeIcon: string;
  theme: string;
  constructor(public router: Router, private activityService: ActivityService) {
    let theme = localStorage.getItem("theme");
    this.setTheme(theme);
  }
  goTo(href) {
    this.router.navigate(href);
  }
  toggleNightMode() {
    let newTheme = localStorage.getItem("theme") === "light" ? "dark" : "light";
    this.setTheme(newTheme);
  }
  private setTheme(theme: string) {
    this.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  toggleShowArchived() {
    this.activityService.toggleArchivedActivitiesThenNotify();
  }
}
