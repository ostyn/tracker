import { autoinject } from "aurelia-framework";
import { MoodService } from "./resources/services/moodService";
import { ActivityService } from "resources/services/activityService";
import { PLATFORM } from "aurelia-pal";
import { Router } from "aurelia-router";
@autoinject
export class App {
  constructor(
    private activityService: ActivityService,
    private moodService: MoodService
  ) {}
  router;
  created() {
    this.activityService.init();
    this.moodService.init();
  }
  configureRouter(config, router: Router) {
    config.title = "tracker";
    config.addPipelineStep("postcomplete", PostCompleteStep);
    config.map([
      {
        route: "",
        moduleId: PLATFORM.moduleName("./resources/elements/entry/entries"),
        nav: true,
        title: "entries",
        name: "entries",
        auth: true,
      },
      {
        route: ["entry"],
        moduleId: PLATFORM.moduleName("./resources/routes/entry-route"),
        nav: false,
        title: "entry",
        name: "entry",
      },
      {
        route: "moods",
        moduleId: PLATFORM.moduleName("./resources/elements/mood/moods"),
        nav: true,
        title: "moods",
        name: "moods",
        auth: true,
      },
      {
        route: "activities",
        moduleId: PLATFORM.moduleName(
          "./resources/elements/activity/activities"
        ),
        nav: true,
        title: "activities",
        name: "activities",
        auth: true,
      },
    ]);

    this.router = router;
  }
}
class PostCompleteStep {
  run(routingContext, next) {
    window.scrollTo(0, 0);
    return next();
  }
}
