// Small helpers for triggering CSS transitions
export function fadeElement(el, cls){el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),500)}
// animations.js - JS triggered transitions
export function crossfade(oldEl, newEl){
  if(!oldEl || !newEl) return;
  oldEl.classList.add('song-fade-exit');
  newEl.classList.add('song-fade-enter');
  setTimeout(()=>{oldEl.classList.remove('song-fade-exit');newEl.classList.remove('song-fade-enter')},450);
}
