import React, { Component } from 'react';
import { Tabs, Tab } from "@material-ui/core";
import {Router, withRouter} from "react-router-dom";
import { history } from '../../../reducers/history';
import PrivateRoute from "../../../common/PrivateRoute";
import HomePage from "../../../pages/Home/Home.page";
import UsersPage from "../../../pages/Users/Users.page";
import PaymentsPage from "../../../pages/Payments/Payments.page";
import EventsPage from "../../../pages/Events/Events.page";
import {connect} from "react-redux";
import ProfilePage from '../../../pages/Profile/Profile.page';
import Header from '../../header/Header.component';

class AdminDashboardLayout extends Component {

  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      currentPage: props.location.pathname,
    }
  }

  navigate(path) {
    this.setState({ anchorEl: null });
    this.props.history.push(path);
    this.setState({
      currentPage: path,
    })
  }

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div className="dashboard-layout">
        <Header />
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
                <Tab disabled={this.props.account.role === 1} value="/dashboard" label="Dashboard" onClick={() => {this.navigate("/dashboard")}} />
                <Tab disabled={this.props.account.role !== 3} value="/users" label="Staff" onClick={() => {this.navigate("/users")}} />
                <Tab value="/payments" label="Payments" onClick={() => {this.navigate("/payments")}} />
                <Tab disabled={this.props.account.role === 1} value="/events" label="Events" onClick={() => {this.navigate("/events")}} />
              </Tabs>
              <div className="page">
                { this.props.account.role !== 1 && <PrivateRoute path={ this.props.account.role !== 1 ? "(/|/dashboard)/" : "/dashboard" } component={HomePage}/> }
                { this.props.account.role === 3 && <PrivateRoute exact path="/users" component={UsersPage}/> }
                { <PrivateRoute path={ this.props.account.role === 1 ? "(/|/payments)/" : "/payments" } component={PaymentsPage}/> }
                { this.props.account.role !== 1 && <PrivateRoute path="/events" component={EventsPage}/> }
                <PrivateRoute path="/profile" component={ProfilePage}/>
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
    account: { ...state.user, members: null },
  }
};

export default withRouter(connect(mapStateToProps)(AdminDashboardLayout))
