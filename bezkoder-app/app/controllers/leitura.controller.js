const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const fs = require('fs');
const path = require('path');
const baseImagePath = '/bezkoder-app/app/uploads';
const baseImageUrl = 'http://localhost:' + process.env.NODE_LOCAL_PORT + '/uploads' 
globalThis.fetch = fetch;
globalThis.Headers = Headers; //Header global no projeto para utilizar a api do gemini

const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require("../models");
//const { INTEGER } = require("sequelize");
const Leitura = db.leitura;
//const Op = db.Sequelize.Op;
const { Op } = db.Sequelize;

exports.create = async (req, res) => {
  // Verifica se todas as informações necessárias estão presentes
  if (!req.body.image || !req.body.user_code || !req.body.measure_date || !req.body.measure_type) {
    return res.status(400).send({
      error_code: "INVALID_DATA",
      error_description: "Os dados fornecidos no corpo da requisição são inválidos"
      });
  }

  //Verfiicar se já existe algum registro do mesmo tipo no mês vigente
  try {
    // Obtém o mês e o ano atuais
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() retorna o mês de 0 (Janeiro) a 11 (Dezembro)

    // Consulta o banco de dados para verificar se há registros no mês atual
    const result = await Leitura.findOne({
      where: {
        measure_date: {
          [Op.between]: [
            new Date(currentYear, currentMonth - 1, 1), // Primeiro dia do mês atual
            new Date(currentYear, currentMonth, 0) // Último dia do mês atual
          ]
        },
        measure_type: req.body.measure_type
      }
    });

    // Verifica se algum registro foi encontrado
    if (result) {
      res.status(409).send({
        error_code: "DOUBLE_REPORT",
        error_description: "Leitura do mês já realizada"
        });
    } 
  }catch (err) {
    console.error("Error occurred:", err.message);
    res.status(500).send({
      message: err.message || "Some error occurred while processing the request."
    });
  }

  

  try {
    // Configuração do modelo
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Codifica a imagem base64
    const base64Image = req.body.image.replace(/^data:image\/[a-z]+;base64,/, '');

    // Definir o caminho e nome do arquivo para salvar a imagem
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const imagePath = path.join(uploadsDir, `${Date.now()}.jpeg`);
    const relativePath = path.relative(baseImagePath, imagePath);

    const imageUrl = `${baseImageUrl}/${relativePath}`;
    
    // Salva a imagem no servidor
    fs.writeFileSync(imagePath, base64Image, 'base64');

    // Configuração do prompt com imagem
    const promptConfig = [
      { text: "what is the reading in the meter. I want just the complete number so I can convert it to integer" },
      {
        inlineData: {
          mimeType: "image/jpeg", // Usar o tipo MIME correto
          data: base64Image,
        },
      },
    ];

    // Envio do prompt
    const result = await model.generateContent({
      contents: [{ role: "user", parts: promptConfig }],
    });

    
    const responseText = await result.response.text();

    const leitura = {
      img: imagePath, 
      user_code: req.body.user_code,
      measure_date: req.body.measure_date,
      measure_type: req.body.measure_type,
      leitura: parseInt(responseText, 10)
    };

    const data = await Leitura.create(leitura);

    const responseData = {
      image_url: imageUrl,
      measure_value: data.leitura,
      measure_uuid: data.id
    }

    data.img = imageUrl;

    res.send(responseData);
  } catch (err) {
    console.error("Error occurred:", err.message);
    res.status(500).send({
      message: err.message || "Some error occurred while processing the request."
    });
  }
};



exports.get = async (req, res) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = "Write a story about a magic backpack.";

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
}







  
  