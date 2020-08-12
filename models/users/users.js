const Sequelize = require('sequelize')
const db = require('../../config/database')

const Users = db.define("users",{
	username : {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			unique : true
		},
		type : Sequelize.STRING,
	} ,
	password : {
		type:Sequelize.STRING
	},
	nickname: {
		type: Sequelize.STRING
	},
	gender: {
		type:Sequelize.STRING
	},
	age: {
		type:Sequelize.STRING
	},
	picture: {
		type:Sequelize.STRING
	}
})

module.exports = Users;