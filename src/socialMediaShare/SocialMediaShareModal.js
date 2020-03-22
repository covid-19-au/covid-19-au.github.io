import React from 'react';
import { Modal } from 'antd';
import 'antd/dist/antd.css';

import SharedButtons from './SharedButtons';


const SocialMediaShareModal = ({ visible, onCancel }) => {
  return(
    <Modal
      title="Share the links with social medias"
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <SharedButtons />
    </Modal>
  )
}

export default SocialMediaShareModal;
