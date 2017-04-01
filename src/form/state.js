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
  return getIn(state.fields, fieldName, initialFieldState);
}

export const updateFieldState = (prevState, fieldName, fieldState) => {
  const state = clone(prevState);

  const prevFieldState = getFieldState(state, fieldName);
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

export const resetFieldErrors = (prevState) => {
  let state = clone(prevState);

  Object.keys(state.fields).forEach(fieldName => {
    state.fields[fieldName] = {
      ...state.fields[fieldName],
      valid: true,
      errors: [],
    }
  });

  return state;
}

export const setFieldErrors = (prevState, errors) => {
  let state = clone(prevState);

  errors.forEach((fieldName, errors) => {
    const valid = !errors.length;
    const fieldState = getFieldState(state, fieldName);
    state.fields[fieldName] = {
      ...fieldState,
      valid,
      errors,
    }
  });

  return state;
}

export const updateWithValidationErrors = (prevState, errors) => {
  let state = clone(prevState);
  state = resetFieldErrors(state);

  const valid = !errors.hasAnyErrors();
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

    state = setFieldErrors(state, errors);
  }

  return state;
}
