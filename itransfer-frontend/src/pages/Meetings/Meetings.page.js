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
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Textbox} from "react-inputs-validation";
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import EventsService from "../../services/events.service";
import {closeSnackbar, openSnackbar} from "../../actions/snackbar";
import CloseIcon from '@material-ui/icons/Close';
import Snackbar from "@material-ui/core/Snackbar";

class MeetingsPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      eventSelected: '',
      openCalendarView: false,
      openConfirmationDialog: false,
      name: '',
      attenders: [],
      attendersValidate: [],
      room: {},
      startDate: '',
      endDate: '',
      rooms: [],
      meetings: []
    };

    this.eventsService = new EventsService();
    this.fetchRooms();
  }

  fetchMeetings() {
    this.eventsService.getMeetings().then((response) => {
      this.setState({
        meetings: response.data,
      });
    });
  }

  fetchRooms() {
    this.eventsService.getRooms().then((response) => {
      this.setState({
        rooms: response.data,
      }, () => {
        this.fetchMeetings();
      });
    });
  }

  handleChange = (event) => {
    this.setState({
      room: this.state.rooms.find((room) => room.id === event.target.value),
    });
  };

  viewCalendarOpen = () => {
    this.setState({
      openCalendarView: true,
    })
  };

  viewCalendarClose = () => {
    this.setState({
      openCalendarView: false,
    })
  };

  handleClickOpen = () => {
    this.setState({
      open: true,
    });
  };

  handleClickClose = () => {
    this.setState({
      open: false,
    });
  };

  handleDeleteConfirmation = () => {
    this.eventsService.deleteMeeting(this.state.eventSelected).then((response) => {
      this.props.openSnackbar(response.data.message);
      this.setState({ openConfirmationDialog: false });
      this.fetchMeetings();
    });
  };

  handleCloseConfirmationDialog = () => {
    this.setState({
      openConfirmationDialog: false,
    })
  };

  startDeletingEvent(eventId) {
    this.setState({
      eventSelected: eventId,
      openConfirmationDialog: true,
    });
  }

  submit() {
    const { attenders, startDate, endDate, room, name } = this.state;
    if (attenders.length && startDate && endDate && room.id && name) {
      this.eventsService.createMeeting({
        attenders,
        startDate,
        endDate,
        name,
        roomId: room.id,
      }).then((response) => {
        if (response.status === 200) {
          this.props.openSnackbar(response.data.message);
          this.setState({ open: false });
          this.fetchMeetings();
        } else {
          this.props.openSnackbar(response.data.message);
        }
      });
    }
  }

  renderAttendersForm() {
    const fields = [];
    for (let i = 0; i <= this.state.attenders.length; i++) {
      fields.push(
        <Textbox
          classNameInput="meetings-input"
          id={'email' + i}
          name={'email' + i}
          type="text"
          value={this.state.attenders[i]}
          validate={true}
          onChange={(email) => {
            const attenders = this.state.attenders;
            attenders[i] = email;
            this.setState({ attenders: attenders });
          }}
          placeholder="Email"
          validationCallback={email => {
            const attendersValidate = this.state.attendersValidate;
            attendersValidate[i] = email;
            this.setState({ attendersValidate: attendersValidate })
          } }
          onBlur={() => {}}
          validationOption={{
            name: 'Email',
            check: true,
            required: false,
            customFunc: email => {
              const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
              if (!email || reg.test(String(email).toLowerCase())) {
                return true;
              } else {
                return 'Is not a valid email address';
              }
            }
          }}
        />
      );
    }
    return fields;
  }

  render() {
    return (
      <div className="meetings-container">
        <h2 className="meetings-header">
          Meetings
          <div>
            <Button color="primary" onClick={this.viewCalendarOpen}>
              View calendar
            </Button>&nbsp;&nbsp;
            <Button variant="outlined" color="primary" onClick={this.handleClickOpen}>
              Create meeting
            </Button>
          </div>
        </h2>
        <Divider />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Meeting name</TableCell>
              <TableCell>Guess</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Start date</TableCell>
              <TableCell>End date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { this.state.meetings.map((meeting) => {
              return (
                <TableRow>
                  <TableCell component="th" scope="row">{ meeting.name }</TableCell>
                  <TableCell>{ meeting.attenders }</TableCell>
                  <TableCell>{ this.state.rooms.find((room) => room.id === meeting.roomId).name }</TableCell>
                  <TableCell>{ new Date(meeting.startDate).toLocaleDateString() + " " + new Date(meeting.startDate).toLocaleTimeString() }</TableCell>
                  <TableCell>{ new Date(meeting.endDate).toLocaleDateString() + " " + new Date(meeting.endDate).toLocaleTimeString() }</TableCell>
                  <TableCell>
                    <IconButton aria-label="Delete" onClick={() => { this.startDeletingEvent(meeting.id) }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            }) }
          </TableBody>
        </Table>
        <h4>Upcoming events</h4>
        <p>TO BE DISCUSSED</p>

        <Dialog open={this.state.open} onClose={this.handleClickClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Create meeting</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You can invite more people to join this meeting and it will show up in their calendar.
              <div className="create-meeting">
                <h5>Event name</h5>
                <Textbox
                  classNameInputs="register-input"
                  id={'name'}
                  name={'name'}
                  type="text"
                  value={this.state.name}
                  validate={true}
                  onChange={(name) => { this.setState({ name }); }}
                  placeholder="Event name"
                  validationCallback={() => {}}
                  onBlur={() => {}}
                  validationOption={{
                    name: 'Event name',
                    check: true,
                    required: true
                  }}
                />
                <h5>When?</h5>
                <TextField
                  id="datetime-local"
                  label="Start date"
                  type="datetime-local"
                  onChange={(event) => { this.setState({
                    startDate: event.target.value,
                  }) }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  id="datetime-local"
                  label="End date"
                  type="datetime-local"
                  defaultValue={new Date()}
                  onChange={(event) => { this.setState({
                    endDate: event.target.value,
                  }) }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <h5>Where?</h5>
                <FormControl className="select-room">
                  <Select
                    value={this.state.room.id}
                    onChange={this.handleChange}
                    inputProps={{
                      name: 'room',
                      id: 'room-simple',
                    }}
                  >
                    { this.state.rooms.map((room) => {
                      return (
                        <MenuItem value={room.id}>{ room.name }</MenuItem>
                      );
                    }) }
                  </Select>
                </FormControl>
                <h5>Attenders</h5>
                { this.renderAttendersForm() }
              </div>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClickClose} color="secondary">
              Cancel
            </Button>
            <Button variant="outlined" onClick={() => { this.submit(); }} color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={this.state.openCalendarView} onClose={this.handleClickClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Create meeting</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <iframe
                src="https://calendar.google.com/calendar/embed?src=itransfer.noreply%40gmail.com&ctz=Europe%2FBucharest"
                style={ {border: 0} } width="550" height="600" frameBorder="0" scrolling="no"></iframe>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.viewCalendarClose} color="secondary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.openConfirmationDialog}
          onClose={this.handleCloseConfirmationDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This action can not undo.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseConfirmationDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.handleDeleteConfirmation} color="primary" autoFocus>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MeetingsPage))


