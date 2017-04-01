import { PropTypes } from 'react';

export default {
  validator: PropTypes.shape({
    key: PropTypes.string,
    validate: PropTypes.func,
  }),
  form: PropTypes.shape({
    getFieldState: PropTypes.func,
    getFieldValue: PropTypes.func,
    updateFieldValue: PropTypes.func,
  })
}
