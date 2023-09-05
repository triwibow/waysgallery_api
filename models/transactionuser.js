'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TransactionUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  TransactionUser.init({
    transactionId: DataTypes.INTEGER,
    orderByUserId: DataTypes.INTEGER,
    orderToUserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'TransactionUser',
  });
  return TransactionUser;
};