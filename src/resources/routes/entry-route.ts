import { autoinject } from "aurelia-framework";
import { EntryService } from "resources/services/entryService";
@autoinject
export class EntryRoute {
  entry: any;
  constructor(private entryService: EntryService) {}
  activate(params, routeConfig, navigationInstruction) {
    if (params.id) {
      this.entryService.getEntry(params.id).then((entry) => {
        this.entry = entry;
      });
    }
  }
}
