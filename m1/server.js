const express = require("express");
const amqp = require("amqplib");
const expressWinston = require("express-winston");
const { transports, format } = require("winston");

const port = 80;
const app = express();

const opt = {
  credentials: require("amqplib").credentials.plain("rmuser", "rmpassword"),
};
const RABBITMQ_URL = "amqp://rabbitmq:5672";

app.use(express.static(__dirname + "/static/Pages"));
app.use(express.static(__dirname + "/static/Logic"));
app.use(express.json());
app.use(
  expressWinston.logger({
    transports: [
      new transports.Console(),
      new transports.File({
        level: "warn",
        filename: "../log/logsWarningsM1.log",
      }),
      new transports.File({
        level: "error",
        filename: "../log/logsErrorsM1.log",
      }),
    ],
    format: format.combine(
      format.json(),
      format.timestamp(),
      format.prettyPrint()
    ),
    statusLevels: true,
  })
);

app.post("/", async (req, res) => {
  try {
    const param = req.body.num;
    const connection = await amqp.connect(RABBITMQ_URL, opt);
    const channel = await connection.createChannel();
    await channel.assertQueue("tasks");

    channel.sendToQueue("tasks", Buffer.from(param.toString()));
    const { content } = await channel.consume(
      "results",
      (msg) => {
        const result = msg.content.toString();
        console.log(result.toString());
        res.json(result.toString());
        connection.close();
      },
      { noAck: true }
    );
  } catch (err) {
    res.status(400).send(err);
  }
});

app.listen(port, () => {
  console.log(`Server run ${port}`);
});
