const pailRedis = require('../redis/pail.redis')
const oooantsApi = require('../api/oooants.api')
const pailMongo = require('../mongodb/pail.mongo')
const onenetApi = require('../api/onenet.api')
const moment = require('moment')
const pailevents = require('events')
const fs = require('fs')
let paileventsEmitter = new pailevents.EventEmitter();

let getCommandHeader = function (length, stationAddress, pailAddress, t, n, c) {
	var length = [length, 0]
		,controller = [0, 0, 0, 0]
		,devAddress = [stationAddress % 256, parseInt(stationAddress / 256), pailAddress % 256, parseInt(pailAddress / 256)]
		,webAddress = [0, 0, 0, 0]
		,type = [t]
		,msgNum = [n]
		,code = [c, 0]
		,pubAddress = [0, 0]
	return Buffer.from([0x68].concat(length, controller, devAddress, webAddress, type, msgNum, code, pubAddress));
}

let getOpenCommand = function (stationAddress, pailAddress, userId) {
	var header = getCommandHeader(18 + 38, stationAddress, pailAddress, 65, 1, 3)
	var msgAddress = [0, 0, 0, 0]
		,open = [01]
		,conMsg = [01]
		,value = [0, 0, 0, 0]
		,maxV = [0, 0, 0, 0]
		,maxI = [0, 0, 0, 0]
		,controlv = [0, 0, 0, 0]
	return Buffer.concat([header, Buffer.from([].concat(msgAddress, open, conMsg, value, maxV, maxI, controlv)), Buffer.from(userId)])
}

let getCloseCommand = function (stationAddress, pailAddress, userId) {
	console.log(userId)
	var header = getCommandHeader(18 + 38, stationAddress, pailAddress, 65, 1, 3)
	var msgAddress = [0, 0, 0, 0]
		,open = [00]
		,conMsg = [01]
		,value = [0, 0, 0, 0]
		,maxV = [0, 0, 0, 0]
		,maxI = [0, 0, 0, 0]
		,controlv = [0, 0, 0, 0]
	return Buffer.concat([header, Buffer.from([].concat(msgAddress, open, conMsg, value, maxV, maxI, controlv)), Buffer.from(userId)])
}

let pailInit = function (pailId) {
	return pailMongo.getOne({pailId}).then(pail => {
		if (pail) {
			var {pailId, name, address, stationId, stationAddress, latitude, longitude, deviceId, status} = pail
			pailRedis.setPail(pailId, {pailId, name, address, stationId, stationAddress, latitude, longitude, deviceId, status})
			return pail
		} else {
			return Promise.reject('该充电桩不存在')
		}
	})
}

function addPreZero(num, length){ return ('000000000'+num).slice(0 - length)}

exports = module.exports = {
	createPail (name, station) {
		return pailMongo.getPailCount({stationId: station.stationId}).then(count => {
			var address = station.address + 't01d' + (count + 1)
			console.log(station)
			return onenetApi.createDevice('pail' + address, name, ['pail'], {lat: station.latitude, lon: station.longitude}, address).then(deviceInfo => {
				return pailMongo.create({
					pailId: '200' + moment().format('YYYYMMDD') + addPreZero(station.address, 5) + addPreZero(address, 3)
					name,
					stationId: station.stationId,
					stationAddress: station.address,
					address: count + 1,
					deviceId: deviceInfo.device_id,
					latitude: station.latitude,
					longitude: station.longitude
				}).then(pail => {
					var {pailId, name, address, stationId, stationAddress, latitude, longitude, deviceId, status} = pail
					pailRedis.setPail(pailId, {pailId, name, address, stationId, stationAddress, latitude, longitude, deviceId, status})
					return pail
				})
			})
		})
	},
	remove (stationId) {
		return pailMongo.getPailAllList({stationId}).then(list => {
			if (list[0]) {
				console.log(list)
				return onenetApi.removeDevice(list[0].deviceId).then(data => {
					pailRedis.delPail(list[0].pailId)
					return pailMongo.remove({pailId: list[0].pailId})
				})
			}
			return Promise.reject('该站点没有充电桩')
		})
	},
	getPailListAll (params) {
		return pailMongo.getPailAllList(params)
	},
	getPailList (params, page, size) {

	},
	getPailListByStatus (pailId, params) {
		
	},
	openPail (pailId, userId) {
		return pailRedis.getPail(pailId).then(pail => {
			return (() => {
				if (pail) {
					return Promise.resolve(pail);
				} else {
					return pailInit(pailId)
				}
			})().then(pail => {
				if (pail.status == 4) {
					return Promise.reject('充电桩离线请稍后再试')
				} else if (pail.open) {
					return Promise.reject('充电桩正在开启中')
				} else if (pail.status == 1) {
					return Promise.reject('充电桩已开启')
				} else {
					var buf = getOpenCommand(pail.stationAddress, pail.address, userId)
					return onenetApi.sendCommand(pail.deviceId, buf).then(data => {
						return pailRedis.setPailOne(pailId, 'open', Date.now())
					})
				}
			})
		})
	},
	closePail (pailId, userId) {
		return pailRedis.getPail(pailId).then(pail => {
			return (() => {
				if (pail) {
					return Promise.resolve(pail);
				} else {
					return pailInit(pailId)
				}
			})().then(pail => {
				if (pail.status == 4) {
					return Promise.reject('充电桩离线请稍后再试')
				} else if (pail.close) {
					return Promise.reject('充电桩正在关闭中')
				} else if (pail.status == 1) {
					var buf = getOpenCommand(pail.stationAddress, pail.address, userId)
					return onenetApi.sendCommand(pail.deviceId, buf).then(data => {
						return pailRedis.setPailOne(pailId, 'close', Date.now())
					})
				} else {
					return Promise.reject('充电桩已关闭')
				}
			})
		})
	},
	openPailFail (pailId) {
		return pailRedis.getPail(pailId).then(pail => {
			if (pail.open) {
				pailRedis.delPailOne(pailId, 'open')
				paileventsEmitter.emit('openfail', pail)
			}
		})
	},
	closePailFail (pailId) {
		return pailRedis.getPail(pailId).then(pail => {
			if (pail.close) {
				pailRedis.delPailOne(pailId, 'open')
				paileventsEmitter.emit('closefail', pail)
			}
		})
	},
	getPailInfo (pailId) {
		return pailRedis.getPail(pailId).then(pail => {
			if (!pail) return pailInit(pailId)
			return pail 
		})
	},
	getPailInfoByDeviceId (deviceId) {
		return pailMongo.getOne({deviceId}).then(pail => {
			if (pail) {
				return pailRedis.getPail(pail.pailId).then(data => {
					if (data) {
						return data
					} else {
						var {pailId, name, address, stationId, stationAddress, latitude, longitude, deviceId, status} = pail
						pailRedis.setPail(pailId, {pailId, name, address, stationId, stationAddress, latitude, longitude, deviceId, status})
						return {pailId, name, address, stationId, stationAddress, latitude, longitude, deviceId, status}
					}
				})
			} else {
				return Promise.reject('不存在该充电桩')
			}
		})
	},
	setPailInfo (pailId, params) {
		for (var key in params) {
			if (params[key] != 0 && !params[key]) return Promise.reject(key + '不能为空')
		}
		return pailRedis.setPail(pailId, params)
	},
	setPailStatus (pailId, status) {
		console.log(pailId, status)
		return pailRedis.getPail(pailId).then(pail => {
			if (status == pail.status) {
				if (pail.status != 1 && pail.open) {
					if (Date.now() - Number(pail.open) > 15 * 1000) {
						pailRedis.delPailOne(pailId, 'open')
						paileventsEmitter.emit('openfail', pail)
					}
				} else if (pail.status == 1 && pail.close) {
					if (Date.now() - Number(pail.close) > 15 * 1000) {
						pailRedis.delPailOne(pailId, 'close')
						paileventsEmitter.emit('closefail', pail)
					}
				}
				return
			}
			return pailRedis.setPailStatus(pailId, status).then(() => {
				pail.status = status
				if (status == 4) {
					paileventsEmitter.emit('outline', pail)
				} else if (pail.open && status == 1) {
					pailRedis.delPailOne(pailId, 'open')
					paileventsEmitter.emit('opensuccess', pail)
				} else if (pail.close && status != 1) {
					pailRedis.delPailOne(pailId, 'close')
					paileventsEmitter.emit('closesuccess', pail)
				} else {
					paileventsEmitter.emit('changestatus', pail)
				}
				return pailMongo.updatePailByPailId(pailId, {status})
			})
		})
	},
	setPailConnectno (pailId, connectno) {
		return pailRedis.setPailOne(pailId, 'connectno', connectno)
	},
	delPailConnectno (pailId) {
		return pailRedis.delPailOne(pailId, 'connectno')
	},
	getPailConnectno (pailId, connectno) {
		return pailRedis.getPailOne(pailId, 'connectno').then(data => {
			if (!data) return Promise.reject('不存在关联')
			return data
		})
	},
	addPailEventListener(event, callback) {
		paileventsEmitter.on(event, callback)
	}
}