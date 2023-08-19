export class Helpers {
  public static isNumeric(str) {
    if (typeof str == "number") return true;
    if (typeof str !== "string") return false; // we only process strings!
    return (
      !isNaN(str as any) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
  }
  public static strMapToObj(strMap) {
    let obj = Object.create(null);
    strMap.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  }
  public static ObjToStrMap(obj) {
    let map = new Map();
    for (let k in obj) {
      map.set(k, obj[k]);
    }
    return map;
  }
}
