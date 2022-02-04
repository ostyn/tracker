import { format } from "date-fns";
export class FormatLib {
  secondsToDate(seconds) {
    return format(seconds, "MMMM d, yyyy");
  }
  secondsToTime(seconds) {
    return format(seconds, "h:mm a");
  }
  selectorDateToJsDate(date: string) {
    return format(new Date(date), "EEEE - MMMM d, yyyy");
  }
}
