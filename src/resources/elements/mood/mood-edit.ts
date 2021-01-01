import { autoinject, bindable } from "aurelia-framework";
import { MoodService } from "resources/services/moodService";
@autoinject
export class MoodEdit {
  @bindable mood;
  workingCopy;
  constructor(private moodService: MoodService) {}

  moodChanged() {
    if (this.mood === undefined) this.resetActiveMood();
    else this.workingCopy = Object.assign({}, this.mood);
  }

  submitMood() {
    this.moodService.saveMood(this.workingCopy).then(() => {
      this.resetActiveMood();
    });
  }

  cancelEdit() {
    this.resetActiveMood();
  }

  deleteMood() {
    if (this.workingCopy && this.workingCopy.id !== undefined) {
      this.moodService.deleteMood(this.workingCopy.id);
      this.resetActiveMood();
    }
  }

  resetActiveMood() {
    this.mood = {
      name: undefined,
      emoji: undefined,
      id: undefined,
      rating: undefined,
    };
  }
}
