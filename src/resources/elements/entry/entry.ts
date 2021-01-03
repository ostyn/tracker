import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { MoodService } from "resources/services/moodService";
import { EventAggregator } from "aurelia-event-aggregator";
import { EntryService } from "resources/services/entryService";
import { FormatLib } from "resources/util/FormatLib";
@autoinject
export class Entry {
  @bindable entry;
  subscribers = [];
  moods;
  currentMood;
  constructor(
    private moodService: MoodService,
    private entryService: EntryService,
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
    this.moods = this.moodService.getMoods();
    if (this.moods && this.moods.length)
      this.currentMood = this.moods.find((mood) => mood.id === this.entry.mood);
  };

  deleteEntry(id) {
    this.entryService.deleteEntry(id);
  }
}
