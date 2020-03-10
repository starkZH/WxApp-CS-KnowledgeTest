// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let result = {}
  await db.collection('answer_formal').where({ exam_id: event.exam_id, user_id: wxContext.OPENID})
  .get().then(res=>{
    result.data = res.data.length>0;
  })
  return result;
}