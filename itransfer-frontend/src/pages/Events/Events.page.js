import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import './Events.scss';

class EventsPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  render() {
    return (
      <div className="spaces-container">
        <div className="row">
          <div className="room large">Room 1</div>
          <div className="room medium">Room 2</div>
          <div className="room small">Room 3</div>
          <div className="room large">Room 4</div>
        </div>
        <div className="row">
          <div className="room small">Room 1</div>
          <div className="room large">Room 2</div>
          <div className="room small">Room 3</div>
          <div className="room medium">Room 4</div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {

  }
};

export default withRouter(connect(mapStateToProps)(EventsPage))


