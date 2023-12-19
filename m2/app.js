const { connect } = require("amqplib");
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.json(),
    winston.format.timestamp(),
    winston.format.prettyPrint()
  ),
  defaultMeta: { service: "log-service" },
  transports: [
    new winston.transports.File({
      filename: "../log/logsErrorsM2.log",
      level: "error",
    }),
  ],
});

const opt = {
  credentials: require("amqplib").credentials.plain("rmuser", "rmpassword"),
};
const RABBITMQ_URL = "amqp://rabbitmq:5672";

connect(RABBITMQ_URL, opt)
  .then(async (connection) => {
    const channel = await connection.createChannel();

    await channel.assertQueue("tasks");

    await channel.assertQueue("results");

    channel.consume(
      "tasks",
      (msg) => {
        let param = msg.content.toString();

        setTimeout(() => {
          let result = "",
            c = 0;
          param = param.split("");
          while (param.length || c) {
            if (param[param.length - 1] === ".") {
              result = param[param.length - 1] + result;
              param.pop();
            }
            c += ~~param.pop() * 2;
            result = (c % 10) + result;
            c = c > 9;
          }

          channel.sendToQueue("results", Buffer.from(result.toString()));
        }, 5000);
      },
      { noAck: true }
    );
  })
  .catch((err) => {
    logger.log("error", { message: err });
  });
