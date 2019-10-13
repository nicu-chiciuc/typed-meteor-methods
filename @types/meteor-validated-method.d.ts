// Type definitions for mdg:validated-method meteor package
// Project: https://atmospherejs.com/mdg/validated-method
// Definitions by:  Dave Allen <https://github.com/fullflavedave>


interface ValidatedMethod_Static {
  new(options: {
    name: string;
    mixins?: Function[];
    validate: (args: { [key: string]: any; }) => void; // returned from SimpleSchemaInstance.validator() method;
    applyOptions?: {
      noRetry: boolean;
      returnStubValue: boolean;
      throwStubExceptions: boolean;
      onResultReceived: (result: any) => void;
      [key: string]: any };
    run: (args: { [key: string]: any; }) => void;
  }): ValidatedMethod_Instance;
}

interface ValidatedMethod_Instance {
  call(args: { [key: string]: any; }, cb?: (error: any, result: any) => void ): void;
  _execute(context: { [key: string]: any; }, args: { [key: string]: any; }): void;
}

declare const ValidatedMethod: ValidatedMethod_Static;

declare module 'meteor/mdg:validated-method' {
  export const ValidatedMethod: ValidatedMethod_Static;
}