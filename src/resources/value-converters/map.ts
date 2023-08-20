export class MapValueConverter {
  toView(array: any[], lookup: Map<any, any>) {
    if (!array) return [];
    return array.map((val) => lookup.get(val) || val);
  }
}
