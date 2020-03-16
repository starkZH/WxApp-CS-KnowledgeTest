/**
 * 后台管理总路由
 */
/**
 * login:登录接口 {username,password}
 * updateExamOpenStatus:开放、关闭测试 {exam_id,open_status}
 * getRank:获取排行榜 {exam_id}
 * getExamList:获取测试列表 {page,limit}
 * addExam:添加测试{}
 * updateExam:更新测试{id,data}
 * deleteExam:删除测试{id}
 */

const cloud = require('wx-server-sdk')
cloud.init();
const db = cloud.database();
const _ = db.command;
const Result = ResultModel();
let tokenCache = {timestamp:0,value:''};

const routes = { login, logout, updateExamOpenStatus, getRank, getExamList, addExam, updateExam, deleteExam, getExam, getBaseInfo, getBaseSettings, deleteBaseSetting, updateBaseSetting, addBaseSetting};


async function login(params){
  let result = {};
  await db.collection('admin_user').where({
    username: params.username,
    password: params.password
  }).limit(1).get().then((res) => {
    if (res.data.length > 0) {
      let token = makeToken()
      result = Result.put({ token });
      tokenCache = { value: token, timestamp: new Date().getTime() };
    } else result = Result.error('用户名或密码错误')
  }).catch(() => {
    result = Result.error('登录失败')
  })
  return result;
}

function logout(){
  tokenCache = { };
  return Result.success();
}
/**
 * 获取后台基本信息
 */
async function getBaseInfo(){
  let result = {};
  let data ={};
  await db.collection('exam').count().then(res=>{
    data.exam_num = res.total;
  })
  await db.collection('sys_user').count().then(res => {
    data.total_user = res.total;
  })
  await db.collection('answer_formal').count().then(res => {
    data.formal_answer_num = res.total;
  })
  await db.collection('answer_simulation').count().then(res => {
    data.simulation_answer_num = res.total;
  })
  result = Result.put(data)

  return result;
}

async function getBaseSettings() {
  let result = {};
  await cloud.callFunction({
    name:'getHomeSettings'
  }).then(res=>{
    result = Result.put(res.result);
  })
  return result;
}

async function deleteBaseSetting({id}){
  await db.collection('base_setting').doc(id).remove();
  return {code:0}
}

async function updateBaseSetting({ id, data }) {
  let result = {};
  await db.collection('base_setting').doc(id).update({data}).then(res=>{
    result = Result.put(res.stats);
  });
  return result;
}

async function addBaseSetting({ data }) {
  await db.collection('base_setting').add({ data });
  return { code: 0 }
}

async function getExam({ exam_id}){
  let result = {};
  await db.collection('exam').doc(exam_id).get().then(res => {
    result = Result.put(res.data);
  }).catch(res => {
    result = Result.error(res);
  })
  return result;
}

async function updateExamOpenStatus({exam_id,open_status}){
  let result={};
  await db.collection('exam').doc(exam_id).update({
    data:{open:open_status}
  }).then(res=>{
    result = Result.put(res);
  }).catch(res=>{
    result = Result.error(res);
  })
  return result;
}

async function addExam(exam){
  let result = {};
  exam.openTime = new Date(exam.openTime)
  exam.endTime = new Date(exam.endTime)
  await db.collection('exam').add({
    data:exam
  }).then(res => {
    result = Result.put(res);
  }).catch(res => {
    result = Result.error(res);
  })
  return result;
}

async function updateExam({id,data}){
  let result = {};
  data.openTime = new Date(data.openTime)
  data.endTime = new Date(data.endTime)
  await db.collection('exam').doc(id).update({ data}).then(res => {
    result = Result.put(res);
  }).catch(res => {
    result = Result.error(res);
  })
  return result;
}

async function deleteExam({ id }) {
  let result = {};
  await db.collection('exam').doc(id).remove().then(res => {
    result = Result.put(res);
  }).catch(res => {
    result = Result.error(res);
  })
  return result;
}

async function getRank({ exam_id }) {
  let result = {};
  const res = await cloud.callFunction({
    name:'getRank',
    data:{exam_id}
  })
  result = Result.put(res.result);
  await db.collection('answer_formal').where({exam_id}).count().then(res=>{
    result.count = res.total;
  })
  return result; 
}

async function getExamList({page,limit}){
  page = Number(page);
  limit = Number(limit);
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
  await db.collection('exam').count().then(res=>{
    result.count=res.total;
  });
  return result; 
}

let expire_seconds = 24*3600*1000;
async function service(funcName,params){
  console.log(funcName,params,tokenCache)
  if(funcName!='login'){
    let authorization = params.authorization;
    let timestamp = tokenCache.timestamp;
    if (!authorization||tokenCache.value!=authorization||!timestamp||timestamp+expire_seconds<new Date().getTime()){
      return Result.error('token无效或已过期，请重新登录');
    }
  } else {
    delete params["authorization"];
    return await login(params);
  }
  delete params["authorization"];
  return await routes[funcName](params);
}

//定义返回结果实体
function ResultModel(){
  const mapper={put,error,success};
  function put(data){
    return {data:data,code:0};
  }
  function error(errmsg) {
    return { errmsg: errmsg, code: 1 };
  }
  function success() {
    return { code: 1 };
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