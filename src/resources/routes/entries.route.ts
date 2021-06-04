import { IEntry } from "resources/elements/entry/entry.interface";
import { activationStrategy, Router } from "aurelia-router";
import { autoinject, bindable } from "aurelia-framework";
import { EntryService } from "resources/services/entryService";
import { EventAggregator } from "aurelia-event-aggregator";
import { summary } from "date-streaks";

@autoinject
export class EntriesRoute {
  entries;
  subscribers = [];
  @bindable currentMonth;
  @bindable currentYear;
  currentDay: number;
  summary: {
    currentStreak: number;
    longestStreak: number;
    streaks: number[];
    todayInStreak: boolean;
    withinCurrentStreak: boolean;
  };
  constructor(
    private entryService: EntryService,
    private ea: EventAggregator,
    private router: Router
  ) {}
  shouldScrollToSelf(entry: IEntry) {
    return entry.day === this.currentDay;
  }
  getEntries = () => {
    this.entryService
      .getEntries(
        Number.parseInt(this.currentYear),
        Number.parseInt(this.currentMonth)
      )
      .then((entries) => {
        this.entries = entries;
        let dates: Date[] = [];
        for (let entry of entries) {
          dates.push(new Date(entry.year, entry.month, entry.day));
        }
        this.summary = summary({ dates });
      });
  };

  determineActivationStrategy() {
    return activationStrategy.replace;
  }
  onMonthChange(month, year) {
    this.currentMonth = month;
    this.currentYear = year;
    this.router.navigateToRoute("entries", { month, year });
  }
  activate(params, routeConfig, navigationInstruction) {
    if (params.month) this.currentMonth = params.month;
    if (params.year) this.currentYear = params.year;
    if (params.day) this.currentDay = Number.parseInt(params.day);
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
