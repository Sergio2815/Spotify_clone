// queue.js - simple queue management
export class Queue{
  constructor(){this.items=[]}
  push(song){this.items.push(song)}
  unshift(song){this.items.unshift(song)}
  next(){return this.items.shift()}
  remove(id){this.items=this.items.filter(s=>s.id!==id)}
  clear(){this.items=[]}
  toArray(){return [...this.items]}
}
