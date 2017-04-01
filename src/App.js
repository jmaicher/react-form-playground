import React, { Component } from 'react';

import Form from './form/Form';
import FormGroup from './form/FormGroup';
import TextControl from './form/TextControl';

const validator = (key, fn) => ({
  key: key,
  validate: (...args) => fn(...args),
});

const required = validator('required', (value) => {
  return value && !!value.length;
});

const minLength = len => validator('minLength', (value) => {
  return value && value.length >= len
});

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
              <Form
                initialModel={initialUser}
                onChange={this.handleUserChange}
              >
                <FormGroup model="firstName" label="First name" htmlFor="firstName">
                  <TextControl model="firstName" id="firstName" validate={[ required ]} />
                </FormGroup>
                <FormGroup model="lastName" label="Last name" htmlFor="lastName">
                  <TextControl model="lastName" id="lastName" validate={[ required, minLength(3) ]} />
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
