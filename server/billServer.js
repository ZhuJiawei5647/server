const billMongo = require('../mongodb/bill.mongo')

exports = module.exports = {
	createBill({
		billno,
		orderno,
		pailId,
		userId,
		userName,
		pailName,
		electric = 0,
		recharge = 0,
		refund = 0,
		cost = 0,
		type = 1,
		opentime = Date.now(),
		closetime = Date.now(),
		rechargetime = Date.now(),
		refundtime = Date.now(),
		closedesc
	}) {
		return new Promise((resolve, reject) => {
			resolve()
		})
	},
	closeBill(params) {
		return new Promise((resolve, reject) => {
			resolve()
		})
	}
}