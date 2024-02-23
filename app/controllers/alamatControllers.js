const { Alamat } = require("../models");

module.exports = {
  async deleteAllDataPass(req, res) {
    Alamat.destroy({ truncate: true })
      .then(() => {
        res.status(200).json({
          status: "Success",
          message: "Alamat Data deleted successfully",
        });
      })
      .catch((error) => {
        res.status(422).json(error);
      });
  },
};
