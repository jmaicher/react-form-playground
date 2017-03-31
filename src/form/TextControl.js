import React, { Component, PropTypes } from 'react';

class Input extends Component {

  handleChange = (evt) => {
    const { model } = this.props;
    const { form } = this.context;

    const value = evt.target.value;
    form.update(model, value);
  }

  handleBlur = (evt) => {
    const { model } = this.props;
    const { form } = this.context;

    const value = this.normalize(evt.target.value.trim());
    form.commit(model, value);
  }

  normalize(value) {
    return value.trim();
  }

  render() {
    const { model, id } = this.props;
    const { form } = this.context;

    const value = form.getValue(model, '');

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

Input.contextTypes = {
  form: PropTypes.shape({
    getField: PropTypes.func,
    getValue: PropTypes.func,
    update: PropTypes.func,
    commit: PropTypes.func,
  })
};

export default Input;
