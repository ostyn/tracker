import { Streak } from "./../../../functions/src/streak.interface";
import { BaseGenericDao } from "./BaseGenericDao";
export class StreakDao extends BaseGenericDao {
  constructor() {
    super("streaks");
  }
  getEntryStreakStatusForDate(date) {
    const query = this.db
      .collection("streaks")
      .where("type", "==", "daysPosted")
      .where("endDate", ">=", date)
      .orderBy("endDate", "desc");
    return this.getItemsFromQuery(query);
  }
  async getActivityStreaksCrossingRange(activityId, rangeBegin, rangeEnd) {
    const query = this.db
      .collection("streaks")
      .where("type", "==", "activity:" + activityId)
      .where("endDate", ">=", rangeBegin)
      .orderBy("endDate", "desc");
    const streaksEndingAfterRangeStarts: Streak[] =
      await this.getItemsFromQuery(query);
    const streaksAffectingRange = [];
    for (let streak of streaksEndingAfterRangeStarts) {
      if (streak.beginDate < rangeEnd) streaksAffectingRange.push(streak);
    }
    return streaksAffectingRange;
  }
  afterLoadFixup(item): Streak {
    item.beginDate = item.beginDate.toDate();
    item.endDate = item.endDate.toDate();
    return item;
  }
}
