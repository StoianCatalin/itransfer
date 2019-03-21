import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import './Profile.scss';
import TextField from '@material-ui/core/TextField';
import {Button, Icon} from "@material-ui/core";

class ProfilePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      name: '',
      password: '',
      repeatPassword: '',
      email: '',
      role: ''
    };
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  render() {
    return (
      <div className="profile-container">
        <form autoComplete="off">
          <TextField
            id="standard-name"
            label="Name"
            value={this.state.name}
            onChange={this.handleChange('name')}
            margin="normal"
          />
          <TextField
            id="standard-name"
            label="Password"
            type="password"
            value={this.state.password}
            onChange={this.handleChange('password')}
            margin="normal"
          />
          <TextField
            id="standard-name"
            label="Confirm password"
            type="password"
            value={this.state.repeatPassword}
            onChange={this.handleChange('repeatPassword')}
            margin="normal"
          />
          <TextField
            id="standard-name"
            label="Email"
            type="email"
            value={this.state.email}
            onChange={this.handleChange('email')}
            margin="normal"
          />
          <Button variant="contained" color="primary" className="profile-button" onClick={() => this.onSubmit()}>
            Save
          </Button>
        </form>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {

  }
};

export default withRouter(connect(mapStateToProps)(ProfilePage))


