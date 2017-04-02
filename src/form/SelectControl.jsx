import React, { Component, PropTypes } from 'react';
import formPropTypes from './propTypes';

class SelectControl extends Component {

  handleChange = (evt) => {
    const { model } = this.props;
    const { form } = this.context;

    const value = evt.target.value;
    form.updateField(model, value, false);
  }

  render() {
    const { children, model, ...forwardedProps } = this.props;
    const { form } = this.context;

    const value = form.getFieldValue(model, '');

    return (
      <select
        className="form-control"
        {...forwardedProps}
        value={value}
        onChange={this.handleChange}
      >
        {children}
      </select>
    );
  }

}

SelectControl.propTypes = {
  model: PropTypes.string.isRequired,
}

SelectControl.contextTypes = {
  form: formPropTypes.form,
};

export default SelectControl;
