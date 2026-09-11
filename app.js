/* =========================================================
   HARMONIQ AI
   APP.JS
   Complete application engine
   ========================================================= */

"use strict";

/* =========================================================
   1. MUSIC LIBRARY
   ========================================================= */

const tracks = [
  {
    id: 1,
    title: "Afterglow",
    artist: "Luna Vale",
    album: "Night Signals",
    cover: "c1",
    emoji: "🌌",
    moods: ["relax", "sleep", "calm"],
    genres: ["ambient", "chill"],
    duration: 180
  },
  {
    id: 2,
    title: "Velvet Sky",
    artist: "Noah Kade",
    album: "Midnight Roads",
    cover: "c2",
    emoji: "🌃",
    moods: ["night", "relax", "chill"],
    genres: ["lofi", "chill"],
    duration: 195
  },
  {
    id: 3,
    title: "Open Water",
    artist: "Kairo Field",
    album: "Blue Horizon",
    cover: "c3",
    emoji: "🌊",
    moods: ["focus", "calm", "nature"],
    genres: ["ambient", "focus"],
    duration: 210
  },
  {
    id: 4,
    title: "Lucid Dream",
    artist: "Harmoniq",
    album: "Dream State",
    cover: "c4",
    emoji: "✨",
    moods: ["sleep", "dream", "relax"],
    genres: ["ambient", "meditation"],
    duration: 200
  }
];


/* =========================================================
   2. TRANSLATIONS
   ========================================================= */

const translations = {

  en: {
    menu: "Menu",
    home: "Home",
    search: "Search",
    library: "Library",
    yourMusic: "Your Music",
    favorites: "Favorites",
    playlists: "My Playlists",
    recent: "Recently Played",
    goodEvening: "Good evening 👋",
    discover: "Discover your next favorite sound.",
    quickAccess: "Quick Access",
    recommended: "Recommended for you",
    searchResults: "Search Results",
    createPlaylist: "Create Playlist",
    searchPlaceholder: "Search music, artists or albums...",
    aiPlaceholder: "Ask Harmoniq AI: play relaxing music for sleep..."
  },

  ar: {
    menu: "القائمة",
    home: "الرئيسية",
    search: "بحث",
    library: "المكتبة",
    yourMusic: "موسيقاك",
    favorites: "المفضلة",
    playlists: "قوائم التشغيل",
    recent: "تم تشغيلها مؤخراً",
    goodEvening: "مساء الخير 👋",
    discover: "اكتشف الصوت المفضل الجديد لديك.",
    quickAccess: "وصول سريع",
    recommended: "مقترحات لك",
    searchResults: "نتائج البحث",
    createPlaylist: "إنشاء قائمة تشغيل",
    searchPlaceholder: "ابحث عن موسيقى أو فنان أو ألبوم...",
    aiPlaceholder: "اطلب من Harmoniq AI: شغّل موسيقى هادئة للنوم..."
  },

  tr: {
    menu: "Menü",
    home: "Ana Sayfa",
    search: "Ara",
    library: "Kitaplık",
    yourMusic: "Müziğin",
    favorites: "Favoriler",
    playlists: "Çalma Listelerim",
    recent: "Son Çalınanlar",
    goodEvening: "İyi akşamlar 👋",
    discover: "Yeni favori sesini keşfet.",
    quickAccess: "Hızlı Erişim",
    recommended: "Senin için önerilenler",
    searchResults: "Arama Sonuçları",
    createPlaylist: "Çalma Listesi Oluştur",
    searchPlaceholder: "Müzik, sanatçı veya albüm ara...",
    aiPlaceholder: "Harmoniq AI'ya sor: uyku için rahatlatıcı müzik çal..."
  },

  fr: {
    menu: "Menu",
    home: "Accueil",
    search: "Recherche",
    library: "Bibliothèque",
    yourMusic: "Votre musique",
    favorites: "Favoris",
    playlists: "Mes playlists",
    recent: "Écoutés récemment",
    goodEvening: "Bonsoir 👋",
    discover: "Découvrez votre prochain son préféré.",
    quickAccess: "Accès rapide",
    recommended: "Recommandé pour vous",
    searchResults: "Résultats",
    createPlaylist: "Créer une playlist",
    searchPlaceholder: "Rechercher musique, artiste ou album...",
    aiPlaceholder: "Demandez à Harmoniq AI..."
  },

  es: {
    menu: "Menú",
    home: "Inicio",
    search: "Buscar",
    library: "Biblioteca",
    yourMusic: "Tu música",
    favorites: "Favoritos",
    playlists: "Mis playlists",
    recent: "Reproducidos recientemente",
    goodEvening: "Buenas tardes 👋",
    discover: "Descubre tu próximo sonido favorito.",
    quickAccess: "Acceso rápido",
    recommended: "Recomendado para ti",
    searchResults: "Resultados",
    createPlaylist: "Crear playlist",
    searchPlaceholder: "Buscar música, artistas o álbumes...",
    aiPlaceholder: "Pregunta a Harmoniq AI..."
  },

  de: {
    menu: "Menü",
    home: "Start",
    search: "Suche",
    library: "Bibliothek",
    yourMusic: "Deine Musik",
    favorites: "Favoriten",
    playlists: "Meine Playlists",
    recent: "Zuletzt gespielt",
    goodEvening: "Guten Abend 👋",
    discover: "Entdecke deinen nächsten Lieblingssound.",
    quickAccess: "Schnellzugriff",
    recommended: "Für dich empfohlen",
    searchResults: "Suchergebnisse",
    createPlaylist: "Playlist erstellen",
    searchPlaceholder: "Musik, Künstler oder Album suchen...",
    aiPlaceholder: "Harmoniq AI fragen..."
  }

};


/* =========================================================
   3. APPLICATION STATE
   ========================================================= */

const defaultState = {
  language: "en",
  favorites: [],
  recent: [],
  playlists: [],
  currentTrackId: null,
  currentIndex: 0,
  playing: false,
  shuffle: false,
  repeat: false,
  volume: 0.8,
  currentTime: 0,
  searchQuery: ""
};

let state = loadState();


/* =========================================================
   4. LOCAL STORAGE
   ========================================================= */

function loadState() {

  try {

    const saved = localStorage.getItem("harmoniq-state");

    if (!saved) {
      return { ...defaultState };
    }

    const parsed = JSON.parse(saved);

    return {
      ...defaultState,
      ...parsed
    };

  } catch (error) {

    console.warn("Harmoniq state could not be loaded.", error);

    return { ...defaultState };
  }
}


function saveState() {

  try {

    localStorage.setItem(
      "harmoniq-state",
      JSON.stringify(state)
    );

    localStorage.setItem(
      "harmoniq-language",
      state.language
    );

    localStorage.setItem(
      "harmoniq-favorites",
      JSON.stringify(state.favorites)
    );

    localStorage.setItem(
      "harmoniq-recent",
      JSON.stringify(state.recent)
    );

    localStorage.setItem(
      "harmoniq-playlists",
      JSON.stringify(state.playlists)
    );

  } catch (error) {

    console.warn("Harmoniq state could not be saved.", error);
  }
}


/* =========================================================
   5. AUDIO ENGINE
   ========================================================= */

let audioContext = null;
let masterGain = null;
let activeOscillators = [];
let audioTimer = null;
let demoStartedAt = 0;
let demoDuration = 0;


function initAudio() {

  if (audioContext) {
    return;
  }

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  audioContext = new AudioContextClass();

  masterGain = audioContext.createGain();

  masterGain.gain.value =
    Number(state.volume) * 0.12;

  masterGain.connect(
    audioContext.destination
  );
}


function resumeAudio() {

  initAudio();

  if (
    audioContext &&
    audioContext.state === "suspended"
  ) {
    audioContext.resume();
  }
}


function stopAudio() {

  if (audioTimer) {
    clearTimeout(audioTimer);
    audioTimer = null;
  }

  activeOscillators.forEach(
    oscillator => {

      try {
        oscillator.stop();
      } catch (_) {}

    }
  );

  activeOscillators = [];
}


function playDemoAudio(track) {

  resumeAudio();

  if (!audioContext || !masterGain) {
    return;
  }

  stopAudio();

  const now = audioContext.currentTime;

  demoStartedAt = Date.now();
  demoDuration = track.duration;

  const frequencies = [
    220,
    261.63,
    293.66,
    329.63
  ];

  const base =
    frequencies[
      (track.id - 1) % frequencies.length
    ];

  const frequenciesToPlay = [
    base,
    base * 1.25,
    base * 1.5
  ];

  frequenciesToPlay.forEach(
    (frequency, index) => {

      const oscillator =
        audioContext.createOscillator();

      const gain =
        audioContext.createGain();

      oscillator.type =
        index === 0
          ? "sine"
          : "triangle";

      oscillator.frequency.value =
        frequency;

      gain.gain.setValueAtTime(
        0,
        now
      );

      gain.gain.linearRampToValueAtTime(
        0.035,
        now + 1
      );

      gain.gain.linearRampToValueAtTime(
        0.02,
        now + 7
      );

      gain.gain.linearRampToValueAtTime(
        0,
        now + 10
      );

      oscillator.connect(gain);

      gain.connect(masterGain);

      oscillator.start(now);

      oscillator.stop(now + 10);

      activeOscillators.push(
        oscillator
      );
    }
  );

  audioTimer = setTimeout(
    () => {

      if (!state.playing) {
        return;
      }

      if (state.repeat) {

        playDemoAudio(track);

      } else {

        nextTrack();
      }

    },
    9500
  );
}


/* =========================================================
   6. PLAYER
   ========================================================= */

function getCurrentTrack() {

  if (!state.currentTrackId) {
    return null;
  }

  return tracks.find(
    track =>
      track.id === state.currentTrackId
  ) || null;
}


function playTrack(trackId) {

  const index =
    tracks.findIndex(
      track => track.id === trackId
    );

  if (index === -1) {
    return;
  }

  const track = tracks[index];

  state.currentTrackId = track.id;
  state.currentIndex = index;
  state.playing = true;
  state.currentTime = 0;

  addToRecent(track.id);

  saveState();

  playDemoAudio(track);

  updatePlayer();

  renderAllTracks();

  showToast(
    `${track.title} — ${track.artist}`
  );
}


function togglePlay() {

  const current = getCurrentTrack();

  if (!current) {

    playTrack(tracks[0].id);

    return;
  }

  if (state.playing) {

    state.playing = false;

    stopAudio();

  } else {

    state.playing = true;

    playDemoAudio(current);
  }

  saveState();

  updatePlayer();
}


function nextTrack() {

  if (!tracks.length) {
    return;
  }

  let nextIndex;

  if (state.shuffle) {

    nextIndex =
      Math.floor(
        Math.random() * tracks.length
      );

  } else {

    nextIndex =
      state.currentIndex + 1;

    if (nextIndex >= tracks.length) {

      if (state.repeat) {

        nextIndex = 0;

      } else {

        nextIndex =
          tracks.length - 1;

        state.playing = false;

        stopAudio();

        updatePlayer();

        return;
      }
    }
  }

  playTrack(
    tracks[nextIndex].id
  );
}


function previousTrack() {

  if (!tracks.length) {
    return;
  }

  let previousIndex =
    state.currentIndex - 1;

  if (previousIndex < 0) {
    previousIndex =
      tracks.length - 1;
  }

  playTrack(
    tracks[previousIndex].id
  );
}


function toggleShuffle() {

  state.shuffle =
    !state.shuffle;

  saveState();

  const button =
    document.getElementById(
      "shuffleBtn"
    );

  if (button) {
    button.classList.toggle(
      "active",
      state.shuffle
    );
  }

  showToast(
    state.shuffle
      ? "Shuffle ON"
      : "Shuffle OFF"
  );
}


function toggleRepeat() {

  state.repeat =
    !state.repeat;

  saveState();

  const button =
    document.getElementById(
      "repeatBtn"
    );

  if (button) {
    button.classList.toggle(
      "active",
      state.repeat
    );
  }

  showToast(
    state.repeat
      ? "Repeat ON"
      : "Repeat OFF"
  );
}


/* =========================================================
   7. VOLUME
   ========================================================= */

function changeVolume(value) {

  const volume =
    Math.max(
      0,
      Math.min(
        1,
        Number(value)
      )
    );

  state.volume = volume;

  if (masterGain) {

    masterGain.gain.value =
      volume * 0.12;
  }

  saveState();

  updateMuteButton();
}


function toggleMute() {

  if (!masterGain) {
    initAudio();
  }

  if (!masterGain) {
    return;
  }

  if (masterGain.gain.value > 0) {

    masterGain.gain.value = 0;

  } else {

    masterGain.gain.value =
      state.volume * 0.12;
  }

  updateMuteButton();
}


function updateMuteButton() {

  const button =
    document.getElementById(
      "muteBtn"
    );

  if (!button) {
    return;
  }

  const muted =
    masterGain &&
    masterGain.gain.value === 0;

  button.textContent =
    muted
      ? "🔇"
      : "🔊";
}


/* =========================================================
   8. PROGRESS
   ========================================================= */

function seek(value) {

  const track =
    getCurrentTrack();

  if (!track) {
    return;
  }

  const percentage =
    Number(value) / 100;

  state.currentTime =
    track.duration * percentage;

  demoStartedAt =
    Date.now() -
    state.currentTime * 1000;

  updateProgressUI();
}


function updateProgress() {

  const track =
    getCurrentTrack();

  if (
    !track ||
    !state.playing
  ) {
    return;
  }

  const elapsed =
    (Date.now() - demoStartedAt) / 1000;

  state.currentTime =
    Math.min(
      elapsed,
      track.duration
    );

  if (
    state.currentTime >=
    track.duration
  ) {

    if (state.repeat) {

      playDemoAudio(track);

    } else {

      nextTrack();
    }

    return;
  }

  updateProgressUI();
}


function updateProgressUI() {

  const progress =
    document.getElementById(
      "progress"
    );

  const currentTime =
    document.getElementById(
      "currentTime"
    );

  const duration =
    document.getElementById(
      "duration"
    );

  const track =
    getCurrentTrack();

  if (!track) {

    if (progress) {
      progress.value = 0;
    }

    if (currentTime) {
      currentTime.textContent =
        "0:00";
    }

    if (duration) {
      duration.textContent =
        "0:00";
    }

    return;
  }

  const percentage =
    (state.currentTime /
      track.duration) *
    100;

  if (progress) {
    progress.value =
      Math.min(
        100,
        Math.max(
          0,
          percentage
        )
      );
  }

  if (currentTime) {
    currentTime.textContent =
      formatTime(
        state.currentTime
      );
  }

  if (duration) {
    duration.textContent =
      formatTime(
        track.duration
      );
  }
}


function formatTime(seconds) {

  const value =
    Math.max(
      0,
      Math.floor(
        Number(seconds) || 0
      )
    );

  const minutes =
    Math.floor(value / 60);

  const remaining =
    value % 60;

  return (
    minutes +
    ":" +
    String(
      remaining
    ).padStart(2, "0")
  );
}


/* =========================================================
   9. PLAYER UI
   ========================================================= */

function updatePlayer() {

  const title =
    document.getElementById(
      "nowTitle"
    );

  const artist =
    document.getElementById(
      "nowArtist"
    );

  const cover =
    document.getElementById(
      "miniCover"
    );

  const playButton =
    document.getElementById(
      "playButton"
    );

  const favoriteButton =
    document.getElementById(
      "playerFavorite"
    );

  const track =
    getCurrentTrack();

  if (!track) {

    if (title) {
      title.textContent =
        "Nothing playing";
    }

    if (artist) {
      artist.textContent =
        "Choose a track";
    }

    if (cover) {
      cover.textContent =
        "♫";
    }

    if (playButton) {
      playButton.textContent =
        "▶";
    }

    if (favoriteButton) {
      favoriteButton.textContent =
        "♡";
    }

    updateProgressUI();

    return;
  }

  if (title) {
    title.textContent =
      track.title;
  }

  if (artist) {
    artist.textContent =
      track.artist;
  }

  if (cover) {
    cover.textContent =
      track.emoji;
  }

  if (playButton) {

    playButton.textContent =
      state.playing
        ? "Ⅱ"
        : "▶";
  }

  if (favoriteButton) {

    favoriteButton.textContent =
      state.favorites.includes(
        track.id
      )
        ? "♥"
        : "♡";
  }

  updateProgressUI();

  const shuffleButton =
    document.getElementById(
      "shuffleBtn"
    );

  const repeatButton =
    document.getElementById(
      "repeatBtn"
    );

  if (shuffleButton) {

    shuffleButton.classList.toggle(
      "active",
      state.shuffle
    );
  }

  if (repeatButton) {

    repeatButton.classList.toggle(
      "active",
      state.repeat
    );
  }
}


/* =========================================================
   10. FAVORITES
   ========================================================= */

function toggleFavorite(trackId) {

  const index =
    state.favorites.indexOf(
      trackId
    );

  if (index >= 0) {

    state.favorites.splice(
      index,
      1
    );

    showToast(
      "Removed from Favorites"
    );

  } else {

    state.favorites.push(
      trackId
    );

    showToast(
      "Added to Favorites"
    );
  }

  saveState();

  renderAllTracks();

  updateCounters();

  updatePlayer();
}


function isFavorite(trackId) {

  return state.favorites.includes(
    trackId
  );
}


/* =========================================================
   11. RECENTLY PLAYED
   ========================================================= */

function addToRecent(trackId) {

  state.recent =
    state.recent.filter(
      id => id !== trackId
    );

  state.recent.unshift(
    trackId
  );

  state.recent =
    state.recent.slice(
      0,
      20
    );

  saveState();

  updateCounters();
}


/* =========================================================
   12. TRACK RENDERING
   ========================================================= */

function renderTracks(
  list,
  targetId
) {

  const container =
    document.getElementById(
      targetId
    );

  if (!container) {
    return;
  }

  if (!list.length) {

    container.innerHTML = `
      <div class="emptyState">
        <div class="emptyIcon">♫</div>
        <h3>No music found</h3>
        <p>Try another search or explore Harmoniq recommendations.</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    list.map(
      track => createTrackHTML(track)
    ).join("");
}


function createTrackHTML(track) {

  const favorite =
    isFavorite(track.id);

  const current =
    state.currentTrackId ===
    track.id;

  return `
    <article
      class="track"
      data-track-id="${track.id}"
    >

      <button
        class="cover ${track.cover}"
        data-action="play"
        data-id="${track.id}"
        aria-label="Play ${escapeHtml(track.title)}"
      >
        <span>${track.emoji}</span>

        ${
          current && state.playing
            ? `<span class="playingBadge">♫</span>`
            : ""
        }

      </button>

      <div class="trackInfo">

        <h3>
          ${escapeHtml(track.title)}
        </h3>

        <p>
          ${escapeHtml(track.artist)}
        </p>

        <small>
          ${escapeHtml(track.album)}
        </small>

      </div>

      <div class="trackActions">

        <button
          class="likeButton ${favorite ? "on" : ""}"
          data-action="favorite"
          data-id="${track.id}"
          aria-label="Favorite"
        >
          ${favorite ? "♥" : "♡"}
        </button>

        <button
          class="playButtonSmall"
          data-action="play"
          data-id="${track.id}"
          aria-label="Play"
        >
          ▶
        </button>

      </div>

    </article>
  `;
}


function renderAllTracks() {

  renderTracks(
    tracks,
    "trackGrid"
  );

  const search =
    state.searchQuery.trim();

  if (search) {

    const results =
      filterTracks(search);

    renderTracks(
      results,
      "searchResults"
    );
  }

  renderLibrary();
}


/* =========================================================
   13. SEARCH
   ========================================================= */

function filterTracks(query) {

  const q =
    query
      .trim()
      .toLowerCase();

  if (!q) {
    return tracks;
  }

  return tracks.filter(
    track => {

      const searchable = [
        track.title,
        track.artist,
        track.album,
        ...track.moods,
        ...track.genres
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(q);
    }
  );
}


function performSearch(query) {

  state.searchQuery =
    query.trim();

  if (!state.searchQuery) {

    showPage("home");

    return;
  }

  const results =
    filterTracks(
      state.searchQuery
    );

  showPage("search");

  renderTracks(
    results,
    "searchResults"
  );
}


/* =========================================================
   14. HARMONIQ AI
   ========================================================= */

function askHarmoniqAI(command) {

  const text =
    String(command || "")
      .trim()
      .toLowerCase();

  if (!text) {

    showToast(
      "Tell Harmoniq AI what you want to hear."
    );

    return;
  }

  let results = [];


  /* Sleep */

  if (
    containsAny(
      text,
      [
        "sleep",
        "bed",
        "dream",
        "نوم",
        "نومي",
        "للنوم",
        "uyku",
        "dormir",
        "schlafen"
      ]
    )
  ) {

    results =
      tracks.filter(
        track =>
          track.moods.includes(
            "sleep"
          ) ||
          track.moods.includes(
            "dream"
          )
      );
  }


  /* Relax */

  else if (
    containsAny(
      text,
      [
        "relax",
        "relaxing",
        "calm",
        "استرخ",
        "استرخاء",
        "هادئ",
        "راحة",
        "sakin",
        "rahat",
        "relaxant",
        "entspann"
      ]
    )
  ) {

    results =
      tracks.filter(
        track =>
          track.moods.includes(
            "relax"
          ) ||
          track.moods.includes(
            "calm"
          )
      );
  }


  /* Focus */

  else if (
    containsAny(
      text,
      [
        "focus",
        "study",
        "work",
        "تركيز",
        "دراسة",
        "عمل",
        "çalış",
        "odak",
        "concentr",
        "fokus"
      ]
    )
  ) {

    results =
      tracks.filter(
        track =>
          track.moods.includes(
            "focus"
          )
      );
  }


  /* Nature */

  else if (
    containsAny(
      text,
      [
        "nature",
        "forest",
        "ocean",
        "water",
        "طبيعة",
        "بحر",
        "ماء",
        "doğa",
        "deniz",
        "nature",
        "natur"
      ]
    )
  ) {

    results =
      tracks.filter(
        track =>
          track.moods.includes(
            "nature"
          )
      );
  }


  /* Direct track search */

  else {

    results =
      tracks.filter(
        track => {

          const title =
            track.title.toLowerCase();

          const artist =
            track.artist.toLowerCase();

          const album =
            track.album.toLowerCase();

          return (
            text.includes(title) ||
            text.includes(artist) ||
            text.includes(album) ||
            title.includes(text) ||
            artist.includes(text)
          );
        }
      );
  }


  if (!results.length) {

    results =
      tracks.slice();
  }


  const selected =
    results[0];

  playTrack(
    selected.id
  );

  showToast(
    `Harmoniq AI: ${selected.title}`
  );
}


function containsAny(
  text,
  words
) {

  return words.some(
    word =>
      text.includes(
        word.toLowerCase()
      )
  );
}


/* =========================================================
   15. LIBRARY
   ========================================================= */

let currentLibraryTab =
  "favorites";


function renderLibrary() {

  const container =
    document.getElementById(
      "libraryContent"
    );

  if (!container) {
    return;
  }

  let list = [];

  if (
    currentLibraryTab ===
    "favorites"
  ) {

    list =
      tracks.filter(
        track =>
          state.favorites.includes(
            track.id
          )
      );

  } else if (
    currentLibraryTab ===
    "recent"
  ) {

    list =
      state.recent
        .map(
          id =>
            tracks.find(
              track =>
                track.id === id
            )
        )
        .filter(Boolean);

  } else if (
    currentLibraryTab ===
    "playlists"
  ) {

    renderPlaylists(
      container
    );

    return;
  }


  if (!list.length) {

    container.innerHTML = `
      <div class="emptyState">
        <div class="emptyIcon">♫</div>
        <h3>Your library is empty</h3>
        <p>Add music to your ${currentLibraryTab} collection.</p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    `<div class="trackGrid" id="libraryTracks"></div>`;

  renderTracks(
    list,
    "libraryTracks"
  );
}


function setLibraryTab(tab) {

  currentLibraryTab =
    tab;

  document
    .querySelectorAll(
      ".libraryTab"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.library ===
          tab
        );
      }
    );

  renderLibrary();
}


function renderPlaylists(container) {

  if (!state.playlists.length) {

    container.innerHTML = `
      <div class="emptyState">
        <div class="emptyIcon">+</div>
        <h3>No playlists yet</h3>
        <p>Create your first Harmoniq playlist.</p>
        <button
          class="primaryBtn"
          data-action="openPlaylist"
        >
          Create Playlist
        </button>
      </div>
    `;

    return;
  }


  container.innerHTML = `
    <div class="playlistGrid">
      ${state.playlists.map(
        playlist => `
          <div class="playlistCard">

            <div class="playlistIconLarge">
              ♫
            </div>

            <div>
              <h3>
                ${escapeHtml(
                  playlist.name
                )}
              </h3>

              <p>
                ${playlist.tracks.length} tracks
              </p>
            </div>

          </div>
        `
      ).join("")}
    </div>
  `;
}


/* =========================================================
   16. PLAYLISTS
   ========================================================= */

function openPlaylistModal() {

  const modal =
    document.getElementById(
      "playlistModal"
    );

  if (!modal) {
    return;
  }

  modal.classList.add(
    "show"
  );

  const input =
    document.getElementById(
      "playlistName"
    );

  if (input) {

    input.value = "";

    setTimeout(
      () => input.focus(),
      50
    );
  }
}


function closePlaylistModal() {

  const modal =
    document.getElementById(
      "playlistModal"
    );

  if (modal) {

    modal.classList.remove(
      "show"
    );
  }
}


function createPlaylist() {

  const input =
    document.getElementById(
      "playlistName"
    );

  if (!input) {
    return;
  }

  const name =
    input.value.trim();

  if (!name) {

    showToast(
      "Enter a playlist name."
    );

    return;
  }


  state.playlists.push({

    id:
      Date.now(),

    name,

    tracks: []

  });


  saveState();

  updateCounters();

  closePlaylistModal();

  renderLibrary();

  showToast(
    "Playlist created"
  );
}


/* =========================================================
   17. NAVIGATION
   ========================================================= */

function showPage(pageId) {

  document
    .querySelectorAll(
      ".page"
    )
    .forEach(
      page => {

        page.classList.toggle(
          "activePage",
          page.id === pageId
        );

        page.style.display =
          page.id === pageId
            ? "block"
            : "none";
      }
    );


  document
    .querySelectorAll(
      ".navBtn"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.section ===
          pageId
        );
      }
    );


  document
    .querySelectorAll(
      ".mobileNavBtn"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.section ===
          pageId
        );
      }
    );


  if (pageId === "library") {

    renderLibrary();
  }
}


function showFavorites() {

  currentLibraryTab =
    "favorites";

  showPage(
    "library"
  );

  updateLibraryTabs();

  renderLibrary();
}


function showRecent() {

  currentLibraryTab =
    "recent";

  showPage(
    "library"
  );

  updateLibraryTabs();

  renderLibrary();
}


function showPlaylists() {

  currentLibraryTab =
    "playlists";

  showPage(
    "library"
  );

  updateLibraryTabs();

  renderLibrary();
}


function updateLibraryTabs() {

  document
    .querySelectorAll(
      ".libraryTab"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.library ===
          currentLibraryTab
        );
      }
    );
}


/* =========================================================
   18. COUNTERS
   ========================================================= */

function updateCounters() {

  const favorites =
    document.getElementById(
      "favoriteCount"
    );

  const playlists =
    document.getElementById(
      "playlistCount"
    );

  const recent =
    document.getElementById(
      "recentCount"
    );


  if (favorites) {

    favorites.textContent =
      `${state.favorites.length} tracks`;
  }


  if (playlists) {

    playlists.textContent =
      `${state.playlists.length} playlists`;
  }


  if (recent) {

    recent.textContent =
      `${state.recent.length} tracks`;
  }
}


/* =========================================================
   19. LANGUAGES
   ========================================================= */

function changeLanguage(language) {

  if (
    !translations[
      language
    ]
  ) {

    language = "en";
  }


  state.language =
    language;

  saveState();


  document.documentElement.lang =
    language;

  document.documentElement.dir =
    language === "ar"
      ? "rtl"
      : "ltr";


  const dictionary =
    translations[
      language
    ];


  document
    .querySelectorAll(
      "[data-i18n]"
    )
    .forEach(
      element => {

        const key =
          element.dataset.i18n;

        if (
          dictionary[key]
        ) {

          element.textContent =
            dictionary[key];
        }
      }
    );


  document
    .querySelectorAll(
      "[data-placeholder]"
    )
    .forEach(
      element => {

        const key =
          element.dataset.placeholder;

        if (
          dictionary[key]
        ) {

          element.placeholder =
            dictionary[key];
        }
      }
    );


  const select =
    document.getElementById(
      "language"
    );

  if (select) {

    select.value =
      language;
  }
}


/* =========================================================
   20. TOAST
   ========================================================= */

let toastTimer = null;


function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );

  if (!toast) {
    return;
  }

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );


  if (toastTimer) {

    clearTimeout(
      toastTimer
    );
  }


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2200
    );
}


/* =========================================================
   21. HTML SAFETY
   ========================================================= */

function escapeHtml(value) {

  return String(value)
    .replace(
      /[&<>"']/g,
      character => {

        const map = {

          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"

        };

        return map[
          character
        ];
      }
    );
}


/* =========================================================
   22. EVENT SYSTEM
   ========================================================= */

function setupEvents() {


  /* Navigation */

  document
    .querySelectorAll(
      "[data-section]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            showPage(
              button.dataset.section
            );
          }
        );
      }
    );


  /* Search */

  const searchInput =
    document.getElementById(
      "searchInput"
    );

  if (searchInput) {

    searchInput.addEventListener(
      "input",
      event => {

        performSearch(
          event.target.value
        );
      }
    );
  }


  /* Language */

  const language =
    document.getElementById(
      "language"
    );

  if (language) {

    language.addEventListener(
      "change",
      event => {

        changeLanguage(
          event.target.value
        );
      }
    );
  }


  /* AI */

  const aiButton =
    document.getElementById(
      "aiButton"
    );

  const aiInput =
    document.getElementById(
      "aiInput"
    );


  if (aiButton) {

    aiButton.addEventListener(
      "click",
      () => {

        askHarmoniqAI(
          aiInput
            ? aiInput.value
            : ""
        );

        if (aiInput) {
          aiInput.value = "";
        }
      }
    );
  }


  if (aiInput) {

    aiInput.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Enter"
        ) {

          event.preventDefault();

          askHarmoniqAI(
            aiInput.value
          );

          aiInput.value = "";
        }
      }
    );
  }


  /* AI suggestion buttons */

  document
    .querySelectorAll(
      "[data-ai]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            askHarmoniqAI(
              button.dataset.ai
            );
          }
        );
      }
    );


  /* Track actions */

  document.addEventListener(
    "click",
    event => {

      const actionElement =
        event.target.closest(
          "[data-action]"
        );

      if (!actionElement) {
        return;
      }

      const action =
        actionElement.dataset.action;

      const id =
        Number(
          actionElement.dataset.id
        );


      if (action === "play") {

        playTrack(id);

      } else if (
        action === "favorite"
      ) {

        toggleFavorite(id);

      } else if (
        action === "openPlaylist"
      ) {

        openPlaylistModal();
      }
    }
  );


  /* Player controls */

  const playButton =
    document.getElementById(
      "playButton"
    );

  const previousButton =
    document.getElementById(
      "previousBtn"
    );

  const nextButton =
    document.getElementById(
      "nextBtn"
    );

  const shuffleButton =
    document.getElementById(
      "shuffleBtn"
    );

  const repeatButton =
    document.getElementById(
      "repeatBtn"
    );


  if (playButton) {

    playButton.addEventListener(
      "click",
      togglePlay
    );
  }


  if (previousButton) {

    previousButton.addEventListener(
      "click",
      previousTrack
    );
  }


  if (nextButton) {

    nextButton.addEventListener(
      "click",
      nextTrack
    );
  }


  if (shuffleButton) {

    shuffleButton.addEventListener(
      "click",
      toggleShuffle
    );
  }


  if (repeatButton) {

    repeatButton.addEventListener(
      "click",
      toggleRepeat
    );
  }


  /* Favorite current song */

  const playerFavorite =
    document.getElementById(
      "playerFavorite"
    );

  if (playerFavorite) {

    playerFavorite.addEventListener(
      "click",
      () => {

        const track =
          getCurrentTrack();

        if (track) {

          toggleFavorite(
            track.id
          );
        }
      }
    );
  }


  /* Volume */

  const volume =
    document.getElementById(
      "volume"
    );

  if (volume) {

    volume.addEventListener(
      "input",
      event => {

        changeVolume(
          event.target.value
        );
      }
    );
  }


  /* Mute */

  const mute =
    document.getElementById(
      "muteBtn"
    );

  if (mute) {

    mute.addEventListener(
      "click",
      toggleMute
    );
  }


  /* Progress */

  const progress =
    document.getElementById(
      "progress"
    );

  if (progress) {

    progress.addEventListener(
      "input",
      event => {

        seek(
          event.target.value
        );
      }
    );
  }


  /* Quick cards */

  const favoritesCard =
    document.getElementById(
      "favoritesCard"
    );

  const playlistCard =
    document.getElementById(
      "playlistCard"
    );

  const recentCard =
    document.getElementById(
      "recentCard"
    );


  if (favoritesCard) {

    favoritesCard.addEventListener(
      "click",
      showFavorites
    );
  }


  if (playlistCard) {

    playlistCard.addEventListener(
      "click",
      openPlaylistModal
    );
  }


  if (recentCard) {

    recentCard.addEventListener(
      "click",
      showRecent
    );
  }


  /* Sidebar buttons */

  const favoritesNav =
    document.getElementById(
      "favoritesNav"
    );

  const playlistsNav =
    document.getElementById(
      "playlistsNav"
    );

  const recentNav =
    document.getElementById(
      "recentNav"
    );


  if (favoritesNav) {

    favoritesNav.addEventListener(
      "click",
      showFavorites
    );
  }


  if (playlistsNav) {

    playlistsNav.addEventListener(
      "click",
      openPlaylistModal
    );
  }


  if (recentNav) {

    recentNav.addEventListener(
      "click",
      showRecent
    );
  }


  /* Mobile favorite */

  const mobileFavorites =
    document.getElementById(
      "mobileFavorites"
    );

  if (mobileFavorites) {

    mobileFavorites.addEventListener(
      "click",
      showFavorites
    );
  }


  /* Library tabs */

  document
    .querySelectorAll(
      ".libraryTab"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            setLibraryTab(
              button.dataset.library
            );
          }
        );
      }
    );


  /* Playlist modal */

  const closeModal =
    document.getElementById(
      "closeModal"
    );

  const cancelPlaylist =
    document.getElementById(
      "cancelPlaylist"
    );

  const createPlaylistButton =
    document.getElementById(
      "createPlaylistBtn"
    );


  if (closeModal) {

    closeModal.addEventListener(
      "click",
      closePlaylistModal
    );
  }


  if (cancelPlaylist) {

    cancelPlaylist.addEventListener(
      "click",
      closePlaylistModal
    );
  }


  if (createPlaylistButton) {

    createPlaylistButton.addEventListener(
      "click",
      createPlaylist
    );
  }


  const playlistName =
    document.getElementById(
      "playlistName"
    );

  if (playlistName) {

    playlistName.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Enter"
        ) {

          event.preventDefault();

          createPlaylist();
        }
      }
    );
  }


  const modal =
    document.getElementById(
      "playlistModal"
    );

  if (modal) {

    modal.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          modal
        ) {

          closePlaylistModal();
        }
      }
    );
  }


  /* Keyboard */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.code === "Space" &&
        event.target.tagName !==
          "INPUT" &&
        event.target.tagName !==
          "TEXTAREA"
      ) {

        event.preventDefault();

        togglePlay();
      }


      if (
        event.key === "ArrowRight" &&
        event.target.tagName !==
          "INPUT"
      ) {

        nextTrack();
      }


      if (
        event.key === "ArrowLeft" &&
        event.target.tagName !==
          "INPUT"
      ) {

        previousTrack();
      }
    }
  );
}


/* =========================================================
   23. INITIALIZATION
   ========================================================= */

function initializeApp() {

  setupEvents();

  /* Restore language */

  const savedLanguage =
    localStorage.getItem(
      "harmoniq-language"
    );

  if (
    savedLanguage &&
    translations[savedLanguage]
  ) {

    state.language =
      savedLanguage;
  }

  changeLanguage(
    state.language
  );


  /* Restore volume */

  const volume =
    document.getElementById(
      "volume"
    );

  if (volume) {

    volume.value =
      state.volume;
  }


  /* Initial page */

  showPage(
    "home"
  );


  /* Initial content */

  renderAllTracks();

  updateCounters();

  updatePlayer();

  updateLibraryTabs();

  updateMuteButton();


  /* Progress clock */

  setInterval(
    updateProgress,
    500
  );


  saveState();
}


/* =========================================================
   24. START APPLICATION
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );

} else {

  initializeApp();
             }
