import { DialogService } from "aurelia-dialog";
import { autoinject } from "aurelia-framework";
import { MoodService } from "./resources/services/moodService";
import { ActivityService } from "resources/services/activityService";
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
  isLoaded = false;
  constructor(
    private activityService: ActivityService,
    private moodService: MoodService,
    private dialogService: DialogService
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
    config.addPipelineStep("postcomplete", ScrollToTopPostCompleteStep);
    this.questionUnloadWhenDialogActive();
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
        route: "",
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

  private questionUnloadWhenDialogActive() {
    window.onbeforeunload = (e) => {
      if (!this.dialogService.hasActiveDialog) return;
      e = e || window.event;
      this.dialogService.closeAll();
      // For IE and Firefox
      if (e) {
        e.returnValue = "";
      }

      // For Safari
      return "";
    };
  }
}
class ScrollToTopPostCompleteStep {
  run(routingContext, next) {
    window.scrollTo(0, 0);
    return next();
  }
}
class PostCompleteStep {
  run(routingContext, next) {
    window.scrollTo(0, 0);
    return next();
  }
}
