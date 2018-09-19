const wechatApi = require('../api/wechat.api.js')
const orderMongo = require('../mongodb/order.mongo.js')
const orderRedis = require('../redis/order.redis.js')
const ejs = require('ejs');
const mch_key = "LHCD54YLW9LJ8SY5X6GS0ZJSW906mFc3";

exports = module.exports = {
	createOrder(orderno, recharge, rechargetype, contents) {
		return orderRedis.setOrder(orderno, Object.assign({
			orderno,
			recharge,
			rechargetype
		}, contents))
	},
	getOrder(orderno) {
		return orderRedis.getOrder(orderno)
	},
	createPayRecord(orderno, payfrom, payto, recharge, rechargetype, msg) {
		orderMongo.createOrder({
			orderno,
			payfrom,
			payto,
			recharge,
			rechargetime: Date.now(),
			rechargetype,
			msg
		})
	},
	getPayRecord(orderno) {
		return orderMongo.getOrder(orderno).then(data => {
			if (!data) return Promise.reject('订单不存在')
			return data
		})
	}
}