import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import './AccessLogs.scss';
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Table from "@material-ui/core/Table";
import EventsService from "../../services/events.service";
import {closeSnackbar, openSnackbar} from "../../actions/snackbar";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/core/SvgIcon/SvgIcon";
import TextField from "@material-ui/core/TextField";
import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers';
import DateFnsUtils from '@date-io/date-fns';

class AccessLogsPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      logs: [],
      search: '',
      shownLogs: [],
      selectedDate: new Date(),
    };

    this.eventsService = new EventsService();

    this.fetchLogs();
  }

  sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }

  fetchLogs() {
    this.eventsService.getAllAccessLogs().then((response) => {
      if (response.status === 200) {
        this.setState({ logs: response.data, shownLogs: response.data });
      }
    });
  }

  handleSearch = (event) => {
    this.setState({
      search: event.target.value,
      shownLogs: this.state.logs.filter((log) => {
        if (!this.sameDay(new Date(this.state.selectedDate), new Date(log.enterDate))) {
          return false;
        }
        if (event.target.value === '') {
          return true;
        }
        if (log.user.full_name.toLowerCase().includes(event.target.value)) {
          return true;
        }
        if (log.office.name.includes(event.target.value)) {
          return true;
        }
        return false;
      }),
    });
  };

  handleDateChange = date => {
    this.setState({
      selectedDate: date,
      shownLogs: this.state.logs.filter((log) => this.sameDay(new Date(date), new Date(log.enterDate)))
    });
  };

  render() {
    return (
      <div className="access-logs-container">
        <div className="logs-filter-container">
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
              margin="normal"
              label="Date picker"
              value={this.state.selectedDate}
              onChange={this.handleDateChange}
            />
        </MuiPickersUtilsProvider>
          <TextField
            id="input-with-icon-textfield"
            label="Search"
            className="search-container"
            onChange={this.handleSearch}
            value={this.state.search}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">User name</TableCell>
              <TableCell align="left">Office</TableCell>
              <TableCell align="left">Access date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { this.state.shownLogs.map((log) => {
              return (
                <TableRow key={1}>
                  <TableCell align="left">{ log.user.full_name }</TableCell>
                  <TableCell align="left">{ log.office.name }</TableCell>
                  <TableCell align="left">{ new Date(log.enterDate).toLocaleDateString() + " " + new Date(log.enterDate).toLocaleTimeString() }</TableCell>
                </TableRow>
              );
            }) }
          </TableBody>
        </Table>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AccessLogsPage))


