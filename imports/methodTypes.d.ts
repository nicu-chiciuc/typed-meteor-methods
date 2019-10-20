import {
  ValidatedMethod,
  ValidatedMethodAsFunc
} from "meteor/mdg:validated-method";
import { getRandomNumber } from "./api/methods/getRandomNumber";
import { getStringLength } from "./api/methods/getStringLength";
import { reverseString } from "./api/methods/reverseString";

type KnownMethods = ValidatedMethodAsFunc<typeof getRandomNumber> &
  ValidatedMethodAsFunc<typeof getStringLength> &
  ValidatedMethodAsFunc<typeof reverseString>;
