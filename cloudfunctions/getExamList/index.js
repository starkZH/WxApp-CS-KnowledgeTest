/**
 * 获取已开放的试题列表
 */
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  let skip = (Number(event.page) - 1) * 10;
  if (isNaN(skip) || skip < 0) skip = 0;
  let result = {};
  await db.collection('exam')
    .where({
      open: 1
    })
    .field({
      answer: false,
      question: false
    })
    .orderBy('openTime', 'desc')
    .skip(skip)
    .limit(10)
    .get().then(res=>{
      result.data = res.data;
    }).catch(res=>{
      result.errcode=1;
      result.errmsg= res;
    })

  let fileList = [];
  for (let val of result.data) {
    val.img_id = val.img_id ? val.img_id:''
    fileList.push(val.img_id);
  }
  fileList = await cloud.getTempFileURL({
    fileList: fileList,
  });
  fileList = fileList.fileList;
  for (let i in fileList) {
    result.data[i].img_url = fileList[i].tempFileURL;
  }
  return result
}