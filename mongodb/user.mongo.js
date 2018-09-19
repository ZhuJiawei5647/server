const mongoose = require('./mongoose')

let userschema = (function () {
	let Schema = mongoose.Schema({
		userId: {type: String, required:[true, '用户ID不能为空']},
		phone: String,
		account: String,
		password: String,
		name: String,
		imageUrl: String,
		loginType: Number,
		created: Number
	})
	Schema.pre('save', function (next) {
		console.log('用户创建成功：' + this.name)
		next()
	})
	return Schema
})()

let Usermodel = mongoose.model('user', userschema);
exports = module.exports = {
	createUser (params) {
		params.created = Date.now()
		let user = new Usermodel(params)
		return new Promise(function (resolve, reject) {
			user.save((err, user) => {
				if (err) {
					reject(err)
				} else {
					resolve(user)
				}
			})
		})
	},
	getUser (userId) {
		return new Promise(function (resolve, reject) {
			Usermodel.findOne({userId}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	delUserOne (params) {
		return new Promise(function (resolve, reject) {
			Usermodel.deleteOne(params, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getUserOne (params) {
		return new Promise(function (resolve, reject) {
			Usermodel.findOne(params, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getUserListAll (params) {
		return new Promise(function (resolve, reject) {
			Usermodel.find(params, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getUserByPhone (phone) {
		return new Promise(function (resolve, reject) {
			Usermodel.findOne({phone}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	updateByPhone (phone, update) {
		return new Promise(function (resolve, reject) {
			Usermodel.updateOne({phone}, {$set: update}, {upsert: true}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	}
}