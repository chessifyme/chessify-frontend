import React, { Component } from 'react';
import { connect } from 'react-redux';
import MainPage from './components/MainPage.jsx';
import { Switch, Route } from 'react-router-dom';
import { getUserFullInfo } from './actions/cloud';
import { getUserAccountDat } from './actions/userAccount';
import { getUserFullData, getUserAccountInfo } from './utils/api';
import { connectToPro, setSubModal } from './actions/cloud';
import NavBar from './components/NavBar.jsx';
import UserAccount from './components/UserAccount.jsx';
import PagePreloader from './components/common/PagePreloader.jsx';
import ThemeProvider from './providers/ThemeProvider';

const mapStateToProps = (state) => {
  return {
    userAccountInfo: state.userAccount.userAccountInfo,
    userFullInfo: state.cloud.userFullInfo,
  };
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      getUserFullInfoIntervalId: null,
      loading: true,
    };
  }
  componentDidMount() {
    const {
      getUserAccountDat,
      getUserFullInfo,
      connectToPro,
      setSubModal,
    } = this.props;
    getUserAccountInfo()
      .then((userAccountDataResponse) => {
        getUserAccountDat(userAccountDataResponse);
      })
      .catch((e) => {
        console.error('USER ACOOUNT ERROR======>>>>', e);
      });

    getUserFullData()
      .then((userDetaleInfo) => {
        getUserFullInfo(userDetaleInfo);
      })
      .catch((e) => {
        console.error(e);
      });

    const intervalId = setInterval(() => {
      getUserFullData()
        .then((userDetaleInfo) => {
          getUserFullInfo(userDetaleInfo);
          const wssChannels = [];
          if (
            userDetaleInfo.notify &&
            userDetaleInfo.subscription &&
            userDetaleInfo.subscription.from_ads
          ) {
            setSubModal('trial');
          } else if (userDetaleInfo.notify && !userDetaleInfo.subscription) {
            setSubModal('after5Min');
          }
          if (userDetaleInfo.servers) {
            for (const [engine, params] of Object.entries(
              userDetaleInfo.servers
            )) {
              wssChannels.push({
                name: engine,
                channel: params[1],
                temp: params[0].for_guests,
                isSubscription: userDetaleInfo.subscription,
                cores: params[0].cores,
              });
            }
            connectToPro(wssChannels);
            this.setState({
              loading: false,
            });
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }, 3000);
    this.setState({
      getUserFullInfoIntervalId: intervalId,
    });
  }

  componentWillUnmount() {
    const { getUserFullInfoIntervalId } = this.state;
    clearInterval(getUserFullInfoIntervalId);
  }

  render() {
    const { userAccountInfo } = this.props;
    const { loading } = this.state;

    if (loading) {
      return <PagePreloader />;
    }

    return (
      <ThemeProvider>
        <NavBar userInfo={this.props.userFullInfo} />
        <Switch>
          <Route
            exact
            path="/analysis/account_settings"
            component={UserAccount}
          />
          <Route
            exact
            path={`${process.env.PUBLIC_URL}`}
            component={MainPage}
          />
        </Switch>
      </ThemeProvider>
    );
  }
}
export default connect(mapStateToProps, {
  getUserAccountDat,
  getUserFullInfo,
  connectToPro,
  setSubModal,
})(App);
