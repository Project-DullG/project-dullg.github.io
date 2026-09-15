"use strict";
const slides=JSON.parse(document.getElementById('slides-data').textContent);
const $=id=>document.getElementById(id);
let index=0,playing=false,timer=null,request=0;
const narration=document.createElement('audio');narration.id='narration';narration.preload='metadata';document.body.append(narration);
function text(tag,value){const n=document.createElement(tag);n.textContent=value;return n;}
function clearTimer(){clearTimeout(timer);timer=null;}
function updateButtons(){ $('play').textContent=playing?'일시정지':'재생';$('play').setAttribute('aria-pressed',String(playing)); }
function pause(){request++;playing=false;clearTimer();narration.pause();updateButtons();$('speech-status').textContent='일시정지했습니다. 재생을 누르면 이어서 들을 수 있습니다.';}
function advance(){if(index<slides.length-1){index++;render();window.scrollTo({top:0,behavior:'instant'});}else{pause();$('speech-status').textContent='마지막 슬라이드입니다. 다시 들으려면 재생을 누르세요.';}}
function play(){clearTimer();playing=true;updateButtons();if(!$('voice').checked){$('speech-status').textContent='음성 없이 자동으로 넘깁니다.';timer=setTimeout(advance,Math.max(10000,slides[index].paragraphs.join('').length*155));return;}
 if(!slides[index].audio){pause();$('speech-status').textContent='이 슬라이드의 음성을 준비하지 못했습니다. 다음 버튼으로 계속 읽을 수 있습니다.';return;}
 const token=++request;narration.playbackRate=Number($('speed').value);if(narration.ended)narration.currentTime=0;
 narration.play().then(()=>{if(token!==request){if(!playing)narration.pause();return;}$('speech-status').textContent='내레이션 재생 중 · 음성이 끝나면 다음 슬라이드로 넘어갑니다.';}).catch(()=>{if(token!==request)return;pause();$('speech-status').textContent='음성을 재생하지 못했습니다. 재생 버튼을 다시 눌러 주세요.';});}
function render(){request++;clearTimer();narration.pause();const s=slides[index];if(s.audio)narration.src=s.audio;else narration.removeAttribute('src');const a=$('slide');a.replaceChildren(text('div',String(index+1).padStart(2,'0')),text('h1',s.title));a.firstChild.className='eyebrow';s.paragraphs.forEach(p=>a.append(text('p',p)));
 if(s.visual==='map'){const im=document.createElement('img');im.src='floor_map_3f.svg';im.alt='학원 3층 지도. 핸드폰함은 아래쪽 책장 오른편에 있다.';im.className='map';a.append(im);}
 if(s.visual==='cast'){const wrap=document.createElement('div');wrap.className='cast';[['yoonjiwon','윤지원'],['parksejun','박세준'],['chaharin','차하린'],['handokyung','한도경']].forEach(([id,name])=>{const f=document.createElement('figure'),im=document.createElement('img');im.src='chr_export/'+id+'.png';im.alt=name;f.append(im,text('figcaption',name));wrap.append(f);});a.append(wrap);}
 appendDiagram(a,s.visual);$('count').textContent=(index+1)+' / '+slides.length;$('jump').value=index;$('prev').disabled=index===0;$('next').disabled=index===slides.length-1;updateButtons();if(playing)play();else $('speech-status').textContent='재생 버튼을 누르면 이 슬라이드부터 들을 수 있습니다.';}
$('prev').onclick=()=>{if(index>0){index--;render();window.scrollTo({top:0,behavior:'instant'});}};
$('next').onclick=()=>{if(index<slides.length-1){index++;render();window.scrollTo({top:0,behavior:'instant'});}};
$('play').onclick=()=>playing?pause():play();
$('voice').onchange=()=>{request++;narration.pause();clearTimer();if(playing)play();};
$('speed').onchange=()=>narration.playbackRate=Number($('speed').value);
$('jump').onchange=()=>{index=Number($('jump').value);render();window.scrollTo({top:0,behavior:'instant'});};
narration.onended=()=>{if(playing&&$('voice').checked)timer=setTimeout(advance,600);};
narration.onerror=()=>{if(!playing)return;pause();$('speech-status').textContent='음성 파일을 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 재생을 눌러 주세요.';};
document.addEventListener('keydown',e=>{if(['INPUT','BUTTON','SUMMARY','SELECT','TEXTAREA'].includes(document.activeElement.tagName))return;if(e.key==='ArrowRight')$('next').click();if(e.key==='ArrowLeft')$('prev').click();});
window.addEventListener('pagehide',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
slides.forEach((s,i)=>{const opt=text('option',(i+1)+'. '+s.title);opt.value=i;$('jump').append(opt);const sec=document.createElement('section');sec.append(text('h2',s.title));s.paragraphs.forEach(p=>sec.append(text('p',p)));$('transcript').append(sec);});render();
function appendDiagram(parent,type){
 const defs={
 setup:['준비물 배치', [['각 플레이어','인물 시트 1부','소지품 카드 3장 · 비공개'],['테이블 가운데','공통 단서 1 → 2 → 3','투표 안내 4 · 순서대로 놓기']]],
 first:['첫 라운드의 공개 순서',[['선 플레이어','자기 카드 1장 공개','첫 라운드에만'],['지목받은 두 사람','각자 카드 1장 공개','서로 다른 두 명'],['모두 함께','5분 토론','이후 공통 단서 1번 공개']]],
 rights:['공개한 카드 수 → 다음 지목권',[['직전 라운드','지목받아 1장 공개','다음 라운드 지목 1회'],['직전 라운드','지목받아 2장 공개','다음 라운드 지목 2회']]],
 sequence:['두 번의 지목은 차례대로',[['1차 지목','대상 선택 → 1장 공개','남은 카드를 먼저 확인'],['2차 지목','대상 선택 → 1장 공개','카드가 없는 사람은 제외']]],
 duplicate:['예시 · B와 C가 모두 D를 지목',[['이번 라운드','B → D, C → D','D가 카드 2장 공개'],['다음 라운드','D가 지목권 2회','한 번씩 차례대로 진행']]],
 discussion:['공통 단서 공개 순서',[['1번째 토론 뒤','공통 단서 1','5분 토론 → 공개'],['2번째 토론 뒤','공통 단서 2','5분 토론 → 공개'],['3번째 토론 뒤','공통 단서 3','이후 최종 토론'],['최종 토론 뒤','투표 안내 4','동시에 지목']]],
 stop:['소지품 카드만 셉니다',[['처음','12장','4명 × 3장'],['공개를 멈출 때','비공개 3장','공통 단서는 세지 않음']]],
 table:['테이블 전체가 함께 확인',[['함께 보는 정보','공개된 소지품·공통 단서','카드 문구를 바꾸지 않기'],['혼자 보는 정보','인물 시트·비공개 카드','다른 사람에게 보여주지 않기']]],
 vote:['최종 투표 순서',[['각자 결론 정하기','동시에 지목','가장 수상한 인물 1명'],['동률이라면','각각 2분 최후 변론','그 뒤 다시 한 번 투표']]],
 ending:['엔딩 QR을 여는 시점',[['투표 전','엔딩 열지 않기','내용이 미리 드러납니다'],['최종 투표 후','엔딩 QR 스캔','점수 · 지목 결과 · 전말 확인']]],
 retest:['재시험 일정',[['오늘 재시험을 못 보면','토요일 오후 보충반','재시험 대상자 반드시 출석']]],
 clock:['사건의 시간',[['오후 7:10','열쇠가 없다는 것을 확인',''],['오후 7:25','현재 시각',''],['오후 8:00','열쇠를 찾아야 하는 시각','']]]
 };
 if(!defs[type])return;
 const [title,items]=defs[type],fig=document.createElement('figure');fig.className='rule-diagram';fig.append(text('figcaption',title));const row=document.createElement('div');row.className='diagram-grid';
 items.forEach(([label,main,sub],i)=>{const card=document.createElement('div');card.className='diagram-step';card.append(text('span',String(i+1).padStart(2,'0')),text('small',label),text('strong',main));if(sub)card.append(text('p',sub));row.append(card);});fig.append(row);
 if(type==='setup'||type==='stop'){const deck=document.createElement('div');deck.className='mini-deck';const n=type==='stop'?3:3;for(let i=0;i<n;i++){const c=text('span','소지품');c.className='mini-card';deck.append(c);}deck.append(text('small',type==='stop'?'전체 비공개 소지품 카드 3장 → 공개 종료':'개인 소지품 카드 · 뒷면으로 보관'));fig.append(deck);}
 if(['first','duplicate'].includes(type)){const strip=document.createElement('div');strip.className='nomination-strip';const entries=type==='duplicate'?[['parksejun','B','D를 지목'],['chaharin','C','D를 지목'],['handokyung','D','2장 공개']]:[['yoonjiwon','A','선 플레이어'],['parksejun','B','1장 공개'],['chaharin','C','1장 공개']];strip.setAttribute('aria-label','플레이어 예시');entries.forEach(([id,label,action])=>{const f=document.createElement('figure'),im=document.createElement('img');im.src='chr_export/'+id+'.png';im.alt='';f.append(im,text('figcaption',label+' · '+action));strip.append(f);});fig.insertBefore(strip,fig.children[1]);}parent.append(fig);
}
