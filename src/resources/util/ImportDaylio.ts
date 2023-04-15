import { EditTools } from "./../elements/entry/entry.interface";
import * as Papa from "papaparse";
import { IEntry } from "resources/elements/entry/entry.interface";
import { parse } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

export class ImportDaylio {
  static parseCsv(
    csvString: string,
    m_Mappings: Map<string, string>,
    a_Mappings: Map<string, string>
  ): { entries: IEntry[]; moodsToMap: string[]; activitiesToMap: string[] } {
    let moodMappings = new Map(m_Mappings);
    let activityMappings = new Map(a_Mappings);
    const results: IEntry[] = [];
    const data: any[] = Papa.parse(csvString, {
      header: true,
    }).data;
    let activitiesToMap = new Set<string>();
    let moodsToMap = new Set<string>();
    for (const row of data) {
      const daylioActivities =
        row.activities !== "" ? row.activities.split(" | ") : [];
      let mappedActivities = new Map();
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
      year = Number.parseInt(year);
      month = Number.parseInt(month);
      day = Number.parseInt(day);
      const dateTimeString = full_date + " " + row.time;
      const parsedDate = parse(dateTimeString, "yyyy-MM-dd HH:mm", new Date());
      const timeZone = "America/Denver";
      const zonedDate = utcToZonedTime(parsedDate, timeZone);

      const entry: IEntry = {
        activitiesArray: Array.from(mappedActivities.keys()),
        activities: mappedActivities,
        day,
        month,
        year,
        date: full_date,
        mood: moodMappings.get(row.mood),
        note: row.note_title ? row.note_title + "\n\n" + row.note : row.note,
        created: zonedDate,
        createdBy: EditTools.DAYLIO_IMPORT,
        lastUpdatedBy: EditTools.DAYLIO_IMPORT,
      };
      results.push(entry);
    }
    return {
      entries: results,
      moodsToMap: Array.from(moodsToMap),
      activitiesToMap: Array.from(activitiesToMap),
    };
  }
}
