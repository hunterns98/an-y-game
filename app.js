window.joinRoom = function(){


    let name = document.getElementById("name").value;

    let room = document.getElementById("room").value;



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
