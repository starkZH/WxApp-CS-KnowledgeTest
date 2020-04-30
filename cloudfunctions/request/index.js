// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

var rp = require('request-promise');
const querystring = require('querystring');

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let re_response = {};
  let access_data = {};
  let headers = event.headers?event.headers:{};
  var options = {
    method: event.method,
    uri: event.url,
    resolveWithFullResponse: true,
    headers: {
      ...headers,
      'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36'
    },
    form:event.params?event.params:{},
    // json: true
};
  await rp(options).then(res=>{
    re_response.headers = res.headers;
    re_response.body = res.body;
    access_data = querystring.parse(res.request.uri.query);
  })

  return {
    re_response:re_response,
    access_data,
    event,
    request_headers: {
      ...headers,
      'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36'
    }
    // openid: wxContext.OPENID,
    // appid: wxContext.APPID,
    // unionid: wxContext.UNIONID,
  }
}