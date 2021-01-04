import { BaseGenericDao } from "./BaseGenericDao";
export class MoodDao extends BaseGenericDao {
  constructor() {
    super("moods");
  }
  sortItems(items) {
    return items.sort((a, b) => a.rating - b.rating);
  }
}
