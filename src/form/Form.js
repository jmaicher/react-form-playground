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

    this.state = {
      initialModel: {},
      model: {},
      formState: {
        pristine: true,
        valid: true,
        errors: []
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

  getFieldValue = (fieldName, defaultValue) => {
    return getIn(this.state.model, fieldName, defaultValue);
  }

  getFieldState = (fieldName) => {
    return this.state.fieldState[fieldName] || initialFieldState;
  }

  updateFieldValue = (fieldName, value, validate = true) => {
    const model = clone(this.state.model);
    setIn(model, fieldName, value);

    const fieldState = {
      ...this.state.fieldState,
      [fieldName]: {
        ...this.getFieldState(fieldName),
        pristine: false,
      }
    };

    const formState = {
      ...this.state.formState,
      pristine: false,
    }

    this.setState({ model, fieldState, formState }, () => {
      if (validate) {
        this.validate(fieldName);
      }

      this.props.onChange(model);
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

    const valid = errors.isEmpty;
    const validStateChanged = this.state.formState.valid !== valid;

    if (valid) {
      this.setState({
        formState: {
          ...this.state.formState,
          valid: true,
          errors: []
        }
      });
    } else {
      this.setState({
        formState: {
          ...this.state.formState,
          valid: false,
          errors: errors.getAll()
        }
      });
    }

    if(validStateChanged) {
      const { onValidStateChange } = this.props;
      onValidStateChange(valid);
    }
  }

  handleSubmit = (evt) => {
    evt.preventDefault();
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
    const { children, ...forwardedProps } = omit(this.props, 'initialModel', 'onChange', 'onValidStateChange', 'validate');
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
  initialModel: PropTypes.object,
  onChange: PropTypes.func,
  onValidStateChange: PropTypes.func,
  validate: PropTypes.func,
};

Form.defaultProps = {
  initialModel: {},
  onChange: noop,
  onValidStateChange: noop,
};

Form.childContextTypes = {
  form: formPropTypes.form,
};

export default Form;
