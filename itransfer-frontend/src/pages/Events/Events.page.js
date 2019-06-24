import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import './Events.scss';
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Table from "@material-ui/core/Table";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContentText from "@material-ui/core/DialogContentText";
import {Textbox} from "react-inputs-validation";
import { MuiPickersUtilsProvider, DatePicker, TimePicker } from 'material-ui-pickers';
import DateFnsUtils from "@date-io/date-fns";
import EventsService from "../../services/events.service";
import CloseIcon from '@material-ui/icons/Close';
import Snackbar from "@material-ui/core/Snackbar";
import {closeSnackbar, openSnackbar} from "../../actions/snackbar";

class EventsPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      events: [],
      openEditEventModal: false,
      openDeleteEventModal: false,
      selectedEvent: {},
      formValidation: {
        name: false,
        price: false,
        location: false,
      },
    };

    this.eventsService = new EventsService();

    this.fetchEvents();
  }

  fetchEvents() {
    this.eventsService.getEvents().then((response) => {
      if (response.status === 200) {
        this.setState({ events: response.data });
      }
    });
  }

  openEditEventModal = (e) => {
    const event = { ...e };
    if (event.startTime) {
      event.startTime = new Date(event.startDate + " " + event.startTime);
    }
    if (event.endTime) {
      event.endTime = new Date(event.endDate + " " + event.endTime);
    }
    this.setState({
      openEditEventModal: true,
      selectedEvent: event,
    });
  };

  closeEditEventModal = () => {
    this.setState({
      openEditEventModal: false,
      selectedEvent: {},
    });
  };

  openDeleteEventModal = (event) => {
    this.setState({
      openDeleteEventModal: true,
      selectedEvent: event,
    });
  };

  closeDeleteEventModal = () => {
    this.setState({
      openDeleteEventModal: false,
      selectedEvent: {},
    });
  };

  deleteEvent = () => {
    this.eventsService.deleteEvent(this.state.selectedEvent.id).then((response) => {
      this.props.openSnackbar(response.data.message);
      this.closeDeleteEventModal();
      this.fetchEvents();
    });
  };

  handleStartDateChange = (value) => {
    this.setState({
      selectedEvent: {...this.state.selectedEvent, startDate: value}
    });
  };

  handleStartTimeChange = (value) => {
    this.setState({
      selectedEvent: {...this.state.selectedEvent, startTime: value}
    });
  };

  handleEndDateChange = (value) => {
    this.setState({
      selectedEvent: {...this.state.selectedEvent, endDate: value}
    });
  };

  handleEndTimeChange = (value) => {
    this.setState({
      selectedEvent: {...this.state.selectedEvent, endTime: value}
    });
  };

  submit = () => {
    const { name, price, location } = this.state.formValidation;
    if(!name && !price && !location) {
      const payload = {
        ...this.state.selectedEvent,
        startDate: new Date(this.state.selectedEvent.startDate).toLocaleDateString(),
        startTime: new Date(this.state.selectedEvent.startTime).toLocaleTimeString(),
        endDate: new Date(this.state.selectedEvent.endDate).toLocaleDateString(),
        endTime: new Date(this.state.selectedEvent.endTime).toLocaleTimeString(),
      };
      if (payload.id) {
        this.eventsService.editEvent(payload).then((response) => {
          this.props.openSnackbar(response.data.message);
          this.closeEditEventModal();
          this.fetchEvents();
        });
      } else {
        this.eventsService.createEvent(payload).then((response) => {
          this.props.openSnackbar(response.data.message);
          this.closeEditEventModal();
          this.fetchEvents();
          setTimeout(() => {
            this.props.closeSnackbar();
          }, 3000);
        });
      }
    }

  };

  render() {
    return (
      <div className="events-container">
        <div className="add-button-container">
          <Button variant="contained" color="primary" onClick={ () => { this.openEditEventModal({}) } }>
            Create
          </Button>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">Event name</TableCell>
              <TableCell align="left">Start date</TableCell>
              <TableCell align="left">End date</TableCell>
              <TableCell align="left">Location</TableCell>
              <TableCell align="left">Price</TableCell>
              <TableCell align="left">No. of attenders</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { this.state.events.map((event) => {
              return (
                <TableRow key={1}>
                  <TableCell align="left">{ event.name }</TableCell>
                  <TableCell align="left">{ event.startDate + " " + event.startTime }</TableCell>
                  <TableCell align="left">{ event.endDate + " " + event.endTime }</TableCell>
                  <TableCell align="left">{ event.location }</TableCell>
                  <TableCell align="left">{ event.price === 0 ? 'Free' : (event.price + " euro") }</TableCell>
                  <TableCell align="left">{ event.attenders.length }</TableCell>
                  <TableCell component="th" scope="row">
                    <IconButton aria-label="Edit" onClick={() => { this.openEditEventModal(event) }}>
                      <Icon>edit</Icon>
                    </IconButton>
                    <IconButton aria-label="Delete" onClick={() => { this.openDeleteEventModal(event) }}>
                      <Icon>delete</Icon>
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            }) }
          </TableBody>
        </Table>
        <Dialog
          open={this.state.openEditEventModal} onClose={this.closeEditEventModal} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">{ this.state.selectedEvent.id ? 'Edit' : 'Create' } event</DialogTitle>
          <DialogContent>
            <div className="edit-staff-form">
              <Textbox
                id={'name'}
                name={'name'}
                type="text"
                value={this.state.selectedEvent.name}
                validate={true}
                onChange={(name) => { this.setState({ selectedEvent: { ...this.state.selectedEvent, name } }); }}
                placeholder="Event name"
                validationCallback={name => { this.setState({ formValidation: { ...this.state.formValidation, name } }) } }
                onBlur={() => {}}
                validationOption={{
                  name: 'Event name',
                  check: true,
                  required: true
                }}
                classNameInput="staff-edit-input"
              />
              <Textbox
                id={'location'}
                name={'location'}
                type="text"
                value={this.state.selectedEvent.location}
                validate={true}
                onChange={(location) => { this.setState({ selectedEvent: { ...this.state.selectedEvent, location } }); }}
                placeholder="Event location"
                validationCallback={location => { this.setState({ formValidation: { ...this.state.formValidation, location } }) } }
                onBlur={() => {}}
                validationOption={{
                  name: 'Event location',
                  check: true,
                  required: true
                }}
                classNameInput="staff-edit-input"
              />
              <Textbox
                id={'price'}
                name={'price'}
                type="number"
                value={this.state.selectedEvent.price}
                validate={true}
                onChange={(price) => { this.setState({ selectedEvent: { ...this.state.selectedEvent, price } }); }}
                placeholder="Event price"
                validationCallback={price => { this.setState({ formValidation: { ...this.state.formValidation, price } }) } }
                onBlur={() => {}}
                validationOption={{
                  name: 'Event price',
                  check: true,
                  required: true
                }}
                classNameInput="staff-edit-input"
              />
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  margin="normal"
                  label="Start date"
                  disablePast={true}
                  value={this.state.selectedEvent.startDate}
                  onChange={this.handleStartDateChange}
                />
              </MuiPickersUtilsProvider>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <TimePicker
                  margin="normal"
                  label="Start time"
                  disablePast={true}
                  value={this.state.selectedEvent.startTime}
                  onChange={this.handleStartTimeChange}
                />
              </MuiPickersUtilsProvider>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  margin="normal"
                  label="End date"
                  disablePast={true}
                  value={this.state.selectedEvent.endDate}
                  onChange={this.handleEndDateChange}
                />
              </MuiPickersUtilsProvider>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <TimePicker
                  margin="normal"
                  label="End time"
                  disablePast={true}
                  value={this.state.selectedEvent.endTime}
                  onChange={this.handleEndTimeChange}
                />
              </MuiPickersUtilsProvider>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeEditEventModal} variant="outlined" color="primary">
              Close
            </Button>
            <Button onClick={() => { this.submit(); }} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openDeleteEventModal}
          onClose={this.closeDeleteEventModal}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This action can not be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeDeleteEventModal} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.deleteEvent} color="primary" autoFocus>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EventsPage))


