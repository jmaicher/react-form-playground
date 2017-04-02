import React, { Component, PropTypes } from 'react';
import formPropTypes from './propTypes';

class TextControl extends Component {

  handleChange = (evt) => {
    const { model } = this.props;
    const { form } = this.context;

    const value = evt.target.value;
    form.updateField(model, value, false);
  }

  handleBlur = (evt) => {
    const { model } = this.props;
    const { form } = this.context;

    const value = this.normalize(evt.target.value.trim());
    form.updateField(model, value);
  }

  normalize(value) {
    return value.trim();
  }

  render() {
    const { model, ...forwardedProps } = this.props;
    const { form } = this.context;

    const value = form.getFieldValue(model, '');

    return (
      <input
        type="text"
        className="form-control"
        autoComplete="off"
        {...forwardedProps}
        value={value}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
      />
    );
  }

}

TextControl.propTypes = {
  model: PropTypes.string.isRequired,
}

TextControl.contextTypes = {
  form: formPropTypes.form,
};

export default TextControl;
