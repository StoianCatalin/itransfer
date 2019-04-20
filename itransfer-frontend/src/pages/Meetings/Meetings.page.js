import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import './Meetings.scss';
import Divider from '@material-ui/core/Divider';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

class MeetingsPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  render() {
    return (
      <div className="meetings-container">
        <h2>Meetings</h2>
        <Divider />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Meeting name</TableCell>
              <TableCell>Guess</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell component="th" scope="row">Stand up</TableCell>
              <TableCell>Alex, Catalin</TableCell>
              <TableCell>Sala Pasilor pierduti</TableCell>
              <TableCell>12/03/2019 13:00</TableCell>
              <TableCell>
                <IconButton aria-label="Edit">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton aria-label="Delete">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <h4>Upcoming events</h4>
        <p>TO BE DISCUSSED</p>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {

  }
};

export default withRouter(connect(mapStateToProps)(MeetingsPage))


