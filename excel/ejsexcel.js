const ejsExcel = require("ejsexcel");
const fs = require("fs");
const exlBuf = fs.readFileSync(__dirname + "/bill.xlsx");
//获得Excel模板的buffer对象

//数据源

//用数据源(对象)data渲染Excel模板

exports = module.exports = {
	renderExcel (data) {
		return new Promise(function (resolve, reject) {
			ejsExcel.renderExcel(exlBuf, data).then(function(exlBuf2) {
				var filename = Date.now()
				exports.saveFile(__dirname + '/files/'+ filename +'.xlsx', exlBuf2).then(data => {
					console.log("生成test2.xlsx");
					resolve(filename)
				}).catch(err => {
					reject(err)
				});
			}).catch(function(err) {
				console.error(err);
				reject(err)
			});
		})
	},
	saveFile (filePath, fileData) {
		return new Promise((resolve, reject) => {  
			// 块方式写入文件  
			const wstream = fs.createWriteStream(filePath);   
			wstream.on('open', () => {   
				const blockSize = 128;   
				const nbBlocks = Math.ceil(fileData.length / (blockSize));   
				for (let i = 0; i < nbBlocks; i += 1) {    
					const currentBlock = fileData.slice(     
						blockSize * i,     
						Math.min(blockSize * (i + 1), fileData.length)  
					);    
					wstream.write(currentBlock);
				}
				wstream.end();
			});
			wstream.on('error', (err) => { reject(err); });
			wstream.on('finish', () => { resolve(true); }); 
		});
	},
	deleteFile (filename) {
		return new Promise((resolve, reject) => {
			fs.unlink(__dirname + '/files/' + filename, function (err) {
				if (err) {
					if (err.code === 'ENOENT') {
						resolve()
					} else {
						reject(err)
					}
				} else {
					resolve()
				}
			});
		})
	}
}