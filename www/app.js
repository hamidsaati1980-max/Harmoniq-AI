/* =========================================================
   Harmoniq AI
   Main Application
   - 6 Languages
   - RTL Arabic
   - Web Audio demo music
   - Player controls
   - Favorites
   - Recently played
   - Playlists
   - Search
   - Local AI music intent
   - LocalStorage
   ========================================================= */

(() => {
  "use strict";

  const BASE = "/Harmoniq-AI/";
  const LOCALES = ["en", "ar", "tr", "fr", "es", "de"];

  const TRACKS = [
    {
      id: "afterglow",
      title: "Afterglow",
      artist: "Luna Vale",
      album: "Night Signals",
      cover: "🌌",
      moods: ["relax", "sleep", "calm", "chill"],
      frequencies: [174, 220, 261.63]
    },
    {
      id: "velvetSky",
      title: "Velvet Sky",
      artist: "Noah Kade",
      album: "Midnight Roads",
      cover: "🌃",
      moods: ["night", "relax", "chill"],
      frequencies: [196, 246.94, 293.66]
    },
    {
      id: "openWater",
      title: "Open Water",
      artist: "Kairo Field",
      album: "Blue Horizon",
      cover: "🌊",
      moods: ["focus", "nature", "calm"],
      frequencies: [220, 277.18, 329.63]
    },
    {
      id: "lucidDream",
      title: "Lucid Dream",
      artist: "Harmoniq",
      album: "Dream State",
      cover: "✨",
      moods: ["sleep", "dream", "relax", "meditation"],
      frequencies: [164.81, 207.65, 246.94]
    }
  ];

  const DEFAULT_STATE = {
    language: "en",
    favorites: [],
    recent: [],
    playlists: [],
    volume: 0.65,
    shuffle: false,
    repeat: false
  };

  let state = loadState();
  let translations = {};
  let currentTrackIndex = 0;
  let currentTime = 0;
  let isPlaying = false;
  let progressTimer = null;
  let audioContext = null;
  let masterGain = null;
  let activeNodes = [];
  let searchTimer = null;

  const TRACK_DURATION = 180;

  /* =========================================================
     STORAGE
     ========================================================= */

  function loadState() {
    try {
      const saved = JSON.parse(
        localStorage.getItem("harmoniq_ai_state") || "null"
      );

      return {
        ...DEFAULT_STATE,
        ...(saved || {}),
        favorites: Array.isArray(saved?.favorites) ? saved.favorites : [],
        recent: Array.isArray(saved?.recent) ? saved.recent : [],
        playlists: Array.isArray(saved?.playlists) ? saved.playlists : []
      };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  function saveState() {
    localStorage.setItem(
      "harmoniq_ai_state",
      JSON.stringify(state)
    );
  }

  /* =========================================================
     TRANSLATION
     ========================================================= */

  async function loadLanguage(language) {
    if (!LOCALES.includes(language)) {
      language = "en";
    }

    try {
      const response = await fetch(
        `${BASE}locales/${language}.json`,
        { cache: "no-cache" }
      );

      if (!response.ok) {
        throw new Error("Language file unavailable");
      }

      translations = await response.json();
      state.language = language;
      saveState();

      document.documentElement.lang = language;
      document.documentElement.dir =
        language === "ar" ? "rtl" : "ltr";

      updateLanguageSelector();
      applyTranslations();
      renderAll();

    } catch (error) {
      console.warn("Language loading failed:", error);

      if (language !== "en") {
        await loadLanguage("en");
      }
    }
  }

  function t(path, fallback = "") {
    const parts = path.split(".");
    let value = translations;

    for (const part of parts) {
      if (
        value &&
        Object.prototype.hasOwnProperty.call(value, part)
      ) {
        value = value[part];
      } else {
        return fallback || path;
      }
    }

    return typeof value === "string"
      ? value
      : fallback || path;
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      const value = t(key);

      if (value && value !== key) {
        element.textContent = value;
      }
    });

    document
      .querySelectorAll("[data-i18n-placeholder]")
      .forEach((element) => {
        const key = element.dataset.i18nPlaceholder;
        const value = t(key);

        if (value && value !== key) {
          element.placeholder = value;
        }
      });

    const greeting = document.querySelector(
      "[data-role='greeting']"
    );

    if (greeting) {
      greeting.textContent = t(
        "home.greeting",
        "Good evening"
      );
    }

    const subtitle = document.querySelector(
      "[data-role='home-subtitle']"
    );

    if (subtitle) {
      subtitle.textContent = t(
        "home.subtitle",
        "Discover music that fits your mood."
      );
    }
  }

  function updateLanguageSelector() {
    const selectors = document.querySelectorAll(
      "#languageSelect, [data-language-select]"
    );

    selectors.forEach((select) => {
      select.value = state.language;
    });
  }

  /* =========================================================
     DOM HELPERS
     ========================================================= */

  function qs(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function qsa(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
  }

  function setText(selector, text) {
    const element = qs(selector);
    if (element) element.textContent = text;
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /* =========================================================
     TRACK HELPERS
     ========================================================= */

  function getCurrentTrack() {
    return TRACKS[currentTrackIndex];
  }

  function getTrackById(id) {
    return TRACKS.find((track) => track.id === id);
  }

  function trackTitle(track) {
    return t(
      `tracks.${track.id}.title`,
      track.title
    );
  }

  function trackArtist(track) {
    return t(
      `tracks.${track.id}.artist`,
      track.artist
    );
  }

  function trackAlbum(track) {
    return t(
      `tracks.${track.id}.album`,
      track.album
    );
  }

  function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(seconds));

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes}:${String(secs).padStart(2, "0")}`;
  }

  /* =========================================================
     AUDIO ENGINE
     ========================================================= */

  function createAudioContext() {
    if (!audioContext) {
      const AudioCtx =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioCtx) {
        showToast("Web Audio is not supported.");
        return false;
      }

      audioContext = new AudioCtx();

      masterGain = audioContext.createGain();
      masterGain.gain.value = state.volume;

      masterGain.connect(audioContext.destination);
    }

    return true;
  }

  async function resumeAudio() {
    if (!createAudioContext()) return false;

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    return true;
  }

  function stopAudioNodes() {
    activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch (_) {}

      try {
        node.disconnect();
      } catch (_) {}
    });

    activeNodes = [];
  }

  function startGeneratedTrack(track) {
    if (!audioContext || !masterGain) return;

    stopAudioNodes();

    const now = audioContext.currentTime;

    const frequencies = track.frequencies;

    frequencies.forEach((frequency, index) => {
      const oscillator =
        audioContext.createOscillator();

      const gain =
        audioContext.createGain();

      const filter =
        audioContext.createBiquadFilter();

      oscillator.type =
        index === 0 ? "sine" :
        index === 1 ? "triangle" :
        "sine";

      oscillator.frequency.setValueAtTime(
        frequency,
        now
      );

      filter.type = "lowpass";
      filter.frequency.value =
        900 + index * 300;

      const baseVolume =
        index === 0 ? 0.08 :
        index === 1 ? 0.045 :
        0.025;

      gain.gain.setValueAtTime(
        0.0001,
        now
      );

      gain.gain.exponentialRampToValueAtTime(
        baseVolume,
        now + 2
      );

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      oscillator.start(now);

      activeNodes.push(oscillator);
    });

    /* Soft ambient pulse */
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();

    lfo.type = "sine";
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.018;

    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);

    lfo.start(now);

    activeNodes.push(lfo);
  }

  async function playCurrentTrack() {
    const ready = await resumeAudio();

    if (!ready) return;

    const track = getCurrentTrack();

    startGeneratedTrack(track);

    isPlaying = true;

    addToRecent(track.id);
    updatePlayer();
    startProgressTimer();
  }

  function pauseCurrentTrack() {
    stopAudioNodes();

    isPlaying = false;

    stopProgressTimer();

    updatePlayer();
  }

  async function togglePlay() {
    if (isPlaying) {
      pauseCurrentTrack();
    } else {
      await playCurrentTrack();
    }
  }

  /* =========================================================
     PROGRESS
     ========================================================= */

  function startProgressTimer() {
    stopProgressTimer();

    progressTimer = setInterval(() => {
      if (!isPlaying) return;

      currentTime += 1;

      if (currentTime >= TRACK_DURATION) {
        currentTime = TRACK_DURATION;
        handleTrackEnded();
        return;
      }

      updateProgress();
    }, 1000);
  }

  function stopProgressTimer() {
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
  }

  function handleTrackEnded() {
    stopProgressTimer();

    if (state.repeat) {
      currentTime = 0;
      playCurrentTrack();
      return;
    }

    nextTrack();
  }

  function seekTo(value) {
    const numeric = Number(value);

    if (!Number.isFinite(numeric)) return;

    currentTime = Math.max(
      0,
      Math.min(TRACK_DURATION, numeric)
    );

    updateProgress();
  }

  function updateProgress() {
    const percent =
      (currentTime / TRACK_DURATION) * 100;

    qsa(
      "#progressBar, [data-role='progress']"
    ).forEach((element) => {
      if (
        element instanceof HTMLInputElement &&
        element.type === "range"
      ) {
        element.value = String(currentTime);
        element.max = String(TRACK_DURATION);
      } else {
        element.style.width = `${percent}%`;
      }
    });

    setText(
      "[data-role='current-time']",
      formatTime(currentTime)
    );

    setText(
      "[data-role='duration']",
      formatTime(TRACK_DURATION)
    );
  }

  /* =========================================================
     NEXT / PREVIOUS
     ========================================================= */

  async function nextTrack() {
    if (state.shuffle) {
      let nextIndex = currentTrackIndex;

      if (TRACKS.length > 1) {
        while (nextIndex === currentTrackIndex) {
          nextIndex =
            Math.floor(Math.random() * TRACKS.length);
        }
      }

      currentTrackIndex = nextIndex;
    } else {
      currentTrackIndex =
        (currentTrackIndex + 1) % TRACKS.length;
    }

    currentTime = 0;

    if (isPlaying) {
      await playCurrentTrack();
    } else {
      updatePlayer();
    }
  }

  async function previousTrack() {
    if (currentTime > 5) {
      currentTime = 0;
      updateProgress();
      return;
    }

    currentTrackIndex =
      (currentTrackIndex - 1 + TRACKS.length) %
      TRACKS.length;

    currentTime = 0;

    if (isPlaying) {
      await playCurrentTrack();
    } else {
      updatePlayer();
    }
  }

  /* =========================================================
     VOLUME
     ========================================================= */

  function setVolume(value) {
    const volume = Math.max(
      0,
      Math.min(1, Number(value))
    );

    state.volume = volume;
    saveState();

    if (masterGain) {
      masterGain.gain.value = volume;
    }

    qsa(
      "#volumeControl, [data-role='volume']"
    ).forEach((element) => {
      if (element instanceof HTMLInputElement) {
        element.value = String(volume);
      }
    });
  }

  function toggleMute() {
    if (state.volume > 0) {
      localStorage.setItem(
        "harmoniq_previous_volume",
        String(state.volume)
      );

      setVolume(0);
    } else {
      const previous = Number(
        localStorage.getItem(
          "harmoniq_previous_volume"
        ) || 0.65
      );

      setVolume(previous);
    }
  }

  /* =========================================================
     FAVORITES
     ========================================================= */

  function isFavorite(trackId) {
    return state.favorites.includes(trackId);
  }

  function toggleFavorite(trackId) {
    if (isFavorite(trackId)) {
      state.favorites =
        state.favorites.filter(
          (id) => id !== trackId
        );

      showToast(
        t(
          "messages.removedFavorite",
          "Removed from Favorites"
        )
      );
    } else {
      state.favorites.push(trackId);

      showToast(
        t(
          "messages.addedFavorite",
          "Added to Favorites"
        )
      );
    }

    saveState();
    renderAll();
    updatePlayer();
  }

  /* =========================================================
     RECENT
     ========================================================= */

  function addToRecent(trackId) {
    state.recent =
      state.recent.filter(
        (id) => id !== trackId
      );

    state.recent.unshift(trackId);

    state.recent =
      state.recent.slice(0, 20);

    saveState();
  }

  /* =========================================================
     PLAYLISTS
     ========================================================= */

  function createPlaylist(name, description = "") {
    const cleanName = String(name || "").trim();

    if (!cleanName) {
      showToast("Please enter a playlist name.");
      return;
    }

    state.playlists.push({
      id:
        "playlist_" +
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .slice(2, 8),
      name: cleanName,
      description: String(description || "").trim(),
      tracks: []
    });

    saveState();
    closeModal();
    renderAll();

    showToast(
      t(
        "messages.playlistCreated",
        "Playlist created successfully."
      )
    );
  }

  function addTrackToPlaylist(trackId, playlistId) {
    const playlist = state.playlists.find(
      (item) => item.id === playlistId
    );

    if (!playlist) return;

    if (!playlist.tracks.includes(trackId)) {
      playlist.tracks.push(trackId);
      saveState();

      showToast(
        t(
          "messages.addedPlaylist",
          "Added to playlist"
        )
      );

      renderAll();
    }
  }

  /* =========================================================
     SEARCH
     ========================================================= */

  function searchTracks(query) {
    const text = String(query || "")
      .trim()
      .toLowerCase();

    if (!text) {
      return TRACKS;
    }

    return TRACKS.filter((track) => {
      const haystack = [
        track.title,
        track.artist,
        track.album,
        ...track.moods
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(text);
    });
  }

  function renderSearchResults(query = "") {
    const container =
      qs("[data-role='search-results']") ||
      qs("#searchResults");

    if (!container) return;

    const results = searchTracks(query);

    if (!results.length) {
      container.innerHTML = `
        <div class="emptyState">
          ${escapeHTML(
            t(
              "search.noResults",
              "No results found."
            )
          )}
        </div>
      `;
      return;
    }

    container.innerHTML =
      results.map(trackCardHTML).join("");

    bindDynamicButtons(container);
  }

  /* =========================================================
     AI
     ========================================================= */

  function processAICommand(command) {
    const text = String(command || "")
      .trim()
      .toLowerCase();

    if (!text) return;

    const words = {
      sleep: [
        "sleep",
        "sleeping",
        "نوم",
        "للنوم",
        "uyku",
        "dormir",
        "schlafen"
      ],
      relax: [
        "relax",
        "relaxing",
        "هادئة",
        "استرخاء",
        "rahat",
        "détente",
        "relajante",
        "entspannung"
      ],
      focus: [
        "focus",
        "study",
        "work",
        "تركيز",
        "دراسة",
        "çalış",
        "concentration",
        "estudiar"
      ],
      nature: [
        "nature",
        "ocean",
        "water",
        "طبيعة",
        "بحر",
        "ماء",
        "doğa",
        "nature"
      ],
      meditation: [
        "meditation",
        "تأمل",
        "meditasyon",
        "méditation",
        "meditación",
        "meditation"
      ]
    };

    let mood = null;

    for (const [key, list] of Object.entries(words)) {
      if (list.some((word) => text.includes(word))) {
        mood = key;
        break;
      }
    }

    let matches = [];

    if (mood) {
      matches = TRACKS.filter((track) =>
        track.moods.includes(mood)
      );
    }

    if (!matches.length) {
      matches = searchTracks(text);
    }

    if (!matches.length) {
      matches = TRACKS;
    }

    const selected = matches[0];

    currentTrackIndex =
      TRACKS.findIndex(
        (track) => track.id === selected.id
      );

    currentTime = 0;

    showToast(
      `${trackTitle(selected)} — ${trackArtist(selected)}`
    );

    playCurrentTrack();
  }

  /* =========================================================
     NAVIGATION
     ========================================================= */

  function showPage(pageName) {
    const pages = qsa(
      ".page, [data-page]"
    );

    pages.forEach((page) => {
      const pageId =
        page.dataset.page ||
        page.id ||
        "";

      const active =
        pageId === pageName ||
        pageId === `${pageName}Page`;

      page.classList.toggle(
        "activePage",
        active
      );

      page.classList.toggle(
        "active",
        active
      );
    });

    qsa(
      ".navBtn, .mobileNavBtn, [data-nav]"
    ).forEach((button) => {
      const target =
        button.dataset.nav ||
        button.dataset.page ||
        button.getAttribute("href")?.replace("#", "");

      button.classList.toggle(
        "active",
        target === pageName
      );
    });
  }

  /* =========================================================
     RENDER TRACK CARD
     ========================================================= */

  function trackCardHTML(track) {
    const favorite = isFavorite(track.id);

    return `
      <article
        class="trackCard"
        data-track-id="${escapeHTML(track.id)}"
      >
        <div class="trackCover">
          <span class="coverEmoji">
            ${track.cover}
          </span>

          <button
            class="playButtonSmall"
            data-action="play"
            data-track-id="${escapeHTML(track.id)}"
            aria-label="${escapeHTML(
              t("actions.playNow", "Play Now")
            )}"
          >
            ▶
          </button>
        </div>

        <div class="trackInfo">
          <h3>${escapeHTML(trackTitle(track))}</h3>
          <p>${escapeHTML(trackArtist(track))}</p>
          <small>${escapeHTML(trackAlbum(track))}</small>
        </div>

        <button
          class="likeButton ${favorite ? "active" : ""}"
          data-action="favorite"
          data-track-id="${escapeHTML(track.id)}"
          aria-label="${
            favorite
              ? escapeHTML(
                  t(
                    "actions.removeFavorite",
                    "Remove from Favorites"
                  )
                )
              : escapeHTML(
                  t(
                    "actions.addFavorite",
                    "Add to Favorites"
                  )
                )
          }"
        >
          ${favorite ? "♥" : "♡"}
        </button>
      </article>
    `;
  }

  /* =========================================================
     RENDER HOME
     ========================================================= */

  function renderRecommended() {
    const containers = [
      qs("[data-role='recommended']"),
      qs("#recommendedTracks"),
      qs(".recommendedGrid")
    ].filter(Boolean);

    containers.forEach((container) => {
      container.innerHTML =
        TRACKS.map(trackCardHTML).join("");

      bindDynamicButtons(container);
    });
  }

  /* =========================================================
     RENDER LIBRARY
     ========================================================= */

  function renderLibrary() {
    const favoritesContainer =
      qs("[data-role='favorites-list']") ||
      qs("#favoritesList");

    if (favoritesContainer) {
      const tracks = state.favorites
        .map(getTrackById)
        .filter(Boolean);

      favoritesContainer.innerHTML =
        tracks.length
          ? tracks.map(trackCardHTML).join("")
          : `<div class="emptyState">
              ${escapeHTML(
                t(
                  "library.emptyFavorites",
                  "You haven't added any favorites yet."
                )
              )}
             </div>`;

      bindDynamicButtons(favoritesContainer);
    }

    const recentContainer =
      qs("[data-role='recent-list']") ||
      qs("#recentList");

    if (recentContainer) {
      const tracks = state.recent
        .map(getTrackById)
        .filter(Boolean);

      recentContainer.innerHTML =
        tracks.length
          ? tracks.map(trackCardHTML).join("")
          : `<div class="emptyState">
              ${escapeHTML(
                t(
                  "library.emptyRecent",
                  "Your recently played tracks will appear here."
                )
              )}
             </div>`;

      bindDynamicButtons(recentContainer);
    }

    renderPlaylists();
  }

  function renderPlaylists() {
    const container =
      qs("[data-role='playlists-list']") ||
      qs("#playlistsList");

    if (!container) return;

    if (!state.playlists.length) {
      container.innerHTML = `
        <div class="emptyState">
          ${escapeHTML(
            t(
              "library.emptyPlaylists",
              "Create a playlist to start organizing your music."
            )
          )}
        </div>
      `;
      return;
    }

    container.innerHTML = state.playlists
      .map((playlist) => {
        const count = playlist.tracks.length;

        return `
          <div class="playlistCard">
            <div class="playlistIcon">♫</div>

            <div>
              <h3>${escapeHTML(playlist.name)}</h3>
              <p>${escapeHTML(
                playlist.description || ""
              )}</p>
              <small>${count} tracks</small>
            </div>

            <button
              class="primaryBtn"
              data-action="open-playlist"
              data-playlist-id="${escapeHTML(
                playlist.id
              )}"
            >
              ▶
            </button>
          </div>
        `;
      })
      .join("");
  }

  /* =========================================================
     PLAYER
     ========================================================= */

  function updatePlayer() {
    const track = getCurrentTrack();

    if (!track) return;

    const title = trackTitle(track);
    const artist = trackArtist(track);

    qsa(
      "[data-role='player-title'], #playerTitle"
    ).forEach((element) => {
      element.textContent = title;
    });

    qsa(
      "[data-role='player-artist'], #playerArtist"
    ).forEach((element) => {
      element.textContent = artist;
    });

    qsa(
      "[data-role='player-cover'], #playerCover"
    ).forEach((element) => {
      element.textContent = track.cover;
    });

    qsa(
      "[data-action='play-toggle'], #playButton"
    ).forEach((button) => {
      button.textContent = isPlaying ? "Ⅱ" : "▶";

      button.setAttribute(
        "aria-label",
        isPlaying
          ? t("player.pause", "Pause")
          : t("player.play", "Play")
      );
    });

    qsa("[data-action='shuffle']").forEach(
      (button) => {
        button.classList.toggle(
          "active",
          state.shuffle
        );
      }
    );

    qsa("[data-action='repeat']").forEach(
      (button) => {
        button.classList.toggle(
          "active",
          state.repeat
        );
      }
    );

    updateProgress();
    setVolume(state.volume);
  }

  /* =========================================================
     MODAL
     ========================================================= */

  function openPlaylistModal() {
    const modal =
      qs("#playlistModal") ||
      qs("[data-role='playlist-modal']");

    if (!modal) return;

    modal.classList.add("open");
    modal.classList.add("active");
  }

  function closeModal() {
    qsa(
      ".modal.open, .modal.active, [data-role='playlist-modal'].open"
    ).forEach((modal) => {
      modal.classList.remove("open");
      modal.classList.remove("active");
    });
  }

  /* =========================================================
     TOAST
     ========================================================= */

  function showToast(message) {
    let toast =
      qs("#toast") ||
      qs("[data-role='toast']");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  /* =========================================================
     EVENT BINDING
     ========================================================= */

  function bindDynamicButtons(root = document) {
    qsa(
      "[data-action]",
      root
    ).forEach((element) => {
      if (element.dataset.bound === "true") return;

      element.dataset.bound = "true";

      element.addEventListener("click", async (event) => {
        event.preventDefault();

        const action =
          element.dataset.action;

        const trackId =
          element.dataset.trackId;

        if (action === "play" && trackId) {
          const index =
            TRACKS.findIndex(
              (track) => track.id === trackId
            );

          if (index >= 0) {
            currentTrackIndex = index;
            currentTime = 0;
            await playCurrentTrack();
          }

          return;
        }

        if (action === "favorite" && trackId) {
          toggleFavorite(trackId);
          return;
        }

        if (action === "play-toggle") {
          await togglePlay();
          return;
        }

        if (action === "next") {
          await nextTrack();
          return;
        }

        if (action === "previous") {
          await previousTrack();
          return;
        }

        if (action === "shuffle") {
          state.shuffle = !state.shuffle;
          saveState();
          updatePlayer();
          return;
        }

        if (action === "repeat") {
          state.repeat = !state.repeat;
          saveState();
          updatePlayer();
          return;
        }

        if (action === "mute") {
          toggleMute();
          return;
        }

        if (action === "open-playlist") {
          const playlist =
            state.playlists.find(
              (item) =>
                item.id ===
                element.dataset.playlistId
            );

          if (!playlist) return;

          if (!playlist.tracks.length) {
            showToast(
              t(
                "playlist.empty",
                "This playlist is empty."
              )
            );
            return;
          }

          const firstTrack =
            getTrackById(
              playlist.tracks[0]
            );

          if (!firstTrack) return;

          currentTrackIndex =
            TRACKS.findIndex(
              (track) =>
                track.id === firstTrack.id
            );

          currentTime = 0;
          await playCurrentTrack();
        }
      });
    });
  }

  function bindNavigation() {
    qsa(
      ".navBtn, .mobileNavBtn, [data-nav]"
    ).forEach((button) => {
      if (button.dataset.navBound === "true") {
        return;
      }

      button.dataset.navBound = "true";

      button.addEventListener("click", (event) => {
        const target =
          button.dataset.nav ||
          button.dataset.page ||
          button
            .getAttribute("href")
            ?.replace("#", "");

        if (!target) return;

        event.preventDefault();

        showPage(target);
      });
    });
  }

  function bindLanguage() {
    qsa(
      "#languageSelect, [data-language-select]"
    ).forEach((select) => {
      if (select.dataset.langBound === "true") {
        return;
      }

      select.dataset.langBound = "true";

      select.addEventListener(
        "change",
        async (event) => {
          await loadLanguage(
            event.target.value
          );
        }
      );
    });
  }

  function bindSearch() {
    qsa(
      "#searchInput, [data-role='search-input']"
    ).forEach((input) => {
      if (input.dataset.searchBound === "true") {
        return;
      }

      input.dataset.searchBound = "true";

      input.addEventListener("input", (event) => {
        clearTimeout(searchTimer);

        searchTimer = setTimeout(() => {
          renderSearchResults(
            event.target.value
          );
        }, 120);
      });
    });
  }

  function bindAI() {
    const inputs = qsa(
      "#aiInput, [data-role='ai-input']"
    );

    inputs.forEach((input) => {
      if (input.dataset.aiBound === "true") {
        return;
      }

      input.dataset.aiBound = "true";

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          processAICommand(
            input.value
          );
        }
      });
    });

    qsa(
      "#aiButton, [data-action='ask-ai']"
    ).forEach((button) => {
      if (button.dataset.aiButtonBound === "true") {
        return;
      }

      button.dataset.aiButtonBound = "true";

      button.addEventListener("click", () => {
        const input =
          qs("#aiInput") ||
          qs("[data-role='ai-input']");

        if (input) {
          processAICommand(input.value);
        }
      });
    });
  }

  function bindPlayer() {
    qsa(
      "#progressBar, [data-role='progress-input']"
    ).forEach((element) => {
      if (element.dataset.progressBound === "true") {
        return;
      }

      element.dataset.progressBound = "true";

      element.min = "0";
      element.max = String(TRACK_DURATION);
      element.step = "1";

      element.addEventListener(
        "input",
        (event) => {
          seekTo(event.target.value);
        }
      );
    });

    qsa(
      "#volumeControl, [data-role='volume']"
    ).forEach((element) => {
      if (element.dataset.volumeBound === "true") {
        return;
      }

      element.dataset.volumeBound = "true";

      element.min = "0";
      element.max = "1";
      element.step = "0.01";

      element.addEventListener(
        "input",
        (event) => {
          setVolume(event.target.value);
        }
      );
    });
  }

  function bindPlaylistCreation() {
    qsa(
      "#createPlaylistButton, [data-action='create-playlist']"
    ).forEach((button) => {
      if (button.dataset.playlistBound === "true") {
        return;
      }

      button.dataset.playlistBound = "true";

      button.addEventListener("click", () => {
        openPlaylistModal();
      });
    });

    qsa(
      "#closeModal, [data-action='close-modal']"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        closeModal
      );
    });

    qsa(
      "#cancelPlaylist, [data-action='cancel-playlist']"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        closeModal
      );
    });

    const form =
      qs("#playlistForm") ||
      qs("[data-role='playlist-form']");

    if (form && form.dataset.bound !== "true") {
      form.dataset.bound = "true";

      form.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();

          const name =
            qs("#playlistName", form)?.value ||
            qs("[name='playlistName']", form)
              ?.value;

          const description =
            qs("#playlistDescription", form)
              ?.value ||
            qs(
              "[name='playlistDescription']",
              form
            )?.value ||
            "";

          createPlaylist(
            name,
            description
          );
        }
      );
    }
  }

  /* =========================================================
     GLOBAL CLICK FALLBACK
     ========================================================= */

  function bindGlobalActions() {
    document.addEventListener("click", async (event) => {
      const element =
        event.target.closest("[data-action]");

      if (!element) return;

      if (element.dataset.bound === "true") {
        return;
      }

      const action =
        element.dataset.action;

      if (action === "play-toggle") {
        await togglePlay();
      }
    });
  }

  /* =========================================================
     SERVICE WORKER
     ========================================================= */

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(`${BASE}service-worker.js`)
        .catch((error) => {
          console.warn(
            "Service Worker registration failed:",
            error
          );
        });
    });
  }

  /* =========================================================
     RENDER ALL
     ========================================================= */

  function renderAll() {
    applyTranslations();
    renderRecommended();
    renderLibrary();
    renderSearchResults("");
    updatePlayer();
    bindDynamicButtons();
  }

  /* =========================================================
     INIT
     ========================================================= */

  async function init() {
    bindNavigation();
    bindLanguage();
    bindSearch();
    bindAI();
    bindPlayer();
    bindPlaylistCreation();
    bindDynamicButtons();
    bindGlobalActions();

    await loadLanguage(
      state.language || "en"
    );

    renderAll();

    registerServiceWorker();

    console.log(
      "Harmoniq AI initialized successfully."
    );
  }

  /* =========================================================
     PUBLIC API
     ========================================================= */

  window.HarmoniqAI = {
    tracks: TRACKS,
    state,
    play: playCurrentTrack,
    pause: pauseCurrentTrack,
    next: nextTrack,
    previous: previousTrack,
    search: searchTracks,
    askAI: processAICommand,
    setLanguage: loadLanguage,
    setVolume,
    toggleFavorite,
    createPlaylist
  };

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
