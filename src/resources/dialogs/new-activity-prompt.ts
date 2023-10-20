import { autoinject } from "aurelia-framework";
import { DialogCloseResult, DialogController } from "aurelia-dialog";
@autoinject
export class NewActivityPrompt {
  activity;
  constructor(public controller: DialogController) {}
  activate({ category }) {
    this.activity = { category };
  }
  canDeactivate(result: DialogCloseResult) {
    if (result.wasCancelled) {
      this.controller.ok(this.activate);
      return false;
    }
    return true;
  }
}
