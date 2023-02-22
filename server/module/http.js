module.exports = (app, port, server) => {
  app.get("/", (req, res, next) => {
    return res.send("Server connected using port " + port);
  });

  app.post("/login", async (req, res, next) => {
    await server.on_login(req, res, next);
  });

  // // for testing data only
  // app.post("/save", async (req, res, next) => {
  //   const data = req.body;
  //   await redis.set(data.key, data.value);
  //   res.send(true);
  // });

  app.get("/load/:key", async (req, res, next) => {
    const key = req.params.key;
    if(key == "user_list") res.status(422).send("No auth")
    const value = await server.on_load(key);
    res.send(value);
  });


  // 错误处理函数
  app.use((error, req, res, next) => {
    console.log(error);
    res.status(error.statusCode).send({
      message: error.message,
    });
  });
};
