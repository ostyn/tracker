import { autoinject } from "aurelia-framework";
import { DialogCloseResult, DialogController } from "aurelia-dialog";
@autoinject
export class TextDialog {
  text: string;

  constructor(public controller: DialogController) {}
  activate(text) {
    this.text = text;
  }
  canDeactivate(result: DialogCloseResult) {
    if (result.wasCancelled) {
      this.controller.ok(this.text);
      return false;
    }
    return true;
  }
}
