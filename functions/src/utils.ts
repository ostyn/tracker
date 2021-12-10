import { Streak } from "./streak.interface";

export function createStreakFromDbStreak(dbStreak: any, id: string): Streak {
  return {
    userId: dbStreak.userId,
    id: id,
    created: dbStreak.created.toDate(),
    updated: dbStreak.updated.toDate(),
    length: dbStreak.length,
    beginDate: dbStreak.beginDate.toDate(),
    endDate: dbStreak.endDate.toDate(),
    type: dbStreak.type,
  };
}
export function addDaysToDate(days: number, origDate: Date) {
  var date = new Date(origDate.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}
