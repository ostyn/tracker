import { singleton } from "aurelia-framework";
import Dexie from "dexie";

@singleton(true)
export class DexieDatabase {
  public db: Dexie;
  constructor() {
    this.db = new Dexie("tracker");
    this.db.version(1).stores({
      moods: "id",
      activities: "id",
      entries: "id, year, [month+year]",
    });
  }
}
