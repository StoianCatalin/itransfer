import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './App.scss';
import LoginPage from './pages/Login/Login.page';
import HomePage from './pages/Home/Home.page';
import configureStore from './reducers/store';
import { Provider } from 'react-redux';

const store = configureStore({});

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/login" component={LoginPage} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
