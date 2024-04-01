import React from 'react'
import { FaPlus } from "react-icons/fa";

const DisplayTracks = ({playlist, isAdd, addSongs}) => {
    if (playlist.length > 0) {
      return playlist.map((song) => (
        <div key={song.id} className="track-display">
          <img src={song.album.images[2].url}/>
          <div>
            <p className='song-name'>{song.name}</p>
            <p className='artist'>{song.artists[0].name}</p>
          </div>
          
          {isAdd ? (
            <button onClick={() => addSongs(song)} className='add-btn'>
                <FaPlus/>
                <p>Add Song</p>
            </button>
          ) : (
            <></>
          )}
        </div>
      ));
    }
  };

export default DisplayTracks