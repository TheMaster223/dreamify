class Song {
    constructor(id, title, artist, audioUrl, artUrl) {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.audioUrl = audioUrl;
        this.artUrl = artUrl;
    }
}

const defaultSongs = [
    new Song(
        'default1',
        'Just the Two of Us',
        'Dreamybull, Bill Withers, Grover Washington, Jr.',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default1.mp3',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default1.jpg'
    ),
    new Song(
        'default2',
        'E-GIRLS ARE RUINING MY LIFE!',
        'CORPSE, Savage Ga$p',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default2.mp3',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default2.jpg'
    ),
    new Song(
        'default3',
        'Whiskey',
        'Morgan Wallen, Luke Combs, Logan Richardson',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default3.wav',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default3.jpg'
    ),
    new Song(
        'default4',
        'Deliway',
        'Tobelious, Joe Miggle',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default4.wav',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default4.jpg'
    ),
    new Song(
        'default5',
        "Ballin'",
        'Animan Studios, Mustard, Roddy Ricch',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default5.mp3',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default5.jpg'
    ),
    new Song(
        'default6',
        'VULTURES 3 LEAK',
        'Joe Miggle, ¥$',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default6.wav',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default6.jpg'
    ),
    new Song(
        'default7',
        'YOU DID KING',
        'Joe Miggle, LoveAndLightTV',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default7.wav',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default7.jpg'
    ),
    new Song(
        'default8',
        'The Gooner Thoughts Won',
        'Joe Miggle, Kyrie Irving',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default8.wav',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default8.jpg'
    ),
    new Song(
        'default9',
        'Dreamy and the Gooner Land Pirates',
        'Joe Miggle, Dreamybull',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default9.wav',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default9.jpg'
    ),
    new Song(
        'default10',
        'LeBron Raymone James',
        'Joe Miggle, LeBron James, Swamp Izzo',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default10.wav',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default10.jpg'
    ),
    new Song(
        'default11',
        'Siege Femboys',
        'Toodles, Nicholas Stewart',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default11.wav',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default11.jpg'
    ),
    new Song(
        'default12',
        'Taste the Rainbow',
        'Lil Skittle, Sam Fisher, Joe Miggle',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default12.wav',
        'https://raw.githubusercontent.com/TheMaster223/tobe/master/assets/default12.jpg'
    )
];

const homePlaylist = {
    id: 'home',
    name: 'Home',
    songIds: defaultSongs.map(song => song.id),
    isDefault: true
};

class MusicPlayer {
    constructor() {
        this.songs = [];
        this.allSongs = [];
        this.playlists = [];
        this.currentPlaylistId = 'home';
        this.currentIndex = -1;
        this.currentSong = null;
        this.currentSongPlaylistId = null;
        this.audio = document.getElementById('audioPlayer');
        this.isPlaying = false;
        this.songList = document.getElementById('songList');
        this.currentArt = document.getElementById('currentArt');
        this.currentTitle = document.getElementById('currentTitle');
        this.currentArtist = document.getElementById('currentArtist');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressBar = document.getElementById('progressBar');
        this.currentTime = document.getElementById('currentTime');
        this.duration = document.getElementById('duration');
        this.playlistList = document.getElementById('playlistList');
        this.currentPlaylistName = document.getElementById('currentPlaylistName');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeSlider.value = 50;
        this.volumeSlider.style.setProperty('--value', this.volumeSlider.value);
        this.songSearchContainer = document.getElementById('songSearchContainer');
        this.songSearch = document.getElementById('songSearch');
        this.clearSongSearch = document.getElementById('clearSongSearch');
        this.db = null;
        this.initDB()
            .then(() => this.loadPlaylistsFromDB())
            .then(() => {
                this.setupEventListeners();
                this.loadSongsForPlaylist('home');
            })
            .catch(err => {
                console.error('Failed to initialize app:', err);
                alert('Failed to initialize the music player. Please check the console for details.');
            });
    }

    initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MusicPlayerDB', 2);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('songs')) {
                    db.createObjectStore('songs', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('playlists')) {
                    db.createObjectStore('playlists', { keyPath: 'id', autoIncrement: true });
                }
            };
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            request.onerror = (event) => {
                console.error('IndexedDB initialization error:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    addSongToDB(song) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['songs'], 'readwrite');
            const store = transaction.objectStore('songs');
            const request = store.add({
                title: song.title,
                artist: song.artist,
                audioBlob: song.audioUrl,
                artBlob: song.artUrl
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    addPlaylistToDB(name) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['playlists'], 'readwrite');
            const store = transaction.objectStore('playlists');
            const request = store.add({ name, songIds: [] });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    updatePlaylistInDB(playlist) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['playlists'], 'readwrite');
            const store = transaction.objectStore('playlists');
            const request = store.put(playlist);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    removeSongFromDB(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['songs'], 'readwrite');
            const store = transaction.objectStore('songs');
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    removePlaylistFromDB(id) {
        return new Promise((resolve, reject) => {
            const transaction1 = this.db.transaction(['playlists'], 'readonly');
            const playlistStore1 = transaction1.objectStore('playlists');
            const getRequest = playlistStore1.get(id);
            getRequest.onsuccess = () => {
                const playlist = getRequest.result;
                if (!playlist) {
                    reject(new Error('Playlist not found'));
                    return;
                }
                const songIds = playlist.songIds || [];
                const transaction2 = this.db.transaction(['playlists', 'songs'], 'readwrite');
                const playlistStore2 = transaction2.objectStore('playlists');
                const songStore = transaction2.objectStore('songs');
                const deleteSongPromises = songIds.map(songId => {
                    return new Promise((res, rej) => {
                        const deleteRequest = songStore.delete(songId);
                        deleteRequest.onsuccess = () => res();
                        deleteRequest.onerror = () => rej(deleteRequest.error);
                    });
                });
                Promise.all(deleteSongPromises).then(() => {
                    const deleteRequest = playlistStore2.delete(id);
                    deleteRequest.onsuccess = () => resolve();
                    deleteRequest.onerror = () => reject(deleteRequest.error);
                }).catch(err => reject(err));
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    resetAll() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['playlists', 'songs'], 'readwrite');
            const playlistStore = transaction.objectStore('playlists');
            const songStore = transaction.objectStore('songs');
            const clearPlaylists = playlistStore.clear();
            const clearSongs = songStore.clear();
            Promise.all([
                new Promise(r => { 
                    clearPlaylists.onsuccess = () => r(); 
                    clearPlaylists.onerror = () => reject(clearPlaylists.error); 
                }),
                new Promise(r => { 
                    clearSongs.onsuccess = () => r(); 
                    clearSongs.onerror = () => reject(clearSongs.error); 
                })
            ]).then(() => {
                this.playlists = [homePlaylist];
                this.currentPlaylistId = 'home';
                this.currentIndex = -1;
                this.updatePlaylistList();
                this.loadSongsForPlaylist('home');
                resolve();
            }).catch(err => reject(err));
        });
    }

    loadPlaylistsFromDB() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const transaction = this.db.transaction(['playlists'], 'readonly');
            const store = transaction.objectStore('playlists');
            const request = store.getAll();
            request.onsuccess = () => {
                this.playlists = [homePlaylist, ...request.result];
                this.updatePlaylistList();
                this.loadSongsForPlaylist(this.currentPlaylistId);
                resolve();
            };
            request.onerror = (err) => reject(err);
        });
    }

    loadSongsForPlaylist(playlistId) {
        this.currentPlaylistId = playlistId;
        this.updatePlaylistList();
        if (this.songSearchContainer) {
            this.songSearchContainer.classList.toggle('hidden', playlistId !== 'home');
            if (playlistId !== 'home') {
                this.songSearch.value = '';
                this.clearSongSearch.classList.remove('visible');
                this.filterSongs();
            }
        }
        if (playlistId === 'home') {
            this.songs = defaultSongs;
            this.allSongs = [...this.songs];
            this.currentPlaylistName.textContent = homePlaylist.name;
            this.renderSongList();
            if (!this.currentSong) {
                if (this.songs.length > 0 && this.currentIndex === -1) {
                    this.currentIndex = 0;
                    this.loadSong();
                } else if (this.songs.length === 0) {
                    this.clearPlayer();
                }
            }
            return;
        }
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) {
            this.songs = [];
            this.allSongs = [];
            this.currentPlaylistName.textContent = 'No Playlist';
            this.renderSongList();
            if (!this.currentSong) {
                this.clearPlayer();
            }
            return;
        }
        this.currentPlaylistName.textContent = playlist.name;
        const transaction = this.db.transaction(['songs'], 'readonly');
        const store = transaction.objectStore('songs');
        const request = store.getAll();
        request.onsuccess = () => {
            const allSongs = request.result;
            this.songs = allSongs
                .filter(song => playlist.songIds.includes(song.id))
                .sort((a, b) => playlist.songIds.indexOf(a.id) - playlist.songIds.indexOf(b.id))
                .map(song => new Song(song.id, song.title, song.artist, song.audioBlob, song.artBlob));
            this.allSongs = [...this.songs];
            this.renderSongList();
            if (!this.currentSong) {
                if (this.songs.length > 0 && this.currentIndex === -1) {
                    this.currentIndex = 0;
                    this.loadSong();
                } else if (this.songs.length === 0) {
                    this.clearPlayer();
                }
            }
        };
        request.onerror = (err) => {
            this.songs = [];
            this.allSongs = [];
            this.renderSongList();
            if (!this.currentSong) {
                this.clearPlayer();
            }
        };
    }

    viewStorage() {
        const transaction = this.db.transaction(['playlists', 'songs'], 'readonly');
        const playlistStore = transaction.objectStore('playlists');
        const songStore = transaction.objectStore('songs');
        const playlistRequest = playlistStore.getAll();
        const songRequest = songStore.getAll();
        Promise.all([
            new Promise(r => { playlistRequest.onsuccess = () => r(playlistRequest.result); }),
            new Promise(r => { songRequest.onsuccess = () => r(songRequest.result); })
        ]).then(([playlists, songs]) => {
            const output = `Playlists: ${playlists.length}\n` +
                playlists.map(p => `${p.name} (${p.songIds.length} songs)`).join('\n') +
                `\n\nTotal Songs in DB: ${songs.length}\n` +
                songs.map(s => `${s.title} by ${s.artist} (Audio: ${s.audioBlob ? s.audioBlob.size : 'N/A'} bytes, Art: ${s.artBlob ? s.artBlob.size : 'N/A'} bytes)`).join('\n') +
                `\n\nDefault Songs (Home Playlist): ${defaultSongs.length}\n` +
                defaultSongs.map(s => `${s.title} by ${s.artist}`).join('\n');
            alert(output);
        }).catch(err => {
            console.error('Error viewing storage:', err);
            alert('Error viewing storage. Check console for details.');
        });
    }

    exportPlaylist(playlistId) {
        if (playlistId === 'home') {
            alert('Cannot export the Home playlist.');
            return;
        }
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) {
            alert('Playlist not found.');
            return;
        }
        const transaction = this.db.transaction(['songs'], 'readonly');
        const songStore = transaction.objectStore('songs');
        const request = songStore.getAll();
        request.onsuccess = () => {
            const allSongs = request.result.filter(song => playlist.songIds.includes(song.id));
            const zip = new JSZip();
            const playlistData = {
                name: playlist.name,
                songs: allSongs.map(song => ({
                    id: song.id,
                    title: song.title,
                    artist: song.artist,
                    audioFile: `audio_${song.id}.${song.audioBlob.type.split('/')[1]}`,
                    artFile: `art_${song.id}.${song.artBlob.type.split('/')[1]}`
                }))
            };
            zip.file('playlist.json', JSON.stringify(playlistData, null, 2));
            allSongs.forEach(song => {
                zip.file(`audio_${song.id}.${song.audioBlob.type.split('/')[1]}`, song.audioBlob);
                zip.file(`art_${song.id}.${song.artBlob.type.split('/')[1]}`, song.artBlob);
            });
            zip.generateAsync({ type: 'blob' }).then(blob => {
                saveAs(blob, `${playlist.name}.zip`);
            }).catch(err => {
                console.error('Error generating ZIP:', err);
                alert('Failed to export playlist. Check console for details.');
            });
        };
        request.onerror = () => {
            console.error('Error fetching songs for export:', request.error);
            alert('Failed to export playlist. Check console for details.');
        };
    }

    importPlaylist(zipFile) {
        JSZip.loadAsync(zipFile).then(zip => {
            const playlistFile = zip.file('playlist.json');
            if (!playlistFile) {
                alert('Invalid ZIP: playlist.json not found.');
                return;
            }
            playlistFile.async('string').then(playlistJson => {
                let playlistData;
                try {
                    playlistData = JSON.parse(playlistJson);
                } catch (err) {
                    alert('Invalid ZIP: playlist.json is not valid JSON.');
                    return;
                }
                if (!playlistData.name || !Array.isArray(playlistData.songs)) {
                    alert('Invalid ZIP: playlist.json is missing required fields.');
                    return;
                }
                const newSongIds = [];
                const addSongPromises = playlistData.songs.map(song => {
                    const audioFile = zip.file(song.audioFile);
                    const artFile = zip.file(song.artFile);
                    if (!audioFile || !artFile) {
                        alert(`Missing audio or art file for song: ${song.title}`);
                        return Promise.reject(new Error('Missing files'));
                    }
                    return Promise.all([
                        audioFile.async('blob'),
                        artFile.async('blob')
                    ]).then(([audioBlob, artBlob]) => {
                        const newSong = new Song(null, song.title, song.artist, audioBlob, artBlob);
                        return this.addSongToDB(newSong).then(songId => {
                            newSong.id = songId;
                            newSongIds.push(songId);
                        });
                    });
                });
                Promise.all(addSongPromises).then(() => {
                    this.addPlaylistToDB(playlistData.name).then(playlistId => {
                        const newPlaylist = { id: playlistId, name: playlistData.name, songIds: newSongIds };
                        this.playlists.push(newPlaylist);
                        this.updatePlaylistInDB(newPlaylist).then(() => {
                            this.updatePlaylistList();
                            this.loadSongsForPlaylist(playlistId);
                        }).catch(err => {
                            console.error('Error updating imported playlist:', err);
                            alert('Failed to save imported playlist. Check console for details.');
                        });
                    }).catch(err => {
                        console.error('Error creating imported playlist:', err);
                        alert('Failed to create imported playlist. Check console for details.');
                    });
                }).catch(err => {
                    console.error('Error importing songs:', err);
                    alert('Failed to import songs. Check console for details.');
                });
            }).catch(err => {
                console.error('Error reading playlist.json:', err);
                alert('Failed to read playlist.json. Check console for details.');
            });
        }).catch(err => {
            console.error('Error loading ZIP:', err);
            alert('Invalid ZIP file. Check console for details.');
        });
    }

    setupEventListeners() {
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.playPrevious());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.playNext());
        }
        if (this.audio) {
            this.audio.addEventListener('timeupdate', () => this.updateProgress());
            this.audio.addEventListener('ended', () => this.playNext());
        }
        if (this.progressBar) {
            this.progressBar.addEventListener('input', () => this.seek());
        }
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', () => this.setVolume());
            this.audio.volume = this.volumeSlider.value / 100;
            this.volumeSlider.style.setProperty('--value', this.volumeSlider.value);
        }
        if (this.progressBar) {
            this.progressBar.style.setProperty('--value', this.progressBar.value);
        }
        if (this.songSearch) {
            this.songSearch.addEventListener('input', () => {
                this.filterSongs();
                this.clearSongSearch.classList.toggle('visible', this.songSearch.value.length > 0);
            });
        }
        if (this.clearSongSearch) {
            this.clearSongSearch.addEventListener('click', () => {
                this.songSearch.value = '';
                this.clearSongSearch.classList.remove('visible');
                this.filterSongs();
            });
        }
        const importPlaylistBtn = document.getElementById('importPlaylistBtn');
        const importPlaylistInput = document.getElementById('importPlaylistInput');
        if (importPlaylistBtn && importPlaylistInput) {
            importPlaylistBtn.addEventListener('click', () => importPlaylistInput.click());
            importPlaylistInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.importPlaylist(file);
                    importPlaylistInput.value = '';
                }
            });
        }
    }

    filterSongs() {
        if (this.currentPlaylistId !== 'home') return;
        const query = this.songSearch.value.trim().toLowerCase();
        if (query === '') {
            this.songs = [...this.allSongs];
        } else {
            this.songs = this.allSongs.filter(song =>
                song.title.toLowerCase().includes(query) ||
                song.artist.toLowerCase().includes(query)
            );
        }
        this.renderSongList();
    }

    setVolume() {
        this.audio.volume = this.volumeSlider.value / 100;
        this.volumeSlider.style.setProperty('--value', this.volumeSlider.value);
    }

    updatePlaylistList() {
        this.playlistList.innerHTML = '';
        this.playlists.forEach(playlist => {
            if (playlist.id === 'home') return;
            const li = document.createElement('li');
            li.className = this.currentPlaylistId === playlist.id ? 'active' : '';
            const span = document.createElement('span');
            span.textContent = playlist.name;
            span.addEventListener('click', () => this.loadSongsForPlaylist(playlist.id));
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.className = 'remove-btn';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removePlaylist(playlist.id);
            });
            const exportBtn = document.createElement('button');
            exportBtn.textContent = 'Export';
            exportBtn.className = 'export-btn';
            exportBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.exportPlaylist(playlist.id);
            });
            li.appendChild(span);
            li.appendChild(exportBtn);
            li.appendChild(removeBtn);
            this.playlistList.appendChild(li);
        });
        document.getElementById('playlistAddSelect').innerHTML = '';
        this.playlists.forEach(playlist => {
            if (playlist.id === 'home') return;
            const option = document.createElement('option');
            option.value = playlist.id;
            option.textContent = playlist.name;
            document.getElementById('playlistAddSelect').appendChild(option);
        });
        if (this.currentPlaylistId && this.currentPlaylistId !== 'home') {
            document.getElementById('playlistAddSelect').value = this.currentPlaylistId;
        }
        const homeNavItem = document.getElementById('homeNavItem');
        if (homeNavItem) {
            homeNavItem.className = 'nav-item home-playlist' + (this.currentPlaylistId === 'home' ? ' active' : '');
        }
    }

    addSong(song, playlistId) {
        if (playlistId === 'home') {
            alert('Cannot add songs to the Home playlist.');
            return;
        }
        this.addSongToDB(song).then(songId => {
            const playlist = this.playlists.find(p => p.id === playlistId);
            if (!playlist) return;
            playlist.songIds.push(songId);
            song.id = songId;
            this.updatePlaylistInDB(playlist).then(() => {
                if (this.currentPlaylistId === playlistId) {
                    this.songs.push(song);
                    this.allSongs.push(song);
                    this.renderSongList();
                    if (this.currentIndex === -1) {
                        this.currentIndex = 0;
                        this.loadSong();
                    }
                }
            }).catch(err => console.error('Error updating playlist in DB:', err));
        }).catch(err => console.error('Error adding song:', err));
    }

    removeSong(index) {
        const song = this.songs[index];
        if (this.currentPlaylistId === 'home') {
            alert('Cannot remove songs from the Home playlist.');
            return;
        }
        this.removeSongFromDB(song.id).then(() => {
            const playlist = this.playlists.find(p => p.id === this.currentPlaylistId);
            const songIndexInPlaylist = playlist.songIds.indexOf(song.id);
            if (songIndexInPlaylist !== -1) {
                playlist.songIds.splice(songIndexInPlaylist, 1);
            }
            this.updatePlaylistInDB(playlist).then(() => {
                const allSongsIndex = this.allSongs.findIndex(s => s.id === song.id);
                if (allSongsIndex !== -1) {
                    this.allSongs.splice(allSongsIndex, 1);
                }
                this.songs.splice(index, 1);
                if (this.currentIndex >= this.songs.length) {
                    this.currentIndex = this.songs.length - 1;
                }
                if (this.currentIndex === -1 && this.songs.length > 0) {
                    this.currentIndex = 0;
                }
                this.renderSongList();
                if (this.currentSong && this.currentSong.id === song.id) {
                    if (this.currentIndex >= 0) {
                        this.loadSong();
                    } else {
                        this.clearPlayer();
                        this.currentSong = null;
                        this.currentSongPlaylistId = null;
                    }
                }
            }).catch(err => console.error('Error updating playlist after song removal:', err));
        }).catch(err => console.error('Error removing song:', err));
    }

    addPlaylist(name) {
        this.addPlaylistToDB(name).then(id => {
            const newPlaylist = { id, name, songIds: [] };
            this.playlists.push(newPlaylist);
            this.updatePlaylistList();
            this.currentPlaylistId = id;
            this.loadSongsForPlaylist(id);
        }).catch(err => console.error('Error adding playlist:', err));
    }

    removePlaylist(id) {
        if (id === 'home') {
            alert('Cannot remove the Home playlist.');
            return;
        }
        this.removePlaylistFromDB(id).then(() => {
            const index = this.playlists.findIndex(p => p.id === id);
            if (index !== -1) {
                this.playlists.splice(index, 1);
                if (this.currentPlaylistId === id) {
                    this.currentPlaylistId = 'home';
                    this.loadSongsForPlaylist(this.currentPlaylistId);
                }
                this.updatePlaylistList();
            }
        }).catch(err => {
            console.error('Error removing playlist:', err);
            alert('Failed to remove playlist. Check console for details.');
        });
    }

    reorderSongs(fromIndex, toIndex) {
        if (this.currentPlaylistId === 'home') return;
        const playlist = this.playlists.find(p => p.id === this.currentPlaylistId);
        if (!playlist) return;
        const [movedSong] = this.songs.splice(fromIndex, 1);
        this.songs.splice(toIndex, 0, movedSong);
        const allSongsFromIndex = this.allSongs.findIndex(s => s.id === movedSong.id);
        const [movedAllSong] = this.allSongs.splice(allSongsFromIndex, 1);
        const allSongsToIndex = this.songs.findIndex(s => s.id === this.allSongs[toIndex]?.id);
        this.allSongs.splice(allSongsToIndex, 0, movedAllSong);
        const [movedSongId] = playlist.songIds.splice(fromIndex, 1);
        playlist.songIds.splice(toIndex, 0, movedSongId);
        if (this.currentIndex === fromIndex) {
            this.currentIndex = toIndex;
        } else if (fromIndex < this.currentIndex && toIndex >= this.currentIndex) {
            this.currentIndex--;
        } else if (fromIndex > this.currentIndex && toIndex <= this.currentIndex) {
            this.currentIndex++;
        }
        this.updatePlaylistInDB(playlist).catch(err => {
            console.error('Error updating playlist order in DB:', err);
            alert('Failed to save new song order. Check console for details.');
        });
    }

    renderSongList() {
        this.songList.innerHTML = '';
        this.songs.forEach((song, index) => {
            const songElement = document.createElement('div');
            songElement.className = 'song-item';
            songElement.setAttribute('draggable', this.currentPlaylistId !== 'home');
            const artUrl = typeof song.artUrl === 'string' ? song.artUrl : URL.createObjectURL(song.artUrl);
            songElement.innerHTML = `
                <img src="${artUrl}" alt="Album Art">
                <div>
                    <h3>${song.title}</h3>
                    <p>${song.artist}</p>
                </div>
            `;
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.className = 'remove-btn';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeSong(index);
            });
            songElement.appendChild(removeBtn);
            songElement.addEventListener('click', (e) => {
                if (e.target !== removeBtn) {
                    this.currentIndex = index;
                    this.loadSong();
                    this.play();
                }
            });
            if (this.currentPlaylistId !== 'home') {
                songElement.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', index);
                    songElement.classList.add('dragging');
                });
                songElement.addEventListener('dragend', () => {
                    songElement.classList.remove('dragging');
                });
                songElement.addEventListener('dragover', (e) => {
                    e.preventDefault();
                });
                songElement.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    const toIndex = index;
                    if (fromIndex !== toIndex) {
                        this.reorderSongs(fromIndex, toIndex);
                        this.renderSongList();
                    }
                });
            }
            this.songList.appendChild(songElement);
        });
    }

    loadSong() {
        if (this.currentIndex >= 0 && this.currentIndex < this.songs.length) {
            const song = this.songs[this.currentIndex];
            this.audio.src = typeof song.audioUrl === 'string' ? song.audioUrl : URL.createObjectURL(song.audioUrl);
            this.currentArt.src = typeof song.artUrl === 'string' ? song.artUrl : URL.createObjectURL(song.artUrl);
            this.currentTitle.textContent = song.title;
            this.currentArtist.textContent = song.artist;
            this.playPauseBtn.textContent = '▶️';
            this.isPlaying = false;
            this.currentSong = song;
            this.currentSongPlaylistId = this.currentPlaylistId;
        }
    }

    clearPlayer() {
        this.audio.src = '';
        this.currentArt.src = '';
        this.currentTitle.textContent = '';
        this.currentArtist.textContent = '';
        this.playPauseBtn.textContent = '▶️';
        this.isPlaying = false;
        this.currentSong = null;
        this.currentSongPlaylistId = null;
    }

    togglePlayPause() {
        if (!this.audio.src) return;
        if (this.isPlaying) {
            this.audio.pause();
            this.playPauseBtn.textContent = '▶️';
        } else {
            this.audio.play().catch(err => console.error('Error playing audio:', err));
            this.playPauseBtn.textContent = '⏸';
        }
        this.isPlaying = !this.isPlaying;
    }

    playPrevious() {
        if (this.songs.length === 0) return;
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadSong();
        this.play();
    }

    playNext() {
        if (this.songs.length === 0) return;
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadSong();
        this.play();
    }

    play() {
        if (this.audio.src) {
            this.audio.play().catch(err => console.error('Error playing audio:', err));
            this.playPauseBtn.textContent = '⏸';
            this.isPlaying = true;
        }
    }

    updateProgress() {
        const current = this.audio.currentTime;
        const duration = this.audio.duration;
        const progressPercent = (current / duration) * 100 || 0;
        this.progressBar.value = progressPercent;
        this.progressBar.style.setProperty('--value', progressPercent);
        this.currentTime.textContent = this.formatTime(current);
        this.duration.textContent = this.formatTime(duration);
    }

    seek() {
        const duration = this.audio.duration;
        const value = this.progressBar.value;
        this.audio.currentTime = (value / 100) * duration;
        this.progressBar.style.setProperty('--value', value);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

try {
    const player = new MusicPlayer();
    const songModal = document.getElementById('songModal');
    const songForm = document.getElementById('songForm');
    const addSongBtn = document.getElementById('addSongBtn');
    const submitSong = document.getElementById('submitSong');
    const cancelSongForm = document.getElementById('cancelSongForm');
    const playlistModal = document.getElementById('playlistModal');
    const createPlaylistForm = document.getElementById('createPlaylistForm');
    const createPlaylistBtn = document.getElementById('createPlaylistBtn');
    const submitPlaylist = document.getElementById('submitPlaylist');
    const cancelPlaylistForm = document.getElementById('cancelPlaylistForm');
    const resetAllBtn = document.getElementById('resetAllBtn');
    const viewStorageBtn = document.getElementById('viewStorageBtn');
    const homeNavItem = document.getElementById('homeNavItem');

    function closeModal(modal) {
        modal.classList.remove('visible');
        modal.classList.add('hidden');
    }

    function openModal(modal) {
        modal.classList.remove('hidden');
        modal.classList.add('visible');
    }

    if (addSongBtn) {
        addSongBtn.addEventListener('click', () => openModal(songModal));
    }

    if (submitSong) {
        submitSong.addEventListener('click', () => {
            const title = document.getElementById('songTitle').value;
            const artist = document.getElementById('artist').value;
            const audioFile = document.getElementById('audioFile').files[0];
            const albumArt = document.getElementById('albumArt').files[0];
            const playlistId = parseInt(document.getElementById('playlistAddSelect').value);
            if (title && artist && audioFile && albumArt && playlistId) {
                const song = new Song(null, title, artist, audioFile, albumArt);
                player.addSong(song, playlistId);
                closeModal(songModal);
                clearSongForm();
            } else {
                alert('Please fill out all fields and select a playlist.');
            }
        });
    }

    if (cancelSongForm) {
        cancelSongForm.addEventListener('click', () => {
            closeModal(songModal);
            clearSongForm();
        });
    }

    if (createPlaylistBtn) {
        createPlaylistBtn.addEventListener('click', () => openModal(playlistModal));
    }

    if (submitPlaylist) {
        submitPlaylist.addEventListener('click', () => {
            const name = document.getElementById('playlistName').value;
            if (name) {
                player.addPlaylist(name);
                closeModal(playlistModal);
                clearPlaylistForm();
            } else {
                alert('Please enter a playlist name.');
            }
        });
    }

    if (cancelPlaylistForm) {
        cancelPlaylistForm.addEventListener('click', () => {
            closeModal(playlistModal);
            clearPlaylistForm();
        });
    }

    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset everything? This will delete all playlists and songs except the Home playlist.')) {
                player.resetAll().catch(err => console.error('Error resetting:', err));
            }
        });
    }

    if (viewStorageBtn) {
        viewStorageBtn.addEventListener('click', () => player.viewStorage());
    }

    if (homeNavItem) {
        homeNavItem.addEventListener('click', () => player.loadSongsForPlaylist('home'));
    }

    [songModal, playlistModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
                if (modal === songModal) clearSongForm();
                if (modal === playlistModal) clearPlaylistForm();
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!songModal.classList.contains('hidden')) {
                closeModal(songModal);
                clearSongForm();
            }
            if (!playlistModal.classList.contains('hidden')) {
                closeModal(playlistModal);
                clearPlaylistForm();
            }
        }
    });

    function clearSongForm() {
        document.getElementById('songTitle').value = '';
        document.getElementById('artist').value = '';
        document.getElementById('audioFile').value = '';
        document.getElementById('albumArt').value = '';
    }

    function clearPlaylistForm() {
        document.getElementById('playlistName').value = '';
    }
} catch (err) {
    console.error('Error initializing player or setting up event listeners:', err);
}