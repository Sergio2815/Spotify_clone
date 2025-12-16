// player.js - central audio logic and UI wiring
import { Storage } from './storage.js'

export class Player{
  constructor({audioEl,ui, songs, queue}){
    this.audio=audioEl;
    this.songs=songs||[];
    this.ui=ui;
    this.state={
      currentSong:null,
      isPlaying:false,
      shuffle:false,
      repeatMode:'off', // off, one, all
      volume: Number(localStorage.getItem('sap_vol')||0.8),
      simulated:false
    };
    this.simTimer=null;
    this.simPosition=0;
    this.queue = queue;
    this.init();
  }

  init(){
    this.audio.volume=this.state.volume;
    this.ui.volume.value=this.state.volume;
    this.attachUI();
    this.audio.addEventListener('timeupdate',()=>this.updateProgress());
    this.audio.addEventListener('ended',()=>this.onEnd());
    this.audio.addEventListener('loadedmetadata',()=>this.onMetadata());
  }

  attachUI(){
    this.ui.play.addEventListener('click',()=>this.togglePlay());
    this.ui.next.addEventListener('click',()=>this.next());
    this.ui.prev.addEventListener('click',()=>this.prev());
    this.ui.seek.addEventListener('input',(e)=>this.onSeek(e));
    this.ui.volume.addEventListener('input',(e)=>this.setVolume(e.target.value));
    this.ui.mute.addEventListener('click',()=>this.toggleMute());
    this.ui.shuffle.addEventListener('click',()=>{this.state.shuffle=!this.state.shuffle;this.ui.shuffle.classList.toggle('active',this.state.shuffle)});
    this.ui.repeat.addEventListener('click',()=>{this.cycleRepeat();});
    this.ui.shuffleAll && this.ui.shuffleAll.addEventListener('click',()=>this.shuffleAll());
  }

  cycleRepeat(){
    const order=['off','one','all'];
    const next=order[(order.indexOf(this.state.repeatMode)+1)%order.length];
    this.state.repeatMode=next;this.ui.repeat.textContent=`Repeat: ${next}`;
  }

  load(song){
    if(!song) return;
    this.stopSimulation();
    this.state.currentSong=song;
    this.ui.title.textContent=song.title;this.ui.artist.textContent=song.artist;this.ui.cover.src=song.coverImage;this.ui.miniCover.src=song.coverImage;this.ui.miniTitle.textContent=song.title;this.ui.miniArtist.textContent=song.artist;
    this.showLoading(true);
    // try to load real audio via fetch; if missing, create a short WAV blob so playback works offline
    fetch(song.audioSrc).then(resp=>{
      if(resp.ok){
        return resp.blob().then(b=>{this.state.simulated=false;this.audio.src=URL.createObjectURL(b);});
      }else{
        // create silent WAV blob matching duration
        const wav = createSilentWav(Math.max(1, Math.floor(song.duration||3)));this.state.simulated=false;this.audio.src=URL.createObjectURL(wav);
        this.ui.duration.textContent=formatTime(Math.floor(song.duration||0));this.ui.seek.max=Math.floor(song.duration||0);
      }
    }).catch(()=>{
      const wav = createSilentWav(Math.max(1, Math.floor(song.duration||3)));this.state.simulated=false;this.audio.src=URL.createObjectURL(wav);
      this.ui.duration.textContent=formatTime(Math.floor(song.duration||0));this.ui.seek.max=Math.floor(song.duration||0);
    }).finally(()=>{this.showLoading(false)});
    // always mark recently played
    Storage.addRecent(song.id);
  }

function createSilentWav(durationSec, sampleRate=22050){
  const samples = Math.max(1, Math.floor(durationSec * sampleRate));
  const blockAlign = 2; // 16-bit mono
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  function writeString(view, offset, string){for(let i=0;i<string.length;i++)view.setUint8(offset+i,string.charCodeAt(i))}
  writeString(view,0,'RIFF');
  view.setUint32(4,36 + dataSize,true);
  writeString(view,8,'WAVE');
  writeString(view,12,'fmt ');
  view.setUint32(16,16,true);
  view.setUint16(20,1,true); // PCM
  view.setUint16(22,1,true); // channels
  view.setUint32(24,sampleRate,true);
  view.setUint32(28,byteRate,true);
  view.setUint16(32,blockAlign,true);
  view.setUint16(34,16,true); // bits per sample
  writeString(view,36,'data');
  view.setUint32(40,dataSize,true);
  // leave data zeroed (silence)
  return new Blob([view],{type:'audio/wav'});
}

  onMetadata(){
    this.state.simulated=false;this.ui.duration.textContent=formatTime(Math.floor(this.audio.duration));this.ui.seek.max=Math.floor(this.audio.duration);this.showLoading(false);
  }

  showLoading(v){this.ui.loading.style.display=v?'flex':'none';}

  play(){
    if(this.state.simulated){this.startSimulation();this.state.isPlaying=true;this.ui.play.textContent='⏸';this.ui.miniPlay.textContent='⏸';return}
    this.audio.play().then(()=>{this.state.isPlaying=true;this.ui.play.textContent='⏸';this.ui.miniPlay.textContent='⏸'}).catch(()=>{});
  }

  pause(){
    if(this.state.simulated){this.stopSimulation();this.state.isPlaying=false;this.ui.play.textContent='▶';this.ui.miniPlay.textContent='▶';return}
    this.audio.pause();this.state.isPlaying=false;this.ui.play.textContent='▶';this.ui.miniPlay.textContent='▶';
  }

  togglePlay(){this.state.isPlaying?this.pause():this.play();}

  next(){
    if(this.state.shuffle){
      const pick=this.songs[Math.floor(Math.random()*this.songs.length)];this.load(pick);this.play();return;
    }
    // try queue
    const next = this.queue && this.queue.next && this.queue.next();
    if(next){this.load(next);this.play();this.ui.queueRender && this.ui.queueRender(this.queue.toArray());return}
    // otherwise next in list
    const idx=this.songs.findIndex(s=>s.id===this.state.currentSong.id);
    let nidx=(idx+1)%this.songs.length;
    if(this.state.repeatMode==='one') nidx=idx;
    if(idx===-1) nidx=0;
    this.load(this.songs[nidx]);this.play();
  }

  prev(){
    const idx=this.songs.findIndex(s=>s.id===this.state.currentSong.id);
    let pidx=(idx-1+this.songs.length)%this.songs.length;this.load(this.songs[pidx]);this.play();
  }

  onEnd(){
    if(this.state.repeatMode==='one'){this.play();return}
    if(this.state.repeatMode==='all' && this.songs.length){this.next();return}
    this.next();
  }

  updateProgress(){
    const cur=this.state.simulated?this.simPosition:Math.floor(this.audio.currentTime||0);
    this.ui.currentTime.textContent=formatTime(cur);
    this.ui.seek.value=cur;
  }

  onSeek(e){
    const v=Number(e.target.value);
    if(this.state.simulated){this.simPosition=v;this.updateProgress();}
    else this.audio.currentTime=v;
  }

  setVolume(v){this.audio.volume=v;this.state.volume=v;localStorage.setItem('sap_vol',v);}

  toggleMute(){if(this.audio.muted){this.audio.muted=false;this.ui.mute.textContent='🔊'}else{this.audio.muted=true;this.ui.mute.textContent='🔇'}}

  startSimulation(){if(this.simTimer) return;const dur=this.state.currentSong.duration;this.simTimer=setInterval(()=>{this.simPosition++;if(this.simPosition>=dur){this.stopSimulation();this.onEnd()}this.updateProgress()},1000);this.state.isPlaying=true;this.ui.play.textContent='⏸';this.ui.miniPlay.textContent='⏸'}

  stopSimulation(){if(this.simTimer){clearInterval(this.simTimer);this.simTimer=null}this.state.isPlaying=false;this.ui.play.textContent='▶';this.ui.miniPlay.textContent='▶'}

  shuffleAll(){this.state.queue=this.songs.slice().sort(()=>Math.random()-0.5);this.ui.queueRender && this.ui.queueRender(this.state.queue)}
}

function formatTime(sec){if(!sec && sec!==0) return '0:00';const s=Math.floor(sec%60);const m=Math.floor(sec/60);return `${m}:${s.toString().padStart(2,'0')}`}
