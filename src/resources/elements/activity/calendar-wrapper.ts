import { Router } from "aurelia-router";
import { IEntry } from "./../entry/entry.interface";
import { autoinject, bindable } from "aurelia-framework";
import { DateTime } from "luxon";
import { DialogController } from "aurelia-dialog";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/light.css";

@autoinject
export class CalendarWrapper {
  @bindable public dates: Map<string, IEntry> = new Map();
  @bindable public inline: boolean | string = true;
  @bindable public year: number;
  @bindable public month: number;
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
  constructor(private router: Router, public controller: DialogController) {}
  datesChanged(newValue) {
    if (this.instance && newValue) this.instance.redraw();
  }
  attached() {
    this.inline = this.inline === true || this.inline === "true";
    this.instance = flatpickr(this.calendar, {
      inline: this.inline,
      defaultDate:
        this.month && this.year ? `${this.year}-${this.month}` : new Date(),
      monthSelectorType: "static",
      onDayCreate: ((dObj, dStr, fp, dayElem) => {
        const dt = DateTime.fromJSDate(dayElem.dateObj);
        const key = dt.toFormat("yyyy-MM-dd");
        const entry: IEntry = this.dates.get(key);
        if (entry) dayElem.innerHTML += `<span class='event'></span>`;
      }).bind(this),
      onMonthChange: this.onMonthYearChange.bind(this),
      onYearChange: this.onMonthYearChange.bind(this),
      onChange: ((selectedDates, dateStr, instance) => {
        if (this.onDateSelect) this.onDateSelect({ date: selectedDates[0] });
      }).bind(this),
    });
  }
}
