/**
 * 部屋処理
 */

var clients = [];


exports.checkUserName = function(name){
    for(var i = 0; i < clients.length; i++){
        if(clients[i].user_name == name){
            return true;
        }
    }
    return false;
}

exports.enter = function(client){
    clients.push(client);
    console.log('enter room. name:'+client.user_name);
    return true;
}

exports.leave = function(client){
    for(var i = 0; i < clients.length; i++){
        if(clients[i].sessionId == client.sessionId){
            clients.splice(i, 1);
        }
    }
    console.log('leave room. name:'+client.user_name);
}

exports.notice = function(msg){
    broadcast({
        id: 'notice',
        data:{
            msg: msg
        }
    });
}

exports.pubmsg = function(name, msg){
    broadcast({
        id: 'pubmsg',
        data:{
            name: name,
            msg: msg
        }
    });
}

function broadcast(msg){
    for(var i = 0; i < clients.length; i++){
        clients[i].send(msg);
    }
}


