import {
  ValidatedMethod,
  ValidatedMethodAsFunc
} from "meteor/mdg:validated-method";
import { getRandomNumber } from "./api/methods/getRandomNumber";
import { getStringLength } from "./api/methods/getStringLength";

type KnownMethods = ValidatedMethodAsFunc<typeof getRandomNumber> &
  ValidatedMethodAsFunc<typeof getStringLength>;
