"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Transaction, { foreignKey: "checkoutsId" });
      this.hasMany(models.Transaction, { foreignKey: "usersId" });
      this.hasMany(models.Alamat, { foreignKey: "checkoutsId" });
      this.hasMany(models.Product, {
        foreignKey: "productId",
        as: "Product",
      });
      this.belongsTo(models.Checkout, {
        foreignKey: "usersId",
        as: "checkout",
      });
    }
  }
  Transaction.init(
    {
      usersId: DataTypes.UUID,
      productId: DataTypes.UUID,
      total_barang: DataTypes.INTEGER,
      hargaOngkir: DataTypes.INTEGER,
      total_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        get() {
          const productsCount = this.getDataValue("total_barang");
          const productPrice = this.Product
            ? this.Product.getDataValue("price")
            : 0;
          return productsCount * productPrice;
        },
      },
    },
    {
      sequelize,
      modelName: "Transaction",
    }
  );
  return Transaction;
};
