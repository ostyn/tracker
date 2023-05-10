import { PLATFORM } from "aurelia-pal";
import { FrameworkConfiguration } from "aurelia-framework";
import { Workbox } from "workbox-window";

export function configure(config: FrameworkConfiguration): void {
  config.globalResources([
    PLATFORM.moduleName("./value-converters/map"),
    PLATFORM.moduleName("./value-converters/sort"),
    PLATFORM.moduleName("./elements/feather-icon/feather-icon"),
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
