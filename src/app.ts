import { LocalActivityStatsService } from "./resources/services/localActivityStatsService";
import { MoodService } from "./resources/services/moodService";
import { ActivityService } from "./resources/services/activityService";
import { DialogService } from "aurelia-dialog";
import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import {
  Router,
  NavigationInstruction,
  PipelineStep,
  Next,
  Redirect,
} from "aurelia-router";
import firebase from "firebase";

@autoinject
export class App {
  showNewEntryButton = false;
  loadedAndNotLoggedIn = false;
  constructor(
    private dialogService: DialogService,
    private activityService: ActivityService,
    private moodService: MoodService,
    private localActivityStatsService: LocalActivityStatsService
  ) {}
  router: Router;
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.activityService.init();
        this.moodService.init();
        this.localActivityStatsService.init();
        this.showNewEntryButton = true;
      } else {
        this.loadedAndNotLoggedIn = true;
      }
    });
  }
  configureRouter(config, router: Router) {
    config.title = "tracker";
    config.addPipelineStep("postcomplete", ScrollToTopPostCompleteStep);
    const closeDialogOnBackButtonStep: PipelineStep = {
      run: (navigationInstruction: NavigationInstruction, next: Next) => {
        if (
          navigationInstruction.router.isNavigatingBack &&
          this.dialogService.hasActiveDialog
        ) {
          this.dialogService.closeAll();
          return next.cancel(
            new Redirect(navigationInstruction.previousInstruction.fragment, {
              trigger: true,
              replace: false,
            })
          );
        }
        return next();
      },
    };
    config.addAuthorizeStep(closeDialogOnBackButtonStep);
    config.map([
      {
        route: ["", "entries"],
        moduleId: PLATFORM.moduleName("./resources/routes/entries.route"),
        nav: true,
        title: "entries",
        name: "entries",
        auth: true,
      },
      {
        route: "moods",
        moduleId: PLATFORM.moduleName("./resources/routes/moods.route"),
        nav: true,
        title: "moods",
        name: "moods",
        auth: true,
      },
      {
        route: "activities",
        moduleId: PLATFORM.moduleName("./resources/routes/activities.route"),
        nav: true,
        title: "activities",
        name: "activities",
        auth: true,
      },
      {
        route: ["entry"],
        moduleId: PLATFORM.moduleName("./resources/routes/entry.route"),
        nav: false,
        name: "entry",
      },
      {
        route: ["quick-log"],
        moduleId: PLATFORM.moduleName("./resources/routes/quick-log.route"),
        nav: false,
        name: "quick-log",
      },
    ]);

    this.router = router;
  }
}
class ScrollToTopPostCompleteStep {
  run(routingContext, next) {
    window.scrollTo(0, 0);
    return next();
  }
}
