"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Alamat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Checkout, { foreignKey: "productId" });
    }
  }
  Alamat.init(
    {
      checkoutsId: DataTypes.UUID,
      productId: DataTypes.UUID,
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      provinsi: DataTypes.STRING,
      kodepos: DataTypes.INTEGER,
      alamatLengkap: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Alamat",
    }
  );
  return Alamat;
};
