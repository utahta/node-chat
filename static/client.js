/**
 * node.js チャットサンプル
 */

var socket = new io.Socket(null, {port:8080});
socket.connect();

socket.on('connect', function(){
    $('#main').load('/login');
});

socket.on('message', function(msg){
    dbglog(msg.id + ' - ' + msg.data);
    
    switch(msg.id){
    case 'enter':
        enter_res(msg);
        break;

    case 'notice':
        notice_res(msg);
        break;

    case 'pubmsg':
        pubmsg_res(msg);
        break;
    }

});

socket.on('disconnect', function(){
    $('#main').append('<p class="notice">サーバーとの接続が切れました。</p>');
});

/**
 * ユーティリティ
 */
// 送信用関数
function send_message(id, data){
    socket.send({
        id: id,
        data: data
    });
}
// デバッグログ
function dbglog(log){
    if(console){
        console.log(log);
    }
}

/**
 * 送信・応答
 */

// 部屋入室要求
function enter(){
    var name = document.forms[0].elements["name"].value;
    send_message('enter', {name:name});
    return false;
}

// 部屋入室要求の結果
function enter_res(msg){
    if(!msg.result){
        alert('既に同じ名前が使用されています。');
        return;
    }
    $('#main').load('/room');
}

// 通知メッセージ受信
function notice_res(msg){
    $('#chat').append('<p class="notice">'+msg.data.msg+'</p>');
}

// 通常メッセージ送信
function pubmsg(){
    var msg = document.forms[0].elements['msg'].value;
    document.forms[0].elements['msg'].value = '';
    send_message('pubmsg', {msg:msg});
    return false;
}

// 通常メッセージ受信
function pubmsg_res(msg){
    $('#chat').append('<p class="pubmsg">'+msg.data.name+': '+msg.data.msg+'</p>');
}


