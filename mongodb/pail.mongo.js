const mongoose = require('./mongoose')

let pailschema = (function () {
	let Schema = mongoose.Schema({
		pailId: {
			type: String,
			required: [true, '桩编号不能为空']
		},
		name: {
			type: String,
			required: [true, '桩名字不能为空']
		},
		stationId: {
			type: String,
			required: [true, '站点ID不能为空']
		},
		stationAddress: {
			type: String,
			required: [true, '站点地址不能为空']
		},
		address: {
			type: String,
			required: [true, '桩地址不能为空']
		},
		latitude: Number,
		longitude: Number,
		deviceId: {
			type: String,
			required: [true, '设备ID不能为空']
		},
		status: {
			type: Number,
			default: 0
		},
		created: Number
	})
	Schema.pre('save', function (next) {
		console.log('桩创建成功：', this.name)
		next()
	})

	return Schema
})()

let Pailmodel = mongoose.model('pail', pailschema);
exports = module.exports = {
	create (params) {
		let pail = new Pailmodel(params)
		return new Promise(function (resolve, reject) {
			pail.save((err, pail) => {
				if (err) {
					reject(err)
				} else {
					resolve(pail)
				}
			})
		})
	},
	getOne (where) {
		return new Promise((resolve, reject) => {
			Pailmodel.findOne(where, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getPailAllList(where) {
		return new Promise((resolve, reject) => {
			Pailmodel.find(where, {}, {sort: {address: -1}}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getPailByPailId (pailId) {
		return new Promise(function (resolve, reject) {
			Pailmodel.findOne({pailId}, {_id: 0, pailId: 1, cardNo: 1, cardId: 1, pass: 1}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data ? data._doc : null)
				}
			})
		})
	},
	getPailCount (where) {
		return new Promise(function (resolve, reject) {
			Pailmodel.countDocuments(where, function (err, res) {
				if (err) {
					reject(err)
				} else {
					resolve(res)
				}
			})
		})
	},
	updatePailById(_id, update) {
		return new Promise(function (resolve, reject) {
			Pailmodel.findByIdAndUpdate(_id, {$set: update}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	updatePailByPailId(pailId, update) {
		return new Promise(function (resolve, reject) {
			Pailmodel.updateOne({pailId}, {$set: update}, {multi: true}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	remove(where) {
		return new Promise(function (resolve, reject) {
			Pailmodel.deleteOne(where, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	removePailByPailId (pailId) {
		return new Promise(function (resolve, reject) {
			Pailmodel.removeOne({pailId}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	removePailById (_id) {
		console.log(_id)
		return new Promise(function (resolve, reject) {
			Pailmodel.findByIdAndRemove(_id, function (err, data) {
				if (err) {
					console.log(err)
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	}
}