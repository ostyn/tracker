import { autoinject } from "aurelia-framework";
import { MoodService } from "resources/services/moodService";
import { EventAggregator } from "aurelia-event-aggregator";
@autoinject
export class MoodsRoute {
  subscribers = [];
  moods;
  mood;
  constructor(private moodService: MoodService, private ea: EventAggregator) {}

  getMoods = () => {
    this.moods = this.moodService.getAllUserCreatedMoods();
  };

  attached() {
    this.subscribers.push(this.ea.subscribe("moodsUpdated", this.getMoods));

    this.getMoods();
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }
  setCurrentMood(mood) {
    this.mood = mood;
  }
}
