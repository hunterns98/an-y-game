// Shared copy and Zalo emoticon rendering for player, display and offline demos.
(function(global){
  const positions={'b-)':['cool','82% 2.5%'],';xx':['oops','84% 12.5%'],';p':['playful','82% 22.5%'],'/-ok':['okay','84% 87.5%'],';-x':['kiss','82% 75%']};
  const resultCopy = ({match,isUnique,a1,a2}) => {
    if(!a1 || !a2) return {title:'Các cô cậu có quên ăn cơm không? Mà quên điền đáp án?',icon:';xx'};
    if(!match) return {title:'Lệch sóng rồi bà Thơ',icon:';xx'};
    if(isUnique) return {title:'Không biết ai dạy, nhưng hai bà học cùng lớp /-ok',icon:'b-)'};
    return {title:'Chuẩn luôn. Đúng chị em guột ;p',icon:'💞'};
  };
  const nameParts=value=>Array.from(new Intl.Segmenter('vi',{granularity:'grapheme'}).segment(value),part=>part.segment);
  const teamNameLength=value=>nameParts(value).length;
  function updateTeamNameInput(){
    const input=document.getElementById('inp-team-name');
    if(!input)return;
    input.value=nameParts(input.value).slice(0,20).join('');
    document.getElementById('team-name-count').textContent=teamNameLength(input.value)+'/20 ký tự';
  }
  global.GamePresentation={resultCopy,teamNameLength,updateTeamNameInput};
  const pattern=/~~hám zai~~|b-\)|;xx|;p|\/-ok|;-x/g;
  function render(root){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];let node;
    while(node=walker.nextNode()){
      if(!node.parentElement || node.parentElement.closest('script,style,textarea,option,.zalo-emote,[data-no-emotes]'))continue;
      pattern.lastIndex=0;if(pattern.test(node.data))nodes.push(node);
    }
    for(const text of nodes){
      const fragment=document.createDocumentFragment();let from=0;pattern.lastIndex=0;
      for(const match of text.data.matchAll(pattern)){
        fragment.append(document.createTextNode(text.data.slice(from,match.index)));
        if(match[0]==='~~hám zai~~'){
          const strike=document.createElement('del');strike.textContent='hám zai';fragment.append(strike);
          from=match.index+match[0].length;continue;
        }
        const span=document.createElement('span'),entry=positions[match[0]];
        span.className='zalo-emote emote-'+entry[0];span.setAttribute('role','img');span.setAttribute('aria-label',match[0]);span.title=match[0];span.style.backgroundPosition=entry[1];fragment.append(span);
        from=match.index+match[0].length;
      }
      fragment.append(document.createTextNode(text.data.slice(from)));text.replaceWith(fragment);
    }
  }
  if(typeof document==='undefined')return;
  const nameInput=document.getElementById('inp-team-name');
  if(nameInput){
    nameInput.addEventListener('input',event=>{if(!event.isComposing)updateTeamNameInput()});
    nameInput.addEventListener('compositionend',updateTeamNameInput);
    updateTeamNameInput();
  }
  const observer=new MutationObserver(records=>{
    observer.disconnect();
    const roots=new Set();
    records.forEach(record=>{if(record.type==='characterData')roots.add(record.target.parentElement);else record.addedNodes.forEach(n=>{if(n.nodeType===1)roots.add(n);else if(n.nodeType===3)roots.add(n.parentElement);});});
    roots.forEach(root=>{if(root && root.isConnected)render(root)});
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  });
  render(document.body);observer.observe(document.body,{subtree:true,childList:true,characterData:true});
})(typeof window!=='undefined'?window:globalThis);
