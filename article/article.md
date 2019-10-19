ValidatedMethod package is the default wrapper around creating meteor methods.

// link to the repo here

# The setup

I've created a new meteor project using:

`meteor create --release 1.8.2-rc.0 --typescript typed-meteor-methods`

Specific release version is used to have access to the `--typescript` option.

Install ValidatedMethod package:
`meteor add mdg:validated-method`

Add file `/imports/api/methods/getRandomNumber.js`:

```javascript
import { ValidatedMethod } from "meteor/mdg:validated-method";

const getRandomNumber = new ValidatedMethod({
  name: "global.getRandomNumber",
  validate: () => {},
  run({ min, max }) {
    return Math.round(Math.random() * (max - min) + min);
  }
});
```

We could use SimpleSchema for the `validate` method but the focus should not be on that.

Import the method in `/server/main.ts`

```javascript
import "../imports/api/methods/getRandomNumber";
```

Change `App.tsx` contents:

```javascript
import React from "react";
import { Meteor } from "meteor/meteor";

export default class App extends React.Component {
  state = {
    randomNumber: null
  };

  componentWillMount() {
    Meteor.call(
      "global.getRandomNumber",
      { min: 5, max: 20 },
      (error: Meteor.Error, data: number) => {
        if (data) {
          this.setState({ randomNumber: data });
        }
      }
    );
  }

  render() {
    return (
      <div>
        Random number:
        {this.state.randomNumber === null ? "N/A" : this.state.randomNumber}
      </div>
    );
  }
}
```

![alt text](./img/simple_output.png "Screenshot")


```javascript
import { Meteor } from "meteor/meteor";
import { getRandomNumber } from "../imports/api/methods/getRandomNumber";

Meteor.startup(() => {
  console.log(getRandomNumber.call({ min: 4, max: 40 }));
});
```



# Typing the `call` method
Before trying to figure out a way to type the `Meteor.call`, let's start simple, by typing the `getRandomNumber.call()` in `/server/main.ts`.

I found the initial typings here:
https://github.com/meteor-typings/validated-method/blob/master/main.d.ts
They were created by Dave Allen.

The worked good enough, but it is possible to make them generic, so let's try that.

Since the type definitions are local we have more leeway in what we can do with them. Below is a modified version of the one linked above.

```ts
declare module "meteor/mdg:validated-method" {
  import { DDPCommon } from "meteor/ddp";
  import { Meteor } from "meteor/meteor";

  type ValidatedMethodOptions<TRunArg, TRunReturn> = {
    name: string;
    mixins?: Function[];

    validate: ((args: TRunArg) => void) | null;

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
```

`Meteor.call` methods can be passed multiple arguments but with `ValidatedMethod`, the standard is passing a single object with multiple properties. This makes it much easier to type since we have a type variable for teh input argument (`TRunArg`) and one for the return argument (`TReturn`).
Notice that `ValidatedMethod` can also be passed mixins in the constructor and those should be also typed, but they are beyond the scope of this article.

Typescript now knows how the method can be called directly and shows some suggestions:
![alt text](./img/call_info.png "Screenshot")

Before we move forward let's add a small wrapper over the `Meteor.call`.

## The `callAsync` wrapper
As per the documentation, `Meteor.call` should receive a string as the first argument, followed by some parameters to pass to the method, and at the end a callback can also be passed.
Instead of trying to work around this limitation a simple promise wrapper can be created:

```ts
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
```

This was introduced by one of my colleagues @barbaros and we found it to be very useful.
Instead of calling the `Meteor.call` in `App.tsx` and passing a callback, a promise can be used:

```ts
// Old way
Meteor.call(
  "global.getRandomNumber",
  { min: 5, max: 20 },
  (error: Meteor.Error, data: number) => {
    if (data) {
      this.setState({ randomNumber: data });
    }
  }
);

// New way
callAsync("global.getRandomNumber", { min: 5, max: 20 })
  .then(randomNumber => {
    this.setState({ randomNumber });
  })
  .catch(() => {})
```

This level of strong typing might prove enough for most people, and it did for us for some time. But, wouldn't it be nice for `callAsync` to know what method names were declared and what types can be passed and received.

# Typing APIs
In many aspects, meteor methods are similar to REST API calls. Since I didn't expect there to be many attempts at typing meteor methods, since meteor wasn't thought with Typescript in mind, I started to search for approaches of typing REST APIs using typescript.

Most of the articles and github repositories I've found relied on the existence of a global interface that contained all the data about the name, arguments and return values of all the REST endpoints.

This would be the smart approach forcing to catalogue all the methods by hand and afterwards keep them method api interface and the implementation in sync seemed like too much of a hastle. A better approach would be to leave the implementation as they are and extract the needed types for further use.

## Typing the name of the function

Now comes the cool part. The `ValidatedMethods` type definition has to be augmented so that it knows the name of the function as a string literal as opposed to a string.
Compared to most other typed languages, Typescript has the concept of string literals, which allows to, for example type semaphores colors like so:

```ts
const semaphore: 'yellow' | 'red' | 'green' = 'green';
```

An additional generic type variable seems to do the trick:

```ts
type ValidatedMethodOptions<TRunArg, TRunReturn, TName extends string> = {
  // Force the name to be a string literal
  name: TName;
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

export class ValidatedMethod<TRunArg, TRunReturn, TName extends string> {
  constructor(options: ValidatedMethodOptions<TRunArg, TRunReturn, TName>);

  call(args: TRunArg): TRunReturn;
  call(args: TRunArg, callback: (error: Meteor.Error, result: TRunReturn) => void): void;

  _execute(context: { [key: string]: any }, args: TRunArg): void;
}
```

Typescript correctly infers the type of name as a string literal instead of a string:
![alt text](./img/fully_typed_method.png "Screenshot")
The only thing that has to be typed is the argument to the run function, and maybe its return type if it has to be enforced.


### Notes on the TName
When I started writing this article I mistakenly assumed that Typescript is inferring the type of name as a simple string. To overcome this problem I had to do some tricks to enforce it.

We were using the following code:

```ts
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void)
  ? I
  : never;
export type CheckForUnion<T, TErr, TOk> = [T] extends [UnionToIntersection<T>] ? TOk : TErr;
```

and then type the `name` as follow:

```ts
type ValidatedMethodOptions<TRunArg, TRunReturn, TName extends string> = {
// Force the name to be a string literal
name: TName & CheckForUnion<TName, never, {}>;;

...
} 
```

You can read more in [this StackOverflow answer](https://stackoverflow.com/a/56375136/2659549)


# Creating a unified API
Even though each specific method is fully typed, we somehow need to gather all the instances and create a unified type so that `callAsync` knows what's going on.

The solution is inspired by the ["Strongly Typed Event Emitters with Conditional Types" article by Brian Terlson](https://medium.com/@bterlson/strongly-typed-event-emitters-2c2345801de8) in which proposes a solution for a similar problem for event emitters.

Below is an excerpt from the article:

```ts
// Gist: https://gist.github.com/bterlson/9d08928ee1147907e063e20ba95fc97f#file-medium-keyof-example-ts
interface Position { x: number, y: number };
interface Events {
  mouseMove: Position,
  done: void
}

// Same as Position, but using indexed access operator
type MouseMovePayloadType = Events['mouseMove'];

interface TypedEventEmitter<T> {
  on<K extends keyof T>(s: K, listener: (v: T[K]) => void);
  // and so on for each method
}

declare const myEventEmitter: TypedEventEmitter<Events>;

myEventEmitter.on('mouseMove', function (p) { })
myEventEmitter.on('done', function () { });

myEventEmitter.emit('mouseMove', { x: 1, y: 1 });
myEventEmitter.emit('done', undefined);
```

The keys in the `Events` interface represent the name of the events and the value represents the type of the value that should be passed and received from the an event of that specific name.
The most important part happens in the `on` method definition which has to be passed and argument of type `K` which should be a key in the `Events` interface. 

Applying this logic to the `ValidatedMethods` we could imagine an interface that could look like this:

```ts
interface TypedMethods {
  'global.getRandomNumber': (arg: {min: number; max: number}) => number;
  'global.getStringLength': (arg: string) => number;
}
```

In our case we have 2 values to take care of, the argument type and the return type. A natural choice is to store the value as a function type.

### Notes on tagged unions

A different approach would've been to use union types like so:
```ts
type TypedMethods =
  | {
      name: "global.getRandomNumber";
      arg: { min: number; max: number };
      ret: number;
    }
  | {
      name: "global.getStringLength";
      arg: string;
      ret: number;
    };
```

We use union types extensively in our project but for this particular problem they seemed to be harder to work with.

## Extracting the ValidatedMethod types
The problem now boils to somehow transform a type 
```ts
ValidatedMethod<{
    min: number;
    max: number;
}, number, "global.getRandomNumber">
```
to a 
```ts
{
  "global.getRandomNumber" : (arg: {min: number; max: number}) => number;
}  
```

Conditional types seem to be the only approach. We can extract each specific type using the following utility types:
```ts
export type ValidatedMethodName<T> = T extends ValidatedMethod<any, any, infer R> ? R : never;
export type ValidatedMethodArg<T> = T extends ValidatedMethod<infer R, any, any> ? R : never;
export type ValidatedMethodReturn<T> = T extends ValidatedMethod<any, infer R, any> ? R : never;
```

so that, for example the following test type
```ts
type Test = ValidatedMehodArg<typeof getRandomNumber>
```
would have the following type:
![alt text](./img/typed_test.png "Screenshot")

The other 2 generic types work in the same way. If you want more info about how the `infer` keyword works, check [Type inference in conditional types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-inference-in-conditional-types) in the official documentation.

### Assembling the new type
Since we can extract the generic type variable, we can assemble them back to our desired type like so:
```ts
export type ValidatedMethodAsFunc<T extends ValidatedMethod<any, any, any>> = {
  [K in ValidatedMethodName<T>]: (arg: ValidatedMethodArg<T>) => ValidatedMethodReturn<T>;
};
```
we can test this out and see that indeed it works correctly:
![alt text](./img/typed_test2.png "Screenshot")

### Constructing the final API
Since we can transform the `ValidatedMethod` generic type to our needed type all that is remained is to assemble all the types.

We can define a `methodTypes.d.ts` in the root of the `imports` folder. Since it will not contain any code that will actually run, it can use the `.d.ts` extension.

```ts
import {
  ValidatedMethod,
  ValidatedMethodAsFunc
} from "meteor/mdg:validated-method";
import { getRandomNumber } from "./api/methods/getRandomNumber";
import { getStringLength } from "./api/methods/getStringLength";

type KnownMethods = ValidatedMethodAsFunc<typeof getRandomNumber> &
  ValidatedMethodAsFunc<typeof getStringLength>;
```

## Typing `callAsync`
The `callAsync` wrapper defined earlier has to be updated so that it knows about this `KnownMethods` type:

```ts
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

```

This might be harder to digest but let's give it try. The `TName` should be one of the keys in `KnownMethods`, that is, it should be the name of one of the defined `ValidatedMethods`. It is the type of the `methodName` parameter.

The `FirstArgument` utility type is defined as follows:
```ts
export type FirstArgument<T> = T extends (val: infer R) => any ? R : never;
```
It is very similar to the `ValidatedMethodArg` defined previusly. It tries to extract the type of the first argument and returns the `never` type if it cannot.

The `ReturnType` is comes with Typescript but it could also be defined similarly:
```ts
// Origin: https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-inference-in-conditional-types
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```

`KnownMethods[TName]` returns the value of a specific function name from the `KnownMethods` type that we defined. For example if `TName` were to be `"global.getRandomNumber"`, then `KnownMethods[TName]` would've been `(arg: {min: number; max: number}) => number`.

Since we need just the type of the argument, we use `FirstArgument<KnownMethods[TName]>` whicuh would become `{min: number; max: number}` in our specific example.

The return value of `callAsync` is implied because we type the `Promise` constructor using `ReturnType<KnownMethods[TName]>`. The logic is the same as before.

The code of the function remains the same. One unfortunate thing is that the `Promise` accepts just one generic type. The `Meteor.call` callback doesn't return a simple `Error` but a `Meteor.Error` unfortunately we cannot capture this. You can find more about this in the [following github issue](https://github.com/microsoft/TypeScript/issues/6283).

### Testing the `callAsync`
Now that everything seems in place, we can check if it actually works as expected.
![alt text](./img/test_callAsync.png "Screenshot")
![alt text](./img/test_callAsync2.png "Screenshot")

It knows the type of the arguments that should be passed and it even errs when things are incorrect. Seems like a good combination.
