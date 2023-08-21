import { IEntry } from "resources/elements/entry/entry.interface";
import { DialogService } from "aurelia-dialog";
import { MoodService } from "../services/moodService";
import { autoinject } from "aurelia-framework";
import { ImportDaylio } from "resources/util/ImportDaylio";
import { ActivityService } from "resources/services/activityService";
import { MoodDialog } from "resources/dialogs/mood-prompt";
import { ActivityPromptDialog } from "resources/dialogs/activity-prompt";
import { EntryService } from "resources/services/entryService";
import { IMood } from "resources/elements/mood/mood.interface";
import { IActivity } from "resources/elements/activity/activity.interface";

@autoinject
export class ImportDaylioRoute {
  public csv = "";
  public moodsToMap: string[] = [];
  public activitiesToMap: string[] = [];
  public entries: IEntry[] = [];
  public moodMappings: { [n: string]: string } = {};
  public activityMappings: { [n: string]: string } = {};

  constructor(
    private moodService: MoodService,
    private activityService: ActivityService,
    private dialogService: DialogService,
    private entryService: EntryService
  ) {}

  public parse(): void {
    let resp = ImportDaylio.parseCsv(
      this.csv,
      new Map(Object.entries(this.moodMappings)),
      new Map(Object.entries(this.activityMappings))
    );
    this.entries = resp.entries;
    this.moodsToMap = resp.moodsToMap;
    this.activitiesToMap = resp.activitiesToMap;
  }
  public import(): void {
    this.entries.forEach((entry) => {
      this.entryService.addEntry(entry);
    });
  }
  public getMood(moodId): IMood {
    return this.moodService.getMood(moodId);
  }
  public getActivity(activityId): IActivity {
    return this.activityService.getActivity(activityId);
  }
  public openMoodPrompt(mood, original): void {
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
  public openActivityPrompt(activity, original): void {
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
