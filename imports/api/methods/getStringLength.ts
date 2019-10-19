import { ValidatedMethod } from "meteor/mdg:validated-method";

const getStringLength = new ValidatedMethod({
  name: "global.getStringLength",

  validate: () => {},

  run(str: string) {
    return str.length;
  }
});

export { getStringLength };
