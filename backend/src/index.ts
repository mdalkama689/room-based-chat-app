import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const allUser: any = [];

wss.on("connection", (socket) => {
  console.log("new user connected");

  socket.on("message", (e) => {
    const data = JSON.parse(e.toString());

    if (data.type === "join") {
      const room = {
        socket: socket,
        roomId: data.roomId,
      };

      allUser.push(room);
    }

    if (data.type === "chat") {

      const user = allUser.find((user: any) => data?.roomId == user.roomId);
      if (!user) return;

      for (let i = 0; i < allUser.length; i++) {
        if (user.roomId == allUser[i].roomId) {
          allUser[i].socket.send(data.message);
        }
      }
    }
  });
});
