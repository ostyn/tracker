export interface IEntry {
  id?: string;
  date: string;
  mood: string;
  activities: Map<string, any>; //number or []
  note: string;
}
