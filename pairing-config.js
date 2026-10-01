(function(g){
 const rounds=[
 [['Nhung','Thoan'],['Hạnh','Liên'],['An','Hằng'],['Trúc','Lệ'],['Phượng','Mai Anh'],['Trang','Hoa'],['Ánh','Giang'],['Linh','Thủy']],
 [['Nhung','Thoan'],['Hạnh','Mai Anh'],['An','Liên'],['Trúc','Phượng'],['Lệ','Hoa'],['Ánh','Linh'],['Giang','Thủy'],['Trang','Hằng']]
 ];
 g.preparePairing=function(room,random=Math.random){
  if(!room || room.game && ['starting','playing','ended'].includes(room.game.status))return null;
  const names=Object.values(room.players||{}).map(p=>p.name),count=Number(room.pairingCount||0);
  if(names.length<2)return null;
  let pairs;
  if(count<2){
   if(names.length!==16 || !rounds[0].flat().every(n=>names.includes(n)))return null;
   pairs=rounds[count];
  }else{
   const shuffled=[...names];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
   pairs=[];for(let i=0;i<shuffled.length;i+=2)pairs.push([shuffled[i],shuffled[i+1]||'']);
  }
  const teams=Object.fromEntries(pairs.map(([player1,player2],i)=>['team'+(i+1),{player1,player2,score:0,nameEditor:player2 && random()>=.5?player2:player1}]));
  return {...room,teams,teamNameReservations:null,pairingCount:count+1};
 };
})(typeof window!=='undefined'?window:globalThis);
