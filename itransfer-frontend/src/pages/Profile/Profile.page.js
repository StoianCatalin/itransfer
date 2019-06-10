import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import './Profile.scss';
import {Button, Divider, Icon} from "@material-ui/core";
import { Textbox } from 'react-inputs-validation';

class ProfilePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      form: {
        name: this.props.form.full_name,
        password: '',
        email: this.props.form.email,
      },
      formValidation: {
        name: true,
        password: true,
        confirmPassword: true,
        email: true,
      },
      teamMembers: {
        member1: { name: '', email: '' },
        member2: { name: '', email: '' },
        member3: { name: '', email: '' },
        member4: { name: '', email: '' },
        member5: { name: '', email: '' },
      }
    };
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  render() {
    return (
      <div className="profile-container">
        <h2>My profile</h2>
        <Divider />
        <div className="profile-form">
          <Textbox
            classNameInputs="profile-input"
            id={'name'}
            name={'Full name'}
            type="text"
            value={this.state.form.name}
            validate={true}
            onChange={(name) => { this.setState({ form: { ...this.state.form, name } }); }}
            placeholder="Full name"
            validationCallback={name => { this.setState({ formValidation: { ...this.state.formValidation, name } }) } }
            onBlur={() => {}}
            validationOption={{
              name: 'Full name',
              check: true,
              required: true
            }}
          />
          <Textbox
            classNameInput="profile-input"
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
          <Textbox
            classNameInput="profile-input"
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
          <h4>Team members</h4>
          <div className="two-columns">
            <Textbox
              classNameInput="profile-input"
              classNameWrapper="input-wrapper"
              id={'member1-name'}
              name={'member1-name'}
              type="text"
              value={this.state.teamMembers.member1.name}
              validate={true}
              onChange={(name) => { this.setState({ teamMembers: {
                  ...this.state.teamMembers, member1: { ...this.state.teamMembers.member1, name }
                } }); }}
              placeholder="Member full name"
              validationCallback={() => {}}
              onBlur={() => {}}
              validationOption={{
                name: 'Member name',
                check: true,
                required: true,
              }}
            />
            <Textbox
              classNameInput="profile-input"
              classNameWrapper="input-wrapper"
              id={'member1-email'}
              name={'member1-email'}
              type="text"
              value={this.state.teamMembers.member1.email}
              validate={true}
              onChange={(email) => { this.setState({ teamMembers: {
                  ...this.state.teamMembers, member1: { ...this.state.teamMembers.member1, email }
                } }); }}
              placeholder="Member full email"
              validationCallback={() => {}}
              onBlur={() => {}}
              validationOption={{
                name: 'Member email',
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
          </div>
          <Button variant="contained" color="primary" className="profile-button" onClick={() => this.onSubmit()}>
            Save
          </Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    form: { ...state.user }
  }
};

export default withRouter(connect(mapStateToProps)(ProfilePage))


