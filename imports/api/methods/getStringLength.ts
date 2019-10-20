import { ValidatedMethod } from "meteor/mdg:validated-method";

const getStringLength = new ValidatedMethod({
  name: "global.getStringLength",

  validate: null,

  run(str: string) {
    return Promise.resolve(str.length);
  }
});

export { getStringLength };
