import { autoinject } from "aurelia-framework";
import { DexieDao } from "./DexieDao";
import { DexieDatabase } from "./DexieDatabase";
@autoinject
export class MoodDao extends DexieDao {
  constructor(dexie: DexieDatabase) {
    super("moods", dexie);
  }
  sortItems(items) {
    return items.sort((a, b) => a.rating - b.rating);
  }
}
