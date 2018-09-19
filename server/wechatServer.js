const wechatApi = require('../api/wechat.api.js')
const orderMongo = require('../mongodb/order.mongo.js')
const orderRedis = require('../redis/order.redis.js')
const crypto = require('crypto');
const fs = require('fs');
const pfx = fs.readFileSync('./apiclient_cert.p12')
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
const config_wxapp = config.wxapp
const config_iph = config.wxiphapp

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

function createNonceStr() {
	return Math.random().toString(36).substr(2, 15);
}

function createTimeStamp() {
	return parseInt(new Date().getTime() / 1000) + '';
}

exports = module.exports = {
	getIphAppOrder(ip, options) {
		var out_trade_no = 'wx' + Date.now() + Math.random().toString().substr(2, 6)
		var params = Object.assign({}, {
			body: "支付", // 商品描述
			mch_id: config_iph.mchid, //商户ID
			appid: config_iph.appid,
			total_fee: 1, // 金额
			spbill_create_ip: '196.168.1.1',
			out_trade_no,
			nonce_str: createNonceStr(),
			trade_type: 'APP'
		}, options)
		var formData = getFormData(params, config_iph.mchkey)

		return wechatApi.getOrder(formData).then(data => {
			var args = {
				appid: params.appid,
				partnerid: params.mch_id,
				noncestr: createNonceStr(),
				package: 'Sign=WXPay',
				prepayid: data.prepay_id,
				timestamp: createTimeStamp()
			};
			args.paySign = getSign(args, key)
			return {
				no: out_trade_no,
				args
			}
		})
	},
	getWxAppOrder(ip, options) {
		var out_trade_no = 'wx' + Date.now() + Math.random().toString().substr(2, 6)
		var params = Object.assign({}, {
			appid: config_wxapp.appid,
			mch_id: config_wxapp.mchid,
			attach: '支付',
			body: '充电桩充电',
			spbill_create_ip: ip,
			total_fee: 1,
			out_trade_no,
			nonce_str: createNonceStr(),
			trade_type: 'JSAPI'
		}, options)

		var formData = getFormData(params, key)

		return wechatApi.getOrder(formData).then(data => {
			var args = {
				appId: params.appid,
				timeStamp: createTimeStamp(),
				nonceStr: createNonceStr(),
				package: 'prepay_id=' + data.prepay_id,
				signType: 'MD5'
			};
			args.paySign = getSign(args, key)
			return {
				no: out_trade_no,
				args
			}
		})
	},
	PaySuccess(buf) {
		return wechatApi.verifiSign(buf).then(data => {
			var success = false,
				reply = {
					return_code: "FAIL",
					return_msg: "FAIL"
				},
				xml = `<xml>
				<return_code><![CDATA[<%= return_code %>]]></return_code>
				<return_msg><![CDATA[<%= return_msg %>]]></return_msg>
				</xml>`

			if (data.return_code == "SUCCESS") {
				var sign = getSign(data, key)
				if (sign === data.sign) {
					success = true
					reply = {
						return_code: "SUCCESS",
						return_msg: "OK"
					}
				} else {
					reply.return_msg = '签名失败'
				}
			} else {
				reply.return_msg = "支付失败"
			}

			var output = ejs.render(xml, data.reply);
			return {
				output,
				data,
				success
			}
		})
	},
	iphAppRefund(orderno, refund_fee, total_fee) {
		if (refund_fee == 0) {
			return Promise.resolve('已退款成功')
		} else {
			var params = {
				out_refund_no: '' + new Date().getTime() + Math.round(Math.random() * 100), //订单号
				nonce_str: createNonceStr(),
				mch_id: config_iph.mchid, //商户ID
				appid: config_iph.appid,
				out_trade_no: orderno,
				refund_fee, // 退款金额
				total_fee
			}
			var formData = getFormData(params, config_iph.mchkey)
			return wechatApi.refund(formData, pfx)
		}
	},
	wxAppRefund(orderno, refund_fee, total_fee) {
		if (refund_fee == 0) {
			return Promise.resolve('已退款成功')
		} else {
			var params = {
				out_refund_no: '' + new Date().getTime() + Math.round(Math.random() * 100), //订单号
				nonce_str: createNonceStr(),
				mch_id: config_wxapp.mchid, //商户ID
				appid: config_wxapp.appid,
				out_trade_no: orderno,
				refund_fee, // 退款金额
				total_fee
			}
			var formData = getFormData(params, config_wxapp.mchkey)
			return wechatApi.refund(formData, pfx)
		}
	},
	getOpenid (code) {
		return wechatApi.getOpenid({
			appid: config.appid,
			secret: config.secret,
			js_code: code,
			grant_type: 'authorization_code'
		})
	}
}