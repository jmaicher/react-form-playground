import React, { Component, PropTypes } from 'react';
import formPropTypes from './propTypes';

class TextControl extends Component {

  componentWillMount() {
    const { model, validate } = this.props;
    const { registerField } = this.context.form;
    registerField(model, validate);
  }

  handleChange = (evt) => {
    const { model } = this.props;
    const { form } = this.context;

    const value = evt.target.value;
    form.updateFieldValue(model, value, false);
  }

  handleBlur = (evt) => {
    const { model } = this.props;
    const { form } = this.context;

    const value = this.normalize(evt.target.value.trim());
    form.updateFieldValue(model, value, true);
  }

  normalize(value) {
    return value.trim();
  }

  render() {
    const { model, id } = this.props;
    const { form } = this.context;

    const value = form.getFieldValue(model, '');

    return (
      <input
        id={id}
        value={value}
        type="text"
        className="form-control" autoComplete="off"
        onChange={this.handleChange}
        onBlur={this.handleBlur}
      />
    );
  }

}

TextControl.propTypes = {
  model: PropTypes.string.isRequired,
  validate: PropTypes.arrayOf(formPropTypes.validator),
}

TextControl.contextTypes = {
  form: formPropTypes.form,
};

export default TextControl;
