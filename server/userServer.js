const userRedis = require('../redis/user.redis')
const userMongo = require('../mongodb/user.mongo')
const verificApi = require('../api/verification.api')
const moment = require('moment')

let userInit = function (userId) {
	return userMongo.getUser(userId).then(user => {
		if (user) {
			var {userId, phone, name, loginType, imageUrl} = user
			if (!imageUrl) imageUrl = 'https://www.evnetworks.cn/image/36e26530b38f3e42d2dcfe1d56684fbf.jpeg'
			userRedis.set(userId, {userId, phone, name, loginType, imageUrl})
			return {userId, phone, name, loginType, imageUrl}
		}
		return Promise.reject('不存在该用户')
	})
}

exports = module.exports = {
	loginByPhone (phone, vcode) {
		return userRedis.getVCode(phone).then(code => {
			if (!code) {
				return Promise.reject('验证码过期')
			} else if (vcode == code) {
				return userMongo.getUserByPhone(phone).then(data => {
					if (data) {
						return data
					} else {
						return userMongo.createUser({
							userId: moment().format('YYYYMMDD') + phone.substr(phone.length - 4) + Math.random().toString().substr(2, 6),
							phone,
							account: phone,
							name: 'ph' + phone.substr(phone.length - 4) + Math.random().toString().substr(2, 6),
							loginType: 0
						}).then(user => {
							var {userId, phone, name, loginType, account, imageUrl} = user
							if (!imageUrl) imageUrl = 'https://www.evnetworks.cn/image/36e26530b38f3e42d2dcfe1d56684fbf.jpeg'
							userRedis.set(userId, {userId, phone, name, loginType, account, imageUrl})
							return {userId, phone, name, loginType, account, imageUrl}
						})
					}
				})
			} else {
				return Promise.reject('验证码错误')
			}
		})
	},
	sendVCode (phone) {
		var code = Math.random().toString().substr(2, 6)
		return verificApi.sendSMS(phone, code).then(data => {
			return userRedis.setVCode(phone, code, 80)
		})
	},
	getUserInfo (userId) {
		return userRedis.get(userId).then(user => {
			if (!user) {
				return userInit(userId)
			}
			return user
		})
	},
	removeUser (userId) {
		return userRedis.del(userId).then(data => {
			return userMongo.delUserOne({userId})
		})
	},
	userInit (userId) {
		return userInit(userId)
	},
	getUserListAll () {
		return userMongo.getUserListAll({})
	},
	setPailConnectno (userId, connectno) {
		return userRedis.setOne(userId, 'pailconnectno', connectno)
	},
	delPailConnectno (userId, connectno) {
		return userRedis.delOne(userId, 'pailconnectno')
	},
	getPailConnectno (userId, connectno) {
		return userRedis.getOne(userId, 'pailconnectno').then(data => {
			if (!data) return Promise.reject('不存在关联')
			return data
		})
	}
}