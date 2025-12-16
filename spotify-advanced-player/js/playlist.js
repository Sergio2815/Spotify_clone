// playlist.js - renders playlist and handles interactions
import { Storage } from './storage.js'

export const Playlist = {
  container: null,
  songs: [],
  init(container){this.container=container},
  load(songs){this.songs=songs;this.render()},
  render(){if(!this.container) return;this.container.innerHTML='';const likes=new Set(Storage.getLikes());
    this.songs.forEach(s=>{
      const li=document.createElement('li');li.className='track ripple';
      li.innerHTML=`<div class="track-cover"><img src="${s.coverImage}" alt="cover"></div><div class="track-meta"><div class="track-title">${s.title}</div><div class="track-artist">${s.artist} • ${s.album}</div></div><div class="track-actions"><button class='like' data-id='${s.id}'>${likes.has(s.id)?'♥':'♡'}</button></div>`;
      li.querySelector('.track-cover').addEventListener('click',()=>this.onPlay && this.onPlay(s));
      li.querySelector('.track-title').addEventListener('click',()=>this.onPlay && this.onPlay(s));
      li.querySelector('.like').addEventListener('click', e=>{e.stopPropagation();const id=s.id;const liked=Storage.toggleLike(id);e.target.textContent=liked?'♥':'♡';});
      this.container.appendChild(li);
    })
  }
}
