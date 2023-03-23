import React from 'react';
import { useEffect, useState } from 'react';
import AccountSettings from './AccountSettings';
import PlanDetails from './PlanDetails';
import PasswordSavedModal from './PasswordSavedModal';
import ResetPasswordModal from './ResetPasswordModal';
import { connect } from 'react-redux';

const mapStateToProps = (state) => {
  return {
    isSavedPasswordModalOpen: state.userAccount.isSavedPasswordModalOpen,
    isResetPasswordModalOpen: state.userAccount.isResetPasswordModalOpen,
    userFullInfo: state.cloud.userFullInfo,
  };
};

const UserAccount = ({
  isSavedPasswordModalOpen,
  isResetPasswordModalOpen,
  userFullInfo,
}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <div  className="user-account-wrapper">
      {isSavedPasswordModalOpen && (
        <PasswordSavedModal
          isSavedPasswordModalOpen={isSavedPasswordModalOpen}
        />
      )}
      {isResetPasswordModalOpen && (
        <ResetPasswordModal
          isResetPasswordModalOpen={isResetPasswordModalOpen}
          userInfo={userFullInfo}
        />
      )}
      <article className="user-account">
        <AccountSettings
          userInfo={userFullInfo}
          isSavedPasswordModalOpen={isSavedPasswordModalOpen}
          isResetPasswordModalOpen={isResetPasswordModalOpen}
        />
        <PlanDetails userInfo={userFullInfo} />
      </article>
      <div className="user-account_mob-button">
        <button className="green-btn user-account_log-out">Log out</button>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, null)(UserAccount);
