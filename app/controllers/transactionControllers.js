const { Product } = require("../models");
const { Transaction } = require("../models");
const { Checkout } = require("../models");
const { Alamat } = require("../models");
const { user } = require("../models");
const { Op } = require("sequelize");
const { v4: uuid } = require("uuid");

module.exports = {
  async getAllTransactionData(req, res) {
    try {
      const checkoutData = await Checkout.findAll({
        include: [
          {
            model: Alamat,
            as: 'Alamats',
          },
          {
            model: Product,
            as: "Product",
            // where: {
            //   id: { [Op.col]: "Checkout.productId" },
            // },
            required: false,
          },
        ],
        order: [["createdAt", "DESC"]], // Menambahkan pengurutan berdasarkan createdAt secara menurun (data terbaru)
      });

      if (checkoutData.length === 0) {
        // jika transaksi tidak ada
        res.status(404).json({
          message: "No transaction data found",
          data: [],
        });
        return;
      }
//  // Sorting function
//  function sortByTypeCluster2First(a, b) {
//   if (a.Product && a.Product.typebarang === "cluster_2" && (!b.Product || b.Product.typebarang !== "cluster_2")) {
//     return -1;
//   } else if ((!a.Product || a.Product.typebarang !== "cluster_2") && b.Product && b.Product.typebarang === "cluster_2") {
//     return 1;
//   } else {
//     return 0;
//   }
// }

    // Sorting function
    function sortByTypeCluster(a, b) {
      const typeOrder = {
        "cluster_2": 0,
        "cluster_0": 1,
        "cluster_1": 2
      };

      const typeA = a.Product ? a.Product.typebarang : "";
      const typeB = b.Product ? b.Product.typebarang : "";

      return typeOrder[typeA] - typeOrder[typeB];
    }

    const formattedCheckoutData = checkoutData
  .sort(sortByTypeCluster)
  .map((checkout) => {
    const productPrice = checkout.Product ? checkout.Product.price : 0;
    const totalBarang = checkout.total_barang;
    const totalOngkir = checkout.hargaOngkir;
    const totalPrice = (productPrice * totalBarang) + totalOngkir;

    return {
      id: checkout.id,
      usersId: checkout.usersId,
      productId: checkout.productId,
      total_barang: checkout.total_barang,
      createdAt: checkout.createdAt,
      updatedAt: checkout.updatedAt,
      Product: checkout.Product,
      total_price: totalPrice,
      Alamats: checkout.Alamats,
    };
  });

    res.status(200).json({
      status: "Success",
      message: "Transaction data successfully obtained",
      data: formattedCheckoutData,
    });
    } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error,
    });
    }
    },
  async getDataTransactionById(req, res) {
    try {
      const usersId = req.user.id; // Menggunakan ID pengguna saat ini

      const transactions = await Transaction.findAll({
        where: {
          usersId,
        },
        include: [
          {
            model: Product,
            as: "products",
          },
          {
            model: Checkout,
            as: "checkouts",
          },
        ],
      });

      res.status(200).json({
        data: transactions,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  async getAllTransactionDataAdmin(req, res) {
    try {
      const checkoutData = await Checkout.findAll({
        include: [
          {
            model: Alamat,
          },
          {
            model: Product,
            as: "product",
            where: {
              id: { [Op.col]: "Checkout.productId" },
            },
            required: false,
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      if (checkoutData.length === 0) {
        res.status(404).json({
          message: "No transaction data found",
          data: [],
        });
        return;
      }

      const formattedCheckoutData = checkoutData.map((checkout) => {
        const productPrice = checkout.Product
          ? checkout.Product.price
          : 0;
        const totalBarang = checkout.total_barang;
        const totalOngkir = checkout.hargaOngkir;
        const totalPrice =
          (productPrice * totalBarang) + totalOngkir;

        return {
          id: checkout.id,
          usersId: checkout.usersId,
          productId: checkout.productId,
          total_barang: checkout.total_barang,
          createdAt: checkout.createdAt,
          updatedAt: checkout.updatedAt,
          Product: checkout.Product,
          total_price: totalPrice,
          Alamat: checkout.Alamat,
        };
      });

      res.status(200).json({
        status: "Success",
        message: "Transaction data successfully obtained",
        data: formattedCheckoutData,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error,
      });
    }
  },

  async updateDataTrans(req, res) {
    try {
      const idDataTrans = req.params.id;

      // Mengambil data user dari model User berdasarkan ID user
      const iduser = await user.findByPk(req.body.userId);

      // Mengambil data prpduct dari model Ticket berdasarkan ID prpduct
      const product = await Product.findByPk(req.body.productId);

      // Menghitung total amount berdasarkan price prpduct dan quantity
      const amount = product.price * req.body.quantity;

      // Membuat transaksi baru dengan data yang diambil
      const transaction = await Transaction.update(
        {
          id: uuid(),
          usersId: iduser.id,
          productId: ticket.id,
          amounts: amount,
          date: req.body.date,
          status: "Success",
        },
        {
          where: { id: idDataTrans },
        }
      );

      res.status(200).json({
        status: "Success",
        message: "Update Data Transaction Successfully",
        data: transaction,
      });
    } catch (error) {
      res.status(500).json({
        status: "Failed",
        message: error.message,
      });
    }
  },

  async deleteDataTrans(req, res) {
    try {
      const idDataTrans = req.params.id;
      Transaction.destroy({
        where: {
          id: idDataTrans,
        },
      })
        .then(() => {
          res.status(200).json({
            status: "Success",
            message: "Transaction Data deleted successfully",
          });
        })
        .catch((err) => {
          res.status(422).json(err);
        });
    } catch (error) {
      res.status(500).json({
        status: "Error",
        message: error.message,
      });
    }
  },

  async deleteAllDataTrans(req, res) {
    Transaction.destroy({ truncate: true })
      .then(() => {
        res.status(200).json({
          status: "Success",
          message: "Transaction Data deleted successfully",
        });
      })
      .catch((error) => {
        res.status(422).json(error);
      });
  },
};
