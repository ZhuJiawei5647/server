const mongoose = require('./mongoose')

let billschema = (function () {
	let Schema = mongoose.Schema({
		billno: String,
		orderno: String,
		pailId: String,
		userId: String,
		userName: String,
		pailName: String,
		electric: Number,
		recharge: Number,
		refund: Number,
		cost: Number,
		type: Number,
		opentime: Number,
		closetime: Number,
		rechargetime: Number,
		refundtime: Number,
		closedesc: Number,
		status: {type: Number, default: 1}
	})
	Schema.pre('save', function (next) {
		console.log('账单创建成功')
		next()
	})
	return Schema
})()

let Billmodel = mongoose.model('bill', billschema);

exports = module.exports = {
	create (params) {
		return new Promise((resolve, reject) => {
			Billmodel.updateOne({no}, {$set: params}, {upsert: true}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getList ({page = 1, size = 10, where = {}}) {
		page = Number(page)
		size = Number(size)
		page--;
		page = Math.max(0, page)
		return new Promise(function (resolve, reject) {
			Billmodel.find(where, {}, {skip: page * size, limit: size, sort: {rechargetime: -1}}, function (err, res) {
				if (err) {
					reject(err)
				} else {
					resolve(res)
				}
			})
		})
	},
	getCount (where = {}) {
		return new Promise(function (resolve, reject) {
			Billmodel.count(where, function (err, res) {
				if (err) {
					reject(err)
				} else {
					resolve(res)
				}
			})
		})
	},
	getListByPhone ({page = 1, size = 10, phone}) {
		page = Number(page)
		size = Number(size)
		page--;
		page = Math.max(0, page)
		return new Promise(function (resolve, reject) {
			Billmodel.find({phone}, {}, {skip: page * size, limit: size, sort: {rechargetime: -1}}, function (err, res) {
				if (err) {
					reject(err)
				} else {
					resolve(res)
				}
			})
		})
	},
	getBillByNo (no) {
		return new Promise (function (resolve, reject) {
			Billmodel.findOne({no}, function (err, res) {
				if (err) {
					reject(err)
				} else {
					resolve(res)
				}
			})
		})
	},
	updateBillByNo (orderno, data) {
		return new Promise((resolve, reject) => {
			Billmodel.findOneAndUpdate({no}, {$set: data}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	}
}