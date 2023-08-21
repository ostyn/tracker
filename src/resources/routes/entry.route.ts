import { autoinject } from "aurelia-framework";
import { EntryService } from "resources/services/entryService";
@autoinject
export class EntryRoute {
  isLoading = true;
  entry: any;
  constructor(private entryService: EntryService) {}
  activate(params) {
    localStorage.removeItem("pendingChanges");
    if (params.id) {
      this.entryService.getEntry(params.id).then((entry) => {
        this.entry = entry;
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
    }
  }
  canDeactivate() {
    if (localStorage.getItem("pendingChanges")) {
      if (confirm("Lose unsaved changes?")) {
        localStorage.removeItem("pendingChanges");
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
}
