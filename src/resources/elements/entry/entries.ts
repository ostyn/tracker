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
  constructor(private entryService: EntryService, private ea: EventAggregator) {
    let date = new Date();
    this.currentMonth = date.getMonth() + 1;
    this.currentYear = date.getFullYear();
  }
  currentMonthChanged() {
    this.getEntries();
  }
  currentYearChanged() {
    this.getEntries();
  }
  getEntries = () => {
    this.entryService
      .getEntries(
        Number.parseInt(this.currentYear),
        Number.parseInt(this.currentMonth)
      )
      .then((entries) => (this.entries = entries));
  };

  attached() {
    this.subscribers.push(this.ea.subscribe("entriesUpdated", this.getEntries));
    this.getEntries();
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }
}
