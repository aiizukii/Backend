'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Product.init({
    kodebarang: DataTypes.STRING,
    namabarang: DataTypes.STRING,
    image: DataTypes.STRING,
    image2: DataTypes.STRING,
    image3: DataTypes.STRING,
    typebarang: DataTypes.STRING,
    deskripsibarang: DataTypes.STRING,
    stockbarang: DataTypes.INTEGER,
    satuanbarang: DataTypes.STRING,
    price: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};