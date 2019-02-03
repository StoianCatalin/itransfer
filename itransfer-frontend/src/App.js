import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import './App.scss';
import LoginPage from './pages/Login/Login.page';
import HomePage from './pages/Home/Home.page';
import configureStore from './reducers/store';
import { Provider } from 'react-redux';
import PrivateRoute from "./common/PrivateRoute";
import PublicRoute from "./common/PublicRoute";

const store = configureStore({});

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <Switch>
            <PrivateRoute exact path="/" component={HomePage} />
            <PublicRoute exact path="/login" component={LoginPage} />
          </Switch>
        </Router>
      </Provider>
    );
  }
}

export default App;
