import React from 'react';
import {Redirect, Route, withRouter} from 'react-router-dom';
import {connect} from "react-redux";

class PrivateRoute extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.authenticated) {
            return <Route {...this.props} />;
        } else {
            return <Redirect
                to={{
                    pathname: "/login",
                    state: { from: this.props.location }
                }}
            />
        }
    }
}

const mapStateToProps = (state) => {
    return {
        authenticated: state.user.authenticated,
    }
};

export default withRouter(connect(mapStateToProps)(PrivateRoute))
