export interface IStatsActivityEntry {
  count: number;
  detailsUsed?: Map<string, IStatsDetailEntry>;
  dates: string[];
}
export interface IStatsDetailEntry {
  count: number;
  text: string;
  dates: string[];
}
