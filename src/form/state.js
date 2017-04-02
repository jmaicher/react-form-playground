import getIn from 'lodash.get';
import setIn from 'lodash.set';

export const initialState = (model = {}) => ({
  initialModel: model,
  model: model,
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

export const getFieldValue = (state, fieldName, defaultValue) => {
  return getIn(state.model, fieldName, defaultValue);
}

export const updateFieldValue = (state, fieldName, value) => {
  setIn(state.model, fieldName, value);
  return state;
}

export const getFieldState = (state, fieldName) => {
  return state.fields[fieldName] || initialFieldState;
}

export const updateFormState = (state, formState) => {
  const prevFormState = state.form;
  state.form = {
    ...prevFormState,
    ...formState,
  }

  return state;
}

export const updateFieldState = (state, fieldName, fieldState) => {
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
export const resetSyncFieldValidState = (state, fieldName, shouldInvalidateSyncFormValidState = true) => {
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
export const resetSyncFormValidState = state => {
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
export const updateSyncFieldValidStateWithErrors = (state, fieldName, syncErrors, shouldInvalidateSyncFormValidState = true) => {
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
export const updateSyncFormValidStateWithErrors = (state, syncErrors) => {
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
export const resetAsyncFieldValidState = (state, fieldName, shouldInvalidateAsyncFormValidState = true) => {
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
export const updateAsyncFieldValidStateWithErrors = (state, fieldName, asyncErrors, shouldInvalidateAsyncFormValidState = true) => {
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
