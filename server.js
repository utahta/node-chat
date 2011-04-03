/**
 * node.js チャットサンプル
 */

var util = require('util');
var io = require('socket.io');
var express = require('express');
var app = express.createServer();
var room = require('./lib/room.js');

app.configure(function(){
    app.use(express.static(__dirname + '/static'));
    app.use(express.bodyParser());
});

app.get('/', function(req, res){
    res.render('index.jade', {layout:false});
});
app.get('/login', function(req, res){
    res.render('login.jade', {layout:false});
});
app.get('/room', function(req, res){
    res.render('room.jade', {layout:false});
});

app.listen(8080);

var socket = io.listen(app);
socket.on('connection', function(client){

    client.on('message', function(msg){
        console.log(msg.id + ':' + util.inspect(msg.data) + ' session:' + client.sessionId);
        if(!msg.id) return;

        switch(msg.id){
        case 'enter':
            enter(msg, client);
            break;

        case 'leave':
            leave(client);
            break;

        case 'pubmsg':
            pubmsg(msg, client);
            break;
        }
    });

    client.on('disconnect', function(){
        leave(client);
    });

});

// 送信関数
function send_result(client, id, result, data){
    var msg = {id:id, result:result, data:data};
    client.send(msg);
}

// htmlエスケープ
function html_escape(val){
    return val.replace(/&/g,"&amp;")
              .replace(/"/g,"&quot;")
              .replace(/'/g,"&#039;")
              .replace(/</g,"&lt;")
              .replace(/>/g,"&gt;");
}

/**
 * メッセージ応答
 */
// チャットルームに入るときの処理
function enter(msg, c){
    var name = html_escape(msg.data.name);
    // 既に同じ名前が使われていないかチェック
    if(room.checkUserName(name)){
        send_result(c, msg.id, false, {});
        return;
    }
    c.user_name = name;
    
    // ルーム入室処理
    if(!room.enter(c)){
        send_result(c, msg.id, false, {});
        return;
    }
    send_result(c, msg.id, true, {}); // 入室成功を返す

    // ルームに入ったことを他のひとに通知
    room.notice(name+' さんが入室しました。');
}

// チャットルームから出るときの処理
function leave(c){
    room.leave(c);
    room.notice(c.user_name+' さんが退室しました。');
}

// メッセージ受信
function pubmsg(msg, c){
    // ルーム内のひとに中継
    var emsg = html_escape(msg.data.msg);
    room.pubmsg(c.user_name, emsg);
    console.log('pubmsg. name:'+c.user_name+' msg:'+emsg);
}

