import { ValidatedMethod } from "meteor/mdg:validated-method";


const getRandomNumber = new ValidatedMethod({
  name: "global.getRandomNumber",

  validate: null,

  run({ min, max }: { min: number; max: number }) {
    return Math.round(Math.random() * (max - min) + min);
  }
});

export { getRandomNumber };
