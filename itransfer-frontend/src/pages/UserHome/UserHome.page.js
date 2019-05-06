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
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import Cards from 'react-credit-cards';
import {Number, Cvc, Expiration} from 'react-credit-card-primitives'
import PaymentService from "../../services/payment.service";

registerPlugin(FilePondPluginFileValidateType);

class UserHomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      card: {
        number: '',
        name: '',
        expiry: '',
        cvc: '',
        focused: '',
      },
      cardValid: {
        number: false,
        name: false,
        expiry: false,
        cvc: false,
      },
      paymentInfo: {
        method: 1,
      },
      paymentModalOpen: false,
      paymentSelected: {},
      user: props.user,
      members: props.members,
      plan: props.user.plan,
    };
    this.props.fetchPayments();
    this.paymentService = new PaymentService();

  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({ ...nextProps });
  }

  handleUpdateMembersEmail() {
    for (const member of this.state.members) {
      if (member.email && member.invalid) {
        return;
      }
    }
    this.props.updateMembers(this.state.members)
  }

  handleClosePaymentModal = () => {
    this.props.fetchPayments();
    this.setState({
      paymentModalOpen: false,
      paymentSelected: {},
    });
  };

  openPaymentModal = (payment) => {
    this.setState({
      paymentModalOpen: true,
      paymentSelected: payment,
    });
  };

  handleChangePayMethod = (method) => {
    this.setState({
      paymentInfo: { method }
    });
  };

  submitCardPayment() {
    const { number, name, expiry, cvc } = this.state.card;
    if (number && name && expiry && cvc) {
      this.paymentService.payWithCreditCard(this.state.paymentSelected.id).then((response) => {
        this.setState({
          paymentModalOpen: false,
        });
      });
    }
  }

  receiptMethodRender() {
    return (
      <div className="method-container">
        <FilePond
          acceptedFileTypes={['image/*']}
          server={
          {
            url: `http://localhost:3001/payments/upload/${this.state.paymentSelected.id}`,
            process: {
              headers: {
                'authorization': `Bearer ${this.state.user.token}`
              }
            },
            revert: {
              headers: {
                'authorization': `Bearer ${this.state.user.token}`
              }
            },
          }
        }/>
      </div>
    );
  }

  setFocusedField(fieldName) {
    this.setState({ card: { ...this.state.card, focused: fieldName } });
  }

  creditCardMethodRender() {
    return (
      <div className="method-container">
        <Cards
          number={this.state.card.number}
          name={this.state.card.name}
          expiry={this.state.card.expiry}
          cvc={this.state.card.cvc}
          focused={this.state.card.focused}
        />
        <Number
          onChange={({value, valid}) => {
            this.setState({ card: {...this.state.card, number: value || '' }, cardValid: { ...this.state.cardValid, number: valid } }) }}
          render={({
                     getInputProps,
                     valid
                   }) => <input {...getInputProps()} className={"card-input" + (valid ? '' : ' error')} onFocus={() => { this.setFocusedField('number') }} />} />
        <Textbox
          id={'owner-name'}
          name={'owner-name'}
          type="text"
          onFocus={() => { this.setFocusedField('name') }}
          value={this.state.card.name}
          validate={true}
          onChange={(name) => {  this.setState({ card: {...this.state.card, name: name || '' } }) }}
          placeholder="Member full name"
          validationCallback={(invalid) => { this.setState({ cardValid: {...this.state.cardValid, name: !invalid } }) }}
          onBlur={() => {}}
          validationOption={{
            name: 'Name',
            check: true,
            required: true,
          }}
        />
        <Expiration
          onChange={({ rawValue, valid }) => {
            this.setState({ card: { ...this.state.card, expiry: rawValue.replace(/ /g,''), cardValid: { ...this.state.cardValid, expiry: valid } } });
          }}
          render={({
                     getInputProps,
                     valid,
                     error
                   }) => (
            <div>
              <input onFocus={() => { this.setFocusedField('expiry') }} {...getInputProps()} className={"card-input" + (valid ? '' : ' error')} />
              {!this.state.card.expiry ? ''
                  : error === Expiration.ERROR_MONTH ? 'Please enter valid month'
                    : error === Expiration.ERROR_YEAR ? 'Please enter valid year'
                      : error === Expiration.ERROR_PAST_DATE ? 'Please enter a date in the future.'
                        : ''}
            </div>
          )} />
        <Cvc
          onChange={({value, valid}) => {
            this.setState({ card: { ...this.state.card, cvc: value, cardValid: { ...this.state.cardValid, cvc: valid } } });
          }}
          render={({
                     getInputProps,
                     valid
                   }) => <input {...getInputProps()} className={"card-input" + (valid ? '' : ' error')} onFocus={() => { this.setFocusedField('cvc') }} />} />
      </div>
    );
  }

  render() {
    const { number, name, expiry, cvc } = this.state.card;
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
              <TableCell>Date</TableCell>
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
                    <Button variant="contained" color="primary" disabled={payment.status !== 'unpaid'} onClick={() => { this.openPaymentModal(payment); }}>
                      Pay
                    </Button>
                  </TableCell>
                </TableRow>
              )
            }) }
          </TableBody>
        </Table>
        <Dialog
          open={this.state.paymentModalOpen}
          onClose={this.handleClosePaymentModal}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Payment</DialogTitle>
          <DialogContent>
            <div className="choose-method" onClick={() => { this.handleChangePayMethod(1) }}>
              <Radio checked={this.state.paymentInfo.method === 1} value="1" />
              Upload bank receipt
            </div>
            <div className="choose-method" onClick={() => { this.handleChangePayMethod(2) }}>
              <Radio checked={this.state.paymentInfo.method === 2} value="2" />
              Credit card
            </div>
            <DialogContentText>
              If you choose to pay via bank receipt, your submission must be checked by our team. Also meke sure you upload a readable photo/scan.
            </DialogContentText>
            { this.state.paymentInfo.method === 1 && this.receiptMethodRender() }
            { this.state.paymentInfo.method === 2 && this.creditCardMethodRender() }
          </DialogContent>
          <DialogActions>
            { this.state.paymentInfo.method === 1 && (
              <Button onClick={this.handleClosePaymentModal} color="primary">
                Done
              </Button>
            ) }
            { this.state.paymentInfo.method === 2 && (
              [
                <Button variant="contained" color="primary" disabled={!(number && name && expiry && cvc)} onClick={() => { this.submitCardPayment() }}>
                  Pay
                </Button>,
                <Button onClick={this.handleClosePaymentModal} color="primary">
                Cancel
                </Button>
              ]
            ) }
          </DialogActions>
        </Dialog>
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
  return {
    user: { ...state.user, members: null },
    members: state.user.members,
    payments: state.payments.list,
  }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UserHomePage))