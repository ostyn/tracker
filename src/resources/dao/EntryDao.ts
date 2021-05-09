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
  getEntriesWithSpecificActivity(id): Promise<IEntry[]> {
    return this.getItemsFromQuery(
      this.db.collection("entries").orderBy(`activities.${id}`, "asc")
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
  beforeSaveFixup(item) {
    var clone = Object.assign({}, item);
    clone.activities = this.strMapToObj(item.activities);
    return clone;
  }
  afterLoadFixup(item) {
    item.activities = this.ObjToStrMap(item.activities);
    return item;
  }
}
