import getIn from 'lodash.get';
import setIn from 'lodash.set';

class FormErrors {
  errors = {};

  add(fieldName, error) {
    const fieldErrors = [...this.get(fieldName)];
    fieldErrors.push(error);
    setIn(this.errors, fieldName, fieldErrors);

    return this;
  }

  get(fieldName) {
    return getIn(this.errors, fieldName, []);
  }

  getAll() {
    return this.errors;
  }

  forEach(fn) {
    Object.keys(this.errors).forEach(fieldName => {
      fn(fieldName, this.errors[fieldName]);
    });
  }

  hasErrors(fieldName) {
    if(!fieldName) {
      return this.hasAnyErrors();
    }

    return this.errors[fieldName] && this.errors[fieldName].length;
  }

  hasAnyErrors() {
    return !!Object.keys(this.errors)
      .find(fieldName => this.errors[fieldName] && this.errors[fieldName].length > 0);
  }
}

export default FormErrors;
