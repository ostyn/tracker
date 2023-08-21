import { TrackerDao } from "./TrackerDao";
import { DexieDatabase } from "./DexieDatabase";

export class DexieDao implements TrackerDao {
  name: any;
  notify: any;

  constructor(name, public dexie: DexieDatabase) {
    this.name = name;
  }
  setupCacheAndUpdateListener(notify: any): void {
    this.notify = notify;
    notify();
  }
  async getItem(id: string): Promise<any> {
    return this.processData(await this.dexie.db[this.name].get(id));
  }
  async getItems(): Promise<any> {
    let rawItems = await this.dexie.db[this.name].toArray();
    return this.getItemsFromQuery(rawItems);
  }
  private processData(item: any): any {
    if (item.created) item.created = new Date(item.created);
    if (item.updated) item.updated = new Date(item.updated);
    return this.afterLoadFixup(item);
  }
  getItemsFromQuery(rawItems): Promise<any> {
    let items = [];
    rawItems.forEach((item) => {
      items.push(this.processData(item));
    });
    return Promise.resolve(this.sortItems(items));
  }
  saveItem(passedEntry: any): Promise<any> {
    if (passedEntry.id === undefined || !passedEntry.id) {
      passedEntry.id = crypto.randomUUID();
    }
    passedEntry.updated = new Date();
    if (!passedEntry.created) {
      passedEntry.created = passedEntry.updated;
    }
    passedEntry = this.beforeSaveFixup(passedEntry);
    const newLocal = this.dexie.db[this.name].put(passedEntry);
    newLocal.then(() => {
      this.notify();
    });
    return newLocal;
  }
  deleteItem(id: any): Promise<boolean> {
    const newLocal = this.dexie.db[this.name].delete(id);
    newLocal.then(() => {
      this.notify();
    });
    return newLocal;
  }
  beforeSaveFixup(item: any) {
    return item;
  }
  afterLoadFixup(item: any) {
    return item;
  }
  sortItems(items: any): any[] {
    return items;
  }
}
