import React, { Component } from 'react';
import './Home.scss'
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Textbox} from "react-inputs-validation";



export default class HomePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openEditUserDialog: false,
      openDeleteUserDialog: false,
      form: {
        name: '',
        cnp: '',
        identity_number: '',
        address: '',
        email: '',
        password: '',
        team: [],
      },
      formValidation: {
        name: true,
        cnp: true,
        identity_number: true,
        address: true,
        email: true,
        password: true,
      },
    }
  }

  handleCloseEditUserDialog = () => {
    this.setState({
      openEditUserDialog: false,
    });
  };

  handleOpenEditUserDialog = () => {
    this.setState({
      openEditUserDialog: true,
    });
  };

  handleCloseDeleteUserDialog = () => {
    this.setState({
      openDeleteUserDialog: false,
    });
  };

  handleOpenDeleteUserDialog = () => {
    this.setState({
      openDeleteUserDialog: true,
    });
  };

  getFormStep() {
    return (
      <div className="edit-user-form">
        <Textbox
          id={'name'}
          name={'name'}
          type="text"
          value={this.state.form.name}
          validate={true}
          onChange={(name) => { this.setState({ form: { ...this.state.form, name } }); }}
          placeholder="Your full name"
          validationCallback={name => { this.setState({ formValidation: { ...this.state.formValidation, name } }) } }
          onBlur={() => {}}
          validationOption={{
            name: 'Full name',
            check: true,
            required: true
          }}
          classNameInput="user-edit-input"
        />
        <Textbox
          classNameInput="user-edit-input"
          id={'cnp'}
          name={'cnp'}
          type="number"
          value={this.state.form.cnp}
          validate={true}
          onChange={(cnp) => { this.setState({ form: { ...this.state.form, cnp } }); }}
          placeholder="Your ID"
          validationCallback={cnp => { this.setState({ formValidation: { ...this.state.formValidation, cnp } }) } }
          onBlur={() => {}}
          validationOption={{
            name: 'ID',
            check: true,
            required: true,
            reg: /^([0-9]){13}$/
          }}
        />
        <Textbox
          classNameInput="user-edit-input"
          id={'identity_number'}
          name={'identity_number'}
          type="text"
          value={this.state.form.identity_number}
          validate={true}
          onChange={(identity_number) => { this.setState({ form: { ...this.state.form, identity_number } }); }}
          placeholder="Your identity card number"
          validationCallback={identity_number => { this.setState({ formValidation: { ...this.state.formValidation, identity_number } }) } }
          onBlur={() => {}}
          validationOption={{
            name: 'Identity card number',
            check: true,
            required: true,
            reg: /^([A-Z]{2})([0-9]){6}$/
          }}
        />
        <Textbox
          classNameInput="user-edit-input"
          id={'address'}
          name={'address'}
          type="text"
          value={this.state.form.address}
          validate={true}
          onChange={(address) => { this.setState({ form: { ...this.state.form, address } }); }}
          placeholder="Address"
          validationCallback={address => { this.setState({ formValidation: { ...this.state.formValidation, address } }) } }
          onBlur={() => {}}
          validationOption={{
            name: 'Address',
            check: true,
            required: true,
          }}
        />
        <Textbox
          classNameInput="user-edit-input"
          id={'email'}
          name={'email'}
          type="text"
          value={this.state.form.email}
          validate={true}
          onChange={(email) => { this.setState({ form: { ...this.state.form, email } }); }}
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
          classNameInput="user-edit-input"
          id={'password'}
          name={'password'}
          type="password"
          value={this.state.form.password}
          validate={true}
          onChange={(password) => { this.setState({ form: { ...this.state.form, password } }); }}
          placeholder="Password"
          validationCallback={password => { this.setState({ formValidation: { ...this.state.formValidation, password } }) } }
          onBlur={() => {}}
          validationOption={{
            name: 'Password',
            check: true,
            required: true,
            min: 6
          }}
        />
        { this.hasMoreMembersInTeam && <div className="team-members">
          <h4>Team Members</h4>
          { this.generateTeamMembersFields() }
        </div> }
      </div>
    );
  }

  render() {

    return (
      <div className="container">
        <h2 className="header">Dashboard</h2>
        <div className="grid three">
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2">
                Catalin Stoian
              </Typography>
              <Typography component="p">
                Office: 2 <br />
                Team Members: 3 <br />
                Subscription plan: Team Access (450 euro) <br />
                Status: Active
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={this.handleOpenEditUserDialog}>Manage</Button>
              <Button size="small" onClick={this.handleOpenDeleteUserDialog}>Delete</Button>
            </CardActions>
          </Card>
        </div>
        <Dialog
          fullWidth={"500"}
          maxWidth={"500"}
          open={this.state.openEditUserDialog} onClose={this.handleCloseEditUserDialog} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Edit user Catalin Stoian</DialogTitle>
          <DialogContent>
            { this.getFormStep() }
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseEditUserDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleCloseEditUserDialog} color="primary">
              Done
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={this.state.openDeleteUserDialog} onClose={this.handleCloseDeleteUserDialog} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Are you sure?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This action can not be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDeleteUserDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleCloseDeleteUserDialog} color="primary">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

