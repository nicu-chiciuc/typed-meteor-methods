declare module "meteor/mdg:validated-method" {
  import { DDPCommon } from "meteor/ddp";
  import { Meteor } from "meteor/meteor";

  type FirstArgument<T> = T extends (val: infer R) => any ? R : never;

  type ValidatedMethodOptions<TRunArg, TRunReturn> = {
    name: string;
    mixins?: Function[];

    validate: ((args: TRunArg) => void) | null; // returned from SimpleSchemaInstance.validator() method;
    applyOptions?: {
      noRetry: boolean;
      returnStubValue: boolean;
      throwStubExceptions: boolean;
      onResultReceived: (result: any) => void;
      [key: string]: any;
    };
    run: (this: DDPCommon.MethodInvocation, arg: TRunArg) => TRunReturn;
  };

  export class ValidatedMethod<TRunArg, TRunReturn> {
    constructor(options: ValidatedMethodOptions<TRunArg, TRunReturn>);

    call(args: TRunArg): TRunReturn;
    call(
      args: TRunArg,
      callback: (error: Meteor.Error, result: TRunReturn) => void
    ): void;

    _execute(context: { [key: string]: any }, args: TRunArg): void;
  }
}
