const db = require("../models");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Leitura = db.leitura;
const Op = db.Sequelize.Op;

const axios = require('axios'); 



const geminiApiKey = process.env.GEMINI_API_KEY; 
const googleAI = new GoogleGenerativeAI(geminiApiKey);
const geminiConfig = {
  temperature: 0.4,
  topP: 1,
  topK: 32,
  maxOutputTokens: 4096,
};

const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-pro-vision",
  geminiConfig,
});

// Create and Save a new Reading
exports.create = async (req, res) => {
  if (!req.body.img || !req.body.user_code || !req.body.measure_date || !req.body.measure_type) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  try {
    
    const base64Data = req.body.img.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBase64 = base64Data; 

    
    const promptConfig = [
      { text: "Can you tell me about this image what's happening there?" },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      },
    ];

    
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: promptConfig }],
    });
    const response = await result.response;

    
    const apiData = response.text(); 

    const apiResponseAsInteger = parseInt(apiData, 10); 

    const leitura = {
      img: req.body.img,
      user_code: req.body.user_code,
      measure_date: req.body.measure_date,
      measure_type: req.body.measure_type,
      leitura: apiResponseAsInteger
    };

    const data = await Leitura.create(leitura);

    res.send(data);
  } catch (err) {
    console.error("Error occurred: ", err.response ? err.response.data : err.message);
    res.status(500).send({
      message: err.message || "Some error occurred while processing the request."
    });
  }
};


  
  