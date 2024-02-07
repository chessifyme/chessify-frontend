import React from 'react';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { logout, manageSubscription } from '../utils/api';
import { getProductDetails } from '../actions/userAccount';
import { connect } from 'react-redux';

const mapStateToProps = (state) => {
  return {
    productDetails: state.userAccount.productDetails,
  };
};

const PlanDetails = ({ plans, getProductDetails, productDetails }) => {
  const [subscription, setSubscription] = useState(null);
  const [productId, setProductId] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [isTappedManageSubscription, setManageSubscription] = useState(false);

  useEffect(() => {
    setSubscription(plans.subscription);
    if (plans.subscription) {
      setProductId(plans.subscription.product_id);
      setExpiryDate(plans.subscription.valid_till);
    }
    else if (plans.package) {
      setProductId(plans.package.product_id);
      setExpiryDate(plans.package.valid_till);
    }

    if (productId) {
      fetch(`/billing/get_product_details?id=${productId}`)
        .then((response) => response.json())
        .then((data) => {
          getProductDetails(data.result[0]);
        });
    }
    document.getElementById('planDetails').style.display = 'flex'
  }, [productId, plans]);

  const recurrence = () => {
    switch (productDetails.recurrence) {
      case 'onetime': {
        return '/once';
      }
      case 'yearly': {
        return '/year';
      }
      case 'monthly': {
        return 'month';
      }
      default: {
        return '';
      }
    }
  };

  const getFreeServer = () => {
    let freeServers = '';
    if (productDetails.free_servers) {
      productDetails.free_servers.forEach((element) => {
        freeServers += `${element} `;
      });
    }
    return freeServers;
  };

  const addLoading = () => {
    return (
      <div className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  };

  const manageSub = () => {
    setManageSubscription(true);
    manageSubscription();
  }

  return (
    <article className="user-account-details" id="planDetails">
      <div className="user-account-details-body">
        <div>
          <h4 className="user-account-details-title">Your plan details</h4>
          <div className="user-account-details-current-plan">
            <span>
              Current plan <span>{ productDetails ? productDetails.name : ''}</span>
            </span>
            {isTappedManageSubscription && addLoading()}
            {!isTappedManageSubscription && (<button className="change-btn" onClick={manageSub}>
              Manage Subscription
            </button>)}
          </div>
        </div>
        <div className="line"></div>
        {Object.keys(productDetails).length !== 0 ? <div>
          <div className="user-account-details-current-plan-info">
            <span className="current-plan-info-title">Billing:</span>
            <span className="referral-link-description">
              {'$' + productDetails.price + recurrence()}
            </span>
          </div>
          <div className="user-account-details-current-plan-info">
            <span className="current-plan-info-title">Free servers:</span>
            <span className="referral-link-description">{getFreeServer()}</span>
          </div>
          <div className="user-account-details-current-plan-info">
            <span className="current-plan-info-title">Coins:</span>
            <span className="referral-link-description">
              {productDetails.coins + ' coins' + recurrence()}
            </span>
          </div>
          <div className="user-account-details-current-plan-info">
            <span className="current-plan-info-title">Bonus:</span>
            <span className="referral-link-description">
              {productDetails.bonus_coins + ' coins'}
            </span>
          </div>
          <div className="user-account-details-current-plan-info">
            <span className="current-plan-info-title">Expires:</span>
            <span className="referral-link-description">
              {moment(expiryDate).format('DD MMM YYYY, H:m')}
            </span>
          </div>
        </div> : <div></div>}
      </div>
      <a href="/" className="green-btn" onClick={logout}>
        Log out
      </a>
    </article>
  );
};

export default connect(mapStateToProps, { getProductDetails })(PlanDetails);
