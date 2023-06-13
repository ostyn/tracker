import { format, parseISO } from "date-fns";
export class FormatLib {
  secondsToDate(seconds) {
    return format(seconds, "MMMM d, yyyy");
  }
  secondsToTime(seconds) {
    return format(seconds, "h:mm a");
  }
  selectorDateToJsDate(date: string) {
    return format(parseISO(date), "MMMM d, yyyy");
  }
  selectorDateToWeekDay(date: string) {
    return format(parseISO(date), "EEEE");
  }
}
