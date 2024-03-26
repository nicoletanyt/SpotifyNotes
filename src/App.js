import { useEffect, useState } from "react";
import "./index.css";
import axios from "axios";
import { ref, set, child, get } from "firebase/database";
import database from "./firebase";

function App() {
  const CLIENT_ID = "d8509cca5e7b40948a5beef95753fdca";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [tracks, setTracks] = useState([]);
  const [songs, setSongs] = useState([]);
  const [link, setLink] = useState([]);

  const urlParams = new URLSearchParams(window.location.search);
  const userID = urlParams.get("user");
  const isAdding = urlParams.get("add");

  useEffect(() => {
    // Use current token if exists, else extract new one
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }
    setToken(token);
  }, []);

  useEffect(() => {
    if (songs.length == 0) {
      get(child(ref(database), `users/${userID}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            setSongs(snapshot.val());
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      set(ref(database, "users/" + userID), songs);
      console.log(songs);
    }
  }, [songs]);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  const searchSongs = async (e) => {
    e.preventDefault();
    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: searchKey,
        type: "track",
      },
    });

    setTracks(data.tracks.items);
  };

  const addSongs = (song) => {
    setSongs([...songs, song]);
    console.log(songs);
  };

  const renderTracks = (playlist, isAdd) => {
    if (playlist.length > 0) {
      return playlist.map((song) => (
        <div key={song.id}>
          <br></br>
          <p>{song.name}</p>
          <p>{song.artists[0].name}</p>
          <p>{song.external_urls.spotify}</p>
          {isAdd ? (
            <button onClick={() => addSongs(song)}>Add Song</button>
          ) : (
            <></>
          )}
          <hr />
        </div>
      ));
    }
  };

  const generateLink = async () => {
    const { data } = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setLink("http://localhost:3000/?" + "user=" + data.id);
  };

  const copyToClipboard = async (link) => {
    setTimeout(() => {
      navigator.clipboard.writeText(link);
    }, 0);
  };

  return (
    <div className="App">
      <h1>Spotify Notes</h1>
      {isAdding == "false" ? (
        <div>
          <button onClick={generateLink}>Generate Link</button>
          <button
            onClick={() => {
              copyToClipboard(link);
            }}
          >
            Copy
          </button>
          <p>{link}</p>
          {!token ? (
            <a
              href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
            >
              Login to Spotify
            </a>
          ) : (
            <button onClick={logout}>Logout</button>
          )}
          <hr></hr>
          <h2>Your Stats</h2>
          {
            renderTracks(songs, false)
          }
        </div>
      ) : (
        <div className="add-song-container">
          <div>
            <form onSubmit={searchSongs}>
              <input
                type="text"
                onChange={(e) => setSearchKey(e.target.value)}
              />
              <button type={"submit"}>Search</button>
            </form>
            {renderTracks(tracks, true)}
          </div>
          <div>
            <h3>Current Tracks</h3>
            {renderTracks(songs, false)}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;