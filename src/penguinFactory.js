const Penguin = require("./Penguin/Penguin");
const Mugger = require("./Penguin/Mugger");

module.exports = class PenguinCreate {
  constructor() {}
  make(role) {
    switch (role) {
      case "mugger":
        return new Mugger();
      case "Mugger":
        return new Mugger();
      default:
        return new Penguin();
    }
  }
};
