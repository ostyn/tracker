import { bindable } from "aurelia-framework";
import feather from "feather-icons/dist/feather.min.js";
export class FeatherIcon {
  @bindable name: string;
  attached() {
    feather.replace();
  }
}
