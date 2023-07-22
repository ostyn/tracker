import { ActivityService } from "./../../services/activityService";
import { IEntry } from "./entry.interface";
import { DialogService } from "aurelia-dialog";
import { Router } from "aurelia-router";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { MoodService } from "resources/services/moodService";
import { EventAggregator } from "aurelia-event-aggregator";
import { FormatLib } from "resources/util/FormatLib";
import { ActivityInfo } from "resources/dialogs/activity-info";

@autoinject
export class Entry {
  @bindable entry: IEntry;
  @bindable scrollToSelf: boolean;
  @bindable onDetailClick;
  public detailClicked(detail) {
    this.onDetailClick({ detail });
  }
  subscribers = [];
  moods;
  currentMood;
  constructor(
    private moodService: MoodService,
    private router: Router,
    private ea: EventAggregator,
    public formatLib: FormatLib,
    private dialogService: DialogService,
    private element: Element,
    public activityService: ActivityService
  ) {}

  attached() {
    this.subscribers.push(this.ea.subscribe("moodsUpdated", this.getMoods));
    this.getMoods();
    this.entry.activitiesArray.sort((a, b) => {
      let aVal = this.entry.activities.get(a);
      let bVal = this.entry.activities.get(b);
      if (Array.isArray(aVal) && Array.isArray(bVal)) {
        let bCharLength = bVal
          .map((val) => val.length)
          .reduce((total, val) => total + val);
        let aCharLength = aVal
          .map((val) => val.length)
          .reduce((total, val) => total + val);
        return bCharLength - aCharLength;
      } else if (Array.isArray(aVal)) {
        return -1;
      } else if (Array.isArray(bVal)) {
        return 1;
      } else {
        return bVal - aVal;
      }
      //TODO add tiebreaker using names
    });
    if (this.scrollToSelf)
      this.element.scrollIntoView({
        block: "center",
      });
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }
  @computedFrom("entry.created", "entry.updated")
  get showUpdatedDate() {
    return (
      this.entry.updated &&
      this.entry.created.getTime() !== this.entry.updated.getTime()
    );
  }
  @computedFrom("entry.created")
  get showCreatedDate() {
    return this.entry.created;
  }

  getMoods = () => {
    this.currentMood = this.moodService.getMood(this.entry.mood);
  };
  editEntry() {
    this.router.navigateToRoute("entry", { id: this.entry.id });
  }
  showActivityInfo(id) {
    this.dialogService.open({
      viewModel: ActivityInfo,
      model: {
        id,
        month: this.entry.month,
        year: this.entry.year,
        day: this.entry.day,
      },
    });
  }
  goToSelf() {
    this.router.navigateToRoute("entries", {
      year: this.entry.year,
      month: this.entry.month,
      day: this.entry.day,
    });
  }
}
