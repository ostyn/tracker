import { IMood } from "./../mood/mood.interface";
import { MoodService } from "resources/services/moodService";
import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
@autoinject
export class MoodDialog {
  currentMoodId: string;
  moods: IMood[];

  constructor(
    public controller: DialogController,
    private moodService: MoodService
  ) {}
  activate(currentMoodId) {
    this.currentMoodId = currentMoodId;
    this.moods = this.moodService.getAllMoods();
  }
}
