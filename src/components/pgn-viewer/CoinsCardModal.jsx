import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';

const CoinsCardModal = ({ showModal, setShowModal, isGuestUser }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const buyCoinsHandler = async (price) => {
    if (isGuestUser) {
      window.location.href = '/auth/signin';
      return;
    }
    const request_body = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriptionProductId: null,
        price: price,
      }),
    };
    const response = await fetch(
      '/billing/create_checkout_session',
      request_body
    );
    const jsonResponse = await response.json();
    window.location.href = jsonResponse.redirectUrl;
  };

  return (
    <Modal
      show={showModal}
      onHide={handleCloseModal}
      keyboard={false}
      backdrop="static"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName="coins-modal"
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
        <div className="coins-title">
          <h3>Access Chessify's Dedicated Servers</h3>
          <h6>
            Buy coins to rent the more powerful servers and analyze at a
            dedicated speed of up to 1000 MN/s.
          </h6>
        </div>
        <div className="d-flex flex-row justify-content-between coins-packages">
          <div className="package-component">
            <div className="package-all-info">
              <div className="d-flex flex-column single-package-card">
                <div>
                  <img
                    src={require('../../../public/assets/images/pgn-viewer/coins-solid.svg')}
                    width="25"
                    height="25"
                    alt=""
                  />
                </div>
                <div className="package-price">500 coins</div>
                <div>
                  <p>E.g. 50 minutes of Lc0</p>
                </div>
                <div>
                  <button
                    className="subscribe-btn"
                    onClick={() => {
                      setIsLoading(true);
                      buyCoinsHandler(5);
                    }}
                  >
                    Buy for $5
                    {isLoading ? <div className="circle-loader"></div> : <></>}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="package-component">
            <div className="package-all-info">
              <div className="d-flex flex-column single-package-card">
                <div>
                  <img
                    src={require('../../../public/assets/images/pgn-viewer/coins-solid.svg')}
                    width="25"
                    height="25"
                    alt=""
                  />
                </div>
                <div className="package-price">2500 coins</div>
                <div>
                  <p>E.g. 250 minutes of Lc0</p>
                </div>
                <div>
                  <button
                    className="subscribe-btn"
                    onClick={() => {
                      setIsLoading(true);
                      buyCoinsHandler(25);
                    }}
                  >
                    Buy for $25
                    {isLoading ? <div className="circle-loader"></div> : <></>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="coins-title coins-title-rate">
          <h6>Use Your Coins for the Servers Below</h6>
        </div>
        <Table bordered>
          <tr>
            <th scope="row" rowSpan="4">
              Stockfish
            </th>
            <td>130 MN/s</td>
            <td>10 coins/minutes</td>
          </tr>
          <tr>
            <td>300 MN/s</td>
            <td>20 coins/minutes</td>
          </tr>
          <tr>
            <td>700 MN/s</td>
            <td>60 coins/minutes</td>
          </tr>
          <tr>
            <td>1 BN/s</td>
            <td>80 coins/minutes</td>
          </tr>
          <tr>
            <th scope="row">LCZero</th>
            <td>100 kN/s</td>
            <td>10 coins/minutes</td>
          </tr>
          <tr>
            <th scope="row">
              AsmFish, Berserk, Koivisto, <br /> SugaR AI, RubiChess, ShashChess
            </th>
            <td>130 MN/s</td>
            <td>10 coins/minutes</td>
          </tr>
        </Table>
        <div className="d-flex flex-row justify-content-center mt-1 mb-1">
          <a
            href="/pricing#buy-coins"
            target="_blank"
            rel="noopener noreferrer"
            className="see-pricing"
          >
            <Button
              className="game-format-btn game-format-close-btn"
              variant="primary"
              onClick={handleCloseModal}
            >
              See More Options for Coins
            </Button>
          </a>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CoinsCardModal;
