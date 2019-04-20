import React, { Component } from 'react';
import { Tabs, Tab } from "@material-ui/core";
import {Router, withRouter} from "react-router-dom";
import { history } from '../../../reducers/history';
import PrivateRoute from "../../../common/PrivateRoute";
import UserHomePage from "../../../pages/UserHome/UserHome.page";
import {connect} from "react-redux";
import MeetingsPage from '../../../pages/Meetings/Meetings.page';
import ProfilePage from '../../../pages/Profile/Profile.page';
import Header from '../../header/Header.component';

class UserDashboardLayout extends Component {

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
                <Tab value="/dashboard" label="Home" onClick={() => {this.navigate("/dashboard")}} />
                <Tab value="/meetings" label="Meetings" onClick={() => {this.navigate("/meetings")}} />
              </Tabs>
              <div className="page">
                <PrivateRoute path="(/|/dashboard)/" component={UserHomePage}/>
                <PrivateRoute path="/meetings" component={MeetingsPage}/>
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

export default withRouter(connect(mapStateToProps)(UserDashboardLayout))
