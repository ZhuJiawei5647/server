const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const onenetRouter = require('./router/onenet.router')
const pailRouter = require('./router/pail.router')
const stationRouter = require('./router/station.router')
const userRouter = require('./router/user.router')
const connectRouter = require('./router/connect.router')
const wechatRouter = require('./router/wechat.router')
const http = require('http').createServer(app)

// app.use('/api', proxy)

// console.log(1)

app.use(function (req, res, next) {
	var data = req.query
	for (var key in data) {
		if (!data[key]) return res.send({status: 201, msg: '参数不能为空', data: null})
	}
	next()
})

app.use('/server', onenetRouter)
app.use('/server', pailRouter)
app.use('/server', stationRouter)
app.use('/server', userRouter)
app.use('/server', connectRouter)
app.use('/server', wechatRouter)


// app.use(router)

// console.log(2)

app.get('/', (req, res) => {
	res.send('Hello Word')
})

// app.listen(8089, () => console.log('port :: 8089'))

http.listen(8089, () => console.log('port :: 8080'));