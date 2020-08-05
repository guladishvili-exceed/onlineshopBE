const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const bcrypt = require('bcrypt')
const exphbs = require('express-handlebars')
const multer = require('multer')
const jwt = require('jsonwebtoken')


const Users = require('./models/users/users')



const app = express()
app.engine('handlebars', exphbs({defaultLayout: "main"}))
app.set('view engine', 'handlebars')
app.use(bodyParser.json())
app.use(cors())

const storage = multer.diskStorage({
	destination: "./uploads",
	filename: (req,file,cb) => {
		cb(null,file.fieldname + "-" + Date.now() + ".jpeg" + path.extname(file.originalname))
}
})

// Init upload

const upload = multer({
	storage: storage,
	fileFilter: (req,file,cb) => {
		checkFileType(file,cb)
	}
}).single('avatar')



// Check file type

const checkFileType = (file,cb) => {
	//Allowed extensions
	const fileTypes = /jpeg|jpg|png/;
	//Check extensions
	const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
	//Check mimeType
	const mimeType = fileTypes.test(file.mimeType)

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
			gender: req.body.gender
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


app.listen(4001, () => {
	console.log('Server is up')
})