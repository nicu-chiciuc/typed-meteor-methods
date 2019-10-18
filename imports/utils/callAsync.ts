import { Meteor } from "meteor/meteor";

const callAsync = (methodName: string, arg: any) =>
  new Promise<any>((resolve, reject) =>
    Meteor.call(methodName, arg, (error: Meteor.Error, result: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    })
  );

export default callAsync;
