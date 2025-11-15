const WS = (function(){
  let socket = null;
  function connect({roomId, username}){
    socket = io({ transports: ['websocket'] });
    return new Promise((resolve, reject)=>{
      socket.on('connect', ()=>{
        socket.emit('join',{roomId,username}, resp=> resolve({socket, meta:resp}));
      });
      socket.on('connect_error', reject);
    });
  }
  function on(e,cb){ socket && socket.on(e,cb); }
  function emit(e,d,a){ socket && socket.emit(e,d,a); }
  return {connect,on,emit};
})();
window.WS = WS;