import { Meteor } from "meteor/meteor";
import { getRandomNumber } from "../imports/api/methods/getRandomNumber";

Meteor.startup(() => {
  console.log(getRandomNumber.call({ min: 4, max: 40 }));
});
