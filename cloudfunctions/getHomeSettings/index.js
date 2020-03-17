// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let result = {};
  await db.collection('base_setting').orderBy('order','asc').get().then(res=>{
    result.data=res.data;
  })
  let fileList = [];
  for(let val of result.data){
    if (val.img_id)
    fileList.push(val.img_id);
  }
  let urlObj={};
  await cloud.getTempFileURL({
    fileList: fileList,
  }).then(res=>{
      for(let val of res.fileList){
        urlObj[val.fileID]=val.tempFileURL;
      }
  });
  for (let val of result.data){
    val.img_url = urlObj[val.img_id];
  }
  return result;
}