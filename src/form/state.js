import getIn from 'lodash.get';
import setIn from 'lodash.set';
import clone from 'lodash.clonedeep';

export const initialState = (model = {}) => ({
  initialModel: {},
  model: {},
  form: {
    submitted: false,
    valid: undefined,
    errors: [],
  },
  fields: {}
});

export const initialFieldState = {
  pristine: true,
  valid: true,
  errors: [],
}

export const getFieldValue = (state, fieldName, defaultValue) => {
  return getIn(state.model, fieldName, defaultValue);
}

export const getFieldState = (state, fieldName) => {
  return getIn(state.fieldStates, fieldName, initialFieldState);
}

export const updateFieldState = (prevState, fieldName, fieldState) => {
  const state = clone(prevState);

  const prevFieldState = getFieldState(fieldName);
  state.fields = {
    ...state.fields,
    [fieldName]: {
      ...prevFieldState,
      fieldState,
    }
  }

  return state;
}

export const updateField = (prevState, fieldName, value) => {
  let state = clone(prevState);

  // update model value
  setIn(state.model, fieldName, value);

  // update field state
  state = updateFieldState(state, fieldName, {
    pristine: false
  });

  return state;
}

export const updateWithValidationErrors = (prevState, errors) => {
  const state = clone(prevState);

  const valid = errors.isEmpty;
  if(valid) {
    state.form = {
      ...state.form,
      valid: true,
      errors: []
    }
  } else {
    state.form = {
      ...state.form,
      valid: false,
      errors: errors.getAll()
    }
  }

  return state;
}
