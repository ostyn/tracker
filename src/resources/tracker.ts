import { autoinject, bindable } from "aurelia-framework";
import { MoodService } from "./moodService";
import { ActivityService } from "./activityService";
import { EntryService } from "./entryService";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class Tracker {
  entries;
  subscribers = [];
  moods;
  activities;
  @bindable currentMonth;
  @bindable currentYear;

  activity;
  mood;
  constructor(
    private moodService: MoodService,
    private activityService: ActivityService,
    private entryService: EntryService,
    private ea: EventAggregator
  ) {
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

  getMoods = () => {
    this.moods = this.moodService.getMoods();
  };

  getActivities = () => {
    this.activities = this.activityService.getActivities();
  };

  attached() {
    this.subscribers.push(this.ea.subscribe("entriesUpdated", this.getEntries));
    this.subscribers.push(this.ea.subscribe("moodsUpdated", this.getMoods));
    this.subscribers.push(
      this.ea.subscribe("activitiesUpdated", this.getActivities)
    );
    this.getMoods();
    this.getActivities();
    this.getEntries();
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }
  setCurrentMood(mood) {
    this.mood = mood;
  }
  setCurrentActivity(activity) {
    this.activity = activity;
  }
}
