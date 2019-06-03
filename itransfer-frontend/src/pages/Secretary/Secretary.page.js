import React, { Component } from 'react';
import { Card } from "@material-ui/core";
import './SecretaryPage.scss';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {loginUser} from "../../actions/user";
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import {closeSnackbar, openSnackbar} from "../../actions/snackbar";
import Button from "@material-ui/core/Button";
import io from 'socket.io-client';
import {baseUrl} from "../../common/config";

class SecretaryPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            result: 'Waiting to scan',
            user: {},
        };
        this.socket = io(baseUrl);

      this.socket.on('connect', () => {
        this.socket.on('scan', (data) => {
          this.setState({
            user: data
          })
        });
      });
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({ ...nextProps });
    }

    render() {
        return (
          <div className="guard-page">
              <Card className="container">
                  { this.state.user.id ? (
                    <div className="user-info">
                        <p><span>Name</span>: { this.state.user.full_name }</p>
                        <p><span>Email</span>: { this.state.user.email }</p>
                        <p><span>Payment status</span>: { this.state.user.paymentStatus }</p>
                        <p><span>Account status</span>: { this.state.user.status }</p>
                        <p><span>Grace period (last day)</span>: { this.state.user.last_date ? new Date(this.state.user.last_date).toLocaleDateString() : 'Account is active.' }</p>
                        <p><span>Office ID / Office name</span>: { this.state.user.officeId } / { this.state.user.officeName }</p>
                        <p><span>Entered at</span>: { new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() }</p>
                        <h5>Team members</h5>
                        { this.state.user.members.length > 0 ? this.state.user.members.map((member) => {
                            return (
                              <p className="team-mem">Name: { member.name } / Email: { member.email || 'Email is not set' }</p>
                            );
                        }) : <p>No team members</p> }
                        <Button variant="outlined" color="primary" onClick={this.reset}>Reset</Button>
                    </div>
                  ) : <p>{ this.state.result }</p> }
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SecretaryPage))


