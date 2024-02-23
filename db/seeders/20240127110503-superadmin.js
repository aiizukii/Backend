'use strict';
const { v4: uuid } = require("uuid");
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash('superadmin', salt);

    await queryInterface.bulkInsert('Admins', [{
      id: uuid(),
      name: 'Super Admin',
      email: 'superadmin@mail.com',
      password: hashPassword,
      image_profile: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
      role: 'SuperAdmin',
      createdAt: new Date(),
      updatedAt: new Date()
    }])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Admins', null, {});
  }
};
