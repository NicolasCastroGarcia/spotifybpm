import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function Home() {
  const code = useRouter().asPath;

  const [fullHash] = code.split("&");
  const [, accessToken] = fullHash.split("=");

  const [userId, setUserId] = useState(false);
  const [tracks, setTracks] = useState(false);
  const [playbacklist, setPlaylist] = useState(false);
  const [trackList, setTrackList] = useState(false);

  const [data, setData] = useState({ name: "Nombre", bpm: 100 });

  async function fetchData(url, setter) {
    const getData = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const json = await getData.json();

    setter(json);
  }

  async function postData(url, setter, data) {
    const postData = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    const json = await postData.json();
    setter(json);
  }

  useEffect(() => {
    if (!userId) {
      fetchData("https://api.spotify.com/v1/me", setUserId);
    }
  }, [userId.id]);

  useEffect(() => {
    if (tracks && playbacklist?.id) {
      addTracksToPlaylist();
    }
  }, [tracks, playbacklist.id, data.bpm]);

  async function addTracksToPlaylist() {
    let tracksUris = [];

    tracksUris = tracks.tracks.map(track => {
      return track.uri;
    });
    const str = tracksUris.join(",");
    await postData(
      `https://api.spotify.com/v1/playlists/${playbacklist.id}/tracks?uris=${str}`,
      setTrackList
    );
  }

  async function handleClick() {
    if (userId && !playbacklist && !tracks) {
      console.log(data.bpm);
      await fetchData(
        `https://api.spotify.com/v1/recommendations?limit=100&target_tempo=${data.bpm}&seed_tracks=0c6xIDDpzE81m2q797ordA`,
        setTracks
      );

      await postData(
        `https://api.spotify.com/v1/users/${userId.id}/playlists`,
        setPlaylist,
        { name: data.name }
      );
    }
  }

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Spotify, make me a playlist</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <a
          className="link-login"
          href="https://accounts.spotify.com/es-ES/authorize?client_id=b030da3cb6304f339970961d2ba76a27&redirect_uri=http://localhost:3000&response_type=token&scope=user-library-modify user-follow-read playlist-read-private user-read-recently-played streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-library-read playlist-modify-private playlist-modify-public"
        >
          Necesito tu data gil
        </a>
        <input
          type="number"
          name="bpm"
          onChange={handleChange}
          defaultValue={data.bpm}
        />
        <input
          type="text"
          name="name"
          onChange={handleChange}
          defaultValue={data.name}
        />
        <button onClick={handleClick}>Generar playlist</button>
      </main>
    </div>
  );
}
