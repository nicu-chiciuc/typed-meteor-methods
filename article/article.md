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
