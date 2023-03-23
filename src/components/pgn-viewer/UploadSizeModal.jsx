import React from 'react';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import { setUploadSizeExceeded, setLoader } from '../../actions/board';

const mapStateToProps = (state) => {
  return {
    uploadSizeExceeded: state.board.uploadSizeExceeded,
  };
};

const UploadSizeModal = ({
  showModal,
  setShowModal,
  setUploadSizeExceeded,
  setLoader,
}) => {
  const handleCloseModal = () => {
    setShowModal(false);
    setUploadSizeExceeded(false);
    setLoader('');
  };

  return (
    <Modal
      show={showModal}
      onHide={handleCloseModal}
      keyboard={false}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName="border-radius-dialog"
    >
      <Modal.Body>
        <div className="text-center">
          <img
            src={require('../../../public/assets/images/failed.svg')}
            width="40px"
            height="40px"
            alt=""
            onClick={handleCloseModal}
          />
          <p className="text-center mt-1 mb-1">
            Your file is too large. The limit is 5MB.
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default connect(mapStateToProps, { setUploadSizeExceeded, setLoader })(
  UploadSizeModal
);
