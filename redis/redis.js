const redis = require('redis')

let client = redis.createClient('6379', '127.0.0.1')

let pailclient = redis.createClient('6379', '127.0.0.1', {db: 1})
let userclient = redis.createClient('6379', '127.0.0.1', {db: 2})
let orderclient = redis.createClient('6379', '127.0.0.1', {db: 3})
let connectclient = redis.createClient('6379', '127.0.0.1', {db: 4})

pailclient.on('error', function (err) {
	console.log('pailclient:error: ', err)
})

userclient.on('error', function (err) {
	console.log('userclient:error: ', err)
})

orderclient.on('error', function (err) {
	console.log('orderclient:error: ', err)
})

connectclient.on('error', function (err) {
	console.log('conectclient:error: ', err)
})

client.on('error', function (err) {
    console.log('error: ', err);
});

module.exports = {
	redis,
	client,
	pailclient,
	userclient,
	orderclient,
	connectclient,
	select (id) {
		return new Promise(function (resolve, reject) {
			client.select(id, function (err, data) {
				if (err) {
					reject(err)
				} else {
					console.log('select', data)
					resolve()
				}
			})
		})
	}
};