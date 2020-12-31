import * as moment from "moment";
export class FormatLib {
  secondsToDate(seconds) {
    return moment(seconds).format("MMMM D, YYYY");
  }
  secondsToTime(seconds) {
    return moment(seconds).format("h:mm a");
  }
  selectorDateToJsDate(date) {
    return moment(date).format("dddd - MMMM D, YYYY");
  }
}
