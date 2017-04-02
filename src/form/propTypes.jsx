import { PropTypes } from 'react';

export default {
  model: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]),
  form: PropTypes.shape({
    getFieldState: PropTypes.func,
    getFieldValue: PropTypes.func,
    updateField: PropTypes.func,
    resolveFieldName: PropTypes.func,
    actions: PropTypes.shape({
      push: PropTypes.func,
      remove: PropTypes.func
    })
  })
}
