const express = require('express')
const app = express()
const fileUpload = require("express-fileupload")
require("dotenv").config()
const cors = require("cors")
const dbConnection = require('./db/db')
const userRouter = require('./router/user.router')
const blogRouter = require('./router/blog.router')
const errorHandlerMiddleware = require('./middleware/errorHandler.middleware')
const routeNotFound = require('./middleware/routeNotFound.middleware')
const authenticationMidleware = require('./middleware/authentication.middleware')
const helmet = require("helmet")
const PORT = process.env.PORT || 3000

const corsOptions = {
    origin: [
        'https://blog-api-frontend-pi.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With'
    ]
};

app.set("trust proxy", 1);
app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));
app.use((req, res, next) => {
    console.log('Request headers:', req.headers);
    console.log('Request method:', req.method);
    next();
  });
app.use(helmet())
app.use(fileUpload({ useTempFiles: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the Blog API.Wanna test apis? visit',
        fontend: 'https://blog-api-frontend-pi.vercel.app/'
    });
});

app.use("/api/v1/user", userRouter)
app.use("/api/v1/blogs", authenticationMidleware, blogRouter)

app.use(routeNotFound);
app.use(errorHandlerMiddleware);
async function start() {
    try {
        const db = await dbConnection(process.env.MONGO_URI)
        console.log(db.connection.name);
        console.log(db.connection.host);
        app.listen(PORT, () => {
            console.log(`Server is listening at port ${PORT}`);

        })


    } catch (error) {
        console.log(error);

    }
}

start()
