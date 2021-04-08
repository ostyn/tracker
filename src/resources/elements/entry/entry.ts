import { Router } from "aurelia-router";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { MoodService } from "resources/services/moodService";
import { EventAggregator } from "aurelia-event-aggregator";
import { FormatLib } from "resources/util/FormatLib";
@autoinject
export class Entry {
  @bindable entry;
  subscribers = [];
  moods;
  currentMood;
  constructor(
    private moodService: MoodService,
    private router: Router,
    private ea: EventAggregator,
    public formatLib: FormatLib
  ) {}

  attached() {
    this.subscribers.push(this.ea.subscribe("moodsUpdated", this.getMoods));
    this.getMoods();
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }
  @computedFrom("entry.created", "entry.updated")
  get showUpdatedDate() {
    return this.entry.created.getTime() !== this.entry.updated.getTime();
  }

  getMoods = () => {
    this.currentMood = this.moodService.getMood(this.entry.mood);
  };
  editEntry() {
    this.router.navigateToRoute("entry", { id: this.entry.id });
  }
}
