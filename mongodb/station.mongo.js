const mongoose = require('./mongoose')
const moment = require('moment')

let stationschema = (function () {
	let Schema = mongoose.Schema({
		stationId: {type: String, required:[true, '站点不能为空']},
		name: String,
		address: Number,
		latitude: Number,
		longitude: Number,
		status: {type: Number, default: 0},
		deviceId: String,
		created: Number,
		connects: {type: Number, default: 0}
	})
	Schema.pre('save', function (next) {
		next()
	})
	return Schema
})()

let Stationmodel = mongoose.model('station', stationschema);

module.exports = {
	create (name, address, latitude, longitude, deviceId) {
		var stationId = '100' + moment().format('YYYYMMDDHHmmssSSS'),
			created = Date.now()
		let station = new Stationmodel({name, address, stationId, deviceId, created, latitude, longitude})
		return new Promise(function (resolve, reject) {
			station.save((err, data) => {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	updateOne (where, params) {
		return new Promise(function (resolve, reject) {
			Stationmodel.findOneAndUpdate(where, {$set: params}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	incOne (where, params) {
		return new Promise(function (resolve, reject) {
			Stationmodel.findOneAndUpdate(where, {$inc: params}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	remove (where) {
		return new Promise(function (resolve, reject) {
			Stationmodel.deleteOne(where, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getOne (where) {
		return new Promise(function (resolve, reject) {
			Stationmodel.findOne(where, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	}
}