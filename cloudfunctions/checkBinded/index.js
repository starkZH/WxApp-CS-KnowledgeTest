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
  let res = await db.collection('sys_user').doc(openid).get().then(res=>{
    return res.data;
  });
  let status = false;
  if(res.casid)
  {
    status = true;
  }
  return {status,openid}
}