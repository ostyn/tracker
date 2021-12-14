import { FirestoreCounter } from "./FirestoreCounter";
import firebase from "firebase";
export class BaseGenericDao {
  name: any;
  db: firebase.firestore.Firestore;
  constructor(name) {
    this.name = name;
    this.db = firebase.firestore();
  }
  getCollectionName() {
    return this.name;
  }
  getItem(id: string) {
    return this.db
      .collection(this.name)
      .doc(id)
      .get()
      .then((snapshot) => {
        return this.processFirestoreData(snapshot);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  getItems(hitCache = false) {
    var ref = this.db.collection(this.name);
    return this.getItemsFromQuery(ref, hitCache);
  }
  getItemsFromQuery(query, hitCache = false) {
    let request;
    if (hitCache)
      request = query
        .where("userId", "==", firebase.auth().currentUser?.uid || null)
        .get({ source: "cache" });
    else
      request = query
        .where("userId", "==", firebase.auth().currentUser?.uid || null)
        .get();
    return request
      .then((snapshot) => {
        let items = [];
        snapshot.forEach((doc) => {
          items.push(this.processFirestoreData(doc, hitCache));
        });
        return this.sortItems(items);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  public processFirestoreData(doc: any, hitCache = false) {
    const item = {
      ...doc.data(),
      id: doc.id,
    };
    if (item.created) item.created = item.created.toDate();
    if (item.updated) item.updated = item.updated.toDate();
    if (!hitCache) FirestoreCounter.count++;
    return this.afterLoadFixup(item);
  }
  saveItem(passedEntry): Promise<any> {
    let id = passedEntry.id;
    passedEntry = this.beforeSaveFixup(passedEntry);
    delete passedEntry.id;
    var ref = this.db.collection(this.name);
    const updatedEntry = {
      ...passedEntry,
      updated: firebase.firestore.FieldValue.serverTimestamp(),
      created:
        passedEntry.created || firebase.firestore.FieldValue.serverTimestamp(),
      userId: firebase.auth().currentUser?.uid,
    };
    if (id)
      return ref
        .doc(id)
        .set(updatedEntry)
        .then(() => {
          return id;
        })
        .catch((err) => {
          console.log(err);
        });
    else
      return ref
        .add(updatedEntry)
        .then((docRef) => {
          return docRef.id;
        })
        .catch((err) => {
          console.log(err);
        });
  }
  deleteItem(id) {
    var ref = this.db.collection(this.name);
    return ref
      .doc(id)
      .delete()
      .then(() => {
        return true;
      })
      .catch((err) => {
        console.log(err);
      });
  }
  beforeSaveFixup(item) {
    return item;
  }
  afterLoadFixup(item) {
    return item;
  }
  sortItems(items) {
    return items;
  }
  strMapToObj(strMap) {
    let obj = Object.create(null);
    strMap.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  }
  ObjToStrMap(obj) {
    let map = new Map();
    for (let k in obj) {
      map.set(k, obj[k]);
    }
    return map;
  }
}
