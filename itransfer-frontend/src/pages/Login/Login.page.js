import React, { Component } from 'react';
import { Card, Icon, Button, TextField } from "@material-ui/core";
import './LoginPage.scss';
import { Link } from 'react-router-dom';
import computerSVG from '../../assets/computer.svg';
import Logo from '../../logo-itransfer.png';
import {validateEmail} from "../../validators/email";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {loginUser} from "../../actions/user";
import AuthService from "../../services/auth.service";
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import {closeSnackbar, openSnackbar} from "../../actions/snackbar";
import Divider from '@material-ui/core/Divider';

class LoginPage extends Component {

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
        };
        this.authService = new AuthService();
    }

    componentWillReceiveProps(nextProps, nextContext) {
        console.log(nextProps);
        this.setState({ ...nextProps });
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

    async onSubmit() {
        if (!this.isErrorOnEmail && !this.isErrorOnPassword) {
            try {
                const response = await this.authService.login(this.state.email.value, this.state.password.value);
                console.log(response);
                if (response.status === 200) {
                    this.props.login(response.data);
                }
            } catch (e) {
                this.props.openSnackbar(e.response.data.message);
                this.state.email = { value: '', touched: false };
                this.state.password = { value: '', touched: false };
            }
            this.setState({
                email: { value: '', touched: false },
                password: { value: '', touched: false }
            });
        }
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
                              <Divider className="divider"/>
                              <div className="register-link">
                                  <Link to="/register"><a href="#">You are not registered yet? Register now!</a></Link>
                              </div>
                          </form>
                      </div>
                  </div>
              </Card>
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
        login: (user) => {
            dispatch(loginUser(user))
        },
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LoginPage))


