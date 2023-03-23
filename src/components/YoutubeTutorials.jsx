import React, { useEffect, useState } from 'react';
import { FaLightbulb } from 'react-icons/fa';
import { Modal, Dropdown } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import { getServerSideProps } from '../utils/utils';

const VideoModal = ({ showModal, setShowModal, url }) => {
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Modal
      show={showModal}
      onHide={handleCloseModal}
      keyboard={false}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName="border-radius-dialog"
    >
      <Modal.Body>
        <div className="text-center trial-status">
          <div className="d-flex flex-row justify-content-center">
            <ReactPlayer
              url={url}
              playing={true}
              width={853}
              height={505}
            />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const YoutubeTutorials = () => {
  const [showModal, setShowModal] = useState(false);
  const [videos, setVideos] = useState([]);
  const [url, setUrl] = useState();

  async function getVideosHandler() {
    getServerSideProps()
      .then((data) => {
        setVideos(data);
      })
      .catch((e) => {
        console.error(e);
      });
  }

  useEffect(() => {
    getVideosHandler();
  }, []);
  return (
    <>
      <Dropdown>
        <Dropdown.Toggle id="dropdown-basic" className="nav-header-tutorials">
          Tutorials
        </Dropdown.Toggle>
        <FaLightbulb className="nav-header-light-bulb" />
        <Dropdown.Menu>
          {videos.items &&
            videos.items.map(({ id, snippet = {} }) => {
              const { title, resourceId = {} } = snippet;

              return title !== 'Deleted video' ? (
                <Dropdown.Item
                  key={id}
                  onClick={() => {
                    setUrl(
                      `https://www.youtube.com/watch?v=${resourceId.videoId}`
                    );
                    setShowModal(true);
                  }}
                >
                  <FaLightbulb className="nav-header-vid-bulb" />
                  {title}
                </Dropdown.Item>
              ) : (
                <></>
              );
            })}
        </Dropdown.Menu>
      </Dropdown>
      <VideoModal showModal={showModal} setShowModal={setShowModal} url={url} />
    </>
  );
};

export default YoutubeTutorials;
