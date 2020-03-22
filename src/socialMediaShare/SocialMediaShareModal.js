import React from 'react';
import Modal from 'react-modal';

import SharedButtons from './SharedButtons';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

Modal.setAppElement('#root')

const SocialMediaShareModal = ({ visible, onCancel }) => {
  return(
    <Modal
      isOpen={visible}
      onRequestClose={onCancel}
      style={customStyles}
    >
      <p>Share this site.</p>
      <SharedButtons />
    </Modal>
  )
}

export default SocialMediaShareModal;
