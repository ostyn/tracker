export interface IEntry {
  userId?: any;
  activitiesArray?: number[];
  day?: number;
  month?: number;
  year?: number;
  lastUpdatedBy?: EditTools;
  updated?: Date;
  created?: Date;
  id?: string;
  date: string;
  mood: string;
  activities: Map<number, IActivityDetail>;
  note: string;
  createdBy: EditTools;
}
export type IActivityDetail = number | string[];
export enum EditTools {
  "WEB" = "WEB",
  "DAYLIO_IMPORT" = "DAYLIO_IMPORT",
}
