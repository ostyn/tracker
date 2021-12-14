import { autoinject } from "aurelia-framework";
import { StreakDao } from "resources/dao/StreakDao";

@autoinject
export class StreakService {
  constructor(private streakDao: StreakDao) {}
  public getActivityStreaksCrossingRange(activityId, rangeBegin, rangeEnd) {
    return this.streakDao
      .getActivityStreaksCrossingRange(activityId, rangeBegin, rangeEnd)
      .then((data) => {
        return data;
      });
  }
  public getEntryStreakStatusForDate(date) {
    return this.streakDao
      .getEntryStreakStatusForDate(this.addDaysToDate(-3, date))
      .then((data) => {
        return data;
      });
  }

  private addDaysToDate(days: number, origDate: Date) {
    var date = new Date(origDate.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }
}
