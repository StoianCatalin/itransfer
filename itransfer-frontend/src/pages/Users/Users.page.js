import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import {ConfirmationModal} from "../../components/modals/confirmation/Confirmation.modal";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";

let id = 0;
function createData(name, role, email, phone) {
  id += 1;
  return { id, name, role, email, phone };
}

const rows = [
  createData('Stoian Catalin', "Admin", "stoian.ioan.catalin@gmail.com", "0754334323"),
  createData('User User 1', 'Manager', 'manager@demo.ro', '07343234333'),
  createData('User User 2', 'Manager', 'manager2@demo.ro', '07354334333'),
  createData('User User 3', 'Manager', 'manager3@demo.ro', '07356544333'),
  createData('User User 4', 'Manager', 'manager4@demo.ro', '0734232333'),
];

class UsersPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }


  handleConfirmationModal = () => {
    this.setState({
      open: true,
    });
  };

  handleClose = value => {
    this.setState({ selectedValue: value, open: false });
  };

  render() {
    return (
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Role</TableCell>
              <TableCell align="left">Email</TableCell>
              <TableCell align="left">Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.id}>
                <TableCell align="left">
                  {row.name}
                </TableCell>
                <TableCell align="left">{row.role}</TableCell>
                <TableCell align="left">{row.email}</TableCell>
                <TableCell align="left">{row.phone}</TableCell>
                <TableCell component="th" scope="row">
                  <IconButton aria-label="Edit" onClick={() => {this.props.history.push("/users/1/edit")}}>
                    <Icon>edit_icon</Icon>
                  </IconButton>
                  <IconButton color="secondary" aria-label="Delete" onClick={this.handleConfirmationModal}>
                    <Icon>delete_icon</Icon>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ConfirmationModal open={this.state.open}
                           onClose={this.handleClose} />
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {

  }
};

export default withRouter(connect(mapStateToProps)(UsersPage))


