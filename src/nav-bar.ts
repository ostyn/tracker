import { FirestoreCounter } from "./resources/dao/FirestoreCounter";
import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import nightwind from "nightwind/helper";
@autoinject
export class NavBar {
  FirestoreCounter = FirestoreCounter;
  constructor(public router: Router) {
    nightwind.toggle();
  }
  toggleNightMode() {
    nightwind.toggle();
  }
}
