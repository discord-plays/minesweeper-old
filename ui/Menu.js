class Menu {
  constructor(controller) {
    this.widgets = [];
    this.controller = controller;
    this.title = "";
    this.color = 0xff0000;
    this.description = "";
  }

  addWidget(widget) {
    this.widgets.push(widget);
    return widget;
  }

  addTextWidget() {
    return this.addWidget(new Textbox(this));
  }

  addArrayInputWidget() {
    return this.addWidget(new ArrayInput(this));
  }

  addBooleanInputWidget() {
    return this.addWidget(new BooleanInput(this));
  }

  addFloatInputWidget() {
    return this.addWidget(new FloatInput(this));
  }

  addIntegerInputWidget() {
    return this.addWidget(new IntegerInput(this));
  }

  addStringInputWidget() {
    return this.addWidget(new StringInput(this));
  }

  generateRichEmbed() {
    const embed = new MessageEmbed()
      .setTitle(this.title)
      .setColor(this.color)
      .setDescription(this.description);
    
    let o=[];
    for(let i=0;i<this.widgets;i++) o.push();
    message.channel.send(embed);
  }

  sendTo(textChannel) {
    textChannel.send(this.generateRichEmbed());
  }

  destroy() {
    this.controller.destroyMenu(this);
  }
}