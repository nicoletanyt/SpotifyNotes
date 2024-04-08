import { useEffect, useState } from "react";
import "./index.css";
import axios from "axios";
import { ref, set, child, get } from "firebase/database";
import database from "./firebase";
import { CiSearch } from "react-icons/ci";
import { FaHome } from "react-icons/fa";
import ChartDisplay from "./components/ChartDisplay.js";
import DisplayTracks from "./components/DisplayTrack.js";

function App() {
  const CLIENT_ID = "d8509cca5e7b40948a5beef95753fdca";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [tracks, setTracks] = useState([]);
  const [songs, setSongs] = useState([]);
  const [link, setLink] = useState("");
  const [perLink, setPerLink] = useState("");
  const [playlist, setPlaylist] = useState(null)
  const [recommendation, setRecommendation] = useState(null)

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
      getFirebase()
    }
  }, [songs]);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  const searchSongs = async (e) => {
    e.preventDefault();
    try {
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
    } catch (err) {
      console.log(err);
      if (err.response.data.error.status == 401) {
        alert("Please login to Spotify again.");
      }
    }
  };

  const addSongs = (song) => {
    setSongs([...songs, song]);
    alert("Song added");
    setTracks([]);
  };

  const generateLink = async () => {
    const { data } = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setLink("http://localhost:3000/?" + "user=" + data.id + "&add=true");
    setPerLink("http://localhost:3000/?" + "user=" + data.id + "&add=false");
  };

  const getFirebase = () => {
    get(child(ref(database), `users/${userID}`))
      .then((snapshot) => {
        console.log("Got data");
        if (snapshot.exists()) {
            setPlaylist(snapshot.val())
            console.log(playlist)
            console.log("Confirmed")
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
 
  // check for new songs 
  useEffect(() => {
    getFirebase()
  }, []);

  // const copyToClipboard = async (link) => {
  //   setTimeout(() => {
  //     navigator.clipboard.writeText(link);
  //   }, 0);
  // };

  const getRec = async() => {
    let songIDs = ""
    for (let i = 0; i < playlist.length; ++i) {
      songIDs += playlist[i].id + ","
    }

    songIDs = songIDs.slice(0, -1);

    const { data } = await axios.get("https://api.spotify.com/v1/recommendations?limit=1&seed_tracks=" + songIDs, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setRecommendation(data.tracks)
  }

  return (
    <div className="App">
      <div className="header">
        <h1 className="title">Spotify Votes</h1>
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
            className="log-btn"
          >
            Login to Spotify
          </a>
        ) : (
          <button className="log-btn" onClick={logout}>
            Logout
          </button>
        )}
      </div>
      {token ? (
        isAdding != "true" ? (
          <div className="main-wrapper">
            <button onClick={generateLink} className="generate-btn">
              Generate Links
            </button>
            {link && perLink ? (
              <div>
                <br></br>
                <h3>Link to send to your friends: </h3>
                <a href={link}>{link}</a>
                <h3>Link for you to view your results: </h3>
                <a href={perLink}>{perLink}</a>
              </div>
            ) : (
              <></>
            )}
            {userID && (
              <div>
                <br></br>
                <hr></hr>
                <h2>Your Stats</h2>

                <ChartDisplay playlist={playlist} />
              </div>
            )}
          </div>
        ) : (
          <div className="main-wrapper">
              <form onSubmit={searchSongs} className="searchbar">
                <input
                  type="text"
                  onChange={(e) => setSearchKey(e.target.value)}
                  placeholder="Search Song..."
                />
                <button type={"submit"} className="search-btn">
                  <CiSearch className="icon" />
                  <p>Search</p>
                </button>
              </form>
              <DisplayTracks
                playlist={tracks}
                isAdd={true}
                addSongs={(song) => {
                  addSongs(song);
                }}
              />
            <br></br>
            <div>
              <h2>Current Tracks Added</h2>
              <ChartDisplay playlist={playlist} />
              <br></br>
              <button onClick={getRec} className="rec-btn">Get Recommendation</button>
              <br></br>
              <DisplayTracks playlist={recommendation} isAdd={false}/>
            </div>
          </div>
        )
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
}

export default App;
