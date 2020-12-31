import { ActivityService } from "./activityService";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { MoodService } from "./moodService";
import { EntryService } from "./entryService";
import { EventAggregator } from "aurelia-event-aggregator";
import { FormatLib } from "./util/FormatLib";
@autoinject
export class Entry {
  @bindable entry;
  activities = [];
  subscribers = [];
  moods;
  currentMood;
  constructor(
    private activityService: ActivityService,
    private moodService: MoodService,
    private entryService: EntryService,
    private ea: EventAggregator,
    public formatLib: FormatLib
  ) {}

  attached() {
    this.subscribers.push(this.ea.subscribe("moodsUpdated", this.getMoods));
    this.subscribers.push(
      this.ea.subscribe("activitiesUpdated", this.getActivities)
    );
    this.getMoods();
    this.getActivities();
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }
  @computedFrom("entry.created", "entry.updated")
  get showUpdatedDate() {
    return this.entry.created.getTime() !== this.entry.updated.getTime();
  }

  getActivities = () => {
    this.activities = this.activityService.getActivities();
  };

  getMoods = () => {
    this.moods = this.moodService.getMoods();
    if (this.moods && this.moods.length)
      this.currentMood = this.moods.find((mood) => mood.id === this.entry.mood);
  };

  deleteEntry(id) {
    this.entryService.deleteEntry(id);
  }

  buildActivityString(id, count) {
    if (this.activities.length == 0) return;
    let activity = this.activities.find((activity) => activity.id === id);
    return `${activity.name}x${count}`;
  }
  findActivity(id) {
    return this.activities.find((activity) => activity.id === id);
  }
}
