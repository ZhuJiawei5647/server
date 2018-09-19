const express = require('express');
const router = express.Router();
const wechatServer = require('../server/wechatServer')

router.get('/wechat/getOpenid', function (req, res) {
	var {code} = req.query
	wechatServer.getOpenid(code).then(openid => {
		res.send({status: 200, msg: 'ok', data: openid})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})
module.exports = router