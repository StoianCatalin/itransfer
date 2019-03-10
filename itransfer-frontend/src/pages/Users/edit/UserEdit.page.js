import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import './UserEdit.scss';

export default class UserEditPage extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  render() {
    return (
      <div>
        <form className="user-form" autoComplete="off">
          <TextField
            id="standard-name"
            label="Name"
            value={this.state.name}
            onChange={this.handleChange('name')}
            margin="normal"
          />

          <TextField
            id="standard-uncontrolled"
            label="Uncontrolled"
            defaultValue="foo"
            margin="normal"
          />

          <TextField
            required
            id="standard-required"
            label="Required"
            defaultValue="Hello World"
            margin="normal"
          />

          <TextField
            error
            id="standard-error"
            label="Error"
            defaultValue="Hello World"
            margin="normal"
          />
        </form>
      </div>
    );
  }

}