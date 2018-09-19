const express = require('express');
const router = express.Router();
const onenetApi = require('../api/onenet.api')
const pailServer = require('../server/pailServer')
const stationServer = require('../server/stationServer')
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

router.get('/onenet/connect', function (req, res) {
	var {msg, nonce, signature} = req.query
	onenetApi.checkSign(msg, nonce, signature).then(data => {
		if (data) {
			res.send(msg)
		} else {
			res.send(null)
		}
	})
})

router.post('/onenet/connect', function (req, res) {
	if (req.body.enc_msg) {
		onenetApi.getMsg(req.body.enc_msg).then(data => {
			if (data) {
				if (data.type == 1) {
					return pailServer.getPailInfoByDeviceId(data.dev_id).then(pail => {
						if (data.ds_id == 'ce') {
							console.log(data.value)
							return pailServer.setPailInfo(pail.pailId, data.value)
						} else if (data.ds_id == 'mai') {
							return pailServer.setPailInfo(pail.pailId, data.value)
						} else if (data.ds_id == 'xin') {
							var status = data.value
							if (status['error']) {
								return pailServer.setPailStatus(pail.pailId, 3)
							} else if (status['comm']) {
								if (status['charge']) {
									return pailServer.setPailStatus(pail.pailId, 1)
								} else if (status['bespeak']) {
									return pailServer.setPailStatus(pail.pailId, 6)
								} else if (status['cable']) {
									return pailServer.setPailStatus(pail.pailId, 5)
								} else {
									return pailServer.setPailStatus(pail.pailId, 2)
								}
							} else {
								return pailServer.setPailStatus(pail.pailId, 4)
							}
						}
					})
				} else if (data.type == 2) {
					if (data.status == 0) {
						return stationServer.getOneByDeviceId(data.dev_id).then(station => {
							return pailServer.getPailListAll({stationId: station.stationId}).then(pails => {
								for (var i = 0; i < pails.length; i++) {
									pailServer.setPailStatus(pails[i].pailId, 4)
								}
							})
						})
					}
				}
			}
		}).catch(err => {console.log('/onenet/connect', err)})
	}
    res.send({code: 200});
})

router.post('/onenet/pailopen', function (req, res) {
	console.log('pailopen')
	var datas = req.body.current_data
	for (var i = 0; i < datas.length; i++) {
		var pailopen = datas[i]
		if (!pailopen.value.success) {
			pailServer.getPailInfoByDeviceId(pailopen.dev_id).then(pail => {
				pailServer.openPailFail(pail.pailId)
			})
		}
		console.log(pailopen.value)
	}
	res.send({code: 200})
})

router.post('/onenet/pailclose', function (req, res) {
	console.log('pailclose')
	var datas = req.body.current_data
	for (var i = 0; i < datas.length; i++) {
		var pailclose = datas[i]
		if (!pailclose.value.success) {
			pailServer.getPailInfoByDeviceId(pailclose.dev_id).then(pail => {
				pailServer.closePailFail(pail.pailId)
			})
		}
		console.log(pailclose.value)
	}
	res.send({code: 200})
})

router.post('/onenet/xinchange', function (req, res) {
	console.log('xinchange')
	var datas = req.body.current_data
	for (var i = 0; i < datas.length; i++) {
		var xinchange = datas[i]
		console.log(xinchange.value)
	}
	res.send({code: 200})
})

router.post('/onenet/record', function (req, res) {
	console.log('record')
	var datas = req.body.current_data
	for (var i = 0; i < datas.length; i++) {
		var record = datas[i]
		console.log(record.value)
	}
	res.send({code: 200})
})

router.get('/onenet/test/device/create', function (req, res) {
	var {title} = req.query
	console.log(req.query)
	onenetApi.createDevice(title, title, ['device'], {lon: 109, lat: 23.45}, Math.random().toString().substr(2,10), other = {}).then(data => {
		res.send(data)
	}).catch(err => {
		res.send(err)
	})
})

router.get('/onenet/test/device/register', function (req, res) {
	onenetApi.registerDevice('546854687214585345487465487465487494456', 'test1').then(data => {
		res.send(data)
	}).catch(err => {
		res.send(err)
	})
})

module.exports = router