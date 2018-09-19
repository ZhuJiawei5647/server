const stationMongo = require('../mongodb/station.mongo')
const onenetApi = require('../api/onenet.api')

module.exports = {
	createStation(name, address, latitude, longitude) {
		return stationMongo.getOne({address}).then(station => {
			if (station) {
				return Promise.reject('改地址已存在')
			}
			return onenetApi.createDevice('station' + address, name, ['controller'], {lat: latitude, lon: longitude}, address).then(deviceInfo => {
				return stationMongo.create(name, address, latitude, longitude, deviceInfo.device_id)
			})
		})
	},
	getOneByStationId (stationId) {
		return stationMongo.getOne({stationId}).then(station => {
			if (!station) return Promise.reject('不存在该站点')
			return station
		})
	},
	getOneByDeviceId (deviceId) {
		return stationMongo.getOne({deviceId}).then(station => {
			if (!station) return Promise.reject('不存在该站点')
			return station
		})
	},
	removeByStationId (stationId) {
		return stationMongo.getOne({stationId}).then(station => {
			if (station) {
				if (station.connects) return Promise.reject('该站点还部署了'+station.connects+'台设备' )
				return onenetApi.removeDevice(station.deviceId).then(data => {
					return stationMongo.remove({stationId})
				})
			}
			return Promise.reject('不存在该站点')
		})
	},
	getOneByAddress (address) {
		return stationMongo.getOne({address}).then(station => {
			if (!station) return Promise.reject('不存在该站点')
			return station
		})
	},
	addDevice (stationId) {
		return stationMongo.incOne({stationId}, {connects: 1})
	},
	delDevice (stationId) {
		return stationMongo.incOne({stationId}, {connects: -1})
	},
	resetConnects (stationId) {
		return stationMongo.updateOne({stationId}, {connects: 0})
	},
	updateLocation (stationId, latitude, longitude) {
		return stationMongo.updateOne({stationId}, {latitude, longitude})
	},
	updateStatus (stationId, status) {
		return stationMongo.updateOne({stationId}, {status})
	}
}