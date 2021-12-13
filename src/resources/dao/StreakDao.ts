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
}
