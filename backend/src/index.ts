import { WebSocketServer, WebSocket } from "ws";

interface MessagePayload {
  roomId: string;
  message?: string;
}
interface SocketMessage {
  type: "join" | "chat";
  payload: MessagePayload;
}

interface RoomSocket {
  socket: WebSocket;
  message: SocketMessage;
}

const wss = new WebSocketServer({ port: 8080 });

let allSockets: RoomSocket[] = [];

wss.on("connection", (socket) => {
  console.log("new user connected");

  socket.on("message", (data) => {
    try {
      if (!data.toString().trim()) {
        socket.send(
          "Error: Please provide a valid message with type and payload."
        );
        return;
      }
      const parseData: SocketMessage = JSON.parse(data?.toString().trim());

      if (!parseData.payload) {
        socket.send("Error: 'payload' is required.");

        return;
      }

      if (!parseData?.payload?.roomId) {
        socket.send("Error: 'roomId' is required .");
        return;
      }
      if (parseData.type === "join") {
        socket.send("You joined the  room");
        const room: RoomSocket = {
          socket,
          message: parseData,
        };

        allSockets.push(room);
        allSockets.forEach((user: any) => {
          if (
            user?.message?.payload?.roomId === parseData.payload.roomId &&
            user.socket != socket
          ) {
            user?.socket?.send("A new user has joined room");
          }
        });
      } else if (parseData.type === "chat") {
        const { message, roomId } = parseData?.payload;

        if (!message) {
          socket.send("Error: 'message' is required to send a chat.");
          return;
        }

        const usersInRoom = allSockets?.filter(
          (user: any) =>
            user?.message?.payload?.roomId == roomId && user.socket !== socket
        );

        if (usersInRoom.length === 0) {
          socket.send(
            `Error: Room ${roomId} does not exist or has no other users.`
          );
          return;
        }
        usersInRoom.forEach((user: any) => {
          user?.socket?.send(message);
        });
      } else {
        socket.send(
          "Error: Invalid 'type'. Valid types are 'join' and 'chat'."
        );
        return;
      }
    } catch (error) {
      console.log(error);
      socket.send("An error occurred while processing your request.");

      return;
    }
    socket.on("close", () => {
      console.log("user disconnected : ");
      allSockets = allSockets.filter((user) => user.socket !== socket);
    });
  });
});
