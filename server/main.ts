import { Meteor } from "meteor/meteor";
import { getRandomNumber } from "../imports/api/methods/getRandomNumber";

Meteor.startup(() => {

  
  const randomNumber = getRandomNumber.call({ min: 4, max: 40 });

  console.log(randomNumber);
});
