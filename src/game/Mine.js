const uniqueBy = require('../utils/uniqueBy');

class Mine {
  constructor(id, name, priority) {
    this.id = id;
    this.alias = [name];
    this.name = name;
    this.priority = priority;
    
    // A reference to the mod which is set when adding the mine to the pool
    this.mod;
  }

  /*
   * Returns all values in alias after running toLowerCase() on each of them
   */
  getAlias() {
    return this.alias.map(x=>x.toString().toLowerCase());
  }

  /*
   * Calculate the new value for the extra property
   */
  calculateExtra(a) {
    // Ignore
    return "";
  }

  /*
   * Calculate the new value after being affected by the current mine for the number cell with value "a"
   */
  calculateValue(a) {
    throw new Error("Default Value Error: virtual method calculateValue()");
  }

  /*
   * Get the coordinates of all the cells affected by 
   */
  affectedCells(x,y,w,h) {
    throw new Error("Default Value Error: virtual method affectedCells()");
  }

  /*
   * Gets the texture for the mine
   */
  getMineTexture(texturepack) {
    throw new Error("Default Value Error: virtual method getMineTexture()");
  }

  /*
   * Gets the texture for the flag for this mine
   */
  getFlagTexture(texturepack) {
    throw new Error("Default Value Error: virtual method getFlagTexture()");
  }

  /*
   * Returns HTML to embed for inputting the options for generating this mine
   * This can be overridden for a custom input or custom styles
   */
  getMineGeneratorEmbed() {
    return `<li>${this.name}: <input class="mine-generator-embed" mineid="${this.id}" type="number"></li>`;
  }

  /*
   * Method to merge multiple coordinate lists
   */
  mergeBoxes(arr,arr2) {
    // Test JS Fiddle: https://jsfiddle.net/mrmelon54/hrstbxyw/3/
    let a = [...arr, ...arr2];
    return uniqueBy(a, x=>`(${x[0]},${x[1]})`);
  }

  /*
   * Default affected cells for 3x3 box
   */
  default3x3Box(x, y) {
    return [
      [x - 1, y - 1], // top left
      [x, y - 1], // top middle
      [x + 1, y - 1], // top right
      [x - 1, y], // middle left
      [x + 1, y], // middle right
      [x - 1, y + 1], // bottom left
      [x, y + 1], // bottom middle
      [x + 1, y + 1] // bottom right
    ];
  }

  /*
   * Default affected cells for a + shape
   */
  plusBox(x, y, w, h) {
    // Test JS Fiddle: https://jsfiddle.net/mrmelon54/yuekmnoj/5/
    let a = [];
    for(let i=0; i<x; i++) a.push([i,y]);
    for(let i=x+1; i<w; i++) a.push([i,y]);
    for(let i=0; i<y; i++) a.push([x,i]);
    for(let i=y+1; i<h; i++) a.push([x,i]);
    return a;
  }

  /*
   * Default affected cells for a x shape
   */
  diagonalBox(x, y, w, h) {
    // Test JS Fiddle: https://jsfiddle.net/mrmelon54/gfeu1kzt/2/
    let a = [];

    let i = 1;
    while (true) {
      let px = x - i;
      let py = y - i;
      if (px < 0 || py < 0) break;
      a.push([px, py]);
      i++;
    }

    i = 1;
    while (true) {
      let px = x + i;
      let py = y + i;
      if (px >= w || py >= h) break;
      a.push([px, py]);
      i++;
    }

    i = 1;
    while (true) {
      let px = x - i;
      let py = y + i;
      if (px < 0 || py >= h) break;
      a.push([px, py]);
      i++;
    }

    i = 1;
    while (true) {
      let px = x + i;
      let py = y - i;
      if (px >= w || py < 0) break;
      a.push([px, py]);
      i++;
    }

    return a;
  }
}

module.exports = Mine;
