import { useEffect, useState } from "react";
import "./index.css";
import axios from "axios";
import { ref, set, child, get } from "firebase/database";
import database from "./firebase";
import { CiSearch } from "react-icons/ci";
import PieChart from "./components/PieChart.js";
import DisplayTracks from "./components/displayTrack.js";

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
    })
    setTracks(data.tracks.items);
    }
    
    catch(err) {
      console.log(err)
      if (err.response.data.error.status == 401) {
        alert("Please login to Spotify again.")
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
  };

  const copyToClipboard = async (link) => {
    setTimeout(() => {
      navigator.clipboard.writeText(link);
    }, 0);
  };

  return (
    <div className="App">
      <div className="header">
        <button className="home-btn">Home</button>
        <h1>Spotify Notes</h1>
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
      {isAdding != "true" ? (
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

          <hr></hr>
          <h2>Who you are to your friends</h2>
          {/* {DisplayTracks(songs, false, (song) => {
            addSongs(song);
          })} */}
          {/* <PieChart userID={userID} database={database}/> */}
        </div>
      ) : (
        <div className="main-wrapper">
          <div>
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
            <DisplayTracks playlist={tracks} isAdd={true} addSongs={(song) => {addSongs(song)}}/>
          </div>
          <br></br>
          <div>
            <h2>Current Tracks Added</h2>
            <PieChart userID={userID} database={database}/>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
