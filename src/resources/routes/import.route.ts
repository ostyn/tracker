import { EntryService } from "resources/services/entryService";
import { autoinject } from "aurelia-dependency-injection";
import { ActivityService } from "resources/services/activityService";
import { MoodService } from "resources/services/moodService";
import { Helpers } from "resources/util/Helpers";
@autoinject
export class ImportRoute {
  moods;
  activities;
  entries;
  constructor(
    private moodService: MoodService,
    private activityService: ActivityService,
    private entryService: EntryService
  ) {}
  importFile(e) {
    var reader = new FileReader();

    reader.onload = (event: any) => {
      var jsonObj = JSON.parse(event.target.result);
      this.moods = jsonObj.moods;
      this.activities = jsonObj.activities;
      this.entries = jsonObj.entries;
    };

    reader.readAsText(e.target.files[0]);
  }
  import() {
    this.moods.forEach((mood) => {
      this.moodService.saveMood(mood);
    });
    this.activities.forEach((activity) => {
      this.activityService.saveActivity(activity);
    });
    let x = 0;
    this.entries.forEach((entry) => {
      console.log(x++);
      entry.activities = Helpers.ObjToStrMap(entry.activities);
      let [year, month, day] = entry.date.split("-");
      entry.year = parseInt(year);
      entry.month = parseInt(month);
      entry.day = parseInt(day);
      entry.created = new Date(entry.created);
      entry.updated = new Date(entry.updated);

      this.entryService.addEntry(entry);
    });
  }
}
