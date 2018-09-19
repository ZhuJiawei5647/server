const express = require('express');
const router = express.Router();
const pailServer = require('../server/pailServer')
const stationServer = require('../server/stationServer')

router.get('/pail/create', function (req, res) {
	var {stationId, name} = req.query
	stationServer.getOneByStationId(stationId).then(station => {
		return pailServer.createPail(name, station).then(pail => {
			return stationServer.addDevice(stationId).then(data => {
				res.send({status: 200, msg: '创建桩成功', data: pail})
			})
		})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/pail/remove', function (req, res) {
	var {stationId} = req.query
	pailServer.remove(stationId).then(data => {
		return stationServer.delDevice(stationId).then(data => {
			res.send({status: 200, msg: '删除桩成功', data: null})
		})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/pail/list/all', function (req, res) {
	pailServer.getPailListAll(req.query).then(data => {
		res.send({status: 200, msg: 'ok', data})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/pail/info', function (req, res) {
	var {pailId} = req.query
	pailServer.getPailInfo(pailId).then(data => {
		res.send({status: 200, msg: 'ok', data})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/pail/open', function (req, res) {
	var {pailId, userId} = req.query
	pailServer.openPail(pailId, userId).then(data => {
		res.send({status: 200, msg: 'ok', data})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/pail/close', function (req, res) {
	var {pailId, userId} = req.query
	pailServer.closePail(pailId, userId).then(data => {
		res.send({status: 200, msg: 'ok', data})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

module.exports = router