import { useEffect, useState } from "react";
import "./index.css"
import axios from "axios"

function App() {
  const CLIENT_ID = "d8509cca5e7b40948a5beef95753fdca"
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState("")
  const [searchKey, setSearchKey] = useState("")
  const [tracks, setTracks] = useState([])

  // Use current token if exists, else extract new one 
  useEffect(() => {
      const hash = window.location.hash
      let token = window.localStorage.getItem("token")

      if (!token && hash) {
          token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

          window.location.hash = ""
          window.localStorage.setItem("token", token)
      }

      setToken(token)

  }, [])

  const logout = () => {
      setToken("")
      window.localStorage.removeItem("token")
  }

  const searchSongs = async (e) => {
    e.preventDefault()
    const {data} = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params: {
            q: searchKey,
            type: "track"
        }
    })

    setTracks(data.tracks.items)
  }
  
  const renderTracks = () => {
    return tracks.map(song => (
        <div key={song.id}>
            <p>{song.name}</p>
            <p>{song.artists[0].name}</p>
            <p>{song.external_urls.spotify}</p>
        </div>
    ))
  }

  return (
      <div className="App">
          <header className="App-header">
              <h1>Spotify</h1>
              <form onSubmit={searchSongs}>
                <input type="text" onChange={e => setSearchKey(e.target.value)}/>
                <button type={"submit"}>Search</button>
            </form>
            {renderTracks()}
            
              {!token ?
                  <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login
                      to Spotify</a>
                  : <button onClick={logout}>Logout</button>}
          </header>
      </div>
  );
}

export default App;