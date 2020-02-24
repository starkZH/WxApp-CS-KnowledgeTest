/**
 * 获取分数排行榜
 * {limit:100}
 */
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  let result={};
  const wxContext = cloud.getWXContext()
  let user_openid = wxContext.OPENID;
  let limit = Number(event.limit);
  let data=[];
  await db.collection('answer_formal').field({
    user_id:true,time_cost:true,score:true,rank:true
  }).where({
    exam_id:event.exam_id
  }).limit(limit).orderBy('rank','asc').get().then((res)=>{
    data=res.data;
  });
  for(let val of data){
    try {
      await db.collection('sys_user').doc(val.user_id).get().then(res => {
        val.userInfo = res.data;
      })
    }catch(e){}
  }
  result.data = data;
  return result;
}