const express = require('express');
require('../db/mongoose');

const userRouter = require('./routers/user');
const blogRouter = require('./routers/blog');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/users',userRouter);
app.use('/blogs',blogRouter);

app.listen(port,console.log(`Server is running at port ${port}!!!`))