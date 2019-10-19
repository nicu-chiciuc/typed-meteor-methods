import { Meteor } from "meteor/meteor";
import { KnownMethods } from "../methodTypes";
import { FirstArgument } from "meteor/mdg:validated-method";

const callAsync = <TName extends keyof KnownMethods = keyof KnownMethods>(
  methodName: TName,
  arg: FirstArgument<KnownMethods[TName]>
) =>
  new Promise<ReturnType<KnownMethods[TName]>>((resolve, reject) =>
    Meteor.call(methodName, arg, (error: Error, result: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    })
  );

export default callAsync;
