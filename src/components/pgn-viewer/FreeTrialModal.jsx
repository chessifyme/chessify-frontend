import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import ReactGA from 'react-ga';

const analyticsEventTracker = (category, limitType) => {
  const action = 'subscribe Amature';
  const label = `from ${limitType}`;
  ReactGA.event({ category, action, label });
};

const FreeTrialModal = ({ showModal, setShowModal, setSubModal }) => {
  const [isLoading, setIsLoading] = useState(false);
  async function subscribeHandler() {
    const request_body = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriptionProductId: 15,
        price: null
      }),
    };
    const response = await fetch(
      '/billing/create_checkout_session',
      request_body
    );
    const jsonResponse = await response.json();
    analyticsEventTracker('Amature checkout', 'extend-free-trial');
    setIsLoading(false);
    window.location.href = jsonResponse.redirectUrl;
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setSubModal('');
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
        <div className="extend-trial-title">
          <h3>Extend Your Trial</h3>
          <h5>
            Get 2 more days of <span>Free Trial</span> by entering your payment
            information.
          </h5>
        </div>
        <div className="extend-trial-info">
          <h6>Pay $7.99/month afterward. No risk: Cancel any time.</h6>
          <div className="info d-flex flex-row">
            <div>
              <img
                src={require('../../../public/assets/images/check.svg')}
                width={20}
                height={20}
                alt=""
              />
            </div>
            <div>
              <span className="feature">Unlimited server speed:</span>
              10,000 kN/s
            </div>
          </div>
          <div className="d-flex flex-row info">
            <div>
              <img
                src={require('../../../public/assets/images/check.svg')}
                width={20}
                height={20}
                alt=""
              />
            </div>
            <div>
              <span className="feature">Engines:</span>
              Stockfish, AsmFish, SugaR AI, Berserk, Koivisto
            </div>
          </div>
          <div className="d-flex flex-row info">
            <img
              src={require('../../../public/assets/images/check.svg')}
              width={20}
              height={20}
              alt=""
            />
            <span className="feature">Database:</span>9 Million+ Games updated
            weekly
          </div>
          <div className="info d-flex flex-row">
            <img
              src={require('../../../public/assets/images/check.svg')}
              width={20}
              height={20}
              alt=""
            />
            <span className="feature">Cloud Storage:</span>
            50 PGNs
          </div>
          <div className="info d-flex flex-row">
            <img
              src={require('../../../public/assets/images/check.svg')}
              width={20}
              height={20}
              alt=""
            />
            <span className="feature">Video Search:</span>
            Unlimited
          </div>
          <div className="info d-flex flex-row">
            <img
              src={require('../../../public/assets/images/check.svg')}
              width={20}
              height={20}
              alt=""
            />
            <div className="feature">And more</div>
          </div>
          <div>
            <button
              className="extend-trial-btn"
              onClick={() => {
                setIsLoading(true);
                subscribeHandler();
              }}
            >
              Extend Trial{' '}
              {isLoading ? <div className="circle-loader"></div> : <></>}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default FreeTrialModal;
