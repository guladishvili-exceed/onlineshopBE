'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('users', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement:true
			},
			username: {
				type:Sequelize.STRING
			},
			password: {
				type: Sequelize.STRING
			},
			nickname: {
				type: Sequelize.STRING
			},
			gender: {
				type: Sequelize.STRING
			},
			age: {
				type: Sequelize.STRING
			},
			picture: {
				type: Sequelize.STRING
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
