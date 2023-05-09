import axios from "axios";
import {useEffect, useState} from "react";
import {Button, Image, OverlayTrigger, Table, Tooltip} from "react-bootstrap";

export const Dashboard = ({token, logout}) => {
  const [userData, setUserData] = useState({});
  const [trackToggle, setTrackToggle] = useState(true);
  const [topTrackData, setTopTracksData] = useState([]);
  const [topArtistData, setTopArtistData] = useState([]);
  const [trackAnalyticsData, setTrackAnalyticsData] = useState({
      acousticness: 0,
      danceability: 0,
      energy: 0,
      liveness: 0
    });

  useEffect(() => {
    fetchUserData().then(data => data);

    if (trackToggle) {
      fetchTopTracks().then(data => data);
    } else {
      fetchTopArtists().then(data => data);
    }
  }, [trackToggle]);


  const fetchUserData = async (e) => {
    console.log('fetching');
    const {data} = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });

    setUserData(data);
  }

  const fetchTrackAnalytics = async (listOfTracks) => {
    var analytics = {
      acousticness: 0,
      danceability: 0,
      energy: 0,
      liveness: 0
    };

    const {data} = await axios.get("https://api.spotify.com/v1/audio-features", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        ids: listOfTracks
      }
    });

    data.audio_features.map((feature) => {
      analytics.acousticness += Math.round(feature.acousticness * 100);
      analytics.danceability += Math.round(feature.danceability * 100);
      analytics.energy += Math.round(feature.energy * 100);
      analytics.liveness += Math.round(feature.liveness * 100);
    });

    var acousticnessElement = document.getElementsByClassName("acousticness-progress-bar2")[0];
    acousticnessElement.style.setProperty('width', analytics.acousticness / 10 + "%");

    var danceabilityElement = document.getElementsByClassName("danceability-progress-bar2")[0];
    danceabilityElement.style.setProperty('width', analytics.danceability / 10 + "%");

    var energyElement = document.getElementsByClassName("energy-progress-bar2")[0];
    energyElement.style.setProperty('width', analytics.energy / 10 + "%");

    var livenessElement = document.getElementsByClassName("liveness-progress-bar2")[0];
    livenessElement.style.setProperty('width', analytics.liveness / 10 + "%");


    setTrackAnalyticsData({
      acousticness: analytics.acousticness / 10,
      danceability: analytics.danceability / 10,
      energy: analytics.energy / 10,
      liveness: analytics.liveness / 10,
    });
  }

  const fetchTopTracks = async (e) => {
    let listOfTracks = "";
    const {data} = await axios.get("https://api.spotify.com/v1/me/top/tracks?limit=10&offset=0", {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });

    const cleanedData = data.items.map((track) => {
      listOfTracks += track.id + ",";
      return {trackName: track.name, artistName: track.artists[0].name, albumName: track.album.name, image: track.album.images[2].url, link: track.external_urls.spotify}
    });

    await fetchTrackAnalytics(listOfTracks);

    setTopTracksData(cleanedData);
  }

  const fetchTopArtists = async (e) => {
    const {data} = await axios.get("https://api.spotify.com/v1/me/top/artists?limit=10&offset=0", {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });

    const cleanedData = data.items.map((artist) => {
      return {artistName: artist.name, image: artist.images[1].url, link: artist.external_urls.spotify}
    });

    setTopArtistData(cleanedData);
  }

  const renderTooltip = (feature) => {

      switch (feature) {
        case "acousticness":
          return (
            <Tooltip id="button-tooltip">
              How acoustic a song is
            </Tooltip>
          );
        case "danceability":
          return (
            <Tooltip id="button-tooltip">
              How suitable a track is for dancing
            </Tooltip>
          );
        case "energy":
          return (
            <Tooltip id="button-tooltip">
              A perceptual measure of intensity and activity
            </Tooltip>
          );
        case "liveness":
          return (
            <Tooltip id="button-tooltip">
              The presence of an audience in the recording
            </Tooltip>
          );
        default:
          return (
            <Tooltip id="button-tooltip">
              An audio feature provided by the Spotify API
            </Tooltip>
          );
      }
  };

  return (
    <div className="display-contents-container">
      <div className="dashboard-header">
        {userData.images && <Image id="header-image" src={userData.images[0].url} roundedCircle={true}></Image>}
        <div className="centered-text-container"><h1>Hi {userData.display_name}</h1></div>
        <Button id="logout-button" variant="outline-primary" onClick={logout}>LOG OUT</Button>
      </div>
      <div>
        <Button variant="outline-primary" active={!trackToggle} onClick={() => setTrackToggle(false)}>ARTISTS</Button>
        <Button variant="outline-primary" active={trackToggle} onClick={() => setTrackToggle(true)}>TRACKS</Button>
      </div>
      { trackToggle &&
        <div>
          <h2>Here are the top 10 tracks you've been listening to recently</h2>
          <div className="flex-container">
            <div className="top-tracks-container">
              <Table variant="dark" striped borderless hover size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>TRACK</th>
                    <th>ARTIST</th>
                    <th>ALBUM</th>
                  </tr>
                </thead>
                <tbody>
                {
                  topTrackData.map((track, i) => {
                    return (
                        <tr className="track-row" key={i}>
                          <td>{i+1}</td>
                          <td className="track-name-cell">
                            <div>
                              <a href={track.link} target="_blank">
                                <svg
                                  width="75"
                                  height="75"
                                  viewBox="0 0 24 24"
                                  color="#1db954"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M15 12.3301L9 16.6603L9 8L15 12.3301Z" fill="currentColor" />
                                </svg>
                              </a>
                            </div>
                            <Image className="image-cell" src={track.image}></Image>
                            <div className="class-name-cell">{track.trackName}</div>
                          </td>
                          <td>{track.artistName}</td>
                          <td>{track.albumName}</td>
                        </tr>
                    )
                  })
                }
                </tbody>
              </Table>
            </div>
            <div className="audio-features-container">
              <div className="container">
                <div className="feature-text">
                  Acousticness: {trackAnalyticsData.acousticness}%
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip("acousticness")}
                  >
                  <svg style={{float: "right"}} xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                       fill="currentColor" className="bi bi-question-circle"
                       viewBox="0 0 16 16">
                    <path
                        d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path
                        d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                  </svg>
                  </OverlayTrigger>
                </div>
                <div className="acousticness-progress-bar acousticness-moved">
                  <div className="acousticness-progress-bar2 acousticness">
                  </div>
                </div>
              </div>
              <div className="container">
                <div className="feature-text">
                  Danceability: {trackAnalyticsData.danceability}%
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip("danceability")}
                  >
                  <svg style={{float: "right"}} xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                       fill="currentColor" className="bi bi-question-circle"
                       viewBox="0 0 16 16">
                    <path
                        d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path
                        d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                  </svg>
                  </OverlayTrigger>
                </div>
                <div className="danceability-progress-bar danceability-moved">
                  <div className="danceability-progress-bar2 danceability">
                  </div>
                </div>
              </div>
              <div className="container">
                <div className="feature-text">
                  Energy: {trackAnalyticsData.energy}%
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip("energy")}
                  >
                  <svg style={{float: "right"}} xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                       fill="currentColor" className="bi bi-question-circle"
                       viewBox="0 0 16 16">
                    <path
                        d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path
                        d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                  </svg>
                  </OverlayTrigger>
                </div>
                <div className="energy-progress-bar energy-moved">
                  <div className="energy-progress-bar2 energy">
                  </div>
                </div>
              </div>
              <div className="container">
                <div className="feature-text">
                  Liveness: {trackAnalyticsData.liveness}%
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip("liveness")}
                  >
                  <svg style={{float: "right"}} xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                       fill="currentColor" className="bi bi-question-circle"
                       viewBox="0 0 16 16">
                    <path
                        d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path
                        d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                  </svg>
                  </OverlayTrigger>
                </div>
                <div className="liveness-progress-bar liveness-moved">
                  <div className="liveness-progress-bar2 liveness">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      {!trackToggle &&
        <div>
          <h2>Here are the top 10 artists you've been listening to
            recently</h2>
          <div className="flex-container top-artists-container">
            {topArtistData.map((artist, i) => {
              return (
                  <a href={artist.link} target="_blank">
                    <div key={i} className="artist-image-element">
                      <Image src={artist.image}></Image>
                      <div>{artist.artistName}</div>
                    </div>
                  </a>
                )
              })
            }
          </div>
        </div>
      }
    </div>
  );
}