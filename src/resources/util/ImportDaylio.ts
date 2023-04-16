import { EditTools } from "./../elements/entry/entry.interface";
import * as Papa from "papaparse";
import { IEntry } from "resources/elements/entry/entry.interface";
import { parse } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

export class ImportDaylio {
  static parseCsv(
    csvString: string,
    moodMappings: Map<string, string>,
    activityMappings: Map<string, string>
  ): { entries: IEntry[]; moodsToMap: string[]; activitiesToMap: string[] } {
    const entries: IEntry[] = [];
    const rows: any[] = Papa.parse(csvString, {
      header: true,
    }).data;
    let activitiesToMap = new Set<string>();
    let moodsToMap = new Set<string>();
    for (const row of rows) {
      const daylioActivities = row.activities.split(" | ");
      const mappedActivities = new Map();
      moodsToMap.add(row.mood);

      daylioActivities.forEach((activity) => {
        activitiesToMap.add(activity);
        if (
          activityMappings.has(activity) &&
          activityMappings.get(activity) !== undefined
        ) {
          let mapping = activityMappings.get(activity);
          if (!mappedActivities.has(mapping)) mappedActivities.set(mapping, 0);
          mappedActivities.set(mapping, mappedActivities.get(mapping) + 1);
        }
      });

      const full_date = row.full_date.trim();
      let [year, month, day] = full_date.split("-");
      const parsedDate = parse(
        `${full_date} ${row.time}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );
      const timeZone = "America/Denver";
      const zonedDate = utcToZonedTime(parsedDate, timeZone);

      const entry: IEntry = {
        activitiesArray: Array.from(mappedActivities.keys()),
        activities: mappedActivities,
        day: Number.parseInt(day),
        month: Number.parseInt(month),
        year: Number.parseInt(year),
        date: full_date,
        mood: moodMappings.get(row.mood),
        note: row.note_title ? row.note_title + "\n\n" + row.note : row.note,
        created: zonedDate,
        createdBy: EditTools.DAYLIO_IMPORT,
        lastUpdatedBy: EditTools.DAYLIO_IMPORT,
      };
      entries.push(entry);
    }
    return {
      entries: entries,
      moodsToMap: Array.from(moodsToMap),
      activitiesToMap: Array.from(activitiesToMap),
    };
  }
}
