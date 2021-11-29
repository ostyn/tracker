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
  activities: Map<string, any>; //number or []
  note: string;
}
