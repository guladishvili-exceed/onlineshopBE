const express = require('express')
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const path = require('path')

const {
	GraphQLID,
	GraphQLString,
	GraphQLList,
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLNonNull
} = require('graphql')

const bodyParser = require('body-parser')
const cors = require('cors')

const bcrypt = require('bcrypt')
const exphbs = require('express-handlebars')
const multer = require('multer')
const jwt = require('jsonwebtoken')

const Users = require('./models/users/users')
const Items = require('./models/items/items')


//GraphQL
const UserType = new GraphQLObjectType({
	name: "Users",
	fields: {
		username: {type: GraphQLString},
		id: {type: GraphQLID},
		password: {type: GraphQLString},
		nickname: {type: GraphQLString},
		gender: {type: GraphQLString},
		age: {type: GraphQLString},
		picture: {type:GraphQLString}
	}
})

const schema = new GraphQLSchema({
	query: new GraphQLObjectType({
		name: "Query",
		fields: {
			people: {
				type: GraphQLList(UserType),
				resolve:(root,args,context,info) => {
					return Users.find().exec()
				}
			},
		}
	})
})

//Create an express server and GraphQL endpoint
const app = express()
app.engine('handlebars', exphbs({defaultLayout: "main"}))
app.set('view engine', 'handlebars')
app.use("/graphql",graphqlHTTP({
	schema: schema,
	graphiql: true,
}))
app.use('/uploads', express.static('uploads'))
app.use('/itemPhotos',express.static('itemPhotos'))
app.use(bodyParser.json())
app.use(cors())

const pfpstorage = multer.diskStorage({
	destination: "./uploads",
	filename: (req,file,cb) => {
		cb(null,file.fieldname + "-" + Date.now() + ".jpeg" + path.extname(file.originalname))
}
})

const itemPhotosStorage = multer.diskStorage({
	destination: './itemPhotos',
	filename: (req,file,cb) => {
		cb(null,file.fieldname + "-" + Date.now() + ".jpeg" + path.extname(file.originalname))
	}
})

// Init upload

const pfpupload = multer({
	storage: pfpstorage,
	fileFilter: (req,file,cb) => {
		checkFileType(file,cb)
	}
}).single('avatar')

const itemPhotosUpload = multer({
	storage: itemPhotosStorage,
	fileFilter: (req,file,cb) => {
		checkFileType(file,cb)
	}
}).single('item')



// Check file type

const checkFileType = (file,cb) => {
	//Allowed extensions
	const fileTypes = /jpeg|jpg|png|gif/;
	//Check extensions
	const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
	//Check mimeType
	const mimeType = fileTypes.test(file.mimetype)

	if (mimeType && extname) {
		return cb(null,true);
	} else {
		return cb("Error:Images Only")
	}
}


//Database 
const db = require('./config/database')

//Test connection
db.authenticate().then(() => {
	console.log('database connected')
})
.catch((err) => {
	console.log('--------err', err);
})


//Add user
app.post('/addUser', async (req, res) => {
	const usernameExist = await Users.findOne({
		where: {
			username: req.body.username
		}
	})
	if (usernameExist) {
		return res.status(400).send("Email already exist");
	}
	//Hash password
	const salt = await bcrypt.genSalt(10);
	const hashPassword = await bcrypt.hash(req.body.password, salt);
	// - - - - - - - - - - - - -
	try {
		const addUser =await Users.create({
			username: req.body.username,
			password: hashPassword,
			gender: req.body.gender,
			picture: `default.jpg`
		})
		res.status(200).send(addUser)
	} catch (err) {
		res.status(404).send(err)
	}

})


//Log in

app.post('/logIn/:username', async (req, res) => {
	//Check is username is valid
	const user = await Users.findOne({where: {username: req.body.username}})
	//Username is not valid
	if (!user) {
		return res.status(400).send('Invalid username')
	}
	//Password validation
	const validPass = await bcrypt.compare(req.body.password, user.password)
	//Password is not valid
	if (!validPass) {
		return res.status(400).send('Invalid password')
	}
	//Create and assign token
	const token = jwt.sign({user}, "secretKey",{expiresIn: "24h"})
	res.header("auth-token", token).send(token)

})

//Get All Users
app.get('/getUsers', (req, res) => {

	Users.findAll({})
		.then((users) => {
			res.send(users)
		})
		.catch((err) => {
			console.log('--------err', err);
		})
})

//Update user info
app.put('/updateUser/:id',(req,res)=>{
	Users.update({
		nickname: req.body.nickname,
		age: req.body.age,
		gender: req.body.gender
	},
		{
			where: {
				id : req.params.id
			}
		})
		.then((user)=>{
			res.send(user)
		})
		.catch((err)=>{
			console.log('--------err', err);
		})
})

//Confirm image upload for PFP
app.post(`/upload/:id`,(req,res)=>{
	pfpupload(req,res,(err)=>{
		if(err) {
			console.log('--------err', err);
		} else {
			if (req.file === undefined) {
				res.json({
					msg: "Error:No file selected"
				})
			} else {
				Users.update({
					picture: req.file.filename
				},
					{
						where: {
							id: req.params.id
						}
					})
				res.json({
					msg: "File uploaded",
					file: `upload/${req.file.filename}`
				})
			}
		}
	})
})

// - - - - - - - -

//Items Section

//Create new item to sell
app.post('/additem/:id',(req,res)=>{
	Items.create({
		itemname: req.body.itemname,
		author: req.body.author,
		authorid: req.params.id,
		price: req.body.price,
	})
		.then((result) => {
			res.send(result)
		})
		.catch((err)=>{
			console.log('--------err', err);
		})
})

//Upload item picture
app.post(`/itemPhotos/:id`,(req,res)=>{
	itemPhotosUpload(req,res,(err)=>{
		if (err) {
			console.log('--------err', err);
		} else {
			if (req.file === undefined) {
				res.json ({
					msg: "Error: No file selected "
				})
			} else {
				Items.update({
					picture1: req.file.filename,
					picture2: req.file.filename,
					picture3: req.file.filename,
					picture4: req.file.filename,
				},
					{
						where : {
							itemid : req.params.id
						}
					})
				res.json({
					msg: "File uploaded",
					file: `itemPhotos/${req.file.filename}`
				})
			}
		}
	})
})


app.listen(4001, () => {
	console.log('Server is up')
})