module.exports = (sequelize, Sequelize) => {
    const Leitura = sequelize.define('leitura', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        leitura: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        img: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        user_code: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        measure_date: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        measure_confirmed: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        measure_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      }, {
        tableName: 'leitura',
        timestamps: true,
      });
  
    return Leitura;
  };
  