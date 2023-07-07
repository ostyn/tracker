import { Aurelia } from "aurelia-framework";
import * as environment from "../config/environment.json";
import { PLATFORM } from "aurelia-pal";
export function configure(aurelia: Aurelia): void {
  PLATFORM.moduleName("./resources/dialogs/text-prompt");
  PLATFORM.moduleName("./resources/dialogs/mood-prompt");
  PLATFORM.moduleName("./resources/dialogs/activity-prompt");
  PLATFORM.moduleName("./resources/dialogs/activity-info");
  PLATFORM.moduleName("./resources/dialogs/activity-detail-prompt");
  PLATFORM.moduleName("./resources/dialogs/new-activity-prompt");
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName("resources/index"))
    .plugin(PLATFORM.moduleName("aurelia-dialog"), (config) => {
      config.useDefaults();
      config.settings.overlayDismiss = true;
      config.settings.centerHorizontalOnly = true;
      config.settings.keyboard = true;
    })
    .plugin(PLATFORM.moduleName("aurelia-long-click-event"));
  //hack to avoid warning
  var env = environment;
  aurelia.use.developmentLogging(env.debug ? "debug" : "warn");
  if (env.testing) {
    aurelia.use.plugin(PLATFORM.moduleName("aurelia-testing"));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName("app")));
}
