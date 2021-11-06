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
  subscribers = [];
  moods;
  currentMood;
  constructor(
    private moodService: MoodService,
    private router: Router,
    private ea: EventAggregator,
    public formatLib: FormatLib,
    private dialogService: DialogService,
    private element: Element
  ) {}

  attached() {
    this.subscribers.push(this.ea.subscribe("moodsUpdated", this.getMoods));
    this.getMoods();
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
      model: id,
    });
  }
}
