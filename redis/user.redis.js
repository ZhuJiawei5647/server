const {
	redis,
	client,
	userclient,
	select
} = require('./redis')

exports = module.exports = {
	get(userId) {
		return new Promise(function(resolve, reject) {
			userclient.hgetall('user' + userId, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	set(userId, params) {
		return new Promise(function(resolve, reject) {
			userclient.hmset('user' + userId, params, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	del(userId) {
		return new Promise(function(resolve, reject) {
			userclient.del('user' + userId, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	delOne(userId, key) {
		return new Promise(function (resolve, reject) {
			userclient.hdel('user' + userId, key, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	setOne(userId, key, value) {
		return new Promise(function (resolve, reject) {
			userclient.hset('user' + userId, key, value, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getOne(userId, key) {
		return new Promise(function (resolve, reject) {
			userclient.hget('user' + userId, key, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	setVCode(phone, vcode, time) {
		return new Promise(function(resolve, reject) {
			userclient.setex('vcode' + phone, time, vcode, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getVCode(phone) {
		return new Promise(function(resolve, reject) {
			userclient.get('vcode' + phone, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	}
}