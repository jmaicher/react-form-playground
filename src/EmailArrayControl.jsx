import React, { Component, PropTypes } from 'react';
import uniqueId from 'lodash.uniqueid';

import TextControl from './form/TextControl';
import Errors from './form/Errors';
import formPropTypes from './form/propTypes';
import track from './form/track';

class EmailControl extends Component {

  handleRemoveClick = (evt) => {
    evt.preventDefault();

    const { trackingId, onRemove } = this.props;
    onRemove(trackingId);
  }

  render() {
    const { model } = this.props;
    const { form } = this.context;
    const modelString = form.resolveFieldName(model);

    return (
      <div>
        <div style={{ float: 'left', width: '50%', paddingRight: '5px' }}>
          <TextControl model={`${modelString}.type`} />
          <Errors model={`${modelString}.type`} />
        </div>
        <div style={{ float: 'left', width: '50%', paddingLeft: '5px' }}>
          <TextControl model={`${modelString}.value`} />
          <Errors model={`${modelString}.value`} />
        </div>
        <a
          href="#"
          onClick={this.handleRemoveClick}
          style={{ position: 'absolute', right: '-30px', lineHeight: '32px' }}
        >
          <i className="fa fa-trash-o" />
        </a>
      </div>
    );
  }

}

EmailControl.propTypes = {
  model: formPropTypes.model.isRequired,
  trackingId: PropTypes.string.isRequired,
  onRemove: PropTypes.func,
}

EmailControl.contextTypes = {
  form: formPropTypes.form,
};

class EmailArrayControl extends Component {
  handleAddClick = (evt) => {
    evt.preventDefault();
    const { model } = this.props;
    const { form } = this.context;

    form.actions.push(model, { trackingId: uniqueId('email'), type: '', value: '' });
  }

  handleRemove = (trackingId) => {
    const { model } = this.props;
    const { form } = this.context;

    form.actions.remove(model, { trackingId });
  }

  render() {
    const { model } = this.props;
    const { form } = this.context;

    const emails = form.getFieldValue(model);
    return (
      <div>
        {(emails || []).map((email, i) => (
          <div
            key={email.trackingId}
            className="clearfix"
            style={{ marginBottom: '10px', position: 'relative' }}
          >
            <EmailControl
              model={track(`${model}`, { trackingId: email.trackingId })}
              trackingId={email.trackingId}
              onRemove={this.handleRemove}
            />
          </div>
        ))}
        <button
          type="button"
          className="wui-btn wui-btn--primary"
          onClick={this.handleAddClick}
        >
          Add email
        </button>
      </div>
    )
  }
}

EmailArrayControl.propTypes = {
  model: PropTypes.string.isRequired,
};

EmailArrayControl.contextTypes = {
  form: formPropTypes.form,
};

export default EmailArrayControl;
