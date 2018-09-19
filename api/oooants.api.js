const request = require('request');
const crypto = require('crypto');

const origin = 'http://183.129.254.28';

const post = function (url, params) {
	return new Promise(function (resolve, reject) {
		url = origin + url;
		request.post({url, form: params}, function (err, res, body) {
			if (err) {
				return reject(err)
			}
			var body = res.body.replace(/\r\n/g,"").replace(/\n/g,"")
			body = body.split('<ns:return>')[1].split('</ns:return>')[0]
			resolve(JSON.parse(body))
		})
	})
}

module.exports = {
	post,
	pailInfo (id) {
		return new Promise(function (resolve, reject) {
			post('/webservice/services/PoleWebService/getRealByPoleId', {id}).then(data => {
				resolve(data)
			}).catch(err => {
				throw err
			})
		})
	},
	cardInfo ({cardNo, cardId, pass, identity = 1}) {
		return new Promise(function (resolve, reject) {
			if (!cardNo && !cardId) reject(new Error('账号与卡号不能为空'))
			pass = crypto.createHash('md5').update(pass, 'utf8').digest('hex')
			post('/webservice/services/IcCardWebService/getMyCard', {cardNo, pass, identity}).then(data => {
				if (data.success) {
					console.log(data.list)
					data.list.forEach(function (card) {
						console.log('card:', card)
						if (card.cardno === cardId) {
							resolve(card)
						}
					})
				} else {
					reject(new Error(data.message))
				}
			}).catch(err => reject(err))
		})
	},
	orderRecord ({poleId, cardNo, cardId, pass, identity = 1, pageSize = 20, index = 1}) {
		return new Promise(function (resolve, reject) {
			if (!poleId && !cardNo && !cardId && !pass) reject(new Error('参数不齐全'))
			pass = crypto.createHash('md5').update(pass, 'utf8').digest('hex')
			post('/webservice/services/IcCardWebService/getConsumRecord', {poleId, cardNo, cardId, pass, identity, pageSize, index}).then(function (data) {
				console.log(data.list)
				resolve(data.list)
			}).catch(function (err) {
				reject(err)
			})
		})
	},
	openPail ({}) {
		return new Promise(function (resolve, reject) {
			resolve()
		})
	},
	closePail ({}) {
		return new Promise(function (resolve, reject) {
			resolve()
		})
	}
}