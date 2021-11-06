import { Options } from "aurelia-loader-nodejs";
import { EntryDao } from "./../../dao/EntryDao";
import { Router } from "aurelia-router";
import { ActivityService } from "resources/services/activityService";
import { MoodService } from "resources/services/moodService";
import { autoinject, bindable } from "aurelia-framework";
import { EntryService } from "resources/services/entryService";
import { EventAggregator } from "aurelia-event-aggregator";
import { DialogService } from "aurelia-dialog";
import { MoodDialog } from "resources/dialogs/mood-prompt";
import { IEntry } from "resources/elements/entry/entry.interface";
import { TextDialog } from "resources/dialogs/text-prompt";
import { ActivityDetailDialog } from "resources/dialogs/activity-detail-prompt";

@autoinject
export class EntryEditor {
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
    private dialogService: DialogService,
    private entryDao: EntryDao
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
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          this.workingCopy.mood = response.output;
          this.checkpointIfDraft();
        }
      });
  }
  openTextPrompt() {
    this.dialogService
      .open({
        viewModel: TextDialog,
        model: this.workingCopy.note,
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          this.workingCopy.note = response.output;
          this.checkpointIfDraft();
        }
      });
  }
  longPress(id) {
    if (this.isArray(this.workingCopy.activities.get(id)))
      this.editActivityDetail(id, this.workingCopy.activities.get(id));
    else if (!this.workingCopy.activities.has(id)) this.editActivityDetail(id);
    else this.addActivity(id);
  }
  editActivityDetail(id, detail = []) {
    this.dialogService
      .open({
        viewModel: ActivityDetailDialog,
        model: {
          activityId: id,
          detail,
        },
      })
      .whenClosed(
        ((response) => {
          if (!response.wasCancelled) {
            if (this.isArray(response.output.detail)) {
              if (response.output.detail.length > 0) {
                this.workingCopy.activities.set(id, response.output.detail);
              } else if (response.output.detail.length === 0) {
                this.workingCopy.activities.delete(id);
              }
              this.checkpointIfDraft();
            }
          }
        }).bind(this)
      );
  }
  addActivity(id) {
    if (!this.isArray(this.workingCopy.activities.get(id))) {
      if (this.workingCopy.activities.has(id))
        this.workingCopy.activities.set(
          id,
          this.workingCopy.activities.get(id) + 1
        );
      else this.workingCopy.activities.set(id, 1);
    } else {
      this.editActivityDetail(id, [...this.workingCopy.activities.get(id)]);
    }
    this.checkpointIfDraft();
  }
  addActivityWithText(activity) {
    if (this.workingCopy.activities.has(activity.id)) {
      this.addActivity(activity);
    } else {
      let text = prompt("Enter text");
      if (text) {
        this.workingCopy.activities.set(activity.id, [text]);
        this.checkpointIfDraft();
      }
    }
  }
  removeActivity(id) {
    if (!this.isArray(this.workingCopy.activities.get(id))) {
      if (this.workingCopy.activities.get(id) > 1)
        this.workingCopy.activities.set(
          id,
          this.workingCopy.activities.get(id) - 1
        );
      else this.workingCopy.activities.delete(id);
    } else {
      this.editActivityDetail(id, this.workingCopy.activities.get(id));
    }
    this.checkpointIfDraft();
  }
  submitEntry() {
    let parts = this.workingCopy.date.split("-");
    let dateFields = {
      year: Number.parseInt(parts[0]),
      month: Number.parseInt(parts[1]),
      day: Number.parseInt(parts[2]),
    };
    let splitTimestampEntry = {
      ...this.workingCopy,
      ...dateFields,
    };
    this.entryService.addEntry(splitTimestampEntry);
    localStorage.removeItem("checkpoint");
    this.router.navigateToRoute("entries", {
      ...dateFields,
    });
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
      localStorage.removeItem("checkpoint");
      this.router.navigateToRoute("entries");
    }
  }
  isArray(array) {
    return array?.constructor === Array;
  }
  checkpointIfDraft() {
    if (!this.workingCopy.id)
      localStorage.setItem(
        "checkpoint",
        JSON.stringify(this.entryDao.beforeSaveFixup(this.workingCopy))
      );
  }
}
