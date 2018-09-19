const {
	redis,
	client,
	orderclient,
	select
} = require('./redis')

exports = module.exports = {
	setOrder(no, params, type) {
		console.log('setOrder')
		var value = JSON.stringify(params)
		console.log(value)
		return new Promise(function(resolve, reject) {
			orderclient.setex(type + no, 10 * 60 * 1000, value, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getOrder(no, type) {
		return new Promise(function(resolve, reject) {
			orderclient.get(type + no, function(err, data) {
				if (err) {
					reject(err)
				} else if (data) {
					resolve(JSON.parse(data))
				} else {
					resolve(false)
				}
			})
		})
	},
	delOrder(no, type) {
		return new Promise(function(resolve, reject) {
			orderclient.del(type + no, function(err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	}
}