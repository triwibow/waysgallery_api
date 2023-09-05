'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction.belongsToMany(models.User,{
        through:'TransactionUser',
        foreignKey:"transactionId",
        otherKey: "orderByUserId",
        as:'orderBy'
      })

      Transaction.belongsToMany(models.User,{
        through:'TransactionUser',
        foreignKey:"transactionId",
        otherKey:"orderToUserId",
        as:'orderTo'
      });
      
    }
  };
  Transaction.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY,
    price: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};