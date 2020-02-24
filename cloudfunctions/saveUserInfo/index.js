// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  const wxContext = cloud.getWXContext();
  let openid = wxContext.OPENID;
  delete event['userInfo'];
  let updateRes=false,pRes;
  await db.collection('sys_user').doc(openid).update({
    data: event
  }).then((res)=>{
    console.log(res)
    pRes=res
  });
  //如果是新用户
  if (pRes.stats.updated == 0) {
    event._id = openid;
    await db.collection('sys_user').add({
      data: event
    });
  } 
    updateRes = true;
  
  return { updateRes ,openid };
}