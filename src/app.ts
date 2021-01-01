import { PLATFORM } from "aurelia-pal";
import firebase from "firebase";
import { Redirect } from "aurelia-router";
export class App {
  router;
  configureRouter(config, router) {
    config.title = "regretless.life";
    config.addPipelineStep("authorize", CheckAuth);
    config.map([
      {
        route: ["", "home"],
        moduleId: PLATFORM.moduleName("./resources/routes/legacy.html"),
        nav: false,
        title: "home",
        name: "home",
      },
      {
        route: "drafts",
        moduleId: PLATFORM.moduleName("./resources/elements/mood/mood-edit"),
        nav: false,
        title: "drafts",
        name: "drafts",
        auth: true,
      },
    ]);

    this.router = router;
  }
}
class CheckAuth {
  run(navigationInstruction, next) {
    return new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged((user) => {
        let currentRoute = navigationInstruction.config;
        let loginRequired = currentRoute.auth && currentRoute.auth === true;
        if (!user && loginRequired) {
          return resolve(next.cancel(new Redirect("")));
        }
        return resolve(next());
      });
    });
  }
}
