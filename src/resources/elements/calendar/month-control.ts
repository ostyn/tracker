import { bindable } from "aurelia-framework";
import { addMonths, format, startOfMonth } from "date-fns";
export class MonthControl {
  @bindable month: number;
  @bindable year: number;
  @bindable onMonthChange;
  private date: Date;
  public monthName: string;
  attached() {
    if (this.year && this.month)
      this.date = new Date(this.year, this.month - 1, 1);
    else this.date = startOfMonth(new Date());
    this.syncDisplayWithDate();
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
  private syncDisplayWithDate() {
    this.monthName = format(this.date, "LLLL");
    this.month = this.date.getMonth() + 1;
    this.year = this.date.getFullYear();
  }
  private triggerMonthChange() {
    if (this.onMonthChange)
      this.onMonthChange({
        year: this.year,
        month: this.month,
      });
  }
}
