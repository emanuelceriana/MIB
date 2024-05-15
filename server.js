import path, { dirname } from "path";
import { fileURLToPath } from "url";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifySocket from "@fastify/websocket";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

let messages = [];
let connections = 0;
let randomMessage = "Hello World!";
let counter = 60;

const getRandomMessage = () => {
  const rdmIdx = Math.floor(Math.random() * messages.length);
  randomMessage = messages?.[rdmIdx] ?? randomMessage;
  messages = [];
};

const setCounter = setInterval(() => {
  if (counter > 0) {
    counter--;
  } else {
    getRandomMessage();
    counter = 60;
  }
}, 1000);

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "dist")
});

fastify.setNotFoundHandler((req, res) => {
  res.sendFile('index.html')
})

fastify.register(fastifySocket);

fastify.register(async function (fastify) {
  fastify.get("/handleMessages", { websocket: true }, (socket, req) => {
    const timer = setInterval(
      () =>
        socket.send(
          JSON.stringify({
            messages: messages.length,
            connections,
            randomMessage,
            counter,
          })
        ),
      1000
    );

    socket.on("message", (data) => {
      const parsedData = JSON.parse(data);
      if (parsedData.event === "add") {
        messages.push(parsedData.message);
      }
      if (parsedData.event === "connect") {
        connections++;
      }
      if (parsedData.event === "disconnect") {
        connections && connections--;
      }
    });

    socket.on("close", () => {
      clearInterval(timer);
    });
  });
});

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at: ${address}`);
});