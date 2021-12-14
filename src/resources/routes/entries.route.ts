import { StreakService } from "resources/services/streakService";
import { IEntry } from "resources/elements/entry/entry.interface";
import { activationStrategy, Router } from "aurelia-router";
import { autoinject, bindable } from "aurelia-framework";
import { EntryService } from "resources/services/entryService";
import { EventAggregator } from "aurelia-event-aggregator";
import firebase from "firebase";
import { ActivityService } from "resources/services/activityService";
import { MoodService } from "resources/services/moodService";

@autoinject
export class EntriesRoute {
  entries;
  subscribers = [];
  @bindable currentMonth;
  @bindable currentYear;
  currentDay: number;
  isLoading: boolean = true;
  currentStreak: any;
  showStreakMessage: boolean = false;
  constructor(
    private entryService: EntryService,
    private ea: EventAggregator,
    private router: Router,
    private activityService: ActivityService,
    private moodService: MoodService,
    private streakService: StreakService
  ) {}
  shouldScrollToSelf(entry: IEntry) {
    return entry.day === this.currentDay;
  }
  getEntries = () => {
    this.isLoading = true;
    this.entryService
      .getEntries(
        Number.parseInt(this.currentYear),
        Number.parseInt(this.currentMonth)
      )
      .then((entries) => {
        this.entries = entries;
      })
      .finally(() => {
        this.isLoading = false;
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
    this.showStreakMessage = this.currentMonth == new Date().getMonth() + 1;
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        if (this.showStreakMessage) {
          this.streakService
            .getEntryStreakStatusForDate(new Date())
            .then((data) => {
              this.currentStreak = data[0];
            });
        }
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
