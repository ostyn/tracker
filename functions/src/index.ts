import { IEntry } from "./../../src/resources/elements/entry/entry.interface";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { differenceInDays } from "date-fns";
import { Streak } from "./streak.interface";
import { createStreakFromDbStreak, addDaysToDate } from "./utils";
admin.initializeApp();
const db = admin.firestore();

exports.createEntryAdjustStreaks = functions.firestore
  .document("entries/{entryId}")
  .onCreate(async (snap, context) => {
    const entry: IEntry = snap.data() as IEntry;
    const userId = snap.data().userId;
    await updateStreaksAfterCreate(
      userId,
      "daysPosted",
      new Date(entry.date),
      new Date(context.timestamp)
    );
    entry.activitiesArray?.forEach(async (activity) => {
      await updateStreaksAfterCreate(
        userId,
        "activity:" + activity,
        new Date(entry.date),
        new Date(context.timestamp)
      );
    });
  });

exports.deleteEntryAdjustStreaks = functions.firestore
  .document("entries/{entryId}")
  .onDelete(async (snap, context) => {
    const entry: IEntry = snap.data() as IEntry;
    const userId = snap.data().userId;

    if (!(await dateHasEntries(userId, new Date(entry.date))))
      await updateStreaksAfterDelete(
        userId,
        "daysPosted",
        new Date(entry.date),
        new Date(context.timestamp)
      );
    (
      await getActivitiesNotRepresentedOnDate(
        userId,
        new Date(entry.date),
        entry.activitiesArray as string[]
      )
    ).forEach(async (activity) => {
      await updateStreaksAfterDelete(
        userId,
        "activity:" + activity,
        new Date(entry.date),
        new Date(context.timestamp)
      );
    });
  });

exports.updateEntryAdjustStreaks = functions.firestore
  .document("entries/{entryId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data() as IEntry;
    const after = change.after.data() as IEntry;
    const userId = before.userId;
    if (before.date !== after.date) {
      if (!(await dateHasEntries(userId, new Date(before.date))))
        await updateStreaksAfterDelete(
          userId,
          "daysPosted",
          new Date(before.date),
          new Date(context.timestamp)
        );
      await updateStreaksAfterCreate(
        userId,
        "daysPosted",
        new Date(after.date),
        new Date(context.timestamp)
      );
      const toCheckupOn = await getActivitiesNotRepresentedOnDate(
        userId,
        new Date(before.date),
        before.activitiesArray as []
      );
      for (let activity of toCheckupOn) {
        await updateStreaksAfterDelete(
          userId,
          "activity:" + activity,
          new Date(before.date),
          new Date(context.timestamp)
        );
      }
      (after.activitiesArray as []).forEach(async (activity) => {
        await updateStreaksAfterCreate(
          userId,
          "activity:" + activity,
          new Date(after.date),
          new Date(context.timestamp)
        );
      });
    } else {
      const removedActivities: string[] = [];
      const addedActivities: string[] = [];
      before.activitiesArray?.forEach((activity) => {
        if (!(after.activities as Record<string, any>)[activity])
          removedActivities.push(activity);
      });
      after.activitiesArray?.forEach((activity) => {
        if (!(before.activities as Record<string, any>)[activity])
          addedActivities.push(activity);
      });
      const toCheckupOn = await getActivitiesNotRepresentedOnDate(
        userId,
        new Date(before.date),
        removedActivities
      );
      for (let activity of toCheckupOn) {
        await updateStreaksAfterDelete(
          userId,
          "activity:" + activity,
          new Date(before.date),
          new Date(context.timestamp)
        );
      }
      addedActivities.forEach(async (activity) => {
        await updateStreaksAfterCreate(
          userId,
          "activity:" + activity,
          new Date(after.date),
          new Date(context.timestamp)
        );
      });
    }
  });

//TODO: Soon we'll have to check if a date has mood/activity instead of just "exists"
async function dateHasEntries(userId: any, date: Date) {
  let query = db
    .collection("entries")
    .where("userId", "==", userId)
    .where("year", "==", date.getFullYear())
    .where("month", "==", date.getMonth() + 1)
    .where("day", "==", date.getDate());

  let entriesOnDateSnapshot = await query.get();
  return entriesOnDateSnapshot.size >= 1;
}

//TODO: Soon we'll have to check if a date has mood/activity instead of just "exists"
async function getActivitiesNotRepresentedOnDate(
  userId: any,
  date: Date,
  activities: any[]
): Promise<string[]> {
  if (activities.length === 0) return [];
  const unrepresentedActivities: Map<string, number> = new Map();
  activities.forEach((activity) => {
    unrepresentedActivities.set(activity, 1);
  });
  //array-contains-any limits to 10 per query
  for (let i = 0; i < activities.length; i += 10) {
    let query = db
      .collection("entries")
      .where("userId", "==", userId)
      .where("year", "==", date.getFullYear())
      .where("month", "==", date.getMonth() + 1)
      .where("day", "==", date.getDate())
      .where(
        "activitiesArray",
        "array-contains-any",
        activities.slice(i, i + 10)
      );
    let entries = await query.get();
    entries.forEach((entry) => {
      entry.data().activitiesArray.forEach((activity: string) => {
        unrepresentedActivities.delete(activity);
      });
    });
  }

  return Array.from(unrepresentedActivities.keys());
}

async function updateStreaksAfterDelete(
  userId: any,
  type: string,
  date: Date,
  actionTime: Date
): Promise<any> {
  let streaks: Streak[] = await getAffectedStreaksForDate(userId, date, type);
  if (streaks.length > 1) {
    console.error(
      "onDelete Streak Update: More than one streak containing deleted entry. Aborting"
    );
    return;
  }
  if (streaks.length === 0) return;
  const streak = streaks[0];
  if (streak.length === 1) {
    return await db.collection("streaks").doc(streak.id).delete();
  } else if (streak.beginDate.getTime() === date.getTime()) {
    return await db
      .collection("streaks")
      .doc(streak.id)
      .set(
        {
          beginDate: addDaysToDate(1, date),
          length: streak.length - 1,
          updated: actionTime,
        },
        { merge: true }
      );
  } else if (streak.endDate.getTime() === date.getTime()) {
    return await db
      .collection("streaks")
      .doc(streak.id)
      .set(
        {
          endDate: addDaysToDate(-1, date),
          length: streak.length - 1,
          updated: actionTime,
        },
        { merge: true }
      );
  } else {
    await db
      .collection("streaks")
      .doc(streak.id)
      .set(
        {
          beginDate: addDaysToDate(1, date),
          length: differenceInDays(streak.endDate, date),
          updated: actionTime,
        },
        { merge: true }
      );
    return await db.collection("streaks").add({
      userId,
      created: actionTime,
      updated: actionTime,
      length: differenceInDays(date, streak.beginDate),
      beginDate: streak.beginDate,
      endDate: addDaysToDate(-1, date),
      type: streak.type,
    });
  }
}

async function updateStreaksAfterCreate(
  userId: any,
  type: string,
  date: Date,
  actionTime: Date
) {
  let streaks: Streak[] = await getAffectedStreaksForDate(
    userId,
    date,
    type,
    1
  );
  //no-existing streak relations
  if (streaks.length === 0)
    await db.collection("streaks").add({
      userId,
      created: actionTime,
      updated: actionTime,
      length: 1,
      beginDate: date,
      endDate: date,
      type: type,
    });
  //contained in a streak
  else if (
    streaks.length === 1 &&
    date >= streaks[0].beginDate &&
    date <= streaks[0].beginDate
  ) {
    //NO-OP
  } //adjacent to a single streak
  else if (streaks.length === 1) {
    if (date < streaks[0].beginDate)
      await db
        .collection("streaks")
        .doc(streaks[0].id)
        .set(
          {
            beginDate: date,
            length: streaks[0].length + 1,
            updated: actionTime,
          },
          { merge: true }
        );
    if (date > streaks[0].endDate)
      await db
        .collection("streaks")
        .doc(streaks[0].id)
        .set(
          {
            endDate: date,
            length: streaks[0].length + 1,
            updated: actionTime,
          },
          { merge: true }
        );
  } // bridging two streaks
  else if (streaks.length === 2) {
    const streakA = streaks[0];
    const streakB = streaks[1];
    let survivingStreak;
    let defunctStreak;
    if (streakA.created < streakB.created) {
      survivingStreak = streakA;
      defunctStreak = streakB;
    } else {
      survivingStreak = streakB;
      defunctStreak = streakA;
    }
    await db.collection("streaks").doc(defunctStreak.id).delete();
    await db
      .collection("streaks")
      .doc(survivingStreak.id)
      .set(
        {
          beginDate:
            survivingStreak.beginDate < defunctStreak.beginDate
              ? survivingStreak.beginDate
              : defunctStreak.beginDate,
          endDate:
            survivingStreak.endDate > defunctStreak.endDate
              ? survivingStreak.endDate
              : defunctStreak.endDate,
          length: survivingStreak.length + defunctStreak.length + 1,
          updated: actionTime,
        },
        { merge: true }
      );
  } else {
    console.error(
      "onCreate Streak Update: Entry adjacent to more than 2 existing streaks. Aborting"
    );
    return;
  }
}
async function getAffectedStreaksForDate(
  userId: any,
  date: Date,
  type: string,
  proximity: number = 0
) {
  let snapshot = await db
    .collection("streaks")
    .where("userId", "==", userId)
    .where("type", "==", type)
    .where("endDate", ">=", addDaysToDate(-1 * proximity, date))
    .orderBy("endDate", "desc")
    .get();
  let streaks: Streak[] = [];
  snapshot.forEach((doc) => {
    const dbStreak = doc.data();
    if (addDaysToDate(-1 * proximity, dbStreak.beginDate.toDate()) <= date) {
      streaks.push(createStreakFromDbStreak(dbStreak, doc.id));
    }
  });
  return streaks;
}
