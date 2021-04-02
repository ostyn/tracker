import { IActivity } from "resources/elements/activity/activity.interface";
import { BaseGenericDao } from "./BaseGenericDao";
export class ActivityDao extends BaseGenericDao {
  constructor() {
    super("activities");
  }
  sortItems(items: IActivity[]) {
    return items.sort((a, b) => {
      if (Number(a.isArchived) - Number(b.isArchived) !== 0)
        return Number(a.isArchived) - Number(b.isArchived);
      a.created - b.created;
    });
  }
  getAllCategories() {
    return this.getItemsFromQuery(
      this.db.collection("activities").orderBy(`category`, "desc")
    ).then((items) => {
      const categories = new Set();
      items.forEach((item) => {
        categories.add(item.category);
      });
      return categories;
    });
  }
}
