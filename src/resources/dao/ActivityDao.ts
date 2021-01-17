import { BaseGenericDao } from "./BaseGenericDao";
export class ActivityDao extends BaseGenericDao {
  constructor() {
    super("activities");
  }
  sortItems(items) {
    return items.sort((a, b) => {
      if (a.isArchived - b.isArchived !== 0) return a.isArchived - b.isArchived;
      a.created - b.created;
    });
  }
}
