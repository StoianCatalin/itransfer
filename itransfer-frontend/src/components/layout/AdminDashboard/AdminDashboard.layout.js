import React, { Component } from 'react';
import { Tabs, Tab } from "@material-ui/core";
import {Router, withRouter} from "react-router-dom";
import { history } from '../../../reducers/history';
import PrivateRoute from "../../../common/PrivateRoute";
import HomePage from "../../../pages/Home/Home.page";
import UsersPage from "../../../pages/Users/Users.page";
import SpacesPage from "../../../pages/Spaces/Spaces.page";
import {connect} from "react-redux";
import UserEditPage from "../../../pages/Users/edit/UserEdit.page";
import ProfilePage from '../../../pages/Profile/Profile.page';
import Header from '../../header/Header.component';

class AdminDashboardLayout extends Component {

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
                <Tab value="/dashboard" label="Dashboard" onClick={() => {this.navigate("/dashboard")}} />
                <Tab value="/users" label="Users" onClick={() => {this.navigate("/users")}} />
                <Tab value="/spaces" label="Spaces" onClick={() => {this.navigate("/spaces")}} />
              </Tabs>
              <div className="page">
                <PrivateRoute path="(/|/dashboard)/" component={HomePage}/>
                <PrivateRoute exact path="/users" component={UsersPage}/>
                <PrivateRoute path="/users/:id/edit" component={UserEditPage}/>
                <PrivateRoute path="/spaces" component={SpacesPage}/>
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

  }
};

export default withRouter(connect(mapStateToProps)(AdminDashboardLayout))
