import { IEntry } from "./../../src/resources/elements/entry/entry.interface";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { differenceInDays } from "date-fns";
admin.initializeApp();
const db = admin.firestore();

interface Streak {
  created: Date;
  updated: Date;
  length: number;
  beginDate: Date;
  endDate: Date;
  id: string;
  type: string;
  userId: string;
}
function createStreak(firestoreObject: any, id: string): Streak {
  return {
    userId: firestoreObject.userId,
    id: id,
    created: firestoreObject.created.toDate(),
    updated: firestoreObject.updated.toDate(),
    length: firestoreObject.length,
    beginDate: firestoreObject.beginDate.toDate(),
    endDate: firestoreObject.endDate.toDate(),
    type: "daysPosted",
  };
}
function addDaysToDate(days: number, origDate: Date) {
  var date = new Date(origDate.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}
exports.createEntryAdjustStreaks = functions.firestore
  .document("entries/{entryId}")
  .onCreate(async (snap, context) => {
    const entry: IEntry = snap.data() as IEntry;
    const userId = snap.data().userId;
    await updateStreaksAfterCreate(userId, entry);
  });

exports.deleteEntryAdjustStreaks = functions.firestore
  .document("entries/{entryId}")
  .onDelete(async (snap, context) => {
    const entry: IEntry = snap.data() as IEntry;
    const userId = snap.data().userId;
    const date = new Date(entry.date);

    await updateStreaksAfterDelete(
      userId,
      date,
      entry.year,
      entry.month,
      entry.day,
      context.timestamp
    );
  });

exports.updateEntryAdjustStreaks = functions.firestore
  .document("entries/{entryId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data() as IEntry;
    const after = change.after.data() as IEntry;
    const userId = before.userId;
    if (before.date === after.date) return;

    await updateStreaksAfterDelete(
      userId,
      new Date(before.date),
      before.year,
      before.month,
      before.day,
      context.timestamp
    );
    await updateStreaksAfterCreate(userId, after);
  });
async function dateHasEntries(userId: any, year: any, month: any, day: any) {
  let entriesOnDateSnapshot = await db
    .collection("entries")
    .where("userId", "==", userId)
    .where("year", "==", year)
    .where("month", "==", month)
    .where("day", "==", day)
    .get();
  return entriesOnDateSnapshot.size >= 1;
}
async function updateStreaksAfterDelete(
  userId: any,
  date: Date,
  year: any,
  month: any,
  day: any,
  timestamp: any
) {
  console.log("hit delete");
  if (await dateHasEntries(userId, year, month, day)) return;
  let snapshot = await db
    .collection("streaks")
    .where("userId", "==", userId)
    .where("type", "==", "daysPosted")
    .where("beginDate", "<=", date)
    .get();
  let streaks: Streak[] = [];
  snapshot.forEach((doc) => {
    const streak = doc.data();
    doc.id;
    if (streak.endDate.toDate() >= date) {
      streaks.push(createStreak(streak, doc.id));
    }
  });
  if (streaks.length > 1) {
    console.error(
      "onDelete Streak Update: More than one streak containing deleted entry. Aborting"
    );
    return;
  }
  const streak = streaks[0];
  if (streak.length === 1) db.collection("streaks").doc(streak.id).delete();
  else if (streak.beginDate.getTime() === date.getTime())
    db.collection("streaks")
      .doc(streak.id)
      .set(
        {
          beginDate: addDaysToDate(1, date),
          length: streak.length - 1,
          updated: new Date(timestamp),
        },
        { merge: true }
      );
  else if (streak.endDate.getTime() === date.getTime())
    db.collection("streaks")
      .doc(streak.id)
      .set(
        {
          endDate: addDaysToDate(-1, date),
          length: streak.length - 1,
          updated: new Date(timestamp),
        },
        { merge: true }
      );
  else {
    db.collection("streaks")
      .doc(streak.id)
      .set(
        {
          beginDate: addDaysToDate(1, date),
          length: differenceInDays(streak.endDate, date),
          updated: new Date(timestamp),
        },
        { merge: true }
      );
    db.collection("streaks").add({
      userId,
      created: new Date(timestamp),
      updated: new Date(timestamp),
      length: differenceInDays(date, streak.beginDate),
      beginDate: streak.beginDate,
      endDate: addDaysToDate(-1, date),
      type: "daysPosted",
    });
  }
}
async function updateStreaksAfterCreate(userId: any, entry: IEntry) {
  console.log("hit create");

  const date = new Date(entry.date);
  let snapshot = await db
    .collection("streaks")
    .where("userId", "==", userId)
    .where("type", "==", "daysPosted")
    .where("beginDate", "<=", addDaysToDate(1, date))
    .get();
  let streaks: Streak[] = [];
  snapshot.forEach((doc) => {
    const streak = doc.data();
    doc.id;
    if (addDaysToDate(1, streak.endDate.toDate()) >= date) {
      streaks.push(createStreak(streak, doc.id));
    }
  });
  //no-existing streak relations
  if (streaks.length === 0)
    db.collection("streaks").add({
      userId,
      created: entry.created,
      updated: entry.updated,
      length: 1,
      beginDate: new Date(entry.date),
      endDate: new Date(entry.date),
      type: "daysPosted",
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
      db.collection("streaks")
        .doc(streaks[0].id)
        .set(
          {
            beginDate: date,
            length: streaks[0].length + 1,
            updated: entry.created,
          },
          { merge: true }
        );
    if (date > streaks[0].endDate)
      db.collection("streaks")
        .doc(streaks[0].id)
        .set(
          {
            endDate: date,
            length: streaks[0].length + 1,
            updated: entry.created,
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
    db.collection("streaks").doc(defunctStreak.id).delete();
    db.collection("streaks")
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
          updated: entry.created,
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
