export interface IEntry {
  userId?: any;
  activitiesArray?: string[];
  day?: number;
  month?: number;
  year?: number;
  updated?: Date;
  created?: Date;
  id?: string;
  date: string;
  mood: string;
  activities: Map<string, IActivityDetail>;
  note: string;
}
export type IActivityDetail = number | string[];
