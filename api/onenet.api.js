const request = require('request');
const moment = require('moment');
const crypto = require('crypto');
const fs = require('fs')
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8')).onenet

console.log(config)

var encrypt = function(key, iv, data) {
	var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
	var crypted = cipher.update(data, 'utf8', 'binary');
	crypted += cipher.final('binary');
	crypted = new Buffer(crypted, 'binary').toString('base64');
	return crypted;
};

/**
 * 解密方法，调用加解密方法前，请先安装 crypto
 * @param key      解密的key
 * @param iv       向量
 * @param crypted  密文
 * @returns string
 */
var decrypt = function(key, iv, crypted) {
	crypted = new Buffer(crypted, 'base64').toString('binary');
	//  这里的 aes-256-cbc 指定加密方式，推送数据的加密方式为，key 为密钥 iv 为初始化向量。
	var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
	var decoded = decipher.update(crypted, 'binary', 'utf8');
	try {
		decoded += decipher.final('utf8');
		return decoded;
	} catch (err) {
		return false;
	}
};

exports = module.exports = {
	sendCommand(deviceid, buf) {
		return new Promise((resolve, reject) => {
			request({
				url: 'http://api.heclouds.com/cmds?device_id=' + deviceid,
				method: 'POST',
				headers: {
					'api-key': config.masterKey
				},
				body: buf
			}, function(err, response, body) {
				var data = JSON.parse(body)
				if (err) {
					reject(err.message)
				} else {
					if (data.errno) {
						reject(data.error)
					}
					resolve(data.data)
				}
			})
		})
	},
	createDevice(title, desc, tags, location, auth_info, other = {}) {
		return new Promise((resolve, reject) => {
			request({
				url: 'http://api.heclouds.com/devices',
				method: 'POST',
				headers: {
					'api-key': config.masterKey
				},
				body: JSON.stringify({
					title,
					desc,
					tags,
					location,
					auth_info,
					other
				})
			}, function (err, response, body) {
				if (err) {
					reject(err)
				} else {
					var data = JSON.parse(body)
					if (data.errno) {
						reject(data.error)
					}
					resolve(data.data)
				}
			})
		})
	},
	removeDevice(deviceid) {
		return new Promise((resolve, reject) => {
			request({
				url: 'http://api.heclouds.com/devices/' + deviceid,
				method: 'DELETE',
				headers: {
					'api-key': config.masterKey
				}
			}, function(err, response, body) {
				var data = JSON.parse(body)
				if (err) {
					reject(err.message)
				} else {
					if (data.errno && data.errno != 3) {
						reject(data.error)
					}
					resolve(data.data)
				}
			})
		})
	},
	registerDevice(sn, title) {
		return new Promise((resolve, reject) => {
			request({
				url: 'http://api.heclouds.com/register_de?register_code=' + config.registerCode,
				method: 'POST',
				body: JSON.stringify({
					sn,
					title
				})
			}, function(err, response, body) {
				if (err) {
					reject(err)
				} else {
					var data = JSON.parse(body)
					if (data.errno) {
						reject(data)
					}
					resolve(data.data)
				}
			})
		})
	},
	checkSign(msg, nonce, signature) {
		return new Promise((resolve, reject) => {
			var str = config.token + nonce + msg,
				sign = crypto.createHash('md5').update(str).digest('base64');

			if (signature === sign) {
				resolve(true)
			} else {
				resolve(false)
			}
		})
	},
	getMsg(enc_msg) {
		var AESKey = new Buffer(config.encodingAESKey + '=', 'base64').toString();

		// enc_msg 为包含数据的消息体，首先对 enc_msg 做 base64 解码
		// var enc_msg = new Buffer(req.body.enc_msg, 'base64').toString()

		// 解密中使用的秘钥由EncodingAESKey计算得来，使用的初始化iv向量为计算出的aes秘钥的前16字节
		// 去掉 dec 的前16字节，再以前4字节取出消息体长度，及 dec 的前20字节是于推送数据本身无关的。
		var dec = decrypt(AESKey, AESKey.substr(0, 16), enc_msg);

		// dec 为解密后 OneNET 平台推送数据
		if (dec) {
			return Promise.resolve(JSON.parse(dec.substr(20)))
		} else {
			return Promise.reject('数据解密失败')
		}
	}
}