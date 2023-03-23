import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player/lazy';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { VIDEOS_COUNT_PER_PAGE } from '../../constants/cloud-params';
import { connect } from 'react-redux';
import { setVideosFen } from '../../actions/cloud';
import { getVideos } from '../../utils/api';

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    videosFen: state.cloud.videosFen,
    userFullInfo: state.cloud.userFullInfo,
  };
};

const VideosArea = ({
  fen,
  userFullInfo,
  videosFen,
  setVideosFen,
  tabIsOpen,
  setVideoLimit,
}) => {
  const [showRange, setShowRange] = useState(VIDEOS_COUNT_PER_PAGE);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [youtubeVideos, setYoutubeVideos] = useState([]);

  async function getVideosHandler() {
    const shortFen = fen.split(' ')[0];
    setVideosFen(fen);
    setLoadingVideos(true);
    getVideos(userFullInfo.token, shortFen)
      .then((videos) => {
        setYoutubeVideos(
          videos.filter((video) => video.type === 'YoutubeFetcher')
        );
        setLoadingVideos(false);
      })
      .catch((e) => {
        setLoadingVideos(false);
        setVideoLimit(true);
        console.error(e);
      });
  }

  useEffect(() => {
    if (tabIsOpen) {
      getVideosHandler();
    }
  }, [fen]);

  return loadingVideos ? (
    <div className="isLoading isLoading-folder d-flex flex-row justify-content-center">
      <div>
        <div className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center">
      <div className="row mt--10">
        {youtubeVideos.slice(showRange - 4, showRange).map((vid) => (
          <div className="col-6 mt--10">
            <ReactPlayer
              url={`${vid.url}?t=${vid.msec / 1000}`}
              height={250}
              width="100%"
            />
          </div>
        ))}
      </div>
      <div className="pgn-viewer-footer mt--10">
        {showRange !== VIDEOS_COUNT_PER_PAGE && (
          <button onClick={() => setShowRange(showRange - 4)}>
            <IoIosArrowBack />
          </button>
        )}
        {showRange + 4 <= youtubeVideos.length && (
          <button onClick={() => setShowRange(showRange + 4)}>
            <IoIosArrowForward />
          </button>
        )}
      </div>
    </div>
  );
};

export default connect(mapStateToProps, { setVideosFen })(VideosArea);
