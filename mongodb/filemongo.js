const mongoose = require('./mongoose')

let fileschema = (function () {
	let Schema = mongoose.Schema({
		name: String,
		filename: String,
		created: Number
	})
	Schema.pre('save', function (next) {
		console.log('文件创建成功')
		next()
	})
	return Schema
})()

let Filemodel = mongoose.model('file', fileschema);

module.exports = {
	create ({name, filename, created = Date.now()}) {
		if (name === '') name = '未命名'
		let file = new Filemodel({name, filename, created})
		return new Promise(function (resolve, reject) {
			file.save((err, file) => {
				if (err) {
					reject(err)
				} else {
					resolve(file)
				}
			})
		})
	},
	deleteByFilename(filename) {
		return new Promise(function (resolve, reject) {
			Filemodel.findOneAndRemove({filename}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	},
	getList () {
		return new Promise(function (resolve, reject) {
			Filemodel.find({}, {_id: 0}, {sort: {created: -1}}, function (err, data) {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})
		})
	}
}