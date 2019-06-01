import React, { Component } from 'react';
import './Home.scss'
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Textbox} from "react-inputs-validation";
import UserService from "../../services/user.service";
import {FilePond} from "react-filepond";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import EventsService from "../../services/events.service";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import {closeSnackbar, openSnackbar} from "../../actions/snackbar";
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from '@material-ui/core/FormControlLabel';



class HomePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      account: this.props.account,
      plans: [],
      offices: [],
      openEditUserDialog: false,
      openDeleteUserDialog: false,
      search: '',
      selectedUser: {},
      users: [],
      originalUsers: [],
      form: {
        full_name: '',
        cnp: '',
        identity_number: '',
        address: '',
        email: '',
        profile: '',
        freeAccount: false,
        endDatePeriod: 0,
        freeAccountObservation: '',
        team: [],
      },
      formValidation: {
        full_name: false,
        cnp: false,
        identity_number: false,
        address: false,
        email: false,
        profile: false,
      },
    };

    this.userService = new UserService();
    this.eventsService = new EventsService();
    this.fetchUsers();
    this.fetchOffices();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({ ...nextProps });
  }

  deleteUser = () => {
    this.userService.deleteUser(this.state.selectedUser.id).then((response) => {
      this.fetchUsers();
      this.handleCloseDeleteUserDialog();
    });
  }

  fetchUsers() {
    this.userService.getAllUsers().then((response) => {
      if (response.status === 200) {
        this.setState({
          users: response.data,
          originalUsers: response.data,
        });
      }
    });
  }

  fetchOffices() {
    this.eventsService.getOffices().then((response) => {
      if (response.status === 200) {
        this.setState({
          offices: response.data,
        });
      }
    });
  }

  handleCloseEditUserDialog = () => {
    this.setState({
      openEditUserDialog: false,
      selectedUser: {},
    });
  };

  handleOpenEditUserDialog = (user) => {
    this.setState({
      openEditUserDialog: true,
      selectedUser: user,
      form: { ...user, team: [...user.members] },
    });
  };

  handleCloseDeleteUserDialog = () => {
    this.setState({
      openDeleteUserDialog: false,
      selectedUser: {},
    });
  };

  handleOpenDeleteUserDialog = (user) => {
    this.setState({
      openDeleteUserDialog: true,
      selectedUser: user,
    });
  };

  submit = () => {
    let isInvalid = false;
    for (const prop of Object.getOwnPropertyNames(this.state.formValidation)) {
      isInvalid = isInvalid || this.state.formValidation[prop];
    }
    if (!isInvalid) {
      this.userService.saveUser(this.state.form).then((response) => {
        if (response.status === 200) {
          this.props.openSnackbar(response.data.message);
          setTimeout(() => {
            this.props.closeSnackbar();
          }, 3000);
        }
        this.fetchUsers();
        this.fetchOffices();
        this.handleCloseEditUserDialog();
      });
    }
  };

  generateTeamMembersFields() {
    const elements = [];
    if (this.state.form.team.length === 0) {
      return (<span>No team members</span>);
    }
    for (let index = 0; index < this.state.form.team.length; index++) {
      elements.push(<Textbox
        classNameInput="user-edit-input"
        id={`nameOfMember${index}`}
        name={`nameOfMember${index}`}
        disabled={ this.state.account.role !== 3 }
        type="text"
        value={this.state.form.team[index].full_name}
        validate={true}
        onChange={(name) => {
          const team = this.state.form.team.map(i => i);
          team[index].full_name = name;
          this.setState({ form: { ...this.state.form, team: [...team]  }});
        }}
        placeholder={`Team member ${index + 1}`}
        onBlur={() => {}}
        validationOption={{
          name: 'Name of team member',
          check: true,
          required: index === 0
        }} />);
    }
    return elements;
  }

  downloadContract(contractUrl) {
    const element = document.createElement('a');
    element.setAttribute('href', this.userService.downloadContractUrl(contractUrl) + `/${this.state.account.token}`);
    element.setAttribute('target', "_blank");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  receiptMethodRender() {
    if (!this.state.selectedUser.id) {
      return null;
    }
    return (
      <div className="method-container">
        { this.state.selectedUser.contractUrl && (<span className="download-contract" onClick={() => { this.downloadContract(this.state.selectedUser.contractUrl); }}>Download contract</span>) }
        <FilePond
          acceptedFileTypes={['image/*', 'application/pdf']}
          server={
            {
              url: `http://localhost:3001/users/upload/${this.state.selectedUser.id}`,
              process: {
                headers: {
                  'authorization': `Bearer ${this.state.account.token}`
                }
              },
              revert: {
                headers: {
                  'authorization': `Bearer ${this.state.account.token}`
                }
              },
            }
          }/>
          <h4>The contract expire in:</h4>
        <Textbox
          classNameInput="register-input"
          id={'endDatePeriod'}
          name={'endDatePeriod'}
          type="number"
          value={this.state.form.endDatePeriod}
          validate={true}
          onChange={(endDatePeriod) => { this.setState({ form: { ...this.state.form, endDatePeriod } }); }}
          placeholder="Number of months"
          validationCallback={endDatePeriod => { this.setState({ formValidation: { ...this.state.formValidation, endDatePeriod } }) } }
          onBlur={() => {}}
          validationOption={{
            name: 'ID',
            check: true,
            required: false,
          }}
        />
      </div>
    );
  }

  getOffice(id) {
    return this.state.offices.find((office) => office.id === id);
  }

  getOfficeClass(id) {
    const office = this.getOffice(id);
    if (office && this.state.form.office && this.state.form.office.id === office.office_id) {
      return ' selected';
    }
    if (office && this.state.selectedUser.office && office.busy === 1 && office.id !== this.state.selectedUser.office.id) {
      return ' reserved';
    }
    if (office && this.state.selectedUser.office && office.busy === 2 && office.id !== this.state.selectedUser.office.id) {
      return ' busy';
    }
    return '';
  }

  handleChangeOffice = (officeId) => {
    const office = this.getOffice(officeId);
    if (office && office.busy && this.state.selectedUser.office && office.id !== this.state.selectedUser.office.id) {
      return;
    }
    this.setState({
      form: { ...this.state.form, office: office }
    });
  };

  renderOfficeDropdown() {
    if (!this.state.form || !this.state.form.office ) {
      return;
    }
    return (
      <div className="office-dropdown">
        <div className="office-container">
          <div className={"office" + this.getOfficeClass(1)} onClick={() => { this.handleChangeOffice(1) }}>Office</div>
          <div className={"office" + this.getOfficeClass(2)} onClick={() => { this.handleChangeOffice(2) }}>Office</div>
          <div className={"office" + this.getOfficeClass(3)} onClick={() => { this.handleChangeOffice(3) }}>Office</div>
          <div className={"office" + this.getOfficeClass(4)} onClick={() => { this.handleChangeOffice(4) }}>Office</div>
          <div className="hall" />
          <div className={"office" + this.getOfficeClass(5)} onClick={() => { this.handleChangeOffice(5) }}>Office</div>
          <div className={"office" + this.getOfficeClass(6)} onClick={() => { this.handleChangeOffice(6) }}>Office</div>
          <div className={"office" + this.getOfficeClass(7)} onClick={() => { this.handleChangeOffice(7) }}>Office</div>
          <div className={"office" + this.getOfficeClass(8)} onClick={() => { this.handleChangeOffice(8) }}>Office</div>
        </div>
        <div className="legend">
          <div className="item">
            Taken <div className="taken" />
          </div>
          <div className="item">
            Reserved <div className="reserved" />
          </div>
          <div className="item">
            Selected <div className="selected" />
          </div>
          <div className="item">
            Free <div className="free" />
          </div>
        </div>
      </div>
    );
  }

  handleChangeFreeAccount = (event) => {
    this.setState({
      form: { ...this.state.form, freeAccount: event.target.checked }
    })
  };

  getFormStep() {
    return (
      <div className="edit-user-form">
        <Textbox
          id={'full_name'}
          name={'full_name'}
          type="text"
          disabled={ this.state.account.role < 2 }
          value={this.state.form.full_name}
          validate={true}
          onChange={(full_name) => { this.setState({ form: { ...this.state.form, full_name } }); }}
          placeholder="Your full name"
          validationCallback={full_name => { this.setState({ formValidation: { ...this.state.formValidation, full_name } }) } }
          onBlur={() => {}}
          validationOption={{
            name: 'Full name',
            check: true,
            required: true
          }}
          classNameInput="user-edit-input"
        />
        <Textbox
          classNameInput="user-edit-input"
          id={'cnp'}
          disabled={ this.state.account.role < 2 }
          name={'cnp'}
          type="number"
          value={this.state.form.cnp}
          validate={true}
          onChange={(cnp) => { this.setState({ form: { ...this.state.form, cnp } }); }}
          placeholder="Your ID"
          validationCallback={cnp => { this.setState({ formValidation: { ...this.state.formValidation, cnp } }) } }
          onBlur={() => {}}
          validationOption={{
            name: 'ID',
            check: true,
            required: true,
            reg: /^([0-9]){13}$/
          }}
        />
        <Textbox
          classNameInput="user-edit-input"
          id={'identity_number'}
          name={'identity_number'}
          disabled={ this.state.account.role < 2 }
          type="text"
          value={this.state.form.identity_number}
          validate={true}
          onChange={(identity_number) => { this.setState({ form: { ...this.state.form, identity_number } }); }}
          placeholder="Your identity card number"
          validationCallback={identity_number => { this.setState({ formValidation: { ...this.state.formValidation, identity_number } }) } }
          onBlur={() => {}}
          validationOption={{
            name: 'Identity card number',
            check: true,
            required: true,
            reg: /^([A-Z]{2})([0-9]){6}$/
          }}
        />
        <Textbox
          classNameInput="user-edit-input"
          id={'address'}
          name={'address'}
          disabled={ this.state.account.role < 2 }
          type="text"
          value={this.state.form.address}
          validate={true}
          onChange={(address) => { this.setState({ form: { ...this.state.form, address } }); }}
          placeholder="Address"
          validationCallback={address => { this.setState({ formValidation: { ...this.state.formValidation, address } }) } }
          onBlur={() => {}}
          validationOption={{
            name: 'Address',
            check: true,
            required: true,
          }}
        />
        <Textbox
          classNameInput="user-edit-input"
          id={'email'}
          name={'email'}
          type="text"
          disabled={ this.state.account.role < 2 }
          value={this.state.form.email}
          validate={true}
          onChange={(email) => { this.setState({ form: { ...this.state.form, email } }); }}
          placeholder="Email"
          validationCallback={email => { this.setState({ formValidation: { ...this.state.formValidation, email } }) } }
          onBlur={() => {}}
          validationOption={{
            name: 'Email',
            check: true,
            required: true,
            customFunc: email => {
              const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
              if (reg.test(String(email).toLowerCase())) {
                return true;
              } else {
                return 'Is not a valid email address';
              }
            }
          }}
        />
        <Textbox
          id={'profile'}
          name={'profile'}
          type="text"
          disabled={ this.state.account.role < 2  }
          value={this.state.form.profile}
          validate={true}
          onChange={(profile) => { this.setState({ form: { ...this.state.form, profile } }); }}
          placeholder="Profile"
          validationCallback={profile => { this.setState({ formValidation: { ...this.state.formValidation, profile } }) } }
          onBlur={() => {}}
          validationOption={{
            name: 'Profile',
            check: true,
            required: true
          }}
          classNameInput="user-edit-input"
        />
        <FormControlLabel
          control={
            <Checkbox checked={this.state.form.freeAccount} onChange={this.handleChangeFreeAccount} value="checkedA" />
          }
          label="Free account"
        />
        <Textbox
          id={'freeAccountObservation'}
          name={'freeAccountObservation'}
          type="text"
          disabled={ this.state.account.role < 2 }
          value={this.state.form.freeAccountObservation}
          validate={true}
          onChange={(freeAccountObservation) => { this.setState({ form: { ...this.state.form, freeAccountObservation } }); }}
          placeholder="Observations"
          validationCallback={() => {} }
          onBlur={() => {}}
          validationOption={{
            name: 'Observations',
            check: true,
            required: false
          }}
          classNameInput="user-edit-input"
        />
      </div>
    );
  }

  handleSearch = (event) => {
    this.setState({
      search: event.target.value,
      users: this.state.originalUsers.filter((user) => {
        if (event.target.value === '') {
          return true;
        }
        if (user.full_name.toLowerCase().includes(event.target.value)) {
          return true;
        }
        if (user.email.toLowerCase().includes(event.target.value)) {
          return true;
        }
        if (user.identity_number.toLowerCase().includes(event.target.value)) {
          return true;
        }
        if (user.profile.toLowerCase().includes(event.target.value)) {
          return true;
        }
        if (user.address.toLowerCase().includes(event.target.value)) {
          return true;
        }
        if (user.office && user.office.name.toLowerCase().includes(event.target.value)) {
          return true;
        }
        if (user.cnp.toLowerCase().includes(event.target.value)) {
          return true;
        }
        return false;
      }),
    });
  };

  render() {

    return (
      <div className="container">
        <div className="header-container">
          <h2 className="header">Dashboard</h2>
          <TextField
            id="input-with-icon-textfield"
            label="Search"
            onChange={this.handleSearch}
            value={this.state.search}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </div>
        <div className="grid three">
          { this.state.users.map((user) => {
            const status = user.payments.find((payment) => payment.status === 'unpaid') ? 'Unpaid' : 'Payed';
            return (
              <Card className="user-card">
                <CardContent>
                  <Typography variant="h5" component="h2">
                    { user.full_name }
                  </Typography>
                  <Typography component="p">
                    <span>Office</span>: { user.office ? user.office.name : 'Unassigned' } <br />
                    <span>Team Members</span>: { user.members.length + 1 } <br />
                    <span>End date</span>: { user.endDate ? new Date(user.endDate).toLocaleDateString() : 'No contract' } <br />
                    <span>Subscription plan</span>: { user.plan.name } ({ user.plan.price } euro) <br />
                    <span>Account status</span>: { user.contractUrl ? 'Active' : 'Not active' }<br />
                    <span>Payment status</span>: <b>{ status }</b> for last month
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => { this.handleOpenEditUserDialog(user); }}>Manage</Button>
                  <Button disabled={ this.state.account.role !== 3 } size="small" onClick={() => { this.handleOpenDeleteUserDialog(user); }}>Delete</Button>
                </CardActions>
              </Card>
            );
          }) }
        </div>
        <Dialog
          fullWidth={"500"}
          maxWidth={"500"}
          open={this.state.openEditUserDialog} onClose={this.handleCloseEditUserDialog} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Edit { this.state.selectedUser.full_name }</DialogTitle>
          <DialogContent>
            <div className="grid-manage-user">
              <div className="two-items">
                <h4>General information</h4>
                { this.getFormStep() }
              </div>
              { this.state.selectedUser && this.state.selectedUser.plan && this.state.selectedUser.plan.allowMoreThanOne && <div className="two-items">
                <div className="team-members">
                  <h4>Team Members</h4>
                  { this.generateTeamMembersFields() }
                </div>
              </div> }
              <div className="two-items">
                <h4>Contract</h4>
                { this.receiptMethodRender() }
              </div>
              <div className="two-items">
                <h4>Office</h4>
                { this.renderOfficeDropdown() }
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseEditUserDialog} color="primary">
              Close
            </Button>
            <Button variant="contained" onClick={this.submit} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={this.state.openDeleteUserDialog} onClose={this.handleCloseDeleteUserDialog} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Are you sure?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This action can not be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDeleteUserDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={this.deleteUser} color="primary">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          open={this.props.snackbar.open}
          autoHideDuration={6000}
          onClose={this.handleClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{ this.props.snackbar.message }</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={this.props.closeSnackbar}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    openSnackbar: (message) => {
      dispatch(openSnackbar(message));
    },
    closeSnackbar: () => {
      dispatch(closeSnackbar());
    }
  };
};

const mapStateToProps = state => {
  return {
    account: { ...state.user, members: null },
    snackbar: state.snackbar,
  }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomePage))
