export class MapValueConverter {
  toView(array: any[], lookup: Map<any, any>) {
    return array.map((val) => lookup.get(val) || val);
  }
}
