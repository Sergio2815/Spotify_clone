import { Playlist } from './playlist.js';
import { Player } from './player.js';
import { Queue } from './queue.js';
import { Storage } from './storage.js';

// Bootstraps app, loads songs.json and connects modules
const SELECTORS = {
  playlist:'#playlist', queueList:'#queueList', audio:'#audio', playBtn:'#playBtn', nextBtn:'#nextBtn', prevBtn:'#prevBtn', seek:'#seek', currentTime:'#currentTime', duration:'#duration', volume:'#volume', muteBtn:'#muteBtn', shuffleBtn:'#shuffleBtn', repeatBtn:'#repeatBtn', loadingIndicator:'#loadingIndicator', coverImage:'#coverImage', title:'#title', artist:'#artist', miniPlayer:'#miniPlayer', miniPlay:'#miniPlay', miniPrev:'#miniPrev', miniNext:'#miniNext', miniCover:'#miniCover', miniTitle:'#miniTitle', miniArtist:'#miniArtist', shuffleAll:'#shuffleAll'
}

const ui = {};
for(const k in SELECTORS){ui[k.replace(/([A-Z])/g,'_$1').toLowerCase()]=document.querySelector(SELECTORS[k])}

async function fetchSongs(){
  const res=await fetch('data/songs.json');const list=await res.json();return list;
}

async function start(){
  const songs=await fetchSongs();
  Playlist.init(document.querySelector('#playlist'));
  Playlist.load(songs);

  const audio=document.querySelector('#audio');
  const queue = new Queue();
  const player=new Player({audioEl:audio, ui:{
    play:document.querySelector('#playBtn'), next:document.querySelector('#nextBtn'), prev:document.querySelector('#prevBtn'), seek:document.querySelector('#seek'), currentTime:document.querySelector('#currentTime'), duration:document.querySelector('#duration'), volume:document.querySelector('#volume'), mute:document.querySelector('#muteBtn'), shuffle:document.querySelector('#shuffleBtn'), repeat:document.querySelector('#repeatBtn'), loading:document.querySelector('#loadingIndicator'), cover:document.querySelector('#coverImage'), title:document.querySelector('#title'), artist:document.querySelector('#artist'), miniPlay:document.querySelector('#miniPlay'), miniPrev:document.querySelector('#miniPrev'), miniNext:document.querySelector('#miniNext'), miniCover:document.querySelector('#miniCover'), miniTitle:document.querySelector('#miniTitle'), miniArtist:document.querySelector('#miniArtist'), shuffleAll:document.querySelector('#shuffleAll'), queueRender:renderQueue
  }, songs:songs, queue:queue});

  // playlist play callback
  Playlist.onPlay=(song)=>{player.load(song);player.play()}

  // mini player toggle and controls
  document.querySelector('#miniToggle').addEventListener('click',()=>{document.querySelector('#miniPlayer').classList.toggle('hidden')})
  document.querySelector('#fullscreenBtn').addEventListener('click',()=>{document.documentElement.requestFullscreen?.()})
  document.querySelector('#miniPlay').addEventListener('click',()=>player.togglePlay());
  document.querySelector('#miniPrev').addEventListener('click',()=>player.prev());
  document.querySelector('#miniNext').addEventListener('click',()=>player.next());

  // render initial queue / liked / recent
  renderQueue(queue.toArray());
  renderLiked();
  renderRecent();

  // listen for storage changes
  window.addEventListener('sap:likes-changed',()=>renderLiked());
  window.addEventListener('sap:recent-changed',()=>renderRecent());
}

function renderQueue(arr){const q=document.querySelector('#queueList');q.innerHTML='';arr.forEach(s=>{const li=document.createElement('li');li.className='track';li.innerHTML=`<div class="track-cover"><img src="${s.coverImage}"></div><div class="track-meta"><div>${s.title}</div><div class="track-artist">${s.artist}</div></div>`;q.appendChild(li)})}

function renderLiked(){const liked=document.querySelector('#likedList');liked.innerHTML='';const ids=Storage.getLikes();if(!ids.length){liked.innerHTML='<li class="muted">No liked songs yet</li>';return}fetch('data/songs.json').then(r=>r.json()).then(list=>{list.filter(s=>ids.includes(s.id)).forEach(s=>{const li=document.createElement('li');li.className='track';li.innerHTML=`<div class="track-cover"><img src="${s.coverImage}"></div><div class="track-meta"><div>${s.title}</div><div class="track-artist">${s.artist}</div></div>`;li.addEventListener('click',()=>{Playlist.onPlay && Playlist.onPlay(s)});liked.appendChild(li)})})}

function renderRecent(){const recent=document.querySelector('#recentList');recent.innerHTML='';const items=Storage.getRecent();if(!items.length){recent.innerHTML='<li class="muted">No recent plays</li>';return}fetch('data/songs.json').then(r=>r.json()).then(list=>{items.forEach(it=>{const s=list.find(x=>x.id===it.id);if(!s) return;const li=document.createElement('li');li.className='track';li.innerHTML=`<div class="track-cover"><img src="${s.coverImage}"></div><div class="track-meta"><div>${s.title}</div><div class="track-artist">${s.artist}</div></div>`;li.addEventListener('click',()=>{Playlist.onPlay && Playlist.onPlay(s)});recent.appendChild(li)})})}

start();
