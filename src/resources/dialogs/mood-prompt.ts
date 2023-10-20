import { IMood } from "resources/elements/mood/mood.interface";
import { MoodService } from "resources/services/moodService";
import { autoinject } from "aurelia-framework";
import { DialogCloseResult, DialogController } from "aurelia-dialog";

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
  canDeactivate(result: DialogCloseResult) {
    if (result.wasCancelled) {
      this.controller.ok(this.currentMoodId);
      return false;
    }
    return true;
  }
}
