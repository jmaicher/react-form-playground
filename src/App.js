import React, { Component } from 'react';
import uniqueId from 'lodash.uniqueid';
import getIn from 'lodash.get';

import Form from './form/Form';
import FormGroup from './form/FormGroup';
import TextControl from './form/TextControl';
import SelectControl from './form/SelectControl';
import FormErrorBuilder from './form/utils/formErrorBuilder';

import EmailArrayControl from './EmailArrayControl';

const validateUser = (user) => {
  const errors = new FormErrorBuilder();

  const required = ['firstName', 'lastName'];
  required.forEach(fieldName => {
    const value = getIn(user, fieldName);
    if (!value || !value.length) {
      errors.addFieldError(fieldName, 'required');
    }
  });

  // validate emails
  if(Array.isArray(user.emails)) {
    // required fields
    user.emails.forEach((email, idx) => {
      if (!email.type || !email.type.length) {
        errors.addFieldError(`emails[${idx}].type`, 'required');
      }

      if (!email.value || !email.value.length) {
        errors.addFieldError(`emails[${idx}].value`, 'required');
      }
    });

    // uniqueness of types
    const emailsWithType = user.emails.filter(it => it.type && it.type.length);
    const usedTypes = emailsWithType.map(it => it.type);

    usedTypes.forEach(type => {
      const emailsWithType = user.emails
        .filter(email => email.type === type);

      if(emailsWithType.length > 1) {
        emailsWithType
          .map(email => user.emails.indexOf(email))
          .forEach(idx => {
            errors.addFieldError(`emails[${idx}].type`, 'unique');
          });
      }
    });
  }

  return errors.getErrors();
}

const asyncValidateField = {
  email: (value) => {
    if (!value) {
      return;
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (value === 'mail@jmaicher.de') {
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
      user: {
        address: {
          country: 'de'
        },
        emails: [
          { trackingId: uniqueId('email'), type: 'work', value: 'jmaicher@wescale.com' },
          { trackingId: uniqueId('email'), type: 'private', value: 'julian.maicher@gmail.com' },
        ],
      },
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

                <FormGroup model="address.country" label="Country" htmlFor="address[country]">
                  <SelectControl model="address.country" id="address[country]">
                    <option value="">Please select</option>
                    <option value="ag">Argentina</option>
                    <option value="de">Germany</option>
                    <option value="es">Spain</option>
                    <option value="us">United States</option>
                  </SelectControl>
                </FormGroup>

                <FormGroup model="emails[]" label="Emails">
                  <EmailArrayControl model="emails" />
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
