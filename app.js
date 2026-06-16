const db = firebase.database();



window.joinRoom = function(){


let name =
document.getElementById("name").value;


let room =
document.getElementById("room").value;



if(!name || !room){

alert("Nhập đủ tên và mã phòng");

return;

}



db.ref(
"rooms/" + room + "/players/" + name
)

.set({

name:name,

score:0,

answer:""

});



alert(
"Đã vào phòng " + room
);


}






window.createRoom = function(){


let hostName =
document.getElementById("hostName").value;



if(!hostName){

alert("Nhập tên host");

return;

}



let code =

Math.random()

.toString(36)

.substring(2,7)

.toUpperCase();



db.ref(
"rooms/" + code
)

.set({

host:hostName,

status:"waiting",

question:""

});



document.getElementById("roomCode").innerHTML =

"Mã phòng: " + code;


}






window.showHost=function(){


document.getElementById("host").style.display="block";


document.getElementById("player").style.display="none";


}






window.showPlayer=function(){


document.getElementById("player").style.display="block";


document.getElementById("host").style.display="none";


}
window.listenPlayers=function(code){



db.ref(
"rooms/"+code+"/players"
)

.on("value", function(snapshot){


let data =
snapshot.val();



let html="👥 Người chơi:<br>";



if(data){


Object.values(data)

.forEach(function(p,index){


html +=

(index+1)+". "+p.name+"<br>";


});


}



document.getElementById("playerList")

.innerHTML=html;



});


}
