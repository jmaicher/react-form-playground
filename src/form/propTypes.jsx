import { PropTypes } from 'react';

export default {
  form: PropTypes.shape({
    getFieldState: PropTypes.func,
    getFieldValue: PropTypes.func,
    updateFieldValue: PropTypes.func,
  })
}
