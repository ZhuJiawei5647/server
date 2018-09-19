const express = require('express');
const router = express.Router();
const stationServer = require('../server/stationServer')

router.get('/station/create', function (req, res) {
	var {name, address} = req.query
	stationServer.createStation(name, address, 30.23, 123.45).then(data => {
		res.send({status: 200, msg: '创建成功', data})
	}).catch(err => {
		console.log(err)
		res.send({status: 0, msg: 'error', data: err})
	})
})

router.get('/station/getByAddress', function (req, res) {
	var {address} = req.query
	stationServer.getOneByAddress(address).then(data => {
		res.send({status: 200, msg: 'ok', data})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/station/remove', function (req, res) {
	var {stationId} = req.query
	stationServer.removeByStationId(stationId).then(data => {
		res.send({status: 200, msg: '删除成功', data})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/station/connects/reset', function (req, res) {
	var {stationId} = req.query
	stationServer.resetConnects(stationId).then(data => {
		res.send({status: 200, msg: 'ok', data})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

module.exports = router