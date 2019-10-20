import { Meteor } from "meteor/meteor";
import { KnownMethods } from "../methodTypes";
import { FirstArgument } from "meteor/mdg:validated-method";

type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

const callAsync = <K extends keyof KnownMethods = keyof KnownMethods>(
  methodName: K,
  arg: FirstArgument<KnownMethods[K]>
) =>
  new Promise<UnpackPromise<ReturnType<KnownMethods[K]>>>((resolve, reject) =>
    (Meteor.call as any)(methodName, arg, (error: Error, result: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    })
  );

export default callAsync;
