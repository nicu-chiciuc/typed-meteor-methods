import { ValidatedMethod } from "meteor/mdg:validated-method";

const getRandomNumber = new ValidatedMethod({
  name: "global.getRandomNumber",

  validate: () => {},

  run({ min, max }) {
    return Math.round(Math.random() * (max - min) + min);
  }
});
