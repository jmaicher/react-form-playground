import React, { Component, PropTypes } from 'react';
import clone from 'lodash.clonedeep';
import getIn from 'lodash.get';
import setIn from 'lodash.set';
import omit from 'lodash.omit';

import formPropTypes from './propTypes';
import FormErrors from './util/formErrors';

const noop = () => { };

export const initialState = (model = {}) => ({
  initialModel: {},
  model: {},
  form: {
    valid: undefined,
    // fieldName -> [error]
    errors: {},
  },
  fields: {}
});

export const initialFieldState = {
  touched: false,
  pristine: true,
  valid: true,
  errors: [],
}

const getFieldValue = (state, fieldName, defaultValue) => {
  return getIn(state.model, fieldName, defaultValue);
}

const updateFieldValue = (state, fieldName, value) => {
  setIn(state.model, fieldName, value);
  return state;
}

const getFieldState = (state, fieldName) => {
  return state.fields[fieldName] || initialFieldState;
}

const updateFormState = (state, formState) => {
  const prevFormState = state.form;
  state.form = {
    ...prevFormState,
    ...formState,
  }

  return state;
}

const updateFieldState = (state, fieldName, fieldState) => {
  const prevFieldState = getFieldState(state, fieldName);
  state.fields[fieldName] = {
    ...prevFieldState,
    ...fieldState
  }

  return state;
}

const resetFieldErrors = (state) => {
  Object.keys(state.fields).forEach(fieldName => {
    updateFieldState(state, fieldName, {
      valid: true,
      errors: [],
    });
  });

  return state;
}

const updateFieldErrors = (state, errors) => {
  errors.forEach((fieldName, errors) => {
    const valid = !errors.length;
    updateFieldState(state, fieldName, {
      valid,
      errors,
    });
  });

  return state;
}

const updateValidState = (state, errors) => {
  const valid = !errors.hasAnyErrors();

  updateFormState(state, {
    valid,
    errors: valid ? errors.getAll() : {},
  });

  updateFieldErrors(state, errors);
}

const resetValidState = (state) => {
  updateFormState(state, {
    valid: true,
    errors: {},
  });

  resetFieldErrors(state);

  return state;
}

class Form extends Component {

  constructor(props) {
    super(props);

    this.state = initialState();
  }

  componentWillReceiveProps(nextProps) {
    const { model } = nextProps;
    if (model !== this.state.model) {
      const state = initialState(model);
      this.setState(state);
    }
  }

  getFieldValue = (fieldName, defaultValue) => {
    return getFieldValue(this.state, fieldName, defaultValue);
  }

  getFieldState = (fieldName) => {
    return getFieldState(this.state, fieldName);
  }

  updateField = (fieldName, value, commit = true) => {
    const prevState = this.state;
    const prevValue = getIn(prevState.model, fieldName);

    const state = clone(prevState);

    const changed = value !== prevValue;
    if (changed) {
      updateFieldValue(state, fieldName, value);
      updateFieldState(state, fieldName, { pristine: false });
    }

    if (commit) {
      updateFieldState(state, fieldName, { touched: true });

      resetValidState(state);
      const errors = this.validate(state.model, fieldName);
      updateValidState(state, errors);
    }

    this.setState(state, () => {
      const { onChange } = this.props;
      onChange(this.state);
    });
  }

  validate(model, fieldName) {
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
        updateField: this.updateField,
      }
    }
  }

  render() {
    console.debug(JSON.stringify(this.state, null, 2));

    const { children, ...forwardedProps } = omit(this.props, 'model', 'validate', 'onChange', 'onSubmit');
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
