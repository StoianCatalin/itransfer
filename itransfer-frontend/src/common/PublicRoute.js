import React from 'react';
import {Redirect, Route, withRouter} from 'react-router-dom';
import {connect} from "react-redux";

class PublicRoute extends React.Component {

    render() {
        if (!this.props.authenticated) {
            return <Route {...this.props} />;
        } else {
            return <Redirect
                to={{
                    pathname: "/",
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

export default withRouter(connect(mapStateToProps)(PublicRoute))
