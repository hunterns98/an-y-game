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


alert(
"Chức năng ghép cặp sẽ thêm ở bước tiếp theo"
);


}
