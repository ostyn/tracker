import { ActivityService } from "resources/services/activityService";
import { autoinject, computedFrom } from "aurelia-framework";
import { Router } from "aurelia-router";
@autoinject
export class NavBar {
  window = window;
  constructor(
    public router: Router,
    private activityService: ActivityService
  ) {}
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
  toggleShowArchived() {
    this.activityService.toggleArchivedActivitiesThenNotify();
  }
}
