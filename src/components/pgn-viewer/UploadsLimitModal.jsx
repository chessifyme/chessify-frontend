import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { setLoader, setUploadLimitExceeded } from '../../actions/board';
import PackageCard from './PackageCard';
import { setSubModal } from '../../actions/cloud';

const mapStateToProps = (state) => {
  return {
    uploadLimitExceeded: state.board.uploadLimitExceeded,
    userFullInfo: state.cloud.userFullInfo,
  };
};

const MESSAGES = {
  videoSearch:
    'Want to find videos with the current position? Upgrade to the Amateur plan.',
  cloudUpload:
    'Need to save more PGN files? Subscribe to increase your cloud storage.',
  after5Min:
    'Get 10X faster analysis and access all our features when you upgrade to the Amateur Plan!',
  reference:
    'Want to see full statistics of all opening moves? Upgrade to the Amateur Plan.',
};

const UploadsLimitModal = ({
  showModal,
  setShowModal,
  setUploadLimitExceeded,
  setLoader,
  limitType,
  userFullInfo,
  setSubModal,
}) => {
  const [products, setProducts] = useState([]);
  const isFreeOrAmature =
    userFullInfo.subscription &&
    (userFullInfo.subscription.product_id === 14 ||
      userFullInfo.subscription.product_id === 15 ||
      userFullInfo.subscription.product_id === 16);

  const message = isFreeOrAmature
    ? MESSAGES[limitType].replace('Amature', 'Master')
    : MESSAGES[limitType];

  async function getProducts() {
    const response = await fetch('/billing/products', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const { result } = await response.json();

    let suggestedProduct = result.filter((product) => product.id === 15);
    if (isFreeOrAmature) {
      suggestedProduct = result.filter((product) => product.id === 17);
    }
    setProducts(suggestedProduct);
  }

  useEffect(() => {
    getProducts();
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setUploadLimitExceeded(false);
    setSubModal('');
    if (limitType === 'cloudUpload' || limitType === 'reference') {
      setLoader('');
    }
  };

  return (
    <Modal
      show={showModal}
      size="md"
      onHide={handleCloseModal}
      keyboard={false}
      backdrop="static"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName="border-radius-dialog"
    >
      <Modal.Body>
        <div className="d-flex flex-row justify-content-end mt-2">
          <button
            className="modal-close"
            type="button"
            onClick={handleCloseModal}
          >
            <img
              src={require('../../../public/assets/images/pgn-viewer/close-mark.svg')}
              width="30"
              height="30"
              alt=""
            />
          </button>
        </div>
        <div className="packages-title">
          <h3>{message}</h3>
        </div>
        <div className="package-component">
          <PackageCard products={products} limitType={limitType} />
        </div>
        <div className="d-flex flex-row justify-content-center mt-1 mb-1">
          <a
            href="/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="see-pricing"
          >
            <Button
              className="game-format-btn game-format-close-btn"
              variant="primary"
              onClick={handleCloseModal}
            >
              See Full Pricing
            </Button>
          </a>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default connect(mapStateToProps, {
  setUploadLimitExceeded,
  setLoader,
  setSubModal,
})(UploadsLimitModal);
