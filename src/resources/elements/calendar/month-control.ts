import { EventAggregator } from "aurelia-event-aggregator";
import { bindable, autoinject } from "aurelia-framework";
import { addMonths, format, startOfMonth } from "date-fns";
import { StatsService } from "resources/services/statsService";

@autoinject
export class MonthControl {
  @bindable month: number;
  @bindable year: number;
  @bindable onMonthChange;
  private date: Date;
  public monthName: string;
  subscribers: any = [];
  stats: {
    currentStreak: number;
    longestStreak: number;
    streaks: number[];
    todayInStreak: boolean;
    withinCurrentStreak: boolean;
  };
  showStreakMessage: boolean = false;
  constructor(
    private statsService: StatsService,
    private ea: EventAggregator
  ) {}
  attached() {
    if (this.year && this.month)
      this.date = new Date(this.year, this.month - 1, 1);
    else this.date = startOfMonth(new Date());
    this.syncDisplayWithDate();
    this.subscribers.push(this.ea.subscribe("statsUpdated", this.getStats));
  }

  detached() {
    this.subscribers.forEach((sub) => this.subscribers.pop().dispose());
  }
  prev() {
    this.date = addMonths(this.date, -1);
    this.syncDisplayWithDate();
    this.triggerMonthChange();
  }
  next() {
    this.date = addMonths(this.date, 1);
    this.syncDisplayWithDate();
    this.triggerMonthChange();
  }
  getStats = () => {
    this.stats = this.statsService.getStreakSummary();
  };
  private syncDisplayWithDate() {
    this.monthName = format(this.date, "LLLL");
    this.month = this.date.getMonth() + 1;
    this.year = this.date.getFullYear();
    this.showStreakMessage =
      this.month == new Date().getMonth() + 1 &&
      this.year == new Date().getFullYear();
  }
  private triggerMonthChange() {
    if (this.onMonthChange)
      this.onMonthChange({
        year: this.year,
        month: this.month,
      });
  }
}
