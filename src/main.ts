import nightwind from "nightwind/helper";
import { Aurelia } from "aurelia-framework";
import * as environment from "../config/environment.json";
import { PLATFORM } from "aurelia-pal";
export function configure(aurelia: Aurelia): void {
  //Pull dark mode setting from local storage and init
  eval(nightwind.init());
  PLATFORM.moduleName("./resources/elements/entry/text-prompt");
  PLATFORM.moduleName("./resources/elements/entry/mood-prompt");
  PLATFORM.moduleName("./resources/elements/activity/activity-info");
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName("resources/index"))
    .plugin(PLATFORM.moduleName("aurelia-dialog"));

  aurelia.use.developmentLogging(environment.debug ? "debug" : "warn");

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName("aurelia-testing"));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName("app")));
}
