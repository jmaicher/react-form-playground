import React, { Component, PropTypes } from 'react';
import omit from 'lodash.omit';

import formPropTypes from './propTypes';
import FormErrors from './util/formErrors';
import * as s from './state';

const noop = () => { };

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
  validate: noop,
  onChange: noop,
  onSubmit: noop
};

Form.childContextTypes = {
  form: formPropTypes.form,
};

export default Form;
