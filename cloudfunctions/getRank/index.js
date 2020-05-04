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
  let result = {};
  let limit = Number(event.limit);
  let skip = (Number(event.page) - 1) * limit;
  if (isNaN(skip) || skip < 0) skip = 0;
  if(isNaN(limit))limit=1000;
  const wxContext = cloud.getWXContext()
  let user_openid = wxContext.OPENID;
  let data=[];
  let exam_id = event.exam_id;
  await db.collection('exam').doc(exam_id).field({rank:true}).get().then((res)=>{
    data=res.data;
  });
  //尚未进行排名，则先排名后返回
  if(!data.rank||!data.rank.length){
    result = await cloud.callFunction({
      name: 'calculateRank',
      data: { exam_id }
    });
    return result.result;
  }
  data=data.rank.slice(skip,skip+limit);
  let ids = [];
  for (let val of data)
    ids.push(val.user_id);
  let map={};
  try {
    await db.collection('sys_user').where({ _id: _.in(ids) }).get().then(res => {
      for (let val of res.data) {
        map[val._id]=val;
      }
      //console.log(map)
      for(var val of data)
        val.userInfo = map[val.user_id];
    })
  } catch (e) { }
  result.data = data;
  return result;
}