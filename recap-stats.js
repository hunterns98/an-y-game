(function(root){
 function summarize(round,roster){
  const entries=Object.entries(roster).map(([id,team],index)=>({id,...team,...round.teams?.[id],index}));
  const shared=round.type==='team_tags', bins=new Map(), missing=[];
  const addBin=value=>{if(!bins.has(value))bins.set(value,{value,members:[]});};
  const options=shared?(round.tags||[]):round.type==='choice'?['A','B']:entries.flatMap(t=>[t.player1,t.player2]);
  options.forEach(addBin);
  for(const team of entries){
   const votes=shared?[{value:team.answer1,team}]:[{value:team.answer1,player:team.player1,team},{value:team.answer2,player:team.player2,team}];
   for(const vote of votes){if(vote.value==null||vote.value===''){missing.push(vote);continue;}addBin(vote.value);bins.get(vote.value).members.push(vote);}
  }
  const total=entries.length*(shared?1:2);
  return {shared,total,missing,teamCount:entries.length,matched:entries.filter(t=>t.match===true).length,bins:[...bins.values()].map(b=>({...b,count:b.members.length,percent:total?b.members.length/total*100:0}))};
 }
 if(typeof module!=='undefined')module.exports={summarize};else root.RecapStats={summarize};
})(typeof window!=='undefined'?window:globalThis);
