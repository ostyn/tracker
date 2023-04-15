import { IEntry } from "resources/elements/entry/entry.interface";
import { DialogService } from "aurelia-dialog";
import { MoodService } from "./../services/moodService";
import { autoinject } from "aurelia-framework";
import { ImportDaylio } from "resources/util/ImportDaylio";
import { EventAggregator } from "aurelia-event-aggregator";
import { ActivityService } from "resources/services/activityService";
import { MoodDialog } from "resources/dialogs/mood-prompt";
import { ActivityPromptDialog } from "resources/dialogs/activity-prompt";
import { EntryService } from "resources/services/entryService";

@autoinject
export class ImportRoute {
  csv = "";
  subscribers = [];
  moods;
  activities;
  moodsToMap = [];
  activitiesToMap = [];
  entries: IEntry[];
  moodMappings = {};
  activityMappings = {};

  constructor(
    private moodService: MoodService,
    private activityService: ActivityService,
    private ea: EventAggregator,
    private dialogService: DialogService,
    private entryService: EntryService
  ) {}

  getMoods = () => {
    this.moods = this.moodService.getAllUserCreatedMoods();
  };
  getActivities = () => {
    this.activities = this.activityService.getActivities();
  };

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
  parse() {
    let resp = ImportDaylio.parseCsv(
      this.csv,
      new Map(Object.entries(this.moodMappings)),
      new Map(Object.entries(this.activityMappings))
    );
    this.entries = resp.entries;
    this.moodsToMap = resp.moodsToMap;
    this.activitiesToMap = resp.activitiesToMap;
  }
  import() {
    this.entries.forEach((entry) => {
      this.entryService.addEntry(entry);
    });
  }
  getMood(moodId) {
    return this.moodService.getMood(moodId);
  }
  getActivity(activityId) {
    return this.activityService.getActivity(activityId);
  }
  openMoodPrompt(mood, original) {
    this.dialogService
      .open({
        viewModel: MoodDialog,
        model: mood,
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          this.moodMappings[original] = response.output;
          this.parse();
        }
      });
  }
  openActivityPrompt(activity, original) {
    this.dialogService
      .open({
        viewModel: ActivityPromptDialog,
        model: activity,
      })
      .whenClosed((response) => {
        if (!response.wasCancelled) {
          this.activityMappings[original] = response.output;
          this.parse();
        }
      });
  }
}
