import React, { Component, PropTypes } from 'react';
import clone from 'lodash.clonedeep';
import getIn from 'lodash.get';
import setIn from 'lodash.set';
import omit from 'lodash.omit';

import formPropTypes from './propTypes';

const noop = () => { };

export const initialState = (model = {}) => ({
  initialModel: {},
  model: {},
  form: {
    syncValid: true,
    asyncValid: true,
    valid: true, // = syncValid && asyncValid
  },
  fields: {},
});

export const initialFieldState = {
  touched: false,
  pristine: true,
  syncValid: true,
  asyncValid: true,
  asyncValidating: false,
  valid: true, // = syncValid && asyncValid
  syncErrors: [],
  asyncErrors: [],
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

const hasAsyncFieldErrors = state => {
  return !Object.keys(state.fields)
    .find(fieldName => state.fields[fieldName].asyncValid);
}

const hasSyncFieldErrors = state => {
  return !Object.keys(state.fields)
    .find(fieldName => state.fields[fieldName].syncValid);
}

/**
 * Checks whether the form has any sync field errors and updates the valid state of the form correspondingly.
 *
 * @param {Object} state
 */
const invalidateSyncFormValidState = state => {
  const syncValid = !hasSyncFieldErrors(state);
  updateFormState(state, {
    syncValid,
    valid: syncValid && state.form.asyncValid,
  });

  return state;
}

/**
 *
 * @param {Object} state
 * @param {String} fieldName
 */
const resetSyncFieldValidState = (state, fieldName, shouldInvalidateSyncFormValidState = true) => {
  const fieldState = state.fields[fieldName];
  updateFieldState(state, fieldName, {
    syncValid: true,
    syncErrors: [],
    valid: fieldState.asyncValid,
  });

  if (shouldInvalidateSyncFormValidState) {
    invalidateSyncFormValidState(state);
  }
}
/**
 * @param {Object} state
 */
const resetSyncFormValidState = state => {
  Object.keys(state.fields).forEach(fieldName => {
    const shouldInvalidateSyncFormValidState = false;
    resetSyncFieldValidState(state, fieldName, shouldInvalidateSyncFormValidState);
  });

  updateFormState(state, {
    syncValid: true,
    valid: state.form.asyncValid,
  });

  return state;
}

/**
 * @param {Object} state
 * @param {String} fieldName
 * @param {Array<String>} syncErrors
 * @param {Boolean} shouldInvalidateSyncFormValidState
 */
const updateSyncFieldValidStateWithErrors = (state, fieldName, syncErrors, shouldInvalidateSyncFormValidState = true) => {
  const syncValid = !syncErrors || !syncErrors.length;
  const fieldState = getFieldState(state, fieldName);
  updateFieldState(state, fieldName, {
    syncValid,
    syncErrors: !syncValid ? (syncErrors || []) : [],
    valid: syncValid && fieldState.asyncValid,
  });

  if (shouldInvalidateSyncFormValidState) {
    invalidateSyncFormValidState(state);
  }

  return state;
}

/**
 * @param {Object} state
 * @param {Object<String, Array>} syncErrors
 */
const updateSyncFormValidStateWithErrors = (state, syncErrors) => {
  Object.keys(syncErrors).forEach(fieldName => {
    const shouldInvalidateSyncFormValidState = false;
    updateSyncFieldValidStateWithErrors(state, fieldName, syncErrors[fieldName], shouldInvalidateSyncFormValidState)
  });

  invalidateSyncFormValidState(state);

  return state;
}

/**
 * Checks whether the form has any async field errors and updates the valid state of the form correspondingly.
 *
 * @param {Object} state
 */
const invalidateAsyncFormValidState = state => {
  const asyncValid = !hasAsyncFieldErrors(state);
  updateFormState(state, {
    asyncValid,
    valid: asyncValid && state.form.syncValid,
  });

  return state;
}


/**
 * @param {Object} state
 * @param {String} fieldName
 * @param {Boolean} shouldInvalidateAsyncFormValidState
 */
const resetAsyncFieldValidState = (state, fieldName, shouldInvalidateAsyncFormValidState = true) => {
  const fieldState = state.fields[fieldName];
  updateFieldState(state, fieldName, {
    asyncValid: true,
    asyncErrors: [],
    valid: fieldState.syncValid,
  });

  if (shouldInvalidateAsyncFormValidState) {
    invalidateAsyncFormValidState(state);
  }
}

/**
 *
 * @param {Object} state
 * @param {String} fieldName
 * @param {Array<String>} asyncErrors
 * @param {Boolean} shouldInvalidateAsyncFormValidState
 */
const updateAsyncFieldValidStateWithErrors = (state, fieldName, asyncErrors, shouldInvalidateAsyncFormValidState = true) => {
  const asyncValid = !asyncErrors || !asyncErrors.length;
  const fieldState = getFieldState(state, fieldName);
  updateFieldState(state, fieldName, {
    asyncValid,
    asyncErrors: !asyncValid ? (asyncErrors || []) : [],
    valid: asyncValid && fieldState.syncValid,
  });

  if (shouldInvalidateAsyncFormValidState) {
    invalidateAsyncFormValidState(state);
  }
}

class Form extends Component {

  constructor(props) {
    super(props);

    this.state = initialState();
  }

  setFormState(state) {
    // console.debug(JSON.stringify(state, null, 2));

    this.setState(state, () => {
      const { onChange } = this.props;
      onChange(this.state);
    });
  }

  componentWillReceiveProps(nextProps) {
    const { model } = nextProps;
    if (model !== this.state.model) {
      let state = initialState(model);
      state = this.syncValidate(state);

      this.setFormState(state);
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
      this.syncValidate(state);
      this.asyncValidateField(state, fieldName);
    }

    this.setFormState(state);
  }

  syncValidate(state) {
    resetSyncFormValidState(state);

    const { validate } = this.props;
    if (!validate) {
      return;
    }

    const formErrors = validate(state.model);
    console.log(state.model, formErrors);
    updateSyncFormValidStateWithErrors(state, formErrors);
  }

  asyncValidateField(state, fieldName) {
    const { asyncValidating } = getFieldState(state, fieldName);
    if (asyncValidating) {
      // already async validating, nothing to do
      return;
    }

    const { asyncValidateField } = this.props;
    const asyncValidate = asyncValidateField[fieldName];
    if (!asyncValidate) {
      // no async field validation defined, nothing to do
      return;
    }

    updateFieldState(state, fieldName, { asyncValidating: true });

    const value = getFieldValue(state, fieldName);
    const promisedResult = asyncValidate(value);

    Promise.resolve(promisedResult).then(() => {
      // field is valid
      const state = clone(this.state);
      resetAsyncFieldValidState(state, fieldName);
      updateFieldState(state, fieldName, { asyncValidating: false });
      this.setFormState(state);
    }, (asyncErrors) => {
      // field is invalid
      const state = clone(this.state);
      updateAsyncFieldValidStateWithErrors(state, fieldName, asyncErrors);
      updateFieldState(state, fieldName, { asyncValidating: false });
      this.setFormState(state);
    });
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
    const { children, ...forwardedProps } = omit(this.props, 'model', 'validate', 'asyncValidateField', 'onChange', 'onSubmit');
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
  asyncValidateField: PropTypes.object,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
};

Form.defaultProps = {
  model: {},
  validate: noop,
  asyncValidateField: {},
  onChange: noop,
  onSubmit: noop
};

Form.childContextTypes = {
  form: formPropTypes.form,
};

export default Form;
