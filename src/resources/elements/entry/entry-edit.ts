import { Router } from "aurelia-router";
import { ActivityService } from "resources/services/activityService";
import { MoodService } from "resources/services/moodService";
import { autoinject, bindable } from "aurelia-framework";
import { EntryService } from "resources/services/entryService";
import { EventAggregator } from "aurelia-event-aggregator";
import { DialogService } from "aurelia-dialog";
import { MoodDialog } from "./mood-prompt";
import { IEntry } from "./entry.interface";
import { TextDialog } from "./text-prompt";

@autoinject
export class EntryEdit {
  @bindable entry: IEntry;
  workingCopy: IEntry;
  activities = [];
  subscribers = [];
  constructor(
    private activityService: ActivityService,
    private moodService: MoodService,
    private entryService: EntryService,
    private ea: EventAggregator,
    private router: Router,
    private dialogService: DialogService
  ) {
    this.getActivities();
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
    this.subscribers.push(
      this.ea.subscribe("activitiesUpdated", this.getActivities)
    );
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }

  getMood = (id) => {
    return this.moodService.getMood(id);
  };
  getActivities = () => {
    this.activities = this.activityService.getActivities();
  };
  openMoodPrompt() {
    this.dialogService
      .open({
        viewModel: MoodDialog,
        model: this.workingCopy.mood,
        lock: false,
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          this.workingCopy.mood = response.output;
        }
      });
  }
  openTextPrompt() {
    this.dialogService
      .open({
        viewModel: TextDialog,
        model: this.workingCopy.note,
        lock: true,
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          this.workingCopy.note = response.output;
        }
      });
  }

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
    let year, month, day;
    [year, month, day] = this.workingCopy.date.split("-");
    this.entryService.addEntry({
      ...this.workingCopy,
      year,
      month,
      day,
    });
    this.router.navigateToRoute("entries", {
      year,
      month,
      day,
    });
  }
  findActivity(id) {
    return this.activities.find((activity) => activity.id === id);
  }
  newEntry(): IEntry {
    var date = new Date();
    return {
      activities: new Map(),
      mood: "0",
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
