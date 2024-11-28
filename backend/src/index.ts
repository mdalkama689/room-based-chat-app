import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

// message
// {
//     "type": "join",
// "payload": {
// roomId: "1"
// }

// }

const allSockets: any = [];

wss.on("connection", (socket) => {
  console.log("new user connected");

  socket.on("message", (message) => {
    const parseMessage = JSON.parse(message.toString());
    console.log(" parseMessage : ", parseMessage);

    if (parseMessage.type === "join") {
      socket.send(`You joined room ${parseMessage.payload.roomId}`);
      const room = {
        socket,
        message: parseMessage,
      };

      allSockets.push(room);
      allSockets.forEach((user: any) => {
        if (user?.message?.payload?.roomId === parseMessage.payload.roomId &&
            user.socket != socket

        ) {
          user?.socket?.send(`new user coonected to room : ${parseMessage.payload.roomId}`);
          console.log("send message to al user in the room");
        }
      });
    }
  });
});
