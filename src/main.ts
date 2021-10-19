import nightwind from "nightwind/helper";
import { Aurelia } from "aurelia-framework";
import * as environment from "../config/environment.json";
import { PLATFORM } from "aurelia-pal";
export function configure(aurelia: Aurelia): void {
  //Pull dark mode setting from local storage and init
  eval(nightwind.init());
  PLATFORM.moduleName("./resources/dialogs/text-prompt");
  PLATFORM.moduleName("./resources/dialogs/mood-prompt");
  PLATFORM.moduleName("./resources/dialogs/activity-info");
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName("resources/index"))
    .plugin(PLATFORM.moduleName("aurelia-dialog"))
    .plugin(PLATFORM.moduleName("aurelia-long-click-event"));

  aurelia.use.developmentLogging(environment.debug ? "debug" : "warn");

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName("aurelia-testing"));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName("app")));
}
