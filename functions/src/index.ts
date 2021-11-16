import { IEntry } from "./../../src/resources/elements/entry/entry.interface";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
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
    let date = new Date(entry.date);
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
    }
  });
