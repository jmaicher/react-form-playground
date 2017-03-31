import React, { Component } from 'react';

class FormGroup extends Component {

  render() {
    const { label, htmlFor, children } = this.props;

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
        </div>
      </div>
    )
  }

}

export default FormGroup;
