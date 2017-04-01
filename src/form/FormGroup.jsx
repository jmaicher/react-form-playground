import React, { Component, PropTypes } from 'react';

import formPropTypes from './propTypes';
import Errors from './Errors';

class FormGroup extends Component {
  render() {
    const { model, label, htmlFor, children } = this.props;

    return (
      <div className="form-group row">
        <label
          htmlFor={htmlFor}
          className="control-label col-sm-3"
        >
          {label}
        </label>
        <div className="col-sm-6">
          {children}
          <Errors model={model} />
        </div>
      </div>
    )
  }
}

FormGroup.propTypes = {
  model: PropTypes.string,
  label: PropTypes.string,
  htmlFor: PropTypes.string,
};

FormGroup.childContextTypes = {
  form: formPropTypes.form,
};

export default FormGroup;
