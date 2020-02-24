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

  return result;
}