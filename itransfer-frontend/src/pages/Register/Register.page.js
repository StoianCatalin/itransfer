import React, { Component } from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import './RegisterPage.scss';
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {loginUser} from "../../actions/user";
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import {closeSnackbar, openSnackbar} from "../../actions/snackbar";
import { Textbox } from 'react-inputs-validation';
import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers';
import CircularProgress from '@material-ui/core/CircularProgress';
import PlansService from "../../services/plans.service";
import DateFnsUtils from '@date-io/date-fns';
import AuthService from "../../services/auth.service";

function getSteps() {
  return ['Select your profile', 'Choose your subscription plan', 'Complete with your personal data'];
}

class RegisterPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeStep: 0,
      selectedType: 1,
      selectedPlan: 0,
      startDate: new Date(),
      plans: [],
      loading: false,
      form: {
        name: '',
        cnp: '',
        identity_number: '',
        address: '',
        email: '',
        password: '',
        team: [],
      },
      formValidation: {
        name: true,
        cnp: true,
        identity_number: true,
        address: true,
        email: true,
        password: true,
      },
    };

    this.plansService = new PlansService();
    this.authService = new AuthService();
  }

  handleNext = () => {
    if (this.state.activeStep === 0) {
      this.fetchPlans();
    }
    if (this.state.activeStep === 2) {
      this.submit();
    } else {
      this.setState(state => ({
        loading: this.state.activeStep === 0,
        activeStep: state.activeStep + 1,
      }));
    }
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1,
    }));
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
    });
  };

  handleSelectType = (selectedType) => {
    this.setState({
      selectedType
    });
  };

  async fetchPlans() {
    const { data } = await this.plansService.getPlans(this.state.selectedType);
    this.setState({
      plans: data,
      loading: false,
      selectedPlan: data[0].id
    });
  }

  handleDateChange = date => {
    this.setState({ startDate: new Date(date) });
  };

  get hasMoreMembersInTeam() {
    const plan = this.state.plans.find((plan) => plan.id === this.state.selectedPlan);
    if (!plan) {
      return false;
    }
    return plan.allowMoreThanOne;
  }

  get isFormValid() {
    let isInvalid = false;
    for (const prop of Object.getOwnPropertyNames(this.state.formValidation)) {
      isInvalid = isInvalid || this.state.formValidation[prop];
    }
    if (this.hasMoreMembersInTeam) {
      isInvalid = isInvalid || this.state.form.team.length === 0;
    }
    return !isInvalid;
  }

  async submit() {
    if (this.isFormValid) {
      try {
        const response = await this.authService.register({
          full_name: this.state.form.name,
          ...this.state.form,
        }, { planId: this.state.selectedPlan, startDate: new Date(this.state.startDate).getTime() });
        if (response.status === 200) {
          this.props.login(response.data);
          this.setState(state => ({
            loading: this.state.activeStep === 0,
            activeStep: state.activeStep + 1,
          }));
        } else {
          this.props.openSnackbar(response.data.message);
        }
      } catch (e) {
        this.props.openSnackbar(e.response.data.message);
      }
    }
  }

  getSubscriptionStep() {
    if (this.state.loading) {
      return (
        <div className="loading-step">
          <CircularProgress />
        </div>
      );
    }
    const plansCards = [];
    for (const plan of this.state.plans) {
      const facilitiesItems = [];
      for (const facility of plan.facilities) {
        facilitiesItems.push(<li>{facility.name}</li>);
      }
      plansCards.push(
        <div className={"plan-card " + (this.state.selectedPlan === plan.id && "selected")}>
          <div className="name" style={{"background-color": `#6b54b7`}}>{plan.name}</div>
          <ul>
            {facilitiesItems}
            <li>{plan.price}€ / {plan.period}</li>
          </ul>
          <Button
            fullWidth={true}
            onClick={() => { this.setState({ selectedPlan: plan.id }) }}
            color="primary">
            { this.state.selectedPlan === plan.id ? 'Selected' : 'Select' }
          </Button>
        </div>
      );
    }
    return (
      <div className="subscription-table">
        {plansCards}
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DatePicker
            margin="normal"
            label="Start date"
            disablePast={true}
            value={this.state.startDate}
            onChange={this.handleDateChange}
          />
        </MuiPickersUtilsProvider>
      </div>
    );
  }

  getProfileStep() {
    return (
      <div className="profile-cards">
        <div className={ "profile-card " + (this.state.selectedType === 1 && 'selected') }
             onClick={() => { this.handleSelectType(1) }}>Professional</div>
        <div className={ "profile-card " + (this.state.selectedType === 2 && 'selected') }
             onClick={() => { this.handleSelectType(2) }}>Students</div>
      </div>
    );
  }

  generateTeamMembersFields() {
    const elements = [];
    for (let index = 0; index <= this.state.form.team.length; index++) {
      elements.push(<Textbox
        classNameInputs="register-input"
        id={`nameOfMember${index}`}
        name={`nameOfMember${index}`}
        type="text"
        value={this.state.form.team[index]}
        validate={true}
        onChange={(name) => {
          const team = this.state.form.team.map(i => i);
          team[index] = name;
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

  getFormStep() {
    return (
      <div className="register-form">
        <Textbox
          classNameInputs="register-input"
          id={'name'}
          name={'name'}
          type="text"
          value={this.state.form.name}
          validate={true}
          onChange={(name) => { this.setState({ form: { ...this.state.form, name } }); }}
          placeholder="Your full name"
          validationCallback={name => { this.setState({ formValidation: { ...this.state.formValidation, name } }) } }
          onBlur={() => {}}
          validationOption={{
            name: 'Full name',
            check: true,
            required: true
          }}
        />
        <Textbox
          classNameInput="register-input"
          id={'cnp'}
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
          classNameInput="register-input"
          id={'identity_number'}
          name={'identity_number'}
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
          classNameInput="register-input"
          id={'address'}
          name={'address'}
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
          classNameInput="register-input"
          id={'email'}
          name={'email'}
          type="text"
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
          classNameInput="register-input"
          id={'password'}
          name={'password'}
          type="password"
          value={this.state.form.password}
          validate={true}
          onChange={(password) => { this.setState({ form: { ...this.state.form, password } }); }}
          placeholder="Password"
          validationCallback={password => { this.setState({ formValidation: { ...this.state.formValidation, password } }) } }
          onBlur={() => {}}
          validationOption={{
            name: 'Password',
            check: true,
            required: true,
            min: 6
          }}
        />
        { this.hasMoreMembersInTeam && <div className="team-members">
          <h4>Team Members</h4>
          { this.generateTeamMembersFields() }
        </div> }
      </div>
    );
  }

  getStepContent(step) {
    switch (step) {
      case 0:
        return this.getProfileStep();
      case 1:
        return this.getSubscriptionStep();
      case 2:
        return this.getFormStep();
      default:
        return 'Unknown step';
    }
  }


  render() {
    const steps = getSteps();
    const { activeStep } = this.state;

    return (
      <div className="register-page">
        <div className="container">
          <h2 className="title">Register</h2>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  <Typography>{this.getStepContent(index)}</Typography>
                  <div>
                    <div>
                      <Button
                        disabled={activeStep === 0}
                        onClick={this.handleBack}
                      >
                        Back
                      </Button>
                      {activeStep < steps.length - 1 && <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleNext}
                      >Next</Button>}
                      {activeStep === steps.length - 1 && <Button
                        variant="contained"
                        color="primary"
                        disabled={!this.isFormValid}
                        onClick={this.handleNext}
                      >Finish</Button>}
                    </div>
                  </div>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length && (
            <Paper square elevation={0}>
              <Typography>All steps completed - you&apos;re finished</Typography>
              <Button onClick={this.handleReset}>
                Reset
              </Button>
            </Paper>
          )}
          <div className="login-link">
            <Link to="/login">I already have an account. Take me to login page!</Link>
          </div>
        </div>
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
    login: (user) => {
      dispatch(loginUser(user))
    },
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
    snackbar: state.snackbar,
  }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RegisterPage))


