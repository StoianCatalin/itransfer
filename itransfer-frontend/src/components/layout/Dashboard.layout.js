import React, { Component } from 'react';
import './Dashboard.scss';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import AdminDashboard from "./AdminDashboard/AdminDashboard.layout";
import UserDashboard from "./UserDashboard/UserDashboard.layout";
import UserService from "../../services/user.service";
import {loginUser, logoutUser} from "../../actions/user";

class DashboardLayout extends Component {

  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      currentPage: props.location.pathname
    };
    this.userService = new UserService();
    this.refreshUser();
  }

  async refreshUser() {
    try {
      const response = await this.userService.getMe();
      this.props.loginUser(response.data);
    } catch (e) {
      this.props.logoutUser();
    }
  }

  getComponent() {
    switch (this.props.role) {
      case 3:
        return <AdminDashboard />;
      case 0:
        return <UserDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  }

  render() {
    return this.getComponent();
  }
}

const mapDispatchToProps = dispatch => {
  return {
    loginUser: (user) => {
      dispatch(loginUser(user))
    },
    logoutUser: () => {
      dispatch(logoutUser());
    }
  };
};


const mapStateToProps = state => {
  return {
    role: state.user.role
  }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DashboardLayout))
