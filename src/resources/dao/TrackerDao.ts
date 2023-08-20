export interface TrackerDao {
  setupCacheAndUpdateListener(notify): void;
  getItem(id: string): Promise<any>;
  getItems(): Promise<any>;
  getItemsFromQuery(query): Promise<any>;
  saveItem(passedEntry): Promise<any>;
  deleteItem(id): Promise<boolean>;
  beforeSaveFixup(item): any;
  afterLoadFixup(item): any;
  sortItems(items): any[];
}
