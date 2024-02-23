const { Checkout } = require("../models");
const { Alamat } = require("../models");
const { Product } = require("../models");
const { user } = require("../models");
const { Notif } = require("../models");
const { v4: uuid } = require("uuid");
const { Op } = require("sequelize");

module.exports = {
  async createCheckout(req, res) {
    try {
      const {
        productId,
        total_barang,
        alamat,
        hargaOngkir,
      } = req.body;

      // Get the current authenticated user ID
      const usersId = req.user.id; // Ganti `req.user.id` dengan cara yang sesuai untuk mengakses ID pengguna saat ini

      // check if the provided productID exists in the Ticket Table
      const product = await Product.findOne({
        where: {
          id: productId,
        },
      });

      if (!product) {
        res.status(400).json({
          status: "Failed",
          message: "Invalid productID, Product does not exist",
        });
        return;
      }

      // Calculate the total price
      const totalOngkir = 70000
      const TotalPrice = (total_barang * product.price) + totalOngkir;
      
      // Create product checkout
      const checkout = await Checkout.create({
        id: uuid(),
        usersId: usersId,
        productId: productId,
        total_barang,
        hargaOngkir: totalOngkir,
        total_price: TotalPrice, 
      });

      // Create Alamat
      for (const alamatData of alamat) {
        await Alamat.create({
          id: uuid(),
          checkoutsId: checkout.id,
          productId: productId,
          name: alamatData.name,
          email: alamatData.email,
          phone: alamatData.phone,
          provinsi: alamatData.provinsi,
          kodepos: alamatData.Kodepos,
          alamatLengkap: alamatData.alamatLengkap,
        });
      }

      res.status(201).json({
        status: "Success",
        message: "Checkout created successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  async getAllCheckoutData(req, res) {
    try {
      const idUser = req.user.id; // Mengambil ID pengguna dari token
      const checkoutData = await Checkout.findAll({
        where: {
          usersId: idUser, // Menggunakan ID pengguna dalam kondisi WHERE
        },
        include: [
          {
            model: Alamat,
          },
          {
            model: Product,
            as: "Product",
            where: {
              id: { [Op.col]: "Checkout.productId" },
            },
          },
        ],
      });

      if (checkoutData.length === 0) {
        // jika transaction tidak ada
        res.status(404).json({
          message: "No Checkout data found",
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
          hargaOngkir: checkout.hargaOngkir,
          total_price: totalPrice,
          alamat: checkout.Alamat,
        };
      });

      res.status(200).json({
        status: "Success",
        message: "Checkout data retrieved successfully",
        data: formattedCheckoutData,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error,
      });
    }
  },
  async getDataCheckoutById(req, res) {
    try {
      const idCheckout = req.params.id; // Mengambil ID pengguna dari token
      const checkoutData = await Checkout.findAll({
        where: {
          id: idCheckout, // Menggunakan ID pengguna dalam kondisi WHERE
        },
        include: [
          {
            model: Alamat, // model alamat associate to checkout
          },
          {
            model: Product,
            as: "Product",
            where: {
              id: { [Op.col]: "Checkout.productId" },
            },
          },
        ],
      });

      if (checkoutData.length === 0) {
        // jika transaction tidak ada
        res.status(404).json({
          message: "No checkout data found",
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
            alamat: checkout.Alamat,
          };
        });

      res.status(200).json({
        message: "Checkout data by id retrieved successfully",
        data: formattedCheckoutData,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error,
      });
    }
  },
  async updateCheckoutData(req, res) {
    const idCheckout = req.params.id;

    const findDataCheckoutId = async () => {
      return await Checkout.findOne({
        where: {
          id: idCheckout,
        },
      });
    };

    Checkout.update({
      id: uuid(),
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      provinsi: req.body.provinsi,
      kodepos: req.body.Kodepos,
      alamatLengkap: req.body.alamatLengkap,
    })
      .then(() => {
        res.status(200).json({
          status: "Success",
          message: "Update Data Checkout Successfully",
        });
      })
      .catch((err) => {
        res.status(422).json(err);
      });
  },
  async deleteCheckout(req, res) {
    try {
      const idCheckout = req.params.id;
      Checkout.destroy({
        where: {
          id: idCheckout,
        },
      })
        .then(() => {
          res.status(200).json({
            status: "Success",
            message: "Checkout Data Deleted successfully",
          });
        })
        .catch((err) => {
          res.status(422).json(err);
        });
    } catch (error) {
      res.status(500).json({
        status: "Erro",
        message: error.message,
      });
    }
  },
  async deleteAllDataCheckout(req, res) {
    Checkout.destroy({ truncate: true })
      .then(() => {
        res.status(200).json({
          status: "Success",
          message: "Checkout Data deleted successfully",
        });
      })
      .catch((error) => {
        res.status(422).json(error);
      });
  },
};
