export interface IEntry {
  day?: number;
  updated?: Date;
  created?: Date;
  id?: string;
  date: string;
  mood: string;
  activities: Map<string, any>; //number or []
  note: string;
}
