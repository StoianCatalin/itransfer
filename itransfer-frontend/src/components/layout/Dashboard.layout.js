import React, { Component } from 'react';
import './Dashboard.scss';
import UserAvatar from '../../assets/user.svg';
import Logo from '../../logo-itransfer.png';
import { IconButton, Menu, MenuItem, Tabs, Tab } from "@material-ui/core";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {Router, withRouter} from "react-router-dom";
import { history } from '../../reducers/history';
import PrivateRoute from "../../common/PrivateRoute";
import HomePage from "../../pages/Home/Home.page";
import UsersPage from "../../pages/Users/Users.page";
import {connect} from "react-redux";

class DashboardLayout extends Component {

  constructor(props) {
    super(props);
    console.log(props.location);
    this.state = {
      anchorEl: null,
      currentPage: props.location.pathname
    }
  }

  navigate(path) {
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

  render() {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div className="dashboard-layout">
        <header className="header">
          <div className="logo-container"><img src={Logo} alt="Logo iTransfer" /></div>
          <div className="left-side">
            <div className="name">Hello, <b>Catalin</b></div>
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
                <MenuItem key="profile" onClick={this.handleClose}>
                  Profile
                </MenuItem>
                <MenuItem key="logout" onClick={this.handleClose}>
                  Logout
                </MenuItem>
              </Menu>
            </div>
          </div>
        </header>
        <div className="content">
          <Router history={history}>
            <div>
              <Tabs
                className="primary-menu"
                value={this.state.currentPage}
                onChange={this.handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab value="/dashboard" label="Dashboard" onClick={() => {this.navigate("/dashboard")}} />
                <Tab value="/users" label="Users" onClick={() => {this.navigate("/users")}} />
                <Tab value="/spaces" label="Spaces" />
              </Tabs>
              <div className="page">
                <PrivateRoute path="(/|/dashboard)/" component={HomePage}/>
                <PrivateRoute path="/users" component={UsersPage}/>
              </div>
            </div>
          </Router>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {

  }
};

export default withRouter(connect(mapStateToProps)(DashboardLayout))
