import{ARController}from'./ar.js';

const $=id=>document.getElementById(id);
const ui={
  home:$('home'),hud:$('hud'),start:$('startAR'),close:$('close'),reset:$('reset'),
  place:$('place'),mode:$('mode'),guide:$('guide'),status:$('status'),
  scale:$('scale'),scaleText:$('scaleText'),eruption:$('eruption'),eruptionText:$('eruptionText')
};

let ar=null,canPlace=false;

ui.scale.oninput=()=>{ui.scaleText.textContent=ui.scale.value+'%';ar?.setScale(+ui.scale.value/100)};
ui.eruption.oninput=()=>{ui.eruptionText.textContent=ui.eruption.value+'%';ar?.setEruption(+ui.eruption.value/100)};

function updatePlace(){ui.place.disabled=!canPlace}

ui.start.onclick=async()=>{
  try{
    ui.status.textContent='AR starten…';
    ar=new ARController({
      onStarted:(refMode)=>{ui.home.hidden=true;ui.hud.hidden=false;ui.mode.textContent='Zoek een vlak…';ui.guide.textContent='Beweeg langzaam over een tafel of vloer. Ref: '+refMode},
      onCanPlace:v=>{canPlace=v;updatePlace();if(v){ui.mode.textContent='Vlak gevonden';ui.guide.textContent='Plaats de vulkaan op de witte ring.'}},
      onPlaced:()=>{canPlace=false;updatePlace();ui.mode.textContent='Vulkaan geplaatst';ui.guide.textContent='Beweeg rond de vulkaan. De uitbarsting blijft verankerd.'},
      onReset:()=>{canPlace=false;updatePlace();ui.mode.textContent='Zoek een nieuw vlak…';ui.guide.textContent='Beweeg langzaam over een tafel of vloer.'},
      onEnded:()=>{ui.hud.hidden=true;ui.home.hidden=false;canPlace=false;updatePlace();ar=null;ui.status.textContent='AR-sessie afgesloten.'}
    });
    ar.setScale(+ui.scale.value/100);
    ar.setEruption(+ui.eruption.value/100);
    await ar.start();
  }catch(e){console.error(e);ui.status.textContent=e.message}
};

ui.place.onclick=()=>ar?.place();
ui.reset.onclick=()=>ar?.reset();
ui.close.onclick=()=>ar?.end();

document.addEventListener('visibilitychange',()=>{if(document.hidden&&ar)ar.end()});
updatePlace();
