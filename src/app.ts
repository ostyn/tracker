import { PLATFORM } from "aurelia-pal";
import firebase from "firebase";
import { Redirect, Router } from "aurelia-router";
export class App {
  router;
  configureRouter(config, router: Router) {
    config.title = "tracker";
    config.addPipelineStep("authorize", CheckAuth);
    config.map([
      {
        route: "",
        moduleId: PLATFORM.moduleName("./resources/elements/entry/entries"),
        nav: true,
        title: "entries",
        name: "entries",
        auth: true,
      },
      {
        route: ["submit"],
        moduleId: PLATFORM.moduleName("./resources/routes/legacy.html"),
        nav: false,
        title: "submit",
        name: "submit",
      },
      {
        route: "moods",
        moduleId: PLATFORM.moduleName("./resources/elements/mood/moods"),
        nav: true,
        title: "moods",
        name: "moods",
        auth: true,
      },
      {
        route: "activities",
        moduleId: PLATFORM.moduleName(
          "./resources/elements/activity/activities"
        ),
        nav: true,
        title: "activities",
        name: "activities",
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
