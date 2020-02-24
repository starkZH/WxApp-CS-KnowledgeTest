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
  //let limit = Number(event.limit);
  let data=[];
  let exam_id = event.exam_id;
  await db.collection('answer_formal').field({
    user_id:true,time_cost:true,score:true,rank:true
  }).where({
    exam_id: exam_id
  })
  //.limit(limit)
  .orderBy('rank','asc').get().then((res)=>{
    data=res.data;
  });
  //尚未进行排名，则先排名后返回
  if(data[0]&&!data[0].rank){
    result = await cloud.callFunction({
      name: 'calculateRank',
      data: { exam_id }
    });
    return result.result;
  }
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