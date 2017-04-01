import React, { Component, PropTypes } from 'react';
import getIn from 'lodash.get';
import setIn from 'lodash.set';
import clone from 'lodash.clonedeep';
import omit from 'lodash.omit';

import formPropTypes from './propTypes';

const noop = () => { };

const initialFieldState = {
  pristine: true,
  valid: true,
  errors: [],
}

class Form extends Component {

  constructor(props) {
    super(props);

    this.fieldValidators = {};

    this.state = {
      initialModel: {},
      model: {},
      formState: {
        pristine: true,
      },
      // path -> state
      fieldState: {},
    }
  }

  componentWillMount() {
    const { initialModel } = this.props;

    this.setState({
      initialModel: clone(initialModel),
      model: clone(initialModel)
    });
  }

  getFieldValue = (path, defaultValue) => {
    return getIn(this.state.model, path, defaultValue);
  }

  getFieldState = (path) => {
    return this.state.fieldState[path] || initialFieldState;
  }

  updateFieldValue = (path, value, validate = true) => {
    const model = clone(this.state.model);
    setIn(model, path, value);

    const fields = {
      ...this.state.fieldState,
      [path]: {
        ...this.getFieldState(path),
        pristine: false
      }
    };

    this.setState({ model, fields }, () => {
      if (validate) {
        this.validateField(path);
      }

      this.props.onChange(model);
    });
  }

  registerField = (path, validators) => {
    this.fieldValidators[path] = validators;
  }

  unregisterField(path) {
    const fieldState = { ...this.state.fieldState };
    delete fieldState[path];
    this.setState({ fieldState });

    delete this.fieldValidators[path];
  }

  validateField(path) {
    const value = this.getFieldValue(path);
    let fieldState = this.getFieldState(path);

    const validators = this.fieldValidators[path];

    const errors = [];
    validators.forEach(v => {
      if (!v.validate(value)) {
        errors.push({ key: v.key });
      }
    });

    const isFieldValid = !errors.length;
    if (isFieldValid) {
      fieldState = {
        ...fieldState,
        valid: true,
        errors: []
      }
    } else {
      fieldState = {
        ...fieldState,
        valid: false,
        errors: errors
      }
    }

    this.setState({
      fieldState: {
        ...this.state.fieldState,
        [path]: fieldState
      }
    });
  }

  getChildContext() {
    return {
      form: {
        registerField: this.registerField,
        unregisterField: this.unregisterField,
        getFieldState: this.getFieldState,
        getFieldValue: this.getFieldValue,
        updateFieldValue: this.updateFieldValue,
      }
    }
  }

  render() {
    const { children, ...forwardedProps } = omit(this.props, 'initialModel', 'onChange', 'validate');
    return (
      <form
        className="wui-bs-form wui-bs-form--horizontal"
        {...forwardedProps}
      >
        {children}
      </form>
    );
  }

}

Form.propTypes = {
  initialModel: PropTypes.object,
  onChange: PropTypes.func,
  validate: PropTypes.func,
};

Form.defaultProps = {
  initialModel: {},
  onChange: noop
};

Form.childContextTypes = {
  form: formPropTypes.form,
};

export default Form;
