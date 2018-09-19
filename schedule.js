const schedule = require('node-schedule');
const pail = require('./mongodb/pailmongo')
const user = require('./mongodb/usermongo')
const order = require('./mongodb/ordermongo')
const pailredis = require('./redis/pailredis')
const userredis = require('./redis/userredis')
const orderredis = require('./redis/orderredis')
const api = require('./router/oooants/api')

var rule = new schedule.RecurrenceRule();
// var minute = [];
// for (var i = 0; i < 12; i++) {
//     minute.push(i * 5)
// }
// rule.minute = minute;
rule.second = [0]

var j = schedule.scheduleJob(rule, function() {
    pailredis.getAllPailworks().then(data => {
        (function getpailinfo(i) {
            if (i >= data.length) return
            var poleId = data[i]
            if (!poleId) return getpailinfo(i + 1)
            api.pailInfo(poleId).then(pailInfo => {
                if (pailInfo.poleReal.status && pailInfo.poleReal.status !== 1) {
                    pailredis.getPail(poleId).then(rpail => {
                        if (rpail) {
                            var curmoney = Math.max(pailInfo.poleReal.money, rpail.data.money)
                            var curkwh = Math.max(pailInfo.poleReal.kwh, rpail.data.kwh)
                            user.getReorder(rpail.data.phone).then(reorder => {
                                var {
                                    recharge,
                                    rechargetime,
                                    no,
                                    poleId,
                                    type
                                } = reorder;

                                var amount = curmoney,
                                    kwh = curkwh;

                                var refund = (Number(recharge) - Number(amount)).toFixed(2);
                                if (refund < 0) refund = 0;

                                var desc = pailInfo.poleReal.status === 4 ? '充电桩离线' : '充电桩自动关闭'

                                var params = {
                                    phone: rpail.data.phone,
                                    poleId,
                                    polename: rpail.data.name,
                                    no,
                                    recharge,
                                    rechargetime,
                                    type,
                                    cost: amount,
                                    electric: kwh,
                                    refund,
                                    opentime: rpail.data.opentime,
                                    closedesc: desc
                                }

                                pailredis.setPail(poleId, {
                                    money: 0,
                                    kwh: 0
                                })

                                pailredis.delPailworks(poleId).then(num => {
                                    if (num) {
                                        order.create(params).then(function() {
                                            pailredis.setPail(poleId, {
                                                isrecharge: false
                                            })
                                        })
                                    }
                                })

                            })
                        }
                    })
                } else {
                    pailredis.setPail(poleId, {
                        money: pailInfo.poleReal.money,
                        kwh: pailInfo.poleReal.kwh
                    })
                }
                getpailinfo(i + 1)
            })
        })(0)
    }).catch(err => {
        throw err
    })
});

module.exports = j