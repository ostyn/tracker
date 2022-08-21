import { FirestoreCounter } from "./FirestoreCounter";
import firebase from "firebase";
import { IEntry } from "./../elements/entry/entry.interface";
import { BaseGenericDao } from "./BaseGenericDao";
export class EntryDao extends BaseGenericDao {
  path;
  constructor() {
    super("entries");
  }
  getItem(id) {
    return super.getItem(id);
  }

  getEntriesFromYearAndMonth(
    year = undefined,
    month = undefined,
    day = undefined
  ) {
    let query: any = this.db.collection("entries");
    if (year !== undefined && year !== "" && !Number.isNaN(year))
      query = query.where("year", "==", year);
    else query = query.orderBy("year", "desc");
    if (month !== undefined && month !== "" && !Number.isNaN(month))
      query = query.where("month", "==", month);
    else query = query.orderBy("month", "desc");
    if (day !== undefined && day !== "" && !Number.isNaN(day))
      query = query.where("day", "==", day);
    else query = query.orderBy("day", "desc");
    query = query.orderBy("created", "desc");
    return this.getItemsFromQuery(query);
  }
  getEntriesWithSpecificActivityAndDate(id, month, year): Promise<IEntry[]> {
    return this.getItemsFromQuery(
      this.db
        .collection("entries")
        .where("activitiesArray", "array-contains", id)
        .where("month", "==", month)
        .where("year", "==", year)
    ).then((items) => {
      return items.sort((a, b) => {
        if (a.date < b.date) {
          return 1;
        }
        if (a.date > b.date) {
          return -1;
        }
        return 0;
      });
    });
  }
  private backfill() {
    let batch = this.db.batch();

    this.db
      .collection("entries")
      .where("userId", "==", firebase.auth().currentUser.uid)
      .get()
      .then((querySnapshot) => {
        let i = 0;
        querySnapshot.forEach((doc) => {
          const docRef = this.db.collection("entries").doc(doc.id);
          batch.update(docRef, {
            activitiesArray: Array.from(
              this.processFirestoreData(doc).activities.keys()
            ),
          });
          i++;
          if (i > 100) {
            batch.commit();
            batch = this.db.batch();
            i = 0;
          }
        });

        batch.commit();
      });
  }

  beforeSaveFixup(item: IEntry) {
    var clone = Object.assign({}, item);
    clone.activities = this.strMapToObj(item.activities);
    clone.activitiesArray = Array.from(item.activities.keys());
    return clone;
  }
  afterLoadFixup(item) {
    item.activities = this.ObjToStrMap(item.activities);
    return item;
  }
}
