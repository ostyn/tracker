import { IEntry } from "./../entry/entry.interface";
import { autoinject, bindable } from "aurelia-framework";
import flatpickr from "flatpickr";
import { DateTime } from "luxon";
import "flatpickr/dist/themes/light.css";
@autoinject
export class CalendarWrapper {
  @bindable public dates: Map<string, IEntry> = new Map();
  private calendar: Element;
  attached() {
    flatpickr(this.calendar, {
      inline: true,
      monthSelectorType: "static",
      onDayCreate: ((dObj, dStr, fp, dayElem) => {
        const dt = DateTime.fromJSDate(dayElem.dateObj);
        const key = dt.toFormat("yyyy-MM-dd");
        const entry: IEntry = this.dates.get(key);
        if (entry) dayElem.innerHTML += `<span class='event'></span>`;
      }).bind(this),
    });
  }
}
