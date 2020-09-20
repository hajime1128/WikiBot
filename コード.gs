var access_token = "botのアクセストークン代入"
var line_url = 'https://api.line.me/v2/bot/message/reply';
var wiki_api = "http://wikipedia.simpleapi.net/api";

function doPost(e) {
  var reply_token= JSON.parse(e.postData.contents).events[0].replyToken;
  if (typeof reply_token === "undefined"){
    return;
}
  var user_message = JSON.parse(e.postData.contents).events[0].message.text;
  
  var reply_messages = ["すまない。データにないようだ"];
  if (/とは？?$/.test(user_message)) {
    var q = user_message.match(/(.*)とは？?$/)[1];
    var url_and_body = getWikipediaUrlAndBody(q);
    if (url_and_body !== null) {
      reply_messages = [
        "「" + q + "」" + "について知りたいようだね",
        url_and_body.body.substr(0, 100) + "...",
        "続きはこっちだよ\n"+url_and_body.url,
      ];
    }
  }
  

  var messages = reply_messages.map(function(v){
    return {'type': 'text', 'text': v};
  });
  
  UrlFetchApp.fetch(line_url,{
     "headers" : {
      "Content-Type" : "application/json; charset=UTF-8",
      "Authorization" : "Bearer " + access_token ,
     },
    "method":"post",
    "payload" : JSON.stringify({
      "replyToken":reply_token,
      'messages': messages,
    }),
  });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}

function getWikipediaUrlAndBody(q){
  var url = wiki_api + '?keyword=' + encodeURIComponent(q) + '&output=json';
  var res = JSON.parse(UrlFetchApp.fetch(url));
  if (res !== null){
    return {'url': res[0].url,'body': res[0].body};
  } else {
    return null;
  }
}
