const {
	pailclient
} = require('./redis')

exports = module.exports = {
	setPail(pailId, params) {
		console.log('setpail')
		return new Promise(function(resolve, reject) {
			pailclient.hmset('pail' + pailId, params, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getPail(pailId) {
		return new Promise(function(resolve, reject) {
			pailclient.hgetall('pail' + pailId, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	delPailOne(pailId, key) {
		return new Promise(function (resolve, reject) {
			pailclient.hdel('pail' + pailId, key, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getPailStatus(pailId) {
		return new Promise(function (resolve, reject) {
			pailclient.hget('pail' + pailId, 'status', function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	setPailStatus(pailId, status) {
		return new Promise(function(resolve, reject) {
			pailclient.hset('pail' + pailId, 'status', status, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})

		})
	},
	setPailOne(pailId, key, value) {
		return new Promise(function (resolve, reject) {
			pailclient.hset('pail' + pailId, key, value, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getPailOne(pailId, key) {
		return new Promise(function (resolve, reject) {
			pailclient.hget('pail' + pailId, key, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	delPail(pailId) {
		return new Promise(function(resolve, reject) {
			pailclient.del('pail' + pailId, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getKeys() {
		return new Promise(function(resolve, reject) {
			pailclient.keys('pail*', function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	}
}