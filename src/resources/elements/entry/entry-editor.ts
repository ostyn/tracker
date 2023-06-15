import { EditTools, IActivityDetail } from "./entry.interface";
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
  @bindable isLoadingEntry: boolean = false;
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
    this.ea.publish("entry-editor-change");
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
          this.markPendingChanges();
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
          this.markPendingChanges();
        }
      });
  }
  longPress(id) {
    if (this.workingCopy.activities.has(id)) {
      navigator.vibrate(100);
      this.editActivityDetail(id, this.workingCopy.activities.get(id));
    } else if (!this.workingCopy.activities.has(id)) {
      navigator.vibrate(100);
      this.editActivityDetail(id);
    } else {
      navigator.vibrate(50);
      this.addActivity(id);
    }
  }
  editActivityDetail(id, detail: IActivityDetail = []) {
    const editingNumber = this.isNumeric(detail);
    this.dialogService
      .open({
        viewModel: ActivityDetailDialog,
        model: {
          id: id,
          detail: JSON.parse(JSON.stringify(detail)),
          editingNumber: editingNumber,
        },
      })
      .whenClosed(
        ((response: {
          output: { detail: IActivityDetail };
          wasCancelled: boolean;
        }) => {
          if (!response.wasCancelled) {
            if (Array.isArray(response.output.detail)) {
              if (response.output.detail.length > 0) {
                this.workingCopy.activities.set(id, response.output.detail);
              } else if (response.output.detail.length === 0) {
                this.workingCopy.activities.delete(id);
              }
              this.markPendingChanges();
            } else if (this.isNumeric(response.output.detail)) {
              this.workingCopy.activities.set(id, response.output.detail);
              this.markPendingChanges();
            } else {
              this.workingCopy.activities.delete(id);
              this.markPendingChanges();
            }
          }
        }).bind(this)
      );
  }
  isNumeric(str) {
    if (typeof str == "number") return true;
    if (typeof str !== "string") return false; // we only process strings!
    return (
      !isNaN(str as any) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
  }
  addActivity(id) {
    const activityDetail: IActivityDetail = this.workingCopy.activities.get(id);
    if (!Array.isArray(activityDetail)) {
      navigator.vibrate(50);
      if (this.workingCopy.activities.has(id))
        this.workingCopy.activities.set(
          id,
          Number((activityDetail + 1).toPrecision(12))
        );
      else this.workingCopy.activities.set(id, 1);
    } else {
      navigator.vibrate(100);
      this.editActivityDetail(id, [...activityDetail]);
    }
    this.markPendingChanges();
  }
  addActivityWithText(activity) {
    if (this.workingCopy.activities.has(activity.id)) {
      this.addActivity(activity);
    } else {
      let text = prompt("Enter text");
      if (text) {
        this.workingCopy.activities.set(activity.id, [text]);
        this.markPendingChanges();
      }
    }
  }
  removeActivity(id) {
    const activityDetail: IActivityDetail = this.workingCopy.activities.get(id);
    navigator.vibrate(50);
    if (!Array.isArray(activityDetail)) {
      if (activityDetail > 1)
        this.workingCopy.activities.set(
          id,
          Number((activityDetail - 1).toPrecision(12))
        );
      else this.workingCopy.activities.delete(id);
    } else {
      navigator.vibrate(100);
      this.editActivityDetail(id, activityDetail);
    }
    this.markPendingChanges();
  }
  submitEntry() {
    let parts = this.workingCopy.date.split("-");
    let dateFields = {
      year: Number.parseInt(parts[0]),
      month: Number.parseInt(parts[1]),
      day: Number.parseInt(parts[2]),
    };
    let splitTimestampEntry: IEntry = {
      ...this.workingCopy,
      ...dateFields,
      lastUpdatedBy: EditTools.WEB,
    };
    this.entryService.addEntry(splitTimestampEntry);
    localStorage.removeItem("pendingChanges");
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
      createdBy: EditTools.WEB,
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
  markPendingChanges() {
    localStorage.setItem("pendingChanges", "true");
    this.ea.publish("entry-editor-change");
  }
  activityDetailSet(activity, newValue) {
    this.workingCopy.activities.set(activity.id, newValue);
    this.markPendingChanges();
  }
  activityDetailClear(activity) {
    this.workingCopy.activities.delete(activity.id);
    this.markPendingChanges();
  }
}
