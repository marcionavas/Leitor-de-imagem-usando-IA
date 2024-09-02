module.exports = app => {
    const leitura = require("../controllers/leitura.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Reading
    router.post("/", leitura.create);

    router.get("/test", leitura.get);
  
   
  
    app.use("/api/leituras", router);
  };
  