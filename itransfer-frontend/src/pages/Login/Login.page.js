import React, { Component } from 'react';
import { Card, Icon, Button, TextField } from "@material-ui/core";
import './LoginPage.scss';
import computerSVG from '../../assets/computer.svg';
import Logo from '../../logo-itransfer.png';
import {validateEmail} from "../../validators/email";

export default class LoginPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: {
                touched: false,
                value: '',
            },
            password: {
                touched: false,
                value: '',
            },
        }
    }

    handleChange(name) {
        return (event) => {
            this.setState({
                [name]: {
                    touched: true,
                    value: event.target.value,
                }
            });
        };
    }

    get isErrorOnEmail() {
        return this.state.email.touched && !validateEmail(this.state.email);
    }

    get emailErrorText() {
        if (!this.state.email.touched) {
            return '';
        }
        if (this.state.email.value === '') {
            return 'This field is required.';
        } else if (!validateEmail(this.state.email)) {
            return 'It is not a valid email.'
        } else return '';
    }

    get isErrorOnPassword() {
        return this.state.password.touched && this.state.password.value.length < 6;
    }

    get passwordErrorText() {
        if (!this.state.password.touched) {
            return '';
        }
        if (this.state.email.value.length < 6) {
            return 'Min length of password is 6 characters.';
        } else return '';
    }

    onSubmit() {
        // logic of login here
    }

    render() {
        return (
          <div className="login-page">
              <Card className="container">
                  <div className="left-side">
                      <img src={computerSVG} alt="computer" />
                  </div>
                  <div className="right-side">
                      <div className="logo">
                          <img src={Logo} alt="Logo iTransfer" />
                      </div>
                      <div className="content">
                          <form>
                              <TextField
                                className="login-input"
                                id="email"
                                label="Email"
                                type="email"
                                value={this.state.email.value}
                                onChange={this.handleChange('email')}
                                variant="outlined"
                                error={this.isErrorOnEmail}
                                helperText={this.emailErrorText}
                                fullWidth />
                              <TextField
                                className="login-input"
                                id="password"
                                label="Password"
                                type="password"
                                value={this.state.password.value}
                                error={this.isErrorOnPassword}
                                helperText={this.passwordErrorText}
                                onChange={this.handleChange('password')}
                                variant="outlined"
                                fullWidth />
                              <Button variant="contained" color="primary" className="login-button" onClick={() => this.onSubmit()}>
                                  Login
                                  <Icon>send</Icon>
                              </Button>
                          </form>
                      </div>
                  </div>
              </Card>
          </div>
        )
    }
}
