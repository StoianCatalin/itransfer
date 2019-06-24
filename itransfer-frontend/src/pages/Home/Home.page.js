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
          <h4>The contract expires in:</h4>
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

  selectOffice = (officeId) => {
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
        const value = event.target.value.toLowerCase();
        if (event.target.value === '') {
          return true;
        }
        if (user.full_name.toLowerCase().includes(value)) {
          return true;
        }
        if (user.email.toLowerCase().includes(value)) {
          return true;
        }
        if (user.identity_number.toLowerCase().includes(value)) {
          return true;
        }
        if (user.profile.toLowerCase().includes(value)) {
          return true;
        }
        if (user.address.toLowerCase().includes(value)) {
          return true;
        }
        if (user.office && user.office.name.toLowerCase().includes(value)) {
          return true;
        }
        if (user.cnp.toLowerCase().includes(value)) {
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
              <div className="one-item">
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
