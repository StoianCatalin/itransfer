import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import {ConfirmationModal} from "../../components/modals/confirmation/Confirmation.modal";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import UserService from "../../services/user.service";
import Button from '@material-ui/core/Button';
import './Users.scss';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import {Textbox} from "react-inputs-validation";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import CloseIcon from '@material-ui/icons/Close';
import Snackbar from "@material-ui/core/Snackbar";
import {closeSnackbar, openSnackbar} from "../../actions/snackbar";


const roles = {
  0: 'Client',
  1: 'Accountant',
  2: 'Secretary',
  3: 'Administrator'

};

class UsersPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      openEditModal: false,
      selectedUser: {},
      users: [],
      formValidation: {
        full_name: false,
        email: false,
      },
    };

    this.userService = new UserService();
    this.fetchStaff();
  }

  fetchStaff() {
    this.userService.getStaff().then((response) => {
      if (response.status === 200) {
        this.setState({
          users: response.data,
        });
      }
    });
  }

  openEditModal = (user) => {
    this.setState({
      openEditModal: true,
      selectedUser: user,
    });
  };

  closeEditModal = () => {
    this.setState({
      openEditModal: false,
      selectedUser: {},
    });
  };

  handleConfirmationModal = (user) => {
    this.setState({
      open: true,
      selectedUser: user,
    });
  };

  handleClose = value => {
    if (value) {
      this.userService.deleteUser(this.state.selectedUser.id).then((response) => {
        if (response.status === 200) {
          this.props.openSnackbar('User deleted');
          this.fetchStaff();
        }
      });
    }
    this.setState({ open: false });
  };

  handleChangeRole = event => {
    this.setState({
      selectedUser: {...this.state.selectedUser, role: event.target.value},
    })
  };

  submit = () => {
    if (this.state.formValidation.full_name || this.state.formValidation.email) {
      return;
    }
    const method = this.state.selectedUser.id ? this.userService.saveStaff(this.state.selectedUser) : this.userService.createStaff(this.state.selectedUser);
    method.then((response) => {
      if (response.status >= 200 && response.status <= 299) {
        this.closeEditModal();
        this.fetchStaff();
      } else {
        this.props.openSnackbar(response.data.message);
        setTimeout(() => { this.props.closeSnackbar();  }, 3000);
      }
    });
  };

  render() {
    return (
      <div>
        <div className="add-button-container">
          <Button variant="contained" color="primary" onClick={ () => { this.openEditModal({ role: 1 }) } }>
            Create
          </Button>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Role</TableCell>
              <TableCell align="left">Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.users.map(row => (
              <TableRow key={row.id}>
                <TableCell align="left">
                  {row.full_name}
                </TableCell>
                <TableCell align="left">{roles[row.role]}</TableCell>
                <TableCell align="left">{row.email}</TableCell>
                <TableCell component="th" scope="row">
                  <IconButton aria-label="Edit" onClick={() => { this.openEditModal(row) }}>
                    <Icon>edit_icon</Icon>
                  </IconButton>
                  <IconButton disabled={row.id === 1} color="secondary" aria-label="Delete" onClick={() => { this.handleConfirmationModal(row); }}>
                    <Icon>delete_icon</Icon>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ConfirmationModal open={this.state.open}
                           onClose={this.handleClose} />
        <Dialog
          open={this.state.openEditModal} onClose={this.closeEditModal} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">{ this.state.selectedUser.id ? 'Edit' : 'Create' } { this.state.selectedUser.full_name }</DialogTitle>
          <DialogContent>
            <div className="edit-staff-form">
              <Textbox
                id={'full_name'}
                name={'full_name'}
                type="text"
                value={this.state.selectedUser.full_name}
                validate={true}
                onChange={(full_name) => { this.setState({ selectedUser: { ...this.state.selectedUser, full_name } }); }}
                placeholder="Your full name"
                validationCallback={full_name => { this.setState({ formValidation: { ...this.state.formValidation, full_name } }) } }
                onBlur={() => {}}
                validationOption={{
                  name: 'Full name',
                  check: true,
                  required: true
                }}
                classNameInput="staff-edit-input"
              />
              <Textbox
                classNameInput="staff-edit-input"
                id={'email'}
                name={'email'}
                type="text"
                value={this.state.selectedUser.email}
                validate={true}
                onChange={(email) => { this.setState({ selectedUser: { ...this.state.selectedUser, email } }); }}
                placeholder="Email"
                validationCallback={email => { this.setState({ formValidation: { ...this.state.formValidation, email } }) } }
                onBlur={() => {}}
                validationOption={{
                  name: 'Email',
                  check: true,
                  required: true,
                  customFunc: email => {
                    const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if (reg.test(String(email).toLowerCase())) {
                      return true;
                    } else {
                      return 'Is not a valid email address';
                    }
                  }
                }}
              />
              <Textbox
                classNameInput="staff-edit-input"
                id={'password'}
                name={'password'}
                type="password"
                value={this.state.selectedUser.password}
                validate={true}
                onChange={(password) => { this.setState({ selectedUser: { ...this.state.selectedUser, password } }); }}
                placeholder="Password"
                validationCallback={password => { this.setState({ formValidation: { ...this.state.formValidation, password } }) } }
                onBlur={() => {}}
                validationOption={{
                  name: 'Password',
                  check: false,
                  min: 6
                }}
              />
              <FormControl className="select-role">
                <Select
                  disabled={this.state.selectedUser.id === 1}
                  value={this.state.selectedUser.role}
                  onChange={this.handleChangeRole}
                  inputProps={{
                    name: 'roles',
                    id: 'roles-simple',
                  }}
                >
                  <MenuItem value={1}>{ roles[1] }</MenuItem>
                  <MenuItem value={2}>{ roles[2] }</MenuItem>
                  <MenuItem value={3}>{ roles[3] }</MenuItem>
                </Select>
              </FormControl>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeEditModal} color="primary">
              Close
            </Button>
            <Button variant="contained" onClick={this.submit} color="primary">
              Save
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UsersPage))


