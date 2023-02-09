import { IEntry } from "./../elements/entry/entry.interface";
export interface IStatsActivityEntry {
  count: number;
  detailsUsed?: Map<string, IStatsDetailEntry>;
  dates: { date: string; entry: IEntry }[];
}
export interface IStatsDetailEntry {
  count: number;
  text: string;
  dates: { date: string; entry: IEntry }[];
}
