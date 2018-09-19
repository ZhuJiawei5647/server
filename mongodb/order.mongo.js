const mongoose = require('./mongoose')

let orderschema = (function () {
	let Schema = mongoose.Schema({
		orderno: String,
		payfrom: String,
		payto: String,
		recharge: Number,
		rechargetime: Number,
		rechargetype: String,
		msg: String
	})
	Schema.pre('save', function (next) {
		console.log('订单创建成功');
		next()
	})
	return Schema
})()

let Ordermodel = mongoose.model('order', orderschema);

exports = module.exports = {
	createOrder (params) {
		return new Promise((resolve, reject) => {
			Ordermodel.updateOne({no}, {$set: params}, {upsert: true}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getOrderAndDel (no) {
		return new Promise((resolve, reject) => {
			Ordermodel.findOneAndRemove({no}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getOrder (no) {
		return new Promise((resolve, reject) => {
			Ordermodel.findOne({no}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getOrderCount (where = {}) {
		return new Promise(function (resolve, reject) {
			Ordermodel.count(where, function (err, res) {
				if (err) {
					reject(err)
				} else {
					resolve(res)
				}
			})
		})
	},
	getOrderList ({page = 1, size = 10, where = {} }) {
		page = Number(page)
		size = Number(size)
		page--;
		page = Math.max(0, page)
		return new Promise((resolve, reject) => {
			Ordermodel.find(where, {}, {skip: page * size, limit: size, sort: {rechargetime: -1}}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	delOrder (no) {
		return new Promise(function (resolve, reject) {
			Ordermodel.findOneAndRemove({no}, function (err, res) {
				if (err) {
					reject(err)
				} else {
					resolve(res)
				}
			})
		})
	}
}