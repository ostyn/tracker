import { autoinject } from "aurelia-framework";
import { EntryDao } from "resources/dao/EntryDao";
import { EntryService } from "resources/services/entryService";
@autoinject
export class EntryRoute {
  isLoading = true;
  entry: any;
  constructor(private entryService: EntryService, private entryDao: EntryDao) {}
  activate(params, routeConfig, navigationInstruction) {
    if (params.id) {
      this.entryService.getEntry(params.id).then((entry) => {
        this.entry = entry;
        this.isLoading = false;
      });
    } else if (localStorage.getItem("checkpoint")) {
      this.entry = this.entryDao.afterLoadFixup(
        JSON.parse(localStorage.getItem("checkpoint"))
      );
      this.isLoading = false;
    } else {
      this.isLoading = false;
    }
  }
}
