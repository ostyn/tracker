import { EntryService } from "resources/services/entryService";
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
import { StatsService } from "resources/services/statsService";

import "@picocss/pico/pico.min.css";
import "./app.css";
import { LocalSettingsService } from "resources/services/localSettingsService";

@autoinject
export class App {
  constructor(
    private dialogService: DialogService,
    private activityService: ActivityService,
    private moodService: MoodService,
    private entryService: EntryService,
    private statsService: StatsService,
    private localSettingsService: LocalSettingsService
  ) {}
  router: Router;
  created() {
    this.localSettingsService.init();
    this.activityService.init();
    this.moodService.init();
    this.entryService.init();
    this.statsService.init();
    navigator?.storage?.persist();
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
        settings: { iconName: "book-open" },
        title: "entries",
        name: "entries",
        auth: true,
      },
      {
        route: ["entries/entry"],
        moduleId: PLATFORM.moduleName("./resources/routes/entry.route"),
        nav: false,
        settings: { iconName: "edit-3" },
        name: "entry",
        title: "entry",
      },
      {
        route: "moods",
        moduleId: PLATFORM.moduleName("./resources/routes/moods.route"),
        nav: true,
        settings: { iconName: "smile" },
        title: "moods",
        name: "moods",
        auth: true,
      },
      {
        route: "activities",
        moduleId: PLATFORM.moduleName("./resources/routes/activities.route"),
        nav: true,
        settings: { iconName: "activity" },
        title: "activities",
        name: "activities",
        auth: true,
      },
      {
        route: ["settings/import-daylio"],
        moduleId: PLATFORM.moduleName("./resources/routes/import-daylio.route"),
        nav: false,
        settings: { iconName: "settings" },

        title: "import daylio",
        name: "import-daylio",
      },
      {
        route: ["settings/import"],
        moduleId: PLATFORM.moduleName("./resources/routes/import.route"),
        nav: false,
        settings: { iconName: "settings" },

        title: "import",
        name: "import",
      },
      {
        route: ["entries/search"],
        moduleId: PLATFORM.moduleName("./resources/routes/search.route"),
        nav: false,
        settings: { iconName: "search" },

        title: "search",
        name: "search",
      },
      {
        route: ["settings"],
        moduleId: PLATFORM.moduleName("./resources/routes/settings.route"),
        nav: true,
        settings: { iconName: "settings" },

        title: "settings",
        name: "settings",
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
