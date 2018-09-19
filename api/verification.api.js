const qcloudsms = require("qcloudsms_js")('1400123825', 'a2af2adeb7d5c8d9b2929be5551b740b')

exports = module.exports = {
	sendSMS (phone, code) {
		var ssender = qcloudsms.SmsSingleSender(),
			templId = '171081',
			params = [code, 3]
		return new Promise((resolve, reject) => {
			ssender.sendWithParam(86, phone, templId, params, "", "", "", function (err, response, data) {
				if (err) {
					reject(err)
				} else if (data.result === 0) {
					resolve(data)
				} else {
					reject(data.errmsg)
				}
			});
		})
	}
}