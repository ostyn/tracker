import { Router } from "aurelia-router";
import { IEntry } from "./../entry/entry.interface";
import { autoinject, bindable } from "aurelia-framework";
import flatpickr from "flatpickr";
import { DateTime } from "luxon";
import "flatpickr/dist/themes/light.css";
import { DialogController } from "aurelia-dialog";
@autoinject
export class CalendarWrapper {
  @bindable public dates: Map<string, IEntry> = new Map();
  private calendar: Element;
  constructor(private router: Router, public controller: DialogController) {}
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
      onChange: (a, b, c, d) => {
        let date: Date = a[0];
        this.router.navigateToRoute("entries", {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
        });
        this.controller.cancel();
      },
    });
  }
}
