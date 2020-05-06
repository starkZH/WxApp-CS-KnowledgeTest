/**
 * 获取分数排行榜
 * {limit:100}
 */
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
let cache;
const db = cloud.database();
const _ = db.command;

async function getUserInfo(data){
  let ids = [];
  for (let val of data)
    ids.push(val.user_id);
  let map = {};
  try {
    await db.collection('sys_user').where({ _id: _.in(ids) }).get().then(res => {
      for (let val of res.data) {
        map[val._id] = val;
      }
      for (var val of data)
        val.userInfo = map[val.user_id];
    })
  } catch (e) { }
  return data;
}

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
  //如果是批量排名
  if(event.list instanceof Array){
    await db.collection('answer_formal')
      .where({
        exam_id: _.in(event.list)
      })
      .limit(1000)
      .field({
        user_id: true, score: true, time_cost: true
      })
      .orderBy('score', 'desc')
      .orderBy('time_cost', 'asc')
      .get().then((res) => {
        data = res.data;
        let last = '';
        let rank = 0;
        for (let val of data) {
          let key = val.score + '-' + val.time_cost;
          val.rank = key != last ? (++rank) : rank;
          last = key;
        }
      })
    await getUserInfo(data);
    result.count = data.length;
    result.data = data;
    return result;
  }
  let exam_id = event.exam_id;
  await db.collection('exam').doc(exam_id).field({rank:true}).get().then((res)=>{
    data = res.data;
  });
  //尚未进行排名，则先排名后返回
  if(!data.rank||!data.rank.length){
    result = await cloud.callFunction({
      name: 'calculateRank',
      data: { exam_id }
    });
    return result.result;
  }
  result.count = data.rank.length;
  data=data.rank.slice(skip,skip+limit);
  await getUserInfo(data);
  result.data = data;
  return result;
}