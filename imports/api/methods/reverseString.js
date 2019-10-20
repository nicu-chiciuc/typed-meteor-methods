// @ts-check
import { ValidatedMethod } from "meteor/mdg:validated-method";

const reverseString = new ValidatedMethod({
  name: "global.reverseString",

  validate: null,

  /** @param {string} str */
  run(str) {
    return str.split('').reverse().join('');
  }
});

export { reverseString };
