import { FrameworkConfiguration } from "aurelia-framework";

export function configure(config: FrameworkConfiguration): void {
  //config.globalResources([]);
}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}
