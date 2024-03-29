import { ActivityService } from "resources/services/activityService";
import { MoodService } from "resources/services/moodService";
import { IEntry } from "resources/elements/entry/entry.interface";
import { activationStrategy, Router } from "aurelia-router";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { EntryService } from "resources/services/entryService";
import { EventAggregator } from "aurelia-event-aggregator";
import firebase from "firebase";

@autoinject
export class EntriesRoute {
  entries;
  subscribers = [];
  @bindable currentMonth;
  @bindable currentYear;
  currentDay: number;
  @computedFrom("activityService.isLoaded", "moodService.isLoaded", "entries")
  public get isLoaded() {
    return (
      this.activityService.isLoaded && this.moodService.isLoaded && this.entries
    );
  }
  constructor(
    private entryService: EntryService,
    private moodService: MoodService,
    private activityService: ActivityService,
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
  onMonthClick() {
    window.scrollTo({ top: 0 });
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
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.getEntries();
      }
    });
  }
  attached() {
    this.subscribers.push(this.ea.subscribe("entriesUpdated", this.getEntries));
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }
}
