class ErrorBuilder {
  constructor() {
    this.errors = {};
  }

  addFieldError(fieldName, error) {
    this.errors[fieldName] = this.errors[fieldName] || [];
    this.errors[fieldName].push(error);

    return this;
  }

  // TODO: Not yet handled
  addFormError(error) {
    return this.addFieldError('', error);
  }

  getErrors() {
    return this.errors;
  }
}

export default ErrorBuilder;
