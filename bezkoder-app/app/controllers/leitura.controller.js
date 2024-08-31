const db = require("../models");
//const { GoogleGenerativeAI } = require("@google/generative-ai");
const Leitura = db.leitura;
const Op = db.Sequelize.Op;

const axios = require('axios'); 

exports.create = (req, res) => {
  // Validate request
  if (!req.body.img || !req.body.user_code || !req.body.measure_date || !req.body.measure_type) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Post Image 


  const leitura = {
    img: req.body.img,
    user_code: req.body.user_code,
    measure_date: req.body.measure_date,
    measure_type: req.body.measure_type
  };

  // Save Tutorial in the database
  Leitura.create(leitura)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Tutorial."
      });
    });
};




  
  