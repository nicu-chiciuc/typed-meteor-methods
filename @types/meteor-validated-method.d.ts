declare module "meteor/mdg:validated-method" {
  import { DDPCommon } from "meteor/ddp";
  import { Meteor } from "meteor/meteor";

  export type FirstArgument<T> = T extends (val: infer R) => any ? R : never;

  export type ValidatedMethodName<T> = T extends ValidatedMethod<any, any, infer R> ? R : never;
  export type ValidatedMethodArg<T> = T extends ValidatedMethod<infer R, any, any> ? R : never;
  export type ValidatedMethodReturn<T> = T extends ValidatedMethod<any, infer R, any> ? R : never;
  export type ValidatedMethodAsFunc<T extends ValidatedMethod<any, any, any>> = {
    [K in ValidatedMethodName<T>]: (arg: ValidatedMethodArg<T>) => ValidatedMethodReturn<T>;
  };

  type ValidatedMethodOptions<TRunArg, TRunReturn, TName extends string> = {
    // Force the name to be a string literal
    name: TName;
    mixins?: Function[];

    // 'ddp-rate-limiter-mixin', might be defined completely in a different file and imported here
    rateLimit?: {
      numRequests?: number;
      timeInterval?: number;
    };

    // CheckPermissionsMixin
    checkPermissions?: string[];

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

  export class ValidatedMethod<TRunArg, TRunReturn, TName extends string> {
    constructor(options: ValidatedMethodOptions<TRunArg, TRunReturn, TName>);

    call(args: TRunArg): TRunReturn;
    call(args: TRunArg, callback: (error: Meteor.Error, result: TRunReturn) => void): void;

    _execute(context: { [key: string]: any }, args: TRunArg): void;
  }
}
