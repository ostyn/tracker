import { ActivityService } from "resources/services/activityService";
import { FirestoreCounter } from "./resources/dao/FirestoreCounter";
import { autoinject, computedFrom } from "aurelia-framework";
import { Router } from "aurelia-router";
@autoinject
export class NavBar {
  FirestoreCounter = FirestoreCounter;
  darkModeIcon: string;
  theme: string;
  window = window;
  constructor(public router: Router, private activityService: ActivityService) {
    let theme = localStorage.getItem("theme");
    this.setTheme(theme);
  }
  @computedFrom("window.location.href", "router.navigation.length")
  get selectedRoute() {
    return (
      this.router.navigation.find((route) => {
        return window.location.href.includes(route.config.name);
      })?.config?.name || "entries"
    );
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
