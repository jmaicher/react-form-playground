import React, { Component, PropTypes } from 'react';
import clone from 'lodash.clonedeep';
import omit from 'lodash.omit';
import findIndex from 'lodash.findindex';

import * as s from './state';
import formPropTypes from './propTypes';

const noop = () => { };

class Form extends Component {

  setFormState(state) {
    console.debug(JSON.stringify(state, null, 2));
    this.setState(state, () => {
      const { onChange } = this.props;
      onChange(this.state);
    });
  }

  componentWillMount() {
    const { model } = this.props;
    const state = s.initialState(model);
    this.syncValidate(state);
    this.setFormState(state);
  }

  componentWillReceiveProps(nextProps) {
    const { model } = nextProps;
    if (model !== this.state.model) {
      let state = s.initialState(model);
      this.syncValidate(state);
      this.setFormState(state);
    }
  }

  getFieldValue = (fieldName, defaultValue) => {
    return s.getFieldValue(this.state, fieldName, defaultValue);
  }

  getFieldState = (fieldName) => {
    return s.getFieldState(this.state, fieldName);
  }

  updateField = (fieldName, value, commit = true) => {
    const prevState = this.state;
    const prevValue = s.getFieldValue(prevState, fieldName);

    const state = clone(prevState);

    const changed = value !== prevValue;
    if (changed) {
      s.updateFieldValue(state, fieldName, value);
      s.updateFieldState(state, fieldName, { pristine: false });
    }

    if (commit) {
      s.updateFieldState(state, fieldName, { touched: true });
      this.syncValidate(state);
      this.asyncValidateField(state, fieldName);
    }

    this.setFormState(state);
  }

  syncValidate(state) {
    const { validate } = this.props;
    if (!validate) {
      return;
    }

    s.resetSyncFormValidState(state);
    const formErrors = validate(state.model);
    s.updateSyncFormValidStateWithErrors(state, formErrors);
  }

  asyncValidateField(state, fieldName) {
    const { asyncValidating } = s.getFieldState(state, fieldName);
    if (asyncValidating) {
      // already async validating, nothing to do
      return;
    }

    const { asyncValidateField } = this.props;
    const asyncValidateFn = asyncValidateField[fieldName];
    if (!asyncValidateFn) {
      // no async field validation defined, nothing to do
      return;
    }

    s.updateFieldState(state, fieldName, { asyncValidating: true });

    const value = s.getFieldValue(state, fieldName);
    const promisedResult = asyncValidateFn(value);

    Promise.resolve(promisedResult).then(() => {
      // field is valid
      const state = clone(this.state);
      s.resetAsyncFieldValidState(state, fieldName);
      s.updateFieldState(state, fieldName, { asyncValidating: false });
      this.setFormState(state);
    }, (asyncErrors) => {
      // field is invalid
      const state = clone(this.state);
      s.updateAsyncFieldValidStateWithErrors(state, fieldName, asyncErrors);
      s.updateFieldState(state, fieldName, { asyncValidating: false });
      this.setFormState(state);
    });
  }

  resolveFieldName = (fieldName) => {
    if(typeof fieldName === 'function') {
      return fieldName(this.state);
    }

    return fieldName;
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

  push = (collectionName, obj) => {
    const state = clone(this.state);
    const collection = s.getFieldValue(state, collectionName, []);

    if(!Array.isArray(collection)) {
      throw new Error(`Unsupported collection type '${typeof collection}' for actions.add`);
    }

    collection.push(obj);
    s.updateFieldValue(state, collectionName, collection);

    this.syncValidate(state);
    this.setFormState(state);
  }

  remove = (collectionName, predicate) => {
    const state = clone(this.state);
    const collection = s.getFieldValue(state, collectionName, []);

    if(!Array.isArray(collection)) {
      throw new Error(`Unsupported collection type '${typeof collection}' for actions.remove`);
    }

    const idx = findIndex(collection, predicate);
    if(idx >= 0) {
      collection.splice(idx, 1);
    }

    this.syncValidate(state);
    this.setFormState(state);
  }

  get actions() {
    return {
      push: this.push,
      remove: this.remove,
    }
  }

  getChildContext() {
    return {
      form: {
        getFieldState: this.getFieldState,
        getFieldValue: this.getFieldValue,
        updateField: this.updateField,
        resolveFieldName: this.resolveFieldName,
        actions: this.actions,
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
