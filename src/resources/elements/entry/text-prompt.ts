import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
@autoinject
export class TextDialog {
  text: string;

  constructor(public controller: DialogController) {}
  activate(text) {
    this.text = text;
  }
}
