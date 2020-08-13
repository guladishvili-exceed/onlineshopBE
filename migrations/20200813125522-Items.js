'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.createTable('users', {
      itemid: {
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
      },
      authorid: {
        type:Sequelize.INTEGER,
        foreignKey:true,
        references: {
          model:"users",
          key:"id"
        }
      },
      itemname: {
        type:Sequelize.STRING
      },
      price: {
        type: Sequelize.STRING
      },
      author: {
        type: Sequelize.STRING
      },
      picture1: {
        type: Sequelize.String
      },
      picture2: {
        type: Sequelize.String
      },
      picture3: {
        type: Sequelize.String
      },
      picture4: {
        type: Sequelize.String
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });

  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
