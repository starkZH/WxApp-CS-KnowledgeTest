/**
 * 后台管理总路由
 */
/**
 * login:登录接口 {username,password}
 * updateExamOpenStatus:开放、关闭测试 {exam_id,open_status}
 * getRank:获取排行榜 {exam_id}
 * getExamList:获取测试列表 {page,limit}
 */

const cloud = require('wx-server-sdk')
cloud.init();
const db = cloud.database();
const _ = db.command;
const Result = ResultModel();
let tokenCache = {timestamp:0,value:''};

const routes = { login, updateExamOpenStatus,getRank,getExamList};


async function login(params){
  let result = {};
  await db.collection('admin_user').where(params).limit(1).get().then((res) => {
    if (res.data.length > 0) {
      result = Result.put({ token: makeToken() });
      tokenCache = { value: result.token, timestamp: new Date().getTime() };
    } else result = Result.error('用户名或密码错误')
  }).catch(() => {
    result = Result.error('登录失败')
  })
  return result;
}

async function updateExamOpenStatus({exam_id,open_status}){
  let result={};
  await db.collection('exam').doc(exam_id).update({
    open:open_status
  }).then(res=>{
    result = res;
  }).catch(res=>{
    result = res;
  })
  return result;
}

async function getRank({exam_id}){
  const res = await cloud.callFunction({
    name:'getRank',
    data:{exam_id}
  })
  return res.result;
}

async function getExamList({page,limit}){
  if(isNaN(limit))
    limit = 10;
  if(isNaN(page))
    page = 1;
  let result = {};
  await db.collection('exam').orderBy('createTime','desc').skip((page-1)*limit).limit(limit).get().then((res)=>{
    result = Result.put(res.data);
  }).catch(res=>{
    result = Result.error(res);
  })
  return result; 
}

let expire_seconds = 24*3600*1000;
async function service(funcName,params){
  if(funcName!='login'){
    let authorization = params.authorization;
    let timestamp = tokenCache.timestamp;
    if(!timestamp||timestamp+expire_seconds<new Date().getTime()){
      return Result.error('token无效或已过期，请重新登录');
    }
  }else{
    return await login(params);
  }
  return await routes[funcName](params);
}

//定义返回结果实体
function ResultModel(){
  const mapper={put,error,success};
  function put(data){
    return {data:data,errcode:0};
  }
  function error(errmsg) {
    return { errmsg: errmsg, errcode: 1 };
  }
  function success() {
    return { errcode: 1 };
  }
  return new Proxy({}, {
    get(target, propKey, receiver) {
      return mapper[propKey];
    },
  });
}

function makeToken(){
  let res='';
  let str='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for(let i=0;i<64;i++){
    res += str.charAt(Math.random()*(str.length)); 
  }
  return res;
}

// 云函数入口函数
exports.main = async (event, context) => {
  let funcName = event.funcName;
  let params = event.params;
  let result = typeof routes[funcName] == 'function' ? await service(funcName, params) : Result.error('Invalid Function');
  return result;
}