import { autoinject } from "aurelia-framework";
import { IActivity } from "resources/elements/activity/activity.interface";
import { DexieDao } from "./DexieDao";
import { DexieDatabase } from "./DexieDatabase";
@autoinject
export class ActivityDao extends DexieDao {
  constructor(dexie: DexieDatabase) {
    super("activities", dexie);
  }
  sortItems(items: IActivity[]) {
    return items.sort((a, b) => {
      if (Number(a.isArchived) - Number(b.isArchived) !== 0)
        return Number(a.isArchived) - Number(b.isArchived);
      a.created - b.created;
    });
  }
}
