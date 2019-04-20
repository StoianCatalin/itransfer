import React, { Component } from 'react';
import './UserHome.scss'
import Divider from '@material-ui/core/Divider';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {Textbox} from "react-inputs-validation";
import {updateMembers} from "../../actions/user";
import {fetchPayments} from "../../actions/payment";


class UserHomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.user,
      members: props.members,
      plan: props.user.plan,
    };
    this.props.fetchPayments();

  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({ ...nextProps });
  }

  handleUpdateMembersEmail() {
    for (const member of this.state.members) {
      console.log(member);
      if (member.email && member.invalid) {
        return;
      }
    }
    this.props.updateMembers(this.state.members)
  }

  render() {
    return (
      <div className="container user-home">
        <h2 className="header">Dashboard</h2>
        <Divider />
        <h4>Team members</h4>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow key={this.state.user.id}>
              <TableCell component="th" scope="row">
                { this.state.user.full_name } <span className="this-is-you">This is you!</span>
              </TableCell>
              <TableCell>{ this.state.user.email }</TableCell>
            </TableRow>
            {this.state.members.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">
                  {row.full_name}
                </TableCell>
                <TableCell>
                  <Textbox
                    classNameInput="profile-input"
                    classNameWrapper="input-wrapper"
                    id={'member1-email'}
                    name={'member1-email'}
                    type="text"
                    value={this.state.members[index].email}
                    validate={true}
                    onChange={(email) => {
                      const members = this.state.members;
                      members[index].email = email;
                      this.setState({ members: members });
                    }}
                    placeholder="Click to add email"
                    validationCallback={(invalid) => {
                      const members = this.state.members;
                      members[index].invalid = invalid;
                      this.setState({ members: members });
                    }}
                    onBlur={() => { this.handleUpdateMembersEmail() }}
                    validationOption={{
                      name: 'Member email',
                      required: false,
                      customFunc: email => {
                        if (!email) {
                          return true;
                        }
                        const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        if (reg.test(String(email).toLowerCase())) {
                          return true;
                        } else {
                          return 'Is not a valid email address';
                        }
                      }
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <h4>Subscription</h4>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subscription plan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { this.state.payments && this.state.payments.map((payment) => {
              return (
                <TableRow key={payment.id}>
                  <TableCell component="th" scope="row">
                    <p>{payment.name} ({ payment.amount } € / {payment.period})</p>
                  </TableCell>
                  <TableCell><span className={"status " + payment.status}>{ payment.status }</span></TableCell>
                  <TableCell>{ new Date(payment.startDate).toLocaleString('en-us', { day: '2-digit', month: 'long', year: 'numeric' }) }</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" disabled={payment.status !== 'unpaid'}>
                      Pay
                    </Button>
                  </TableCell>
                </TableRow>
              )
            }) }
          </TableBody>
        </Table>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateMembers: (members) => {
      dispatch(updateMembers(members));
    },
    fetchPayments: () => {
      dispatch(fetchPayments());
    }
  }
};

const mapStateToProps = state => {
  console.log(state);
  return {
    user: { ...state.user, members: null },
    members: state.user.members,
    payments: state.payments.list,
  }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UserHomePage))