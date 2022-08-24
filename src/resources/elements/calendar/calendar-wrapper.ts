import { MoodService } from "./../../services/moodService";
import { IEntry } from "./../entry/entry.interface";
import { autoinject, bindable } from "aurelia-framework";
import { format } from "date-fns";

import { DialogController } from "aurelia-dialog";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/dark.css";

@autoinject
export class CalendarWrapper {
  @bindable public dates: Map<string, IEntry> = new Map();
  @bindable public activityId: string;
  @bindable public inline: boolean | string = true;
  @bindable public year: number;
  @bindable public month: number;
  @bindable public day: number;
  @bindable public onMonthChange;
  @bindable public onDateSelect;

  private calendar: Element;
  instance: any;
  onMonthYearChange(selectedDates, dateStr, instance) {
    this.month = instance.currentMonth + 1;
    this.year = instance.currentYear;
    if (this.onMonthChange)
      this.onMonthChange({ year: this.year, month: this.month });
  }
  constructor(
    public controller: DialogController,
    private moodService: MoodService
  ) {}
  datesChanged(newValue) {
    if (this.instance && newValue) this.instance.redraw();
  }
  attached() {
    this.inline = this.inline === true || this.inline === "true";
    this.instance = flatpickr(this.calendar, {
      inline: this.inline,
      defaultDate:
        this.month && this.year && this.day
          ? `${this.year}-${this.month}-${this.day}`
          : new Date(),
      monthSelectorType: "static",
      onDayCreate: ((dObj, dStr, fp, dayElem) => {
        const dt = new Date(dayElem.dateObj);
        const key = format(dt, "yyyy-MM-dd");
        const entry: IEntry = this.dates.get(key);
        if (entry) {
          const activityDetail = entry.activities.get(this.activityId);
          const activityNumber = activityDetail.length || activityDetail;
          dayElem.innerHTML += `<div class="rounded-full bg-green-300 text-xs">${
            this.moodService.getMood(entry.mood).emoji
          }${activityNumber > 1 ? activityNumber : ""} </div>`;
        }
      }).bind(this),
      onMonthChange: this.onMonthYearChange.bind(this),
      onYearChange: this.onMonthYearChange.bind(this),
      onChange: ((selectedDates, dateStr, instance) => {
        if (this.onDateSelect)
          this.onDateSelect({ date: new Date(selectedDates[0]) });
      }).bind(this),
    });
  }
}
