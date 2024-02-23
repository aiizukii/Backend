const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Admin } = require("../models");
const { v4: uuid } = require("uuid");
const nodemailer = require("nodemailer");
const { findEmail } = require("./emailVerification");
const salt = 10;

function encryptPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, (err, encryptedPassword) => {
      if (!!err) {
        reject(err);
        return;
      }
      resolve(encryptedPassword);
    });
  });
}

function checkPassword(encryptedPassword, password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, encryptedPassword, (err, isPasswordCorrect) => {
      if (!!err) {
        reject(err);
        return;
      }
      resolve(isPasswordCorrect);
    });
  });
}

function createToken(payload) {
  return jwt.sign(payload, process.env.JWT_SIGNATURE_KEY || "Rahasia");
}

module.exports = {
    async registerAdmin(req, res) {
        try {
          const password = await encryptPassword(req.body.password);
          const { name, email, phone, role } = req.body;
    
          // check email and password is not empty
          if (!email || !password) {
            return res.status(400).json({
              status: "error",
              message: "Email and password is required",
            });
          }
    
          // validator email format using regex
          const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
          if (!emailRegex.test(email)) {
            return res.status(400).json({
              status: "error",
              message: "Email format is invalid",
            });
          }
    
          // check if email already exist
          const emailAdmin = await findEmail(email);
          if (emailAdmin) {
            return res.status(400).json({
              status: "Error",
              message: "Email already Exist",
              data: {},
            });
          }
    
          const adminForm = await Admin.create({
            id: uuid(),
            name: name,
            password: password,
            email: email,
            phone: phone,
            image_profile:
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
            role: role,
          });
    
          res.status(201).json({
            status: "Success",
            message: "Verification Link Sent, please check email!",
            data: adminForm,
          });
        } catch (error) {
          res.status(400).json({
            status: "Failed",
            message: error.message,
          });
        }
      },
    
      async loginAdmin(req, res) {
        try {
          const email = req.body.email;
          const password = req.body.password;
    
          const adminLogin = await Admin.findOne({
            where: { email },
          });
    
          if (!adminLogin) {
            return res.status(400).json({
              status: "error",
              message: "Email not found",
            });
          }
    
          const isPasswordCorrect = await checkPassword(
            adminLogin.password,
            password
          );
    
          if (!isPasswordCorrect) {
            return res.status(401).json({
              status: "error",
              message: "Pasword salah!",
            });
          }
    
          const token = createToken({
            id: adminLogin.id,
            email: adminLogin.email,
            createdAt: adminLogin.createdAt,
            updatedAt: adminLogin.updatedAt,
          });
          res.status(201).json({
            status: "Success",
            token: token,
            name: adminLogin.name,
            createdAt: adminLogin.createdAt,
            updatedAt: adminLogin.updatedAt,
          });
        } catch (error) {
          res.status(500).json({
            status: "error",
            message: "Login Failed",
            error: error.message,
          });
        }
      },
      async whoAmI(req, res) {
        res.status(200).json(req.admin);
      },
      async authorizeAdmin(req, res, next) {
        try {
          const bearerToken = req.headers.authorization;
          const token = bearerToken.split("Bearer ")[1];
          const tokenPayload = jwt.verify(
            token,
            process.env.JWT_SIGNATURE_KEY || "Rahasia"
          );
          const admin = await Admin.findByPk(tokenPayload.id);

          if (admin.role = !'SuperAdmin') {
              return res.status(401).json({
                  message: "Unauthorized",
              })
          }

          req.Admin = admin;
          next();
      } catch (err) {
          console.error(err);
          res.status(401).json({
              message: "Unauthorized",
          });
      }
  },

  async getAllAdminData(req, res) {
    const findAll = () => {
      return Admin.findAll();
    };
    try {
      const dataAdmins = await findAll();
      if (!dataAdmins) {
        res.status(404).json({
          status: "Failed",
          message: "Data not found",
        });
      }
      res.status(200).json({
        status: "Success",
        message: "Get All Data Admin Success",
        data: dataAdmins,
      });
    } catch (error) {
      res.status(500).json({
        status: "Error",
        message: error.message,
      });
    }
  },

  async getAdminById(req, res) {
    try {
      const idAdmin = req.params.id;
      const findAdminId = () => {
        return Admin.findOne({
          where: { id: idAdmin },
        });
      };

      const dataAdminsId = await findAdminId();

      if (!dataAdminsId) {
        res.status(404).json({
          status: "Failed",
          message: "Admin not found",
        });
      }
      res.status(200).json({
        status: "Success",
        message: "Get Data Admin Successfully",
        data: dataAdminsId,
      });
    } catch (error) {
      res.status(500).json({
        status: "Error",
        message: error.message,
      });
    }
  },

  async updateAdminData(req, res) {
    const idAdmin = req.params.id;

    const findAdminId = async () => {
      return await Admin.findOne({
        where: { id: idAdmin },
      });
    };

    const dataAdminsId = await findAdminId();

    Admin.update(
        {
          name: req.body.name,
          phone: req.body.phone,
          email: req.body.email,
        },
        {
          where: { id: req.params.id },
        }
      )
      .then(() => {
        res.status(200).json({
          status: "Success",
          message: "Update Data Admin Successfully",
        });
      })
      .catch((err) => {
        res.status(422).json(err);
      });
  },

  async deleteAdmin(req, res) {
    try {
      const idAdmin = req.params.id;
      Admin
        .destroy({
          where: { id: idAdmin },
        })
        .then(() => {
          res.status(200).json({
            status: "Success",
            message: "Admin Data deleted successfully",
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
    
}