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
