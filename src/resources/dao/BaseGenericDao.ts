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

  public setupCacheAndUpdateListener(notify) {
    this.db
      .collection(this.name)
      .orderBy("updated", "desc")
      .where(
        "updated",
        ">",
        firebase.firestore.Timestamp.fromMillis(
          parseInt(localStorage.getItem("lastLoad_" + this.name) || "0")
        )
      )
      .where("userId", "==", firebase.auth().currentUser?.uid || null)
      .onSnapshot((snapshot) => {
        FirestoreCounter.count += snapshot.docChanges().length;
        notify();
      });
    if (!localStorage.getItem("lastLoad_" + this.name)) {
      this.db
        .collection(this.name)
        .where("userId", "==", firebase.auth().currentUser?.uid || null)
        .orderBy("updated", "desc")
        .get({ source: "cache" })
        .then((snapshot) => {
          if (snapshot.size === 0) {
            this.db
              .collection(this.name)
              .where("userId", "==", firebase.auth().currentUser?.uid || null)
              .orderBy("updated", "desc")
              .get({ source: "server" })

              .then((serversnap) => {
                localStorage.setItem(
                  "lastLoad_" + this.name,
                  serversnap.docs[0].data().updated.toDate().getTime()
                );
              })
              .catch((err) => console.log(err));
          } else {
            localStorage.setItem(
              "lastLoad_" + this.name,
              snapshot.docs[0].data().updated.toDate().getTime()
            );
          }
        })
        .catch((err) => console.log(err));
    } else {
      this.db
        .collection(this.name)
        .orderBy("updated", "desc")
        .where(
          "updated",
          ">",
          firebase.firestore.Timestamp.fromMillis(
            parseInt(localStorage.getItem("lastLoad_" + this.name))
          )
        )
        .where("userId", "==", firebase.auth().currentUser?.uid || null)
        .get({ source: "server" })
        .then((serversnap) => {
          if (serversnap.size > 0) {
            notify();
            localStorage.setItem(
              "lastLoad_" + this.name,
              serversnap.docs[0].data().updated.toDate().getTime()
            );
          }
        });
    }
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
  getItems() {
    var ref = this.db.collection(this.name);
    return this.getItemsFromQuery(ref);
  }
  getItemsFromQuery(query): Promise<any> {
    let request;
    request = query
      .where("userId", "==", firebase.auth().currentUser?.uid || null)
      .get({ source: "cache" });
    return request
      .then((snapshot) => {
        let items = [];
        snapshot.forEach((doc) => {
          items.push(this.processFirestoreData(doc));
        });
        return this.sortItems(items);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  public processFirestoreData(doc: any) {
    const item = {
      ...doc.data(),
      id: doc.id,
    };
    if (item.created) item.created = item.created.toDate();
    if (item.updated) item.updated = item.updated.toDate();
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
    ref.doc(id).set({
      updated: firebase.firestore.FieldValue.serverTimestamp(),
      created: firebase.firestore.FieldValue.serverTimestamp(),
      userId: firebase.auth().currentUser?.uid,
    });
    return ref
      .doc(id)
      .delete()
      .then(() => {
        return true;
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
