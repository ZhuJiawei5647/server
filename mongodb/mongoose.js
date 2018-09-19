'use strict';
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/service', { config: { autoIndex: false }, useNewUrlParser: true });
const con = mongoose.connection;
con.on('error', console.error.bind(console, '连接数据库失败'));
con.once('open', console.log.bind(console, '数据库连接成功'))

module.exports = mongoose