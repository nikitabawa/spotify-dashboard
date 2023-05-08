import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import axios from "axios";
import {Dashboard} from "./Dashboard";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button} from "react-bootstrap";

function App() {
  const CLIENT_ID = "9279e1d414564440bc2c5a10bfd69c6b";
  const REDIRECT_URI = "http://localhost:3000/";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([]);
  const [userData, setUserData] = useState({});


  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
        token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

        window.location.hash = ""
        window.localStorage.setItem("token", token)
    }

    setToken(token)

  }, []);

  const logout = () => {
    console.log('in logout')
    setToken("")
    window.localStorage.removeItem("token")
  }

  const searchArtists = async (e) => {
    e.preventDefault()
    const {data} = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params: {
            q: searchKey,
            type: "artist"
        }
    })

    setArtists(data.artists.items)
  }

  const renderArtists = () => {
    return artists.map(artist => (
        <div key={artist.id}>
            {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt=""/> : <div>No Image</div>}
            {artist.name}
        </div>
    ))
  }


  const fetchTopTracks = async (e) => {
    const {data} = await axios.get("https://api.spotify.com/v1/me/top/tracks?limit=5&offset=0", {
        headers: {
            Authorization: `Bearer ${token}`
        },
    })

    console.log(data);
  }

  return (
    <div className="App">
      {/*<header className="App-header">*/}
        {/*<img src={logo} className="App-logo" alt="logo" />*/}
        {!token ?
          <div className="centered">
            <div>
              <img src="https://www.freepnglogos.com/uploads/spotify-logo-png/spotify-icon-green-logo-8.png" width="200" alt="spotify icon green logo" />
            </div>
            <div>Login to see your top tracks and artists!</div>
            <div>
              <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-top-read`}>
                <Button variant="outline-primary">Login to Spotify</Button>
              </a>
            </div>
          </div>
          : <Dashboard token={token} logout={logout}></Dashboard>
        }
        {/*<form onSubmit={searchArtists}>*/}
        {/*  <input type="text" onChange={e => setSearchKey(e.target.value)}/>*/}
        {/*  <button type={"submit"}>Search</button>*/}
        {/*</form>*/}
        {/*{renderArtists()}*/}
      {/*</header>*/}
      {/*<button onClick={logout}>Logout</button>*/}
    </div>
  );
}

export default App;
