const { Product } = require("../models");
const { v4: uuid } = require("uuid");
const { Op } = require("sequelize");

module.exports = {
  async createproduct(req, res) {
    try {
      const {
        kodebarang,
        namabarang,
        image1,
        image2,
        image3,
        typebarang,
        deskripsibarang,
        stockbarang,
        satuanbarang,
        price,
      } = req.body;

      const productForm = await Product.create({
        id: uuid(),
        kodebarang: kodebarang,
        namabarang: namabarang,
        image: image1,
        image2: image2,
        image3: image3,
        typebarang: typebarang,
        deskripsibarang: deskripsibarang,
        stockbarang: stockbarang,
        satuanbarang: satuanbarang,
        price: price,
      });

      res.status(201).json({
        status: "Success",
        message: "Created Product Success",
        data: productForm,
      });
    } catch (error) {
      res.status(400).json({
        status: "Failed",
        message: error.message,
      });
    }
  },

  async getAllProductData(req, res) {
    const findAll = () => {
      return Product.findAll();
    };
    try {
      const dataProduct = await findAll();
      if (!dataProduct) {
        res.status(404).json({
          status: "Failed",
          message: "Data not found",
        });
      }
      res.status(200).json({
        status: "Success",
        message: "Get All Data User Success",
        data: dataProduct,
      });
    } catch (error) {
      res.status(500).json({
        status: "Error",
        message: error.message,
      });
    }
  },

  async getProductByName(req, res) {
    const namabarang = req.query.namabarang ? req.query.namabarang : "";
    

    const querySearch = {
      namabarang: {
        [Op.iLike]: `%${namabarang}`,
      },
    };
    const findAll = () => {
        return product.findAll({
          where: querySearch,
        });
      };
      try {
        const dataProduct = await findAll();
        if (!dataProduct) {
          res.status(404).json({
            status: "Failed",
            message: "Data not found",
            data: {},
          });
        }
        res.status(200).json({
          status: "Success",
          message: "Get Data Product Success",
          data: dataDestFav,
        });
      } catch (error) {
        res.status(500).json({
          status: "Error",
          message: error.message,
        });
      }
    },

  async getProductById(req, res) {
    try {
      const idProduct = req.params.id;
      const findProductId = () => {
        return Product.findOne({
          where: { id: idProduct },
        });
      };

      const dataProductId = await findProductId();

      if (!dataProductId) {
        res.status(404).json({
          status: "Failed",
          message: "Data not found",
        });
      }
      res.status(200).json({
        status: "Success",
        message: "Get Data Product Successfully",
        data: dataProductId,
      });
    } catch (error) {
      res.status(500).json({
        status: "Error",
        message: error.message,
      });
    }
  },

  async deleteProduct(req, res) {
    try {
      const idProduct = req.params.id;
      Product
        .destroy({
          where: { id: idProduct },
        })
        .then(() => {
          res.status(200).json({
            status: "Success",
            message: "Product Data deleted successfully",
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

  async updateProductData(req, res) {
    const idProduct = req.params.id;

    const findProductId = async () => {
      return await product.findOne({
        where: { id: idProduct },
      });
    };

    const dataproductsId = await findProductId();

    product
      .update(
        {
          image: req.body.image,
          image2: req.body.image2,
          image3: req.body.image3,
          stockbarang : req.body.stockbarang,
          deskripsibarang : req.body.deskripsibarang,
          price: req.body.price,
        },
        {
          where: { id: req.params.id },
        }
      )
      .then(() => {
        res.status(200).json({
          status: "Success",
          message: "Update Data Product Successfully",
        });
      })
      .catch((err) => {
        res.status(422).json(err);
      });
  },
};
