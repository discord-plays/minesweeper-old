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
   * Calculate the new value after being affected by the current mine for the number cell with value "a"
   */
  calculateValue(a) {
    throw new Error("Default Value Error: virtual method calculateValue()");
  }

  /*
   * Get the coordinates of all the cells affected by 
   */
  affectedCells(x,y) {
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
}

module.exports = Mine;
