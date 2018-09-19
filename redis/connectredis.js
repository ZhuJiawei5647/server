const {
	connectclient
} = require('./redis')

module.exports = {
	set(connectno, params) {
		return new Promise((resolve, reject) => {
			connectclient.hmset(connectno, params, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	get(connectno) {
		return new Promise((resolve, reject) => {
			connectclient.hgetall(connectno, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	del(connectno) {
		return new Promise((resolve, reject) => {
			connectclient.del(connectno, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	setOne(connectno, key, value) {
		return new Promise((resolve, reject) => {
			connectclient.hset(connectno, key, value, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	delOne(connectno, key) {
		return new Promise((resolve, reject) => {
			connectclient.hdel(connectno, key, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	}
}