import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
@autoinject
export class Menu {
  constructor(public router: Router) {}
}
