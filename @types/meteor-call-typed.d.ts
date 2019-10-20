import { KnownMethods } from "/imports/methodTypes";
import { Meteor } from "meteor/meteor";

declare module "meteor/meteor" {
  type FirstArgument<T> = T extends (val: infer R) => any ? R : never;

  module Meteor {
    function call<K extends keyof KnownMethods = keyof KnownMethods>(
      methodName: K,
      arg: FirstArgument<KnownMethods[K]>
    ): ReturnType<KnownMethods[K]>;

    function call<K extends keyof KnownMethods = keyof KnownMethods>(
      methodName: K,
      arg: FirstArgument<KnownMethods[K]>,
      callback: (error: Meteor.Error, data: ReturnType<KnownMethods[K]>) => void
    ): void;
  }
}
