import React, { useState } from 'react';
import ReactGA from 'react-ga';

const analyticsEventTracker = (category, limitType) => {
  const action = 'subscribe Amature';
  const label = `from ${limitType}`;
  ReactGA.event({ category, action, label });
};

const PackageCard = ({ products, limitType }) => {
  const [isLoading, setIsLoading] = useState(false);

  async function subscribeHandler(plan) {
    const request_body = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriptionProductId: plan.id,
        price: null,
      }),
    };
    const response = await fetch(
      '/billing/create_checkout_session',
      request_body
    );
    const jsonResponse = await response.json();
    analyticsEventTracker('Amature checkout', limitType);
    setIsLoading(false);
    window.location.href = jsonResponse.redirectUrl;
  }

  return (
    <>
      <div className="package-all-info">
        {products.map((prod) => {
          return (
            <div className="d-flex flex-column single-package-card">
              <div className="package-name">{prod.name.split('-')[0]}</div>
              <div className="package-price">
                ${prod.price.split('.')[0]}
                <sup>.{prod.price.split('.')[1]}</sup>
              </div>
              <div className="recurrence">Per month</div>
              <div className="package-info">
                <div className="server-speed d-flex flex-row">
                  <div>
                    <img
                      src={require('../../../public/assets/images/check.svg')}
                      width={20}
                      height={20}
                      alt=""
                    />
                  </div>
                  <div>
                    Unlimited server speed: <b>{prod.id === 15 ? "10 MN/s" : "25-100 MN/s"}</b>
                  </div>
                </div>
                <div className="package-engines d-flex flex-row">
                  <div>
                    <img
                      src={require('../../../public/assets/images/check.svg')}
                      width={25}
                      height={25}
                      alt=""
                    />
                  </div>
                  <div>
                    Engines: Stockfish, AsmFish, SugaR AI, Berserk, Koivisto, RubiChess, ShashChess
                  </div>
                </div>
                <div>
                  <img
                    src={require('../../../public/assets/images/check.svg')}
                    width={20}
                    height={20}
                    alt=""
                  />
                  Cloud Storage: <b>{prod.id === 15 ? "500 PGN" : "Unlimited"}</b>
                </div>
                <div>
                  <img
                    src={require('../../../public/assets/images/check.svg')}
                    width={20}
                    height={20}
                    alt=""
                  />
                  Syzygy Tablebase
                </div>
                <div>
                  <img
                    src={require('../../../public/assets/images/check.svg')}
                    width={20}
                    height={20}
                    alt=""
                  />
                  Database of 9 Million+ Games updated weekly
                </div>
                <div>
                  <img
                    src={require('../../../public/assets/images/check.svg')}
                    width={20}
                    height={20}
                    alt=""
                  />
                  Unlimited Video Search
                </div>
              </div>
              <div>
              <button
                  className="subscribe-btn"
                  onClick={() => {
                    setIsLoading(true);
                    subscribeHandler(prod);
                  }}
                >
                  {isLoading ? (
                    <div className="circle-loader"></div>
                  ) : prod.id === 15 ? (
                    'Start Free Trial'
                  ) : (
                    'Subscribe'
                  )}
                </button>

              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PackageCard;
