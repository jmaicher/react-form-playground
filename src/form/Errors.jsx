import React, { Component, PropTypes } from 'react';
import formPropTypes from './propTypes';

class Errors extends Component {
  render() {
    const { model, messages } = this.props;
    const { form } = this.context;

    const state = form.getFieldState(model);
    const { valid, errors } = state;

    const hasErrors = !valid && errors.length;
    if(!hasErrors) {
      return null;
    }

    const firstError = errors[0];
    return (
      <p className="wui-message wui-message--error">
        {messages[firstError] || firstError}
      </p>
    );
  }
}

Errors.propTypes = {
  model: PropTypes.string.isRequired,
  messages: PropTypes.object,
};

Errors.defaultProps = {
  messages: {},
};

Errors.contextTypes = {
  form: formPropTypes.form,
};

export default Errors;
