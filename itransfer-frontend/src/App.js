import React, { Component } from 'react';
import { Router, Switch } from "react-router-dom";
import './App.scss';
import LoginPage from './pages/Login/Login.page';
import RegisterPage from './pages/Register/Register.page';
import configureStore from './reducers/store';
import { Provider } from 'react-redux';
import PrivateRoute from "./common/PrivateRoute";
import PublicRoute from "./common/PublicRoute";
import DashboardLayout from "./components/layout/Dashboard.layout";
import CssBaseline from '@material-ui/core/CssBaseline';
import { history } from './reducers/history';
import 'react-inputs-validation/lib/react-inputs-validation.min.css';

const store = configureStore({});

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <CssBaseline />
        <Router history={history}>
          <Switch>
            <PublicRoute exact path="/login" component={LoginPage} />
            <PublicRoute exact path="/register" component={RegisterPage} />
            <PrivateRoute path="/" component={DashboardLayout} />
          </Switch>
        </Router>
      </Provider>
    );
  }
}

export default App;
