const express = require('express');
const router = express.Router();
const userServer = require('../server/userServer')

router.get('/user/sendcode/sms', function (req, res) {
	var {phone} = req.query
	userServer.sendVCode(phone).then(data => {
		res.send({status: 200, msg: '验证码发送成功', data})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/user/login/byPhone', function (req, res) {
	var {phone, code} = req.query
	userServer.loginByPhone(phone, code).then(user => {
		res.send({status: 200, msg: '登入成功', data: user})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/user/info', function (req, res) {
	var {userId} = req.query
	userServer.getUserInfo(userId).then(user => {
		res.send({status: 200, msg: '用户信息', data: user})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/user/delete', function (req, res) {
	var {userId} = req.query
	userServer.removeUser(userId).then(data => {
		res.send({status: 200, msg: '删除成功', data})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/user/init', function (req, res) {
	var {userId} = req.query
	userServer.userInit(userId).then(data => {
		res.send({status: 200, msg: '用户初始化', data})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/user/list/all', function (req, res) {
	userServer.getUserListAll().then(list => {
		res.send({status: 200, msg: '用户列表', data: list})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

module.exports = router