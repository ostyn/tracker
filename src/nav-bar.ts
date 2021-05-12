import { FirestoreCounter } from "./resources/dao/FirestoreCounter";
import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
@autoinject
export class NavBar {
  FirestoreCounter = FirestoreCounter;
  constructor(public router: Router) {}
}
