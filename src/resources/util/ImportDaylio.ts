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
    let activitiesToMap = new Map();
    let moodsToMap = new Map();
    for (const row of data) {
      const daylioActivities =
        row.activities !== "" ? row.activities.split(" | ") : [];
      let mappedActivities = new Map();
      moodsToMap.set(row.mood, 1);

      daylioActivities.forEach((activity) => {
        activitiesToMap.set(activity, 1);
        if (activityMappings.has(activity)) {
          let mapping = activityMappings.get(activity);
          if (!mappedActivities.has(mapping)) mappedActivities.set(mapping, 0);
          mappedActivities.set(mapping, mappedActivities.get(mapping) + 1);
        }
      });

      const full_date = row.full_date.trim();
      const [year, month, day] = full_date.split("-");
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
      };
      results.push(entry);
    }
    return {
      entries: results,
      moodsToMap: Array.from(moodsToMap.keys()),
      activitiesToMap: Array.from(activitiesToMap.keys()),
    };
  }
}
