import React, { Component } from 'react';

import Form from './form/Form';
import FormGroup from './form/FormGroup';
import TextControl from './form/TextControl';

const validate = (user) => {
  const errors = {};

  if(!user.firstName) {
    errors.firstName = { required: true }
  }

  if(!user.lastName) {
    errors.lastName = { required: true }
  }

  return errors;
}

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      initialUser: {},
      user: {},
    }
  }

  handleUserChange = (user) => {
    this.setState({ user });
  }

  render() {
    const { user, initialUser } = this.state;

    return (
      <div className="wui-page">
        <div className="container-fluid">
          <div className="wui-bs-panel">
            <div className="panel-heading">
              <h2 className="panel-title">Simple React Form</h2>
            </div>
            <div className="panel-body">
              <Form initialModel={initialUser} onChange={this.handleUserChange} validate={validate} className="wui-bs-form wui-bs-form--horizontal">
                <FormGroup label="First name" htmlFor="firstName">
                  <TextControl model="firstName" id="firstName" />
                </FormGroup>
                <FormGroup label="Last name" htmlFor="lastName">
                  <TextControl model="lastName" id="lastName" />
                </FormGroup>
              </Form>
            </div>
          </div>
          <pre>
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
}

export default App;
