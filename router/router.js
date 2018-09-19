const express = require('express');
const router = express.Router();

router.get('/app/version', function(req, res) {
	res.send({
		status: 200,
		msg: '版本号',
		data: {
			version: '2.0.2'
		}
	})
})

const ali_router = require('./ali/router')
router.use(ali_router)

const wechat_router = require('./wechat/router')
router.use(wechat_router)

const onenet_router = require('./onenet/router')
router.use('/onenet/evt', onenet_router)

const oooants_router = require('./oooants/router')
router.use('/oooants', oooants_router)

const web_router = require('./web/router')
router.use('/web', web_router)

const verification_router = require('./verification/router')
router.use('/verification', verification_router)

module.exports = router;