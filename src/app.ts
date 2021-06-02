import { autoinject } from "aurelia-framework";
import { MoodService } from "./resources/services/moodService";
import { ActivityService } from "resources/services/activityService";
import { PLATFORM } from "aurelia-pal";
import { Router } from "aurelia-router";
import firebase from "firebase";

@autoinject
export class App {
  isLoaded = false;
  constructor(
    private activityService: ActivityService,
    private moodService: MoodService
  ) {}
  router: Router;
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.activityService.init();
        this.moodService.init();
        this.isLoaded = true;
      }
    });
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
      {
        route: ["entry"],
        moduleId: PLATFORM.moduleName("./resources/routes/entry-route"),
        nav: false,
        name: "entry",
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
