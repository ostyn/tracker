import { activationStrategy, Router } from "aurelia-router";
import { autoinject, bindable } from "aurelia-framework";
import { EntryService } from "resources/services/entryService";
import { EventAggregator } from "aurelia-event-aggregator";
@autoinject
export class Entries {
  entries;
  subscribers = [];
  @bindable currentMonth;
  @bindable currentYear;
  @bindable showEntries = true;
  constructor(
    private entryService: EntryService,
    private ea: EventAggregator,
    private router: Router
  ) {}
  getEntries = () => {
    this.entryService
      .getEntries(
        Number.parseInt(this.currentYear),
        Number.parseInt(this.currentMonth)
      )
      .then((entries) => (this.entries = entries));
  };

  determineActivationStrategy() {
    return activationStrategy.replace;
  }
  selectDate() {
    const params: any = {};
    if (this.currentMonth) params.month = this.currentMonth;
    if (this.currentYear) params.year = this.currentYear;
    this.router.navigateToRoute("entries", params);
  }
  activate(params, routeConfig, navigationInstruction) {
    if (params.month) this.currentMonth = params.month;
    if (params.year) this.currentYear = params.year;
    if (!params.month && !params.year) {
      let date = new Date();
      this.currentMonth = date.getMonth() + 1;
      this.currentYear = date.getFullYear();
    }
    this.getEntries();
  }
  attached() {
    this.subscribers.push(this.ea.subscribe("entriesUpdated", this.getEntries));
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }
}
