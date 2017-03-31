import React, { Component, PropTypes } from 'react';
import getIn from 'lodash.get';
import setIn from 'lodash.set';
import cloneDeep from 'lodash.clonedeep';
import omit from 'lodash.omit';

const noop = () => { };

const initialFieldState = {
  pristine: true,
}

class Form extends Component {

  constructor(props) {
    super(props);

    this.state = {
      initialModel: {},
      model: {},
      isValid: true,
      errors: {},
      fields: {}
    }
  }

  componentWillMount() {
    const { initialModel } = this.props;

    this.setState({
      initialModel: cloneDeep(initialModel),
      model: cloneDeep(initialModel)
    });

    this.validate();
  }

  getValue = (path, defaultValue) => {
    return getIn(this.state.model, path, defaultValue);
  }

  getField = (path) => {
    return getIn(this.state.fields, path, { ...initialFieldState });
  }

  update = (path, value, done = noop) => {
    const model = cloneDeep(this.state.model);
    setIn(model, path, value);

    const field = this.getField(path);
    const fields = cloneDeep(this.state.fields);
    setIn(fields, path, { ...field, pristine: false });

    this.setState({ model, fields }, () => {
      this.props.onChange(model);
      done();
    });
  }

  commit = (path, value) => {
    this.update(path, value, () => {
      this.validate();
    });
  }

  validate() {
    const { model } = this.state;
    const { validate } = this.props;

    const errors = validate(model);
    if (typeof errors === 'object' && Object.keys(errors).length) {
      this.setState({ isValid: false, errors });
    } else {
      this.setState({ isValid: true, errors: {} });
    }
  }

  getChildContext() {
    return {
      form: {
        getValue: this.getValue,
        getField: this.getField,
        update: this.update,
        commit: this.commit
      }
    }
  }

  render() {
    console.log(this.state);
    const { children, ...forwardedProps } = omit(this.props, 'initialModel', 'onChange', 'validate');
    return <form {...forwardedProps}>{children}</form>
  }

}

Form.propTypes = {
  initialModel: PropTypes.object,
  onChange: PropTypes.func,
  validate: PropTypes.func,
};

Form.defaultProps = {
  initialModel: {},
  onChange: noop,
  validate: noop
};

Form.childContextTypes = {
  form: PropTypes.shape({
    getValue: PropTypes.func,
    getField: PropTypes.func,
    update: PropTypes.func,
    commit: PropTypes.func,
  })
};

export default Form;
