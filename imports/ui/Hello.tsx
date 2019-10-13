import React from "react";
import { Meteor } from "meteor/meteor";

export default class Hello extends React.Component {
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
        <p>
          Random number:{" "}
          {this.state.randomNumber === null ? "N/A" : this.state.randomNumber}
        </p>
      </div>
    );
  }
}
