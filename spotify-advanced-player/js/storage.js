// storage.js - simple localStorage wrapper for likes and recently played
export const Storage = {
  keyLikes: 'sap_likes_v1',
  keyRecent: 'sap_recent_v1',
  getLikes(){
    try{const raw=localStorage.getItem(this.keyLikes);return raw?JSON.parse(raw):[];}catch(e){return []}
  },
  saveLikes(arr){localStorage.setItem(this.keyLikes,JSON.stringify(arr))},
  toggleLike(id){const likes=new Set(this.getLikes());if(likes.has(id))likes.delete(id);else likes.add(id);this.saveLikes([...likes]);return likes.has(id)},
  addRecent(id){const arr=this.getRecent();arr.unshift({id,t:Date.now()});const seen=new Map();const filtered=arr.filter(x=>{if(seen.has(x.id))return false;seen.set(x.id,true);return true}).slice(0,50);localStorage.setItem(this.keyRecent,JSON.stringify(filtered))},
  getRecent(){try{const raw=localStorage.getItem(this.keyRecent);return raw?JSON.parse(raw):[]}catch(e){return []}}
}

// dispatch events when storage changes so UI can react
window.addEventListener && (function(){
  const origToggle = Storage.toggleLike.bind(Storage);
  Storage.toggleLike = function(id){const liked = origToggle(id);window.dispatchEvent(new CustomEvent('sap:likes-changed',{detail:{id,liked}}));return liked}
  const origRecent = Storage.addRecent.bind(Storage);
  Storage.addRecent = function(id){origRecent(id);window.dispatchEvent(new CustomEvent('sap:recent-changed',{detail:{id}}))}
})();
