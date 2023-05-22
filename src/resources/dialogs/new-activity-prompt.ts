import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
@autoinject
export class NewActivityPrompt {
  activity;
  constructor(public controller: DialogController) {}
  activate({ category }) {
    this.activity = { category };
  }
}
