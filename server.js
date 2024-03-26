const express = require("express")
const path = require("path")
const PORT = 8000

const dotenv = require("dotenv")
dotenv.config()

const app = express()
var cors = require('cors');
app.use(cors());

const firebaseConfig = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTHDOMAIN,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID,
    appId: process.env.APPID,
};

app.get('/', (req, res) => {
    // res.send(firebaseConfig)
    res.json(firebaseConfig)
})

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})