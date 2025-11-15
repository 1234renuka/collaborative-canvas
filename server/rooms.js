class Rooms{
  constructor(){this.rooms=new Map();}
  ensure(id){if(!this.rooms.has(id))this.rooms.set(id,{users:new Map()});return this.rooms.get(id);}
  addUser(id,socket,username){const r=this.ensure(id); r.users.set(socket.id,{id:socket.id,username});}
  listUsers(id){const r=this.rooms.get(id); return r?Array.from(r.users.values()):[];}
  removeUser(id,socketId){const r=this.rooms.get(id); r && r.users.delete(socketId);}
}
module.exports=new Rooms();