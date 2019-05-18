import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import './Payments.scss';
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Table from "@material-ui/core/Table";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import {FilePond} from "react-filepond";
import PaymentService from "../../services/payment.service";
import UserService from "../../services/user.service";

class PaymentsPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      account: {},
      payments: [],
      shownPayments: [],
      users: [],
      filterPaymentsBy: 0,
      selectedPayment: {},
    };
    this.paymentService = new PaymentService();
    this.userService = new UserService();

    this.fetchPayments();
    this.fetchUsers();
  }

  fetchPayments() {
    this.paymentService.getAllPayments().then((response) => {
      if (response.status === 200) {
        this.setState({
          payments: response.data,
          shownPayments: response.data,
        });
      }
    });
  }

  fetchUsers() {
    this.userService.getAllUsers().then((response) => {
      if (response.status === 200) {
        this.setState({
          users: response.data,
        });
      }
    });
  }

  closePaymentModal = () => {
    this.fetchPayments();
    this.fetchUsers();
    this.setState({ open: false, selectedPayment: {} });
  };

  openPaymentModal = (payment) => {
    this.setState({ open: true, selectedPayment: payment });
  };

  handleChangeUser = (event) => {
    const optionId = event.target.value;
    let shownPayments = [];
    if (optionId === 0) {
      shownPayments = this.state.payments.map(item => item);
    } else {
      shownPayments = this.state.payments.filter((item) => item.user.id === optionId);
    }
    this.setState({
      shownPayments,
      filterPaymentsBy: optionId,
    });
  };

  downloadRecipe() {
    const element = document.createElement('a');
    element.setAttribute('href', this.userService.downloadRecipeUrl(this.state.selectedPayment.recipeUrl) + `/${this.props.account.token}`);
    element.setAttribute('target', "_blank");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  render() {
    return (
      <div className="payments-container">
        <FormControl className="select-user">
          <Select
            value={this.state.filterPaymentsBy}
            onChange={this.handleChangeUser}
            inputProps={{
              name: 'users',
              id: 'users-simple',
            }}
          >
            <MenuItem value={0}>All</MenuItem>
            { this.state.users.map((user) => {
              return (
                <MenuItem value={user.id}>{ user.full_name }</MenuItem>
              );
            }) }
          </Select>
        </FormControl>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">Payment ID</TableCell>
              <TableCell align="left">Month / Year</TableCell>
              <TableCell align="left">User</TableCell>
              <TableCell align="left">Price</TableCell>
              <TableCell align="left">Plan</TableCell>
              <TableCell align="left">Method</TableCell>
              <TableCell align="left">Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { this.state.shownPayments.map((payment) => {
              const date = new Date(payment.startDate);
              return (
                <TableRow key={payment.id}>
                  <TableCell align="left">#{ payment.id }</TableCell>
                  <TableCell align="left">
                    { date.toLocaleString('en-us', { month: 'long' }) + ' ' }
                    { date.toLocaleString('en-us', { year: 'numeric' }) }
                  </TableCell>
                  <TableCell align="left">{ payment.user.full_name }</TableCell>
                  <TableCell align="left">{ payment.amount } euro</TableCell>
                  <TableCell align="left">{ payment.name }</TableCell>
                  <TableCell align="left">{ payment.payedMethod ? payment.payedMethod : '-' }</TableCell>
                  <TableCell className="capitalize" align="left">{ payment.status }</TableCell>
                  <TableCell component="th" scope="row">
                    <IconButton aria-label="Edit" onClick={() => { this.openPaymentModal(payment); }}>
                      <Icon>assignment</Icon>
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            }) }
          </TableBody>
        </Table>
        <Dialog
          open={this.state.open} onClose={this.closePaymentModal} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Payment #{ this.state.selectedPayment.id }</DialogTitle>
          <DialogContent>
            <div className="edit-staff-form">
              <div className="info">
                <p><span>User:</span> { this.state.selectedPayment.user && this.state.selectedPayment.user.full_name }</p>
                <p><span>Price:</span> { this.state.selectedPayment.amount } euro</p>
                <p><span>Plan:</span> { this.state.selectedPayment.name }</p>
                <p>
                  <span>Billing date: </span>
                  { this.state.selectedPayment.startDate && new Date(this.state.selectedPayment.startDate).toLocaleString('en-us', { month: 'long' }) + ' ' }
                  { this.state.selectedPayment.startDate && new Date(this.state.selectedPayment.startDate).toLocaleString('en-us', { year: 'numeric' }) }
                </p>
                <p><span>Status: </span><b className="capitalize">{ this.state.selectedPayment.status}</b></p>
                <p>
                  <span>Payed at: </span>
                  { this.state.selectedPayment.payedDate ? new Date(this.state.selectedPayment.payedDate).toLocaleDateString() + ' ' +
                    new Date(this.state.selectedPayment.payedDate).toLocaleTimeString() : '-' }
                </p>
                <p><span>Payment method: </span>{ this.state.selectedPayment.payedMethod || '-' }</p>
                { this.state.selectedPayment.payedMethod === 'Card' && <p><span>Transaction id: </span>{ this.state.selectedPayment.recipeUrl }</p> }
              </div>
              <div className="method-container">
                <label>Recipe</label><br />
                { this.state.selectedPayment.recipeUrl && this.state.selectedPayment.payedMethod !== 'Card' &&
                (<span className="download-contract" onClick={() => { this.downloadRecipe(); }}>Download recipe</span>) }
                <FilePond
                  acceptedFileTypes={['image/*']}
                  server={
                    {
                      url: `http://localhost:3001/payments/upload/${this.state.selectedPayment.id}`,
                      process: {
                        headers: {
                          'authorization': `Bearer ${this.props.account.token}`
                        }
                      },
                      revert: {
                        headers: {
                          'authorization': `Bearer ${this.props.account.token}`
                        }
                      },
                    }
                  }/>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closePaymentModal} variant="contained" color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    account: { ...state.user, members: null },
  }
};

export default withRouter(connect(mapStateToProps)(PaymentsPage))


