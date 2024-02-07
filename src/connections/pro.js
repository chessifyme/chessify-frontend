export default function connectToPro(
  channel,
  fen,
  onConnect,
  onGetAnalyze,
  onDisconnect,
  numPV,
  is_socket_timeout_case = false,
) {

  const socket = new WebSocket(channel);

  socket.onopen = () => {
    if (!is_socket_timeout_case) {
      socket.send(`stop`);
      socket.send(`setoption name MultiPV value ${numPV}`);
      socket.send(`position fen ${fen}`);
      socket.send('go infinite');
    }
    setTimeout(() => {
      if (socket.readyState === WebSocket.OPEN) {
        console.log('Simulating socket disconnection after 30 seconds');
        socket.close(); // This will trigger the onclose event
      }
    }, 30000)
    onConnect(socket, is_socket_timeout_case);
  };

  socket.onmessage = (event) => {
    onGetAnalyze(event.data);
  };

  socket.onclose = () => {
    onDisconnect(socket);
  };
  socket.onerror = console.error;
}
