import React, { Component } from 'react';
import getIn from 'lodash.get';

import Form from './form/Form';
import FormGroup from './form/FormGroup';
import TextControl from './form/TextControl';

import FormErrorBuilder from './form/utils/formErrorBuilder';

const validateUser = (user) => {
  const errors = new FormErrorBuilder();

  const required = ['firstName', 'lastName'];
  required.forEach(fieldName => {
    const value = getIn(user, fieldName);
    if (!value || !value.length) {
      errors.addFieldError(fieldName, 'required');
    }
  });

  return errors.getErrors();
}

const asyncValidateField = {
  email: (value) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if(value === 'mail@jmaicher.de') {
          resolve();
        } else {
          reject(['unique']);
        }
      }, 1000);
    });
  }
}

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      user: {},
      valid: false,
    }
  }

  handleFormChange = ({ model, form: { valid } }) => {
    this.setState({ user: model, valid });
  }

  handleSubmit = (model) => {
    console.log('Submitting', model);

    return new Promise(resolve => {
      setTimeout(resolve, 1000);
    });
  }

  render() {
    const { user, valid } = this.state;

    return (
      <div className="wui-page">
        <div className="container-fluid">
          <div className="wui-bs-panel">
            <div className="panel-heading">
              <h2 className="panel-title">Simple React Form</h2>
            </div>
            <div className="panel-body">
              <Form
                model={user}
                validate={validateUser}
                asyncValidateField={asyncValidateField}
                onChange={this.handleFormChange}
                onSubmit={this.handleSubmit}
              >
                <FormGroup model="firstName" label="First name" htmlFor="firstName">
                  <TextControl model="firstName" id="firstName" />
                </FormGroup>
                <FormGroup model="lastName" label="Last name" htmlFor="lastName">
                  <TextControl model="lastName" id="lastName" />
                </FormGroup>
                <FormGroup model="email" label="Email" htmlFor="email">
                  <TextControl model="email" id="email" />
                </FormGroup>

                <div className="row">
                  <div className="col-sm-6 col-sm-push-3">
                    <button type="submit" className="wui-btn wui-btn--primary" disabled={!valid}>Submit</button>
                  </div>
                </div>
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
