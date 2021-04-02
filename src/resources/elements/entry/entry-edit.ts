import { Router } from "aurelia-router";
import { ActivityService } from "resources/services/activityService";
import { MoodService } from "resources/services/moodService";
import { autoinject, bindable } from "aurelia-framework";
import { EntryService } from "resources/services/entryService";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class EntryEdit {
  @bindable entry;
  workingCopy;
  activities = [];
  subscribers = [];
  moods: any;
  get nonArchivedActivities() {
    return this.activities.filter((activity) => !activity.isArchived);
  }
  constructor(
    private activityService: ActivityService,
    private moodService: MoodService,
    private entryService: EntryService,
    private ea: EventAggregator,
    private router: Router
  ) {
    this.getActivities();
    this.getMoods();
    this.entry = this.newEntry();
  }

  entryChanged(newEntry, oldEntry) {
    if (newEntry === "") {
      this.entry = oldEntry;
    }
    this.workingCopy = Object.assign({}, this.entry);
    this.workingCopy.activities = new Map(this.entry.activities);
  }
  attached() {
    this.subscribers.push(this.ea.subscribe("moodsUpdated", this.getMoods));
    this.subscribers.push(
      this.ea.subscribe("activitiesUpdated", this.getActivities)
    );
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }

  getMoods = () => {
    this.moods = this.moodService.getMoods();
  };
  getActivities = () => {
    this.activities = this.activityService.getActivities();
  };

  addActivity(activity) {
    if (activity.type === "number" || activity.type === undefined) {
      if (this.workingCopy.activities.has(activity.id))
        this.workingCopy.activities.set(
          activity.id,
          this.workingCopy.activities.get(activity.id) + 1
        );
      else this.workingCopy.activities.set(activity.id, 1);
    } else if (activity.type === "text") {
      let text = prompt("Enter text");
      if (text) {
        this.workingCopy.activities.set(
          activity.id,
          [text].concat(this.workingCopy.activities.get(activity.id) || [])
        );
        console.log(this.workingCopy.activities.get(activity.id));
      }
    }
  }
  removeTextItem(id, textItemIndex) {
    if (this.workingCopy.activities.get(id).length === 1)
      this.workingCopy.activities.delete(id);
    else {
      this.workingCopy.activities.get(id).splice(textItemIndex, 1);
    }
  }
  removeActivity(id) {
    if (this.findActivity(id).type !== "text") {
      if (this.workingCopy.activities.get(id) > 1)
        this.workingCopy.activities.set(
          id,
          this.workingCopy.activities.get(id) - 1
        );
      else this.workingCopy.activities.delete(id);
    } else {
      if (this.workingCopy.activities.get(id).length > 1)
        this.workingCopy.activities.set(
          id,
          this.workingCopy.activities
            .get(id)
            .slice(0, this.workingCopy.activities.get(id).length - 1)
        );
      else this.workingCopy.activities.delete(id);
    }
  }
  submitEntry() {
    let parts = this.workingCopy.date.split("-");
    let splitTimestampEntry = {
      ...this.workingCopy,
      year: Number.parseInt(parts[0]),
      month: Number.parseInt(parts[1]),
      day: Number.parseInt(parts[2]),
    };
    this.entryService.addEntry(splitTimestampEntry).then(() => {
      this.router.navigateToRoute("entries", {
        year: Number.parseInt(parts[0]),
        month: Number.parseInt(parts[1]),
      });
    });
  }
  findActivity(id) {
    return this.activities.find((activity) => activity.id === id);
  }
  newEntry() {
    var date = new Date();
    return {
      activities: new Map(),
      mood: undefined,
      note: "",
      date:
        date.getFullYear() +
        "-" +
        this.padValue(date.getMonth() + 1, 2) +
        "-" +
        this.padValue(date.getDate(), 2),
    };
  }
  padValue(value, width) {
    let padding = "";
    for (var i = 0; i < width; i++) {
      padding += "0";
    }
    return (padding + value).slice(-width);
  }
  deleteEntry() {
    if (confirm("Sure you want to delete?")) {
      this.entryService.deleteEntry(this.entry.id);
      this.router.navigateToRoute("entries");
    }
  }
}
