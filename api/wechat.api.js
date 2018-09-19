const request = require('request');
const crypto = require('crypto');
const fs = require('fs');
const parseString = require('xml2js').parseString;
const pfx = fs.readFileSync('./apiclient_cert.p12')
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8')).wxapp
// const messageTpl = fs.readFileSync(__dirname + '/message.ejs', 'utf-8'); 
function gethref(url, params) {
	var paramstr = '?'
	for (var key in params) {
		console.log(key)
		paramstr += key + '=' + (params[key]? params[key] : '') + '&'
	}
	paramstr = paramstr.slice(0, paramstr.length - 1)
	return url + paramstr;
}

function getXMLNodeValue(node_name, xml) {
	return xml.split('<' + node_name + '>')[1].split('</' + node_name + '>')[0].split('[')[2].split(']')[0];
}

function getSign(params, key) {
	try {
		var string = getParams(params);
		string = string + '&key=' + key;
		var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
		return sign.toUpperCase();
	} catch (err) {
		throw err;
	}
}

function getParams(params) {
	var sPara = [];
	if (!params) return null;
	for (var key in params) {
		if ((!params[key]) || key == "sign" || key == "sign_type") {
			continue;
		};
		sPara.push([key, params[key]]);
	}
	sPara = sPara.sort();
	var prestr = '';
	for (var i2 = 0; i2 < sPara.length; i2++) {
		var obj = sPara[i2];
		prestr = prestr + obj[0] + '=' + obj[1] + '&';
	}
	return prestr.slice(0, prestr.length - 1);
}

function getFormData(params, much_key) {
	var formData = "<xml>";
	for (var key in params) {
		if ((!params[key]) || key == "sign") {
			continue;
		};
		formData = formData + '<' + key + '>' + params[key] + '</' + key + '>'
	}
	formData += "<sign>" + getSign(params, mch_key) + "</sign>";
	formData += "</xml>";
	return formData
}

function xmltojson(xml) {
	return new Promise(function(resolve, reject) {
		parseString(xml, function(err, result) {
			console.log(xml)
			var data = {},
				xml = result.xml;
			for (var key in xml) {
				data[key] = xml[key][0]
			}
			resolve(data)
		})
	})
}

function createNonceStr() {
	return Math.random().toString(36).substr(2, 15);
}

function createTimeStamp() {
	return parseInt(new Date().getTime() / 1000) + '';
}

var WxPay = {
	getOrder(formData) {
		return new Promise((resolve, reject) => {
			request({
				url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
				method: 'POST',
				body: formData
			}, function(err, response, body) {
				if (!err && response.statusCode == 200) {
					xmltojson(body).then(data => {
						if (data.return_code === 'SUCCESS') {
							if (data.result_code === 'SUCCESS') {
								//签名
								resolve(data)
							} else {
								reject(JSON.stringify({
									err_code: data.err_code,
									err_code_des: data.err_code_des
								}))
							}
						} else {
							reject('订单创建失败')
						}
					})
				} else {
					reject('订单请求报错')
				}
			});
		})
	},
	// 退款
	refund(formData, pfx) {
		return new Promise((resolve, reject) => {

			request({
				url: 'https://api.mch.weixin.qq.com/secapi/pay/refund',
				method: 'POST',
				body: formData,
				agentOptions: {
					pfx: pfx,
					passphrase: opt.mch_id
				}
			}, function(err, response, body) {
				if (!err && response.statusCode == 200) {
					xmltojson(body).then(data => {
						if (data.return_code === 'SUCCESS' && data.result_code === 'SUCCESS') {
							resolve({
								out_trade_no: params.out_trade_no,
								out_refund_no: params.out_refund_no,
								total_fee: params.total_fee,
								refund_fee: data.refund_fee
							})
						} else {
							reject(JSON.stringify(data))
						}
					})
				} else {
					reject('订单请求报错')
				}
			});
		})
	},
	//支付回调通知
	verifiSign: function(body, key) {
		if (key) mch_key = key
		return new Promise(function(resolve, reject) {
			xmltojson(body).then(data => {
				resolve(data)
			})
		})
	},
	getOpenid (params) {
		return new Promise((resolve, reject) => {
			request(gethref('https://api.weixin.qq.com/sns/jscode2session', params), function (error, response, body) {
				if (error) {
					reject(error)
				} else {
					var obj = JSON.parse(body)
					console.log(obj)
					resolve(obj.openid)
				}
			})
		})
	},
};

module.exports = WxPay;