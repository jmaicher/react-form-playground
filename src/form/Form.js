import React, { Component, PropTypes } from 'react';
import getIn from 'lodash.get';
import setIn from 'lodash.set';
import omit from 'lodash.omit';

import formPropTypes from './propTypes';
import * as s from './state';

const noop = () => { };

class FormErrors {
  errors = {};

  add(fieldName, error) {
    const fieldErrors = [...this.get(fieldName)];
    fieldErrors.push(error);
    setIn(this.errors, fieldName, fieldErrors);

    return this;
  }

  get(fieldName) {
    return getIn(this.errors, fieldName, []);
  }

  getAll() {
    return this.errors;
  }

  get isEmpty() {
    return !Object.keys(this.errors)
      .find(fieldName => this.errors[fieldName] && this.errors[fieldName].length > 0);
  }
}

class Form extends Component {

  constructor(props) {
    super(props);

    this.state = s.initialState();
  }

  componentWillReceiveProps(nextProps) {
    const { model } = nextProps;
    if (model !== this.state.model) {
      const state = s.initialState(model);
      this.setState(state);
    }
  }

  getFieldValue = (fieldName, defaultValue) => {
    return s.getFieldValue(this.state, fieldName, defaultValue);
  }

  getFieldState = (fieldName) => {
    return s.getFieldState(this.state, fieldName);
  }

  updateFieldValue = (fieldName, value, validate = true) => {
    let state = s.updateField(this.state, fieldName, value);

    if (validate) {
      const errors = this.validate(state.model);
      state = s.updateWithValidationErrors(this.state, errors);
    }

    this.setState(state, () => {
      const { onChange } = this.props;
      onChange(this.state);
    });
  }

  validate(fieldName) {
    const { model } = this.state;
    const { validate } = this.props;

    if (!validate) {
      return;
    }

    const errors = new FormErrors();
    validate(model, errors);
    return errors;
  }

  handleSubmit = (evt) => {
    evt.preventDefault();
    const { onSubmit } = this.props;
    const { model, form } = this.state;

    if (!form.valid) {
      return;
    }

    onSubmit(model);
  }

  getChildContext() {
    return {
      form: {
        getFieldState: this.getFieldState,
        getFieldValue: this.getFieldValue,
        updateFieldValue: this.updateFieldValue,
      }
    }
  }

  render() {
    console.log(this.state);
    const { children, ...forwardedProps } = omit(this.props, 'model', 'onChange', 'onValidStateChange', 'validate');
    return (
      <form
        {...forwardedProps}
        className="wui-bs-form wui-bs-form--horizontal"
        onSubmit={this.handleSubmit}
      >
        {children}
      </form>
    );
  }

}

Form.propTypes = {
  model: PropTypes.object,
  validate: PropTypes.func,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
};

Form.defaultProps = {
  model: {},
  onChange: noop,
  onSubmit: noop
};

Form.childContextTypes = {
  form: formPropTypes.form,
};

export default Form;
