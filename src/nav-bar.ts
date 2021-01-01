import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
@autoinject
export class NavBar {
  constructor(public router: Router) {}
}
