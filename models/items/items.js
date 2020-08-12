const Sequelize = require('sequelize')
const Users = require('../users/users')
const db = require('../../config/database')

const Items = db.define('items',{
	itemid : {
		type: Sequelize.INTEGER,
		primaryKey:true,
		autoIncrement: true,
		unique : true
	},
	authorid : {
		type: Sequelize.INTEGER,
		foreignKey : {
			references : Users.id
		}
	},
	itemname : {
		type: Sequelize.STRING
	},
	author : {
		type: Sequelize.STRING
	},
	picture1: {
		type : Sequelize.STRING
	},
	picture2: {
		type : Sequelize.STRING
	},
	picture3: {
		type : Sequelize.STRING
	},
	picture4: {
		type : Sequelize.STRING
	},
})

module.exports = Items;