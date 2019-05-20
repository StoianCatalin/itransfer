import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import './UserEvents.scss';
import Divider from '@material-ui/core/Divider';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import EventsService from "../../services/events.service";
import {closeSnackbar, openSnackbar} from "../../actions/snackbar";
import CloseIcon from '@material-ui/icons/Close';
import Snackbar from "@material-ui/core/Snackbar";
import Icon from "@material-ui/core/Icon";

class UserEventsPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      selectedEvent: '',
      events: []
    };

    this.eventsService = new EventsService();
    this.fetchEvents();
  }

  fetchEvents() {
    this.eventsService.getEventsUser().then((response) => {
      this.setState({
        events: response.data,
      });
    });
  }

  handleClickOpen = (event) => {
    this.setState({
      open: true,
      selectedEvent: event,
    });
  };

  handleClickClose = () => {
    this.setState({
      open: false,
      selectedEvent: null,
    });
  };

  signInToEvent = () => {
    this.eventsService.signUpEvent(this.state.selectedEvent.id).then((response) => {
      this.props.openSnackbar(response.data.message);
      this.handleClickClose();
      setTimeout(() => {
        this.props.closeSnackbar();
      }, 3000);
    });
  };

  render() {
    return (
      <div className="meetings-container">
        <h2 className="meetings-header">
          Upcoming events
        </h2>
        <Divider />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Start date</TableCell>
              <TableCell>End date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { this.state.events.map((event) => {
              return (
                <TableRow>
                  <TableCell component="th" scope="row">{ event.name }</TableCell>
                  <TableCell>{ event.location }</TableCell>
                  <TableCell align="left">{ event.startDate + " " + event.startTime }</TableCell>
                  <TableCell align="left">{ event.endDate + " " + event.endTime }</TableCell>
                  <TableCell>
                    <IconButton aria-label="Delete" onClick={() => { this.handleClickOpen(event) }}>
                      <Icon>style</Icon>
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            }) }
          </TableBody>
        </Table>

        <Dialog
          open={this.state.open}
          onClose={this.handleClickClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Do you want to sign in to this event?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This event is going to be added in your calendar.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClickClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={() => { this.signInToEvent(); }} color="primary" autoFocus>
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          open={this.props.snackbar.open}
          autoHideDuration={6000}
          onClose={this.handleClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{ this.props.snackbar.message }</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={this.props.closeSnackbar}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    openSnackbar: (message) => {
      dispatch(openSnackbar(message));
    },
    closeSnackbar: () => {
      dispatch(closeSnackbar());
    }
  };
};

const mapStateToProps = state => {
  return {
    snackbar: state.snackbar,
  }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UserEventsPage))


