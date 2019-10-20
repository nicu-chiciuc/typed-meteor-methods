import React from "react";
import { Meteor } from "meteor/meteor";
import callAsync from "../utils/callAsync";

export default class App extends React.Component {
  state = {
    randomNumber: null
  };

  componentWillMount() {
    // Meteor.call(
    //   "global.getRandomNumber",
    //   { min: 5, max: 20 },
    //   (error: Meteor.Error, data: number) => {
    //     if (data) {
    //       this.setState({ randomNumber: data });
    //     }
    //   }
    // );

    callAsync("global.getRandomNumber", { min: 5, max: 20 })
      .then(randomNumber => {
        this.setState({ randomNumber });
      })
      .catch(() => {});

    callAsync("global.reverseString", "something").then(value => {
      console.log(value);
    });

    Meteor.call("global.getRandomNumbe", { min: 4, max: 5 }, (error, data) => {
      console.log(data);
    });

    callAsync("global.getStringLength", "something").then(len => {
      console.log(len);
    });
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
