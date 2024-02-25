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
      this.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "Product",
      }); // Perbarui foreign key
      // this.hasMany(models.Ticket, {
      //   foreignKey: "ticketsId",
      // });
      this.belongsTo(models.Checkout, {
        foreignKey: "usersId",
        as: "checkout",
      });
    }
  }
  Transaction.init(
    {
      usersId: DataTypes.UUID,
      productsId: DataTypes.UUID,
      alamatId: DataTypes.UUID,
      checkoutsId: DataTypes.UUID,
      amounts: DataTypes.INTEGER,
      date: DataTypes.DATEONLY,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Transaction",
    }
  );
  return Transaction;
};
