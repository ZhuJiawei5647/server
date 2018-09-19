const express = require('express');
const router = express.Router();
const userServer = require('../server/userServer')
const connectServer = require('../server/connectServer')
const pailServer = require('../server/pailServer')
const wechatServer = require('../server/wechatServer')
const orderServer = require('../server/orderServer')
const billServer = require('../server/billServer')

pailServer.addPailEventListener('outline', function (pail) {
	if (pail.connectno) connectServer.setOutline(pail.connectno)
})

pailServer.addPailEventListener('opensuccess', function (pail) {
	if (pail.connectno) connectServer.getConnect(pail.connectno).then(connect => {
		if (connect.status == 2) {
			connectServer.pailOpenSuccess(pail.connectno, true)
		}
	})
})

pailServer.addPailEventListener('openfail', function (pail) {
	if (pail.connectno) connectServer.getConnect(pail.connectno).then(connect => {
		if (connect.status == 2) {
			connectServer.pailOpenSuccess(pail.connectno, false)
		}
	})
})

pailServer.addPailEventListener('closesuccess', function (pail) {
	if (pail.connectno) connectServer.getConnect(pail.connectno).then(connect => {
		if (connect.status == 3) {
			connectServer.pailCloseSuccess(pail.connectno, true)
		}
	})
})

pailServer.addPailEventListener('closefail', function (pail) {
	if (pail.connectno) connectServer.getConnect(pail.connectno).then(connect => {
		if (connect.status == 3) {
			connectServer.pailCloseSuccess(pail.connectno, false)
		}
	})
})

pailServer.addPailEventListener('changestatus', function (pail) {
	if (pail.connectno) connectServer.getConnect(pail.connectno).then(connect => {
		if (connect.status == 1) {
			console.log('充电桩自动关闭')
			connectServer.pailCloseSuccess(pail.connectno, true)
		}
	})
})

router.get('/connect/create', function (req, res) {
	var {userId, pailId} = req.query
	Promise.all([
		userServer.getUserInfo(userId).then(user => {
			if (user.pailconnectno) {
				return connectServer.getConnect(user.pailconnectno).then(connect => {
					return Promise.reject({status: 202, msg: '已存在关联', data:connect})
				}).catch(err => {
					if (err == '不存在关联') {
						return user
					}
					return Promise.reject(err)
				})
			}
			return user
		}),
		pailServer.getPailInfo(pailId).then(pail => {
			if (pail.connectno) {
				return connectServer.getConnect(pail.connectno).then(connect => {
					return Promise.reject({status: 203, msg: '充电桩正在工作中', data:connect})
				}).catch(err => {
					if (err == '不存在关联') {
						return pail
					}
					return Promise.reject(err)
				})
			}
			return pail
		})
	]).then(datas => {
		var user = datas[0],
			pail = datas[1];
		return connectServer.createConnect(userId, pailId, 'pail', {usreName: user.name, pailName: pail.name}).then(connect => {
			return Promise.all([
				userServer.setPailConnectno(userId, connect.connectno),
				pailServer.setPailConnectno(pailId, connect.connectno)
			]).then(datas => {
				res.send({status: 200, msg: '关联成功', data: connect})
			})
		})
	}).catch(err => {
		if (err.status == 202) {
			res.send(err)
		} else if (err.status == 203) {
			res.send(err)
		} else {
			res.send({status: 0, msg: 'error', data: err.toString()})
		}
	})
})

router.get('/connect/delete', function (req, res) {
	var {connectno} = req.query
	connectServer.getConnect(connectno).then(connect => {
		console.log(connect)
		if (connect.status == 0) {
			return connectServer.removeConnect(connectno).then(data => {
				return Promise.all([
					userServer.delPailConnectno(connect.userId), 
					pailServer.delPailConnectno(connect.hardId)
				]).then(datas => {
					res.send({status: 200, msg: '删除成功', data: null})
				})
			})
		} else {
			res.send({status: 200, msg: '删除失败', data: connect})
		}
	}).catch(err => {
		console.log(err)
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/connect/info', function(req, res) {
	var {connectno} = req.query
	connectServer.getConnect(connectno).then(connect => {
		console.log(connect)
		return Promise.all([
			pailServer.getPailInfo(connect.hardId).then(pail => {
				if (connect.outline) {
					if (pail.status == 4 && Date.now() - Number(connect.outline) > 10*1000) {
						connectServer.delOutline(connect.connectno)
						if (connect.status == 1) {
							console.log('充电桩离线关闭')
							return connectServer.pailCloseSuccess(connectno, true).then(data => {
								connect.status = 0
								return pail
							})
						} else if (connect.status == 2) {
							console.log('充电桩开启失败')
							connectServer.pailOpenSuccess(connectno, false).then(data => {
								connect.status = 0
								return pail
							})
						} else if (connect.status == 3) {
							console.log('充电桩离线强制关闭')
							return connectServer.pailCloseSuccess(connectno, true).then(data => {
								connect.status = 0
								return pail
							})
						}
					} else if (pail.status != 4) {
						connectServer.delOutline(connect.connectno)
					}
				}
				return pail
			}),
			userServer.getUserInfo(connect.userId)
		]).then(datas => {
			connect.pail = datas[0],
			connect.user = datas[1]
			res.send({status: 200, msg: '关联信息', data: connect})
		})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/connect/openPail', function (req, res) {
	var {connectno} = req.query
	connectServer.getConnect(connectno).then(connect => {
		if (connect.status == 1) {
			return res.send({status: 200, msg: '充电桩已开启成功', data: null})
		} else if (connect.status == 2) {
			return res.send({status: 200, msg: '充电桩正在开启中', data: null})
		} else {
			return pailServer.openPail(connect.hardId, connect.userId).then(data => {
				return connectServer.pailOpen(connectno).then(data => {
					res.send({status: 200, msg: '发送开启命令成功', data: null})
				})
			})
		}	
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/connect/closePail', function (req, res) {
	var {connectno} = req.query
	connectServer.getConnect(connectno).then(connect => {
		if (connect.status == 0) {
			return res.send({status: 200, msg: '充电桩已关闭成功', data: null})
		} else if (connect.status == 3) {
			return res.send({status: 200, msg: '充电桩正在关闭中', data: null})
		} else {
			return pailServer.closePail(connect.hardId, connect.userId).then(data => {
				return connectServer.pailClose(connectno).then(data => {
					res.send({status: 200, msg: '发送开启命令成功', data: null})
				})
			})
		}
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/connect/closePailCoerce', function (req, res) {
	var {connectno} = req.query
	connectServer.pailClose(connectno).then(data => {
		res.send({status: 200, msg: '强制关闭充电桩', data: null})
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/connect/getOrderByIOS', function (req, res) {
	var {connectno, fee} = req.query
	connectServer.getConnect(connectno).then(connect => {
		if (connect.isrecharge == 1) {
			return Promise.reject('已充值')
		} else {
			return wechatServer.getIphAppOrder(get_client_ip(req) ,{
				total_fee: fee,
				notify_url: 'https://www.evnetworks.cn/server/connect/recharge'
			}).then(data => {
				return orderServer.createOrder(data.no, fee, 1, {
					connectno,
					userId: connect.userId,
					userName: connect.usreName,
					pailId: connect.hardId,
					pailName: connect.pailName
				}).then({
					res.send({status: 200, msg: '订单获取成功', data: data.args})
				})
			})
		}
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/connect/getOrderByWx', function (req, res) {
	var {connectno, fee} = req.query
	connectServer.getConnect(connectno).then(connect => {
		if (connect.isrecharge == 1) {
			return Promise.reject('已充值')
		} else {
			return wechatServer.getWxAppOrder(get_client_ip(req) ,{
				total_fee: fee,
				notify_url: 'https://www.evnetworks.cn/server/connect/recharge'
			}).then(data => {
				return orderServer.createOrder(data.no, fee, 2, {
					connectno,
					userId: connect.userId,
					userName: connect.usreName,
					pailId: connect.hardId,
					pailName: connect.pailName
				}).then({
					res.send({status: 200, msg: '订单获取成功', data: data.args})
				})
			})
		}
	}).catch(err => {
		res.send({status: 0, msg: 'error', data: err.toString()})
	})
})

router.get('/connect/recharge', function (req, res) {
	var buf = '';
	req.on('data', function(chunk) {
		buf += chunk
	});
	req.on('end', function () {
		wechatServer.PaySuccess(buf).then(data => {
			if (data.success) {
				return orderServer.getOrder(data.out_trade_no).then(order => {
					order.createPayRecord(order.orderno, order.usreName, order.pailName, order.recharge, order.rechargetype, '充电桩充电')
					return connectServer.getConnect(order.connectno).then(connect => {
						if (connect.isrecharge == 1) {
							return billServer.createBill()
						} else {
							return connectServer.rechargeSuccess(order.connectno, order.orderno, order.recharge).then(data => {
								return pailServer.openPail(connect.hardId, connect.userId).then(data => {
									return connectServer.pailOpen(order.connectno)
								}).catch(err => {
									return billServer.createBill()
								})
							})
						}
					}).catch(err => {
						return billServer.createBill()
					})
				})
			}
			res.send(data.output)
		}).catch(console.log)
	})
})

function get_client_ip (req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if(ip.split(',').length>0){
        ip = ip.split(',')[0]
    }
    console.log(ip)
    return ip;
}

module.exports = router