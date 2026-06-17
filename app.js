// Kết nối Firebase Database
const db = firebase.database();



// =======================
// HIỂN THỊ CHỌN ROLE
// =======================

window.showHost = function(){

    document.getElementById("host").style.display = "block";

    document.getElementById("player").style.display = "none";

}



window.showPlayer = function(){

    document.getElementById("player").style.display = "block";

    document.getElementById("host").style.display = "none";

}




// =======================
// NGƯỜI CHƠI VÀO PHÒNG
// =======================

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
listenGame(room);

}




// =======================
// HOST TẠO PHÒNG
// =======================

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



    // bắt đầu nghe người chơi

    listenPlayers(code);
listenGame(code);


}





// =======================
// HIỂN THỊ DANH SÁCH NGƯỜI CHƠI
// =======================


window.listenPlayers = function(code){



    db.ref(
        "rooms/" + code + "/players"
    )

    .on(
        "value",

        function(snapshot){


            let players =
            snapshot.val();



            let html =
            "👥 Người chơi:<br><br>";



            if(players){


                Object.values(players)

                .forEach(

                function(player,index){


                    html +=

                    (index+1)

                    + ". "

                    + player.name

                    + "<br>";

                }

                );



            }

            else{


                html +=

                "Chưa có ai vào phòng";

            }



            document.getElementById("playerList")

            .innerHTML = html;



        }


    );



}






// =======================
// GHÉP CẶP (TẠM THỜI)
// =======================


window.makeTeams = function(){



let roomCode =
prompt("Nhập mã phòng để ghép cặp");



if(!roomCode){

return;

}



db.ref(
"rooms/"+roomCode+"/players"
)

.once("value")

.then(function(snapshot){



let players = snapshot.val();



if(!players){

alert("Chưa có người chơi");

return;

}



let list =
Object.values(players);



if(list.length < 2){

alert("Cần ít nhất 2 người");

return;

}



// xáo trộn

list.sort(
()=>Math.random()-0.5
);



let teams = {};



for(
let i=0;
i<list.length;
i+=2
){


let teamNumber =
(i/2)+1;



teams["team"+teamNumber]={


player1:
list[i].name,


player2:
list[i+1]
?
list[i+1].name
:
"Đang chờ"


};


}



db.ref(
"rooms/"+roomCode+"/teams"
)

.set(teams);



alert(
"Đã ghép "+Object.keys(teams).length+" đội"
);

listenTeams(roomCode);

});


}
window.listenTeams = function(roomCode){



db.ref(
"rooms/"+roomCode+"/teams"
)

.on(
"value",

function(snapshot){


let teams = snapshot.val();



if(!teams){

return;

}



let html =
"🎉 Đội chơi:<br><br>";



Object.values(teams)

.forEach(function(team,index){


html +=

"❤️ Team "

+(index+1)

+" : "

+team.player1

+" + "

+team.player2

+"<br>";


});



document.getElementById("teamList")

.innerHTML = html;



}


);



}
// =======================
// CÂU HỎI ĂN Ý
// =======================


const questions = [

{
text:"Thức uống bạn chọn là:",
a:"Cà phê",
b:"Trà",
special:false
},

{
text:"Bạn thích phúc lợi:",
a:"Thêm ngày phép",
b:"Tiền thưởng nóng",
special:false
},

{
text:"Thể loại âm nhạc bạn chọn:",
a:"Ballad thất tình",
b:"Remix giật giật",
special:false
},

{
text:"Nếu phải chọn nuôi:",
a:"Chó",
b:"Mèo",
special:false
},

{
text:"Liên hoan cuối năm bạn chọn:",
a:"Hát",
b:"Nhảy",
special:false
},

{
text:"Sếp bảo tăng ca nhé em:",
a:"Tìm lý do từ chối",
b:"Chấp nhận số phận",
special:false
},

{
text:"Môi trường công sở:",
a:"Lương cao sếp toxic",
b:"Lương thấp đồng nghiệp vui",
special:false
},

{
text:"Màu yêu thích:",
a:"Đỏ",
b:"Xanh Lá",
special:false
},

{
text:"Bộ môn thể thao nếu phải chọn:",
a:"Chạy bộ",
b:"Bơi lội",
special:false
},

{
text:"Nếu phải chọn đi du lịch:",
a:"Lên núi",
b:"Xuống biển",
special:false
},

{
text:"Nếu lựa chọn:",
a:"Làm sếp công ty bé",
b:"Nhân viên tập đoàn lớn",
special:false
},

{
text:"Nếu lựa chọn đồ uống unhealthy:",
a:"Bia",
b:"Rượu",
special:false
},

{
text:"Đến giờ nạp calo rồi, bạn chọn:",
a:"Ăn lẩu",
b:"Ăn nướng",
special:false
},

{
text:"Câu hỏi ăn điểm: Tỉnh nào bắt đầu bằng chữ H?",
a:"Hà Nội",
b:"Hải Phòng",
special:true
},

{
text:"Thời tiết ưa thích:",
a:"Mùa Xuân mát mẻ",
b:"Mùa Thu se lạnh",
special:false
},

{
text:"Chuông báo thức kêu:",
a:"Dậy ngay",
b:"Bấm 5 phút nữa",
special:false
},

{
text:"Kế hoạch cuối tuần:",
a:"Ngủ nướng",
b:"Ra ngoài vi vu",
special:false
},

{
text:"Khẩu vị:",
a:"Cay",
b:"Chua Ngọt",
special:false
},

{
text:"Dân chơi hệ:",
a:"Táo IOS",
b:"Android",
special:false
},

{
text:"Nếu lựa chọn, bạn muốn trở thành:",
a:"Steve Jobs",
b:"Elon Musk",
special:false
}

];





// =======================
// HOST BẮT ĐẦU GAME
// =======================


window.startGame=function(){


let roomCode =
prompt("Nhập mã phòng");


if(!roomCode){

return;

}



let q =
questions[
Math.floor(
Math.random()*questions.length
)
];



db.ref(
"rooms/"+roomCode+"/game"
)

.set({

question:q.text,

optionA:q.a,

optionB:q.b,

status:"playing"

});



listenGame(roomCode);


}







// =======================
// NGHE CÂU HỎI REALTIME
// =======================


window.listenGame=function(roomCode){



db.ref(
"rooms/"+roomCode+"/game"
)

.on(
"value",

function(snapshot){


let game =
snapshot.val();



if(!game){

return;

}



document.getElementById("gameArea")

.innerHTML =


"<h2>🎯 Câu hỏi</h2>"+

game.question+

"<br><br>"+

"A. "+game.optionA+

"<br>"+

"B. "+game.optionB;



}



);



}
