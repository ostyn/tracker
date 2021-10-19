import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
@autoinject
export class DummyHome {
  constructor(private router: Router) {}
  activate() {
    this.router.navigateToRoute("entries");
  }
}
