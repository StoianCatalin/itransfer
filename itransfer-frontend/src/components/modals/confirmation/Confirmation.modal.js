import React from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import './ConfirmationModal.scss';
import Button from '@material-ui/core/Button';

export class ConfirmationModal extends React.Component {
  handleClose = (value) => {
    this.props.onClose(value);
  };

  render() {
    const { classes, onClose, selectedValue, ...other } = this.props;

    return (
      <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" {...other}>
        <DialogTitle className="dialog-header">Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action can not undo. Once you press 'Yes' the user will erased.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {this.handleClose(false); }} color="primary">
            Cancel
          </Button>
          <Button onClick={() => {this.handleClose(true); }} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
