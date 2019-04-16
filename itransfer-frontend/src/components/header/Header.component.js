import React, { Component } from 'react';
import UserAvatar from '../../assets/user.svg';
import Logo from '../../logo-itransfer.png';
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {logoutUser} from "../../actions/user";

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      currentPage: props.location.pathname
    }
  }

  navigate(path) {
    this.setState({ anchorEl: null });
    this.props.history.push(path);
    this.setState({
      currentPage: path,
    })
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  logout = () => {
    this.props.logoutUser();
  };

  render() {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <header className="header">
        <div className="logo-container"><img src={Logo} alt="Logo iTransfer" /></div>
        <div className="left-side">
          <div className="name">Hello, <b>{this.props.user.full_name}</b></div>
          <div className="avatar"><img src={UserAvatar} alt="User avatar"/></div>
          <div>
            <IconButton
              className="menu-button"
              aria-label="More"
              aria-owns={open ? 'long-menu' : undefined}
              aria-haspopup="true"
              onClick={this.handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="long-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={this.handleClose}
              PaperProps={{
                style: {
                  maxHeight: 45 * 4.5,
                  width: 200,
                },
              }}
            >
              <MenuItem key="profile" onClick={() => {this.navigate("/profile")}} >
                Profile
              </MenuItem>
              <MenuItem key="logout" onClick={this.logout}>
                Logout
              </MenuItem>
            </Menu>
          </div>
        </div>
      </header>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logoutUser: () => {
      dispatch(logoutUser());
    }
  };
};

const mapStateToProps = state => {
  return {
    user: state.user,
  }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header))
