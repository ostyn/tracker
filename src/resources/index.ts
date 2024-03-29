import { PLATFORM } from "aurelia-pal";
import { FrameworkConfiguration } from "aurelia-framework";
import { Workbox } from "workbox-window";

export function configure(config: FrameworkConfiguration): void {
  config.globalResources([
    PLATFORM.moduleName("./value-converters/map"),
    PLATFORM.moduleName("./value-converters/sort"),
    PLATFORM.moduleName("./elements/activity/activity-detail.html"),
    PLATFORM.moduleName("./elements/activity/activity-edit"),
    PLATFORM.moduleName("./elements/activity/activity-grid-loading.html"),
    PLATFORM.moduleName("./elements/activity/activity-grid"),
    PLATFORM.moduleName("./elements/activity/activity-loading.html"),
    PLATFORM.moduleName("./elements/activity/activity"),
    PLATFORM.moduleName("./elements/calendar/calendar-wrapper"),
    PLATFORM.moduleName("./elements/calendar/month-control"),
    PLATFORM.moduleName("./elements/close-button/close-button.html"),
    PLATFORM.moduleName("./elements/entry/entry-editor"),
    PLATFORM.moduleName("./elements/entry/entry-loading.html"),
    PLATFORM.moduleName("./elements/entry/entry"),
    PLATFORM.moduleName("./elements/feather-icon/feather-icon"),
    PLATFORM.moduleName("./elements/login/login"),
    PLATFORM.moduleName("./elements/mood/mood-edit"),
  ]);
}

if ("serviceWorker" in navigator) {
  // Service worker setup
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });

  // Service worker update message setup
  const wb = new Workbox("/service-worker.js");
  const showSkipWaitingPrompt = (event) => {
    if (confirm("Install update?")) {
      wb.addEventListener("controlling", (event) => {
        window.location.reload();
      });
      wb.messageSkipWaiting();
    }
  };
  wb.addEventListener("waiting", showSkipWaitingPrompt);
  wb.register();
}
