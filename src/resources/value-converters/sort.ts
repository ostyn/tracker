export class SortValueConverter {
  toView(array, property, direction = "asc") {
    if (!array) return array;
    const factor = direction.match(/^desc*/i) ? 1 : -1;
    const retvalue = array.sort((a, b) => {
      const textA: string =
        a[property] && a[property].toUpperCase
          ? a[property].toUpperCase()
          : a[property];
      const textB: string =
        b[property] && a[property].toUpperCase
          ? b[property].toUpperCase()
          : b[property];
      return textA < textB ? factor : textA > textB ? -factor : 0;
    });
    return retvalue;
  }
}
