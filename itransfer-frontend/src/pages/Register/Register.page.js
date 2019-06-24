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
import EventsService from "../../services/events.service";
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

function getSteps() {
  return ['Select your profile', 'Choose your subscription plan', 'Complete with your personal data', 'Choose your office'];
}

class RegisterPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeStep: 0,
      selectedType: 1,
      selectedOffice: null,
      selectedPlan: 0,
      startDate: new Date(),
      plans: [],
      loading: false,
      offices: [],
      profileValue: '',
      form: {
        name: '',
        cnp: '',
        identity_number: '',
        address: '',
        email: '',
        password: '',
        profile: 'Industry specialist',
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
    this.eventsService = new EventsService();

    this.fetchOffices();
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

  handleChangeProfile = (event) => {
    this.setState({
      form: { ...this.state.form, profile: event.target.value }
    })
  };

  handleNext = () => {
    if (this.state.activeStep === 0) {
      this.fetchPlans();
    }
    if (this.state.activeStep === 3) {
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
    if (this.state.selectedOffice === null) {
      return false;
    }
    return !isInvalid;
  }

  async submit() {
    if (this.isFormValid) {
      try {
        const response = await this.authService.register({
          full_name: this.state.form.name,
          office_id: this.state.selectedOffice,
          ...this.state.form,
          profile: this.state.form.profile === 'Other' ? this.state.profileValue : this.state.form.profile,
        }, { planId: this.state.selectedPlan, startDate: new Date(this.state.startDate).getTime() });
        if (response.status === 200) {
          this.props.openSnackbar(response.data.message);
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
        classNameInput="register-input"
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
        <br />
        <InputLabel className="salect-profile" htmlFor="profile-simple">Profile</InputLabel>
        <Select
          value={this.state.form.profile}
          onChange={this.handleChangeProfile}
          inputProps={{
            name: 'profile',
            id: 'profile-simple',
          }}
        >
          <MenuItem value={'Industry specialist'}>Industry specialist</MenuItem>
          <MenuItem value={'Researcher / Teacher'}>Researcher / Teacher</MenuItem>
          <MenuItem value={'Student'}>Student</MenuItem>
          <MenuItem value={'Other'}>Other</MenuItem>
        </Select>
        { this.state.form.profile === 'Other' &&
        <Textbox
          classNameInput="register-input profile-input"
          id={'profile'}
          name={'profile'}
          type="text"
          value={this.state.profileValue}
          validate={true}
          onChange={(profileValue) => { this.setState({ profileValue }); }}
          placeholder="Your profile"
          validationCallback={profile => {} }
          onBlur={() => {}}
          validationOption={{
            name: 'Profile',
            check: true,
          }}
        />}
        { this.hasMoreMembersInTeam && <div className="team-members">
          <h4>Team Members</h4>
          { this.generateTeamMembersFields() }
        </div> }
      </div>
    );
  }

  selectOffice(officeId) {
    const office = this.getOffice(officeId);
    if (office && office.busy) {
      return;
    }
    this.setState({
      selectedOffice: officeId,
    })
  }

  getOffice(id) {
    return this.state.offices.find((office) => office.id === id);
  }

  getOfficeClass(id) {
    const office = this.getOffice(id);
    if (office && office.busy === 1) {
      return ' reserved';
    }
    if (office && office.busy === 2) {
      return ' busy';
    }
    if (office && this.state.selectedOffice === office.office_id) {
      return ' selected';
    }
    return '';
  }

  getOfficeStep() {
    return (
      [<div className="office-container">
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsSe="http://svg-edit.googlecode.com"
             xmlnsXlink="http://www.w3.org/1999/xlink" xmlnsDc="http://purl.org/dc/elements/1.1/"
             xmlnsCc="http://creativecommons.org/ns#" xmlnsRdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlnsInkscape="http://www.inkscape.org/namespaces/inkscape" className="workspace-room"><title>Room</title>
          <rect id="backgroundrect" width="100%" height="100%" x="0" y="0" fill="#FFFFFF" stroke="none"/>
          <g className="currentLayer"><title>Office</title>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" id="svg_1" x="1.098901391029358" y="0.09890115261077881"
                  width="123.15383911132812" height="99.4065933227539" className={"office black" + this.getOfficeClass(1)}
                  onClick={() => { this.selectOffice(1) }}
                  fill-opacity="1"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="305.71429443359375" y="170.09890747070312" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(6)} onClick={() => { this.selectOffice(6) }} fill-opacity="1" id="svg_4"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="305.93408203125" y="201.08792114257812" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(7)} onClick={() => { this.selectOffice(7) }} fill-opacity="1" id="svg_5"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="367.69232177734375" y="262.2967224121094" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(8)} onClick={() => { this.selectOffice(8) }} fill-opacity="1" id="svg_17"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="218.4615478515625" y="204.82418823242188" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(9)} onClick={() => { this.selectOffice(9) }} fill-opacity="1" id="svg_22"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="178.02198791503906" y="205.04397583007812" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(10)} onClick={() => { this.selectOffice(10) }} fill-opacity="1" id="svg_26"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="62.857154846191406" y="170.09890747070312" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(11)} onClick={() => { this.selectOffice(11) }} fill-opacity="1" id="svg_30"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="63.62638854980469" y="228.56045532226562" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(12)} onClick={() => { this.selectOffice(12) }} fill-opacity="1" id="svg_32"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="103.40660858154297" y="228.23077392578125" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(13)} onClick={() => { this.selectOffice(13) }} fill-opacity="1" id="svg_33"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="103.73627471923828" y="170.31869506835938" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(14)} onClick={() => { this.selectOffice(14) }} fill-opacity="1" id="svg_31"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="178.2417755126953" y="237.1318817138672" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(15)} onClick={() => { this.selectOffice(15) }} fill-opacity="1" id="svg_27"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="177.91209411621094" y="269.21978759765625" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(16)} onClick={() => { this.selectOffice(16) }} fill-opacity="1" id="svg_28"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="178.1318817138672" y="301.3077087402344" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(17)} onClick={() => { this.selectOffice(17) }} fill-opacity="1" id="svg_29"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="7.4725341796875" y="294.93408203125" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(18)} onClick={() => { this.selectOffice(18) }} fill-opacity="1" id="svg_34"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="48.351654052734375" y="295.15386962890625" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(19)} onClick={() => { this.selectOffice(19) }} fill-opacity="1" id="svg_35"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="48.571434020996094" y="327.24176025390625" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(20)} onClick={() => { this.selectOffice(20) }} fill-opacity="1" id="svg_36"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="8.131871223449707" y="326.912109375" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(21)} onClick={() => { this.selectOffice(21) }} fill-opacity="1" id="svg_37"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="218.6813201904297" y="236.91209411621094" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(22)} onClick={() => { this.selectOffice(22) }} fill-opacity="1" id="svg_23"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="218.35165405273438" y="269.0000305175781" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(23)} onClick={() => { this.selectOffice(23) }} fill-opacity="1" id="svg_24"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="218.57142639160156" y="301.0879211425781" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(24)} onClick={() => { this.selectOffice(24) }} fill-opacity="1" id="svg_25"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="326.70330810546875" y="279" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(25)} onClick={() => { this.selectOffice(25) }} fill-opacity="1" id="svg_18"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="367.5824279785156" y="294.6044006347656" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(26)} onClick={() => { this.selectOffice(26) }} fill-opacity="1" id="svg_19"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="326.5934143066406" y="311.8571472167969" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(27)} onClick={() => { this.selectOffice(27) }} fill-opacity="1" id="svg_20"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="367.4725341796875" y="327.4615478515625" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(28)} onClick={() => { this.selectOffice(28) }} fill-opacity="1" id="svg_21"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="346.2637634277344" y="170.53846740722656" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(29)} onClick={() => { this.selectOffice(29) }} fill-opacity="1" id="svg_6"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="387.14288330078125" y="170.75823974609375" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(30)} onClick={() => { this.selectOffice(30) }} fill-opacity="1" id="svg_8"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="387.3626708984375" y="201.19781494140625" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(31)} onClick={() => { this.selectOffice(31) }} fill-opacity="1" id="svg_16"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="346.15386962890625" y="201.19781494140625" width="40.18680191040039"
                  height="31.824172973632812" className={"office black" + this.getOfficeClass(32)} onClick={() => { this.selectOffice(32) }} fill-opacity="1" id="svg_9"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="294.72528076171875" y="-0.2307700514793396" width="113.26373291015625"
                  height="99.4065933227539" className={"office black" + this.getOfficeClass(3)} onClick={() => { this.selectOffice(3) }} fill-opacity="1" id="svg_12"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="473.5164794921875" y="164.8241729736328" width="113.26373291015625"
                  height="99.4065933227539" className={"office black" + this.getOfficeClass(4)} onClick={() => { this.selectOffice(4) }} fill-opacity="1" id="svg_13"/>
            <rect stroke="#222222" stroke-width="2" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="588.02197265625" y="165.04396057128906" width="113.26373291015625"
                  height="99.4065933227539" className={"office black" + this.getOfficeClass(5)} onClick={() => { this.selectOffice(5) }} fill-opacity="1" id="svg_14"/>
            <rect stroke="#222222" stroke-width="1" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" x="124.94506072998047" y="-0.2307700514793396" width="168.75823974609375"
                  height="99.4065933227539" className={"office black" + this.getOfficeClass(2)} onClick={() => { this.selectOffice(2) }} fill-opacity="1" id="svg_11"/>
            <rect fill="#4a90d6" stroke="#222222" stroke-width="2" stroke-linejoin="round" stroke-dashoffset=""
                  fill-rule="nonzero" id="svg_2" x="227" y="81" width="0" height="19" className="black"/>
            <rect fill="#b6b6b6" stroke="#ffffff" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  id="svg_3" x="51.890106201171875" y="17.296703338623047" width="23.956045150756836"
                  height="62.29670715332031" className="black" fill-opacity="1"/>
            <rect fill="#b6b6b6" stroke="#ffffff" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="342.21978759765625" y="18.065933227539062" width="23.956045150756836" height="62.29670715332031"
                  className="black" fill-opacity="1" id="svg_44"/>
            <rect fill="#b6b6b6" stroke="#ffffff" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="175.73626708984375" y="1.0329647064208984" width="64.61538696289062" height="29.87912368774414"
                  className="" fill-opacity="1" id="svg_38"/>
            <rect fill="#b6b6b6" stroke="#ffffff" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="508.3736572265625" y="194.6593475341797" width="45.38461685180664" height="43.615386962890625"
                  className="black" fill-opacity="1" id="svg_47"/>
            <rect fill="#b6b6b6" stroke="#ffffff" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="595.9560546875" y="185.53846740722656" width="74.50550079345703" height="22.18681526184082"
                  className="black" fill-opacity="1" id="svg_52"/>
            <rect fill="#b6b6b6" stroke="#ffffff" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="614.3077392578125" y="233.010986328125" width="74.50550079345703" height="22.18681526184082"
                  className="black" fill-opacity="1" id="svg_53"/>
            <rect fill="#b6b6b6" stroke="#ffffff" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="262.21978759765625" y="32.57143020629883" width="31.09890365600586" height="63.395606994628906"
                  className="black" fill-opacity="1" id="svg_39"/>
            <rect fill="#b6b6b6" stroke="#ffffff" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="126.17583465576172" y="31.14285659790039" width="31.09890365600586" height="63.395606994628906"
                  className="black" fill-opacity="1" id="svg_40"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  id="svg_7" x="22.23076820373535" y="37.39560317993164" width="21" height="20"
                  className="black" fill-opacity="1" stroke-opacity="1"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="315.8571472167969" y="39.26373291015625" width="21" height="20"
                  className="black" fill-opacity="1" stroke-opacity="1" id="svg_45"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="373.21978759765625" y="38.93406295776367" width="21" height="20"
                  className="black" fill-opacity="1" stroke-opacity="1" id="svg_46"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="84.53845977783203" y="36.516483306884766" width="21" height="20"
                  className="black selected" fill-opacity="1" stroke-opacity="1" id="svg_10"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="199.04396057128906" y="32.34065628051758" width="21" height="20"
                  className="black" fill-opacity="1" stroke-opacity="1" id="svg_41"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="159.7032928466797" y="38.0549430847168" width="21" height="20"
                  className="black" fill-opacity="1" stroke-opacity="1" id="svg_42"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="159.92306518554688" y="65.74725341796875" width="21" height="20"
                  className="black" fill-opacity="1" stroke-opacity="1" id="svg_58"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="239.0439453125" y="38.82417297363281" width="21" height="20"
                  className="black" fill-opacity="1" stroke-opacity="1" id="svg_43"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="238.7142791748047" y="65.4175796508789" width="21" height="20"
                  className="black" fill-opacity="1" stroke-opacity="1" id="svg_59"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="485.967041015625" y="206.07691955566406" width="21" height="20"
                  className="black" fill-opacity="1" stroke-opacity="1" id="svg_48"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="520.2527465820312" y="172.78021240234375" width="21" height="20"
                  className="black" fill-opacity="1" stroke-opacity="1" id="svg_49"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="602.8900756835938" y="169.7032928466797" width="14.956043243408203" height="13.956043243408203"
                  className="black" fill-opacity="1" stroke-opacity="1" id="svg_54"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="645.967041015625" y="170.47251892089844" width="14.956043243408203" height="13.956043243408203"
                  className="black" fill-opacity="1" stroke-opacity="1" id="svg_55"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="621.4614868164062" y="216.8461456298828" width="14.956043243408203" height="13.956043243408203"
                  className="black" fill-opacity="1" stroke-opacity="1" id="svg_56"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="661.7911987304688" y="216.5164794921875" width="14.956043243408203" height="13.956043243408203"
                  className="black" fill-opacity="1" stroke-opacity="1" id="svg_57"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="555.6373291015625" y="205.96702575683594" width="21" height="20"
                  className="" fill-opacity="1" stroke-opacity="1" id="svg_50"/>
            <rect fill="#ffffff" stroke="#b6b6b6" stroke-linejoin="round" stroke-dashoffset="" fill-rule="nonzero"
                  x="521.2417602539062" y="239.7032928466797" width="21" height="20"
                  className="black" fill-opacity="1" stroke-opacity="1" id="svg_51"/>
          </g>
        </svg>
      </div>,
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
      </div>]
    )
  }

  getStepContent(step) {
    switch (step) {
      case 0:
        return this.getProfileStep();
      case 1:
        return this.getSubscriptionStep();
      case 2:
        return this.getFormStep();
      case 3:
        return this.getOfficeStep();
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
              <div className="login-link">
                <Link to="/login">Take me to login page!</Link>
              </div>
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


