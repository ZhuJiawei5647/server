const connectredis = require('../redis/connectredis')
const crypto = require('crypto');

exports = module.exports = {
	createConnect (userId, hardId, hardtype, params = {}) {
		var hardExit = hardtype.indexOf(['pail'])
		if (userId && hardId && hardExit != -1) {
			var connectno = crypto.createHash('md5').update(userId+hardId+hardtype).digest('hex')
				,params = Object.assign({}, params, {
					connectno,
					userId,
					hardId,
					hardtype,
					status: 0,
					isrecharge: 0
				})
			return connectredis.set(connectno, params).then(data => params)
		} else if (hardtype == -1) {
			return Promise.reject('不存在该产品')
		} else {
			return Promise.reject('参数不能为空')
		}
	},
	getConnect (connectno) {
		return connectredis.get(connectno).then(data => {
			if (data) {
				return data
			} else {
				return Promise.reject('不存在关联')
			}
		})
	},
	removeConnect (connectno) {
		return connectredis.del(connectno).then(data => {
			return data
		})
	},
	setOutline (connectno) {
		return connectredis.setOne(connectno, 'outline', Date.now())
	},
	delOutline (connectno) {
		return connectredis.delOne(connectno, 'outline')
	},
	pailOpen(connectno) {
		return connectredis.setOne(connectno, 'status', 2)
	},
	pailClose(connectno) {
		return connectredis.setOne(connectno, 'status', 3)
	},
	pailOpenSuccess(connectno, isSuccess) {
		if (isSuccess) {
			return connectredis.set(connectno, {
				status: 1,
				opentime: Date.now()
			})
		} else {
			return connectredis.setOne(connectno, 'status', 0)
		}
	},
	pailCloseSuccess(connectno, isSuccess) {
		if (isSuccess) {
			return connectredis.setOne(connectno, {
				status: 0,
				closetime: Date.now()
			})
		} else {
			return connectredis.setOne(connectno, 'status', 1)
		}
	},
	rechargeSuccess(connectno, orderno, recharge) {
		return connectredis.set(connectno, {
			isrecharge: 1,
			orderno,
			recharge,
			rechargetime: Date.now()
		})
	},
	createBillSuccess(connectno) {
		return connectredis.setOne(connectno, 'isrecharge', 0)
	}
}