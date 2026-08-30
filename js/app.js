import * as THREE from 'three';

const $=id=>document.getElementById(id);
let renderer,scene,camera,session,refSpace,viewerSpace,hitSource,reticle,volcano,lastHit=null;
let scale=0.85, placed=false, clock=new THREE.Clock(), smoke=[], sparks=[], lavaPulse=[];
const hud=$('hud'), start=$('start'), placeBtn=$('place'), mode=$('mode'), guide=$('guide');

$('scale').oninput=e=>{scale=+e.target.value/100;$('scaleText').textContent=e.target.value+'%'};
$('startAR').onclick=startAR;$('close').onclick=()=>session?.end();$('reset').onclick=()=>resetVolcano();placeBtn.onclick=placeVolcano;

function noise(x,z){return Math.sin(x*7.1+Math.sin(z*4.7))*0.035+Math.sin(z*10.3+x*2.2)*0.018+Math.sin((x+z)*18.0)*0.009}

function buildVolcano(){
 const g=new THREE.Group(); g.visible=false;
 // irregular volcanic cone
 const geo=new THREE.CylinderGeometry(.11,.62,.52,96,42,true);
 const pos=geo.attributes.position;
 for(let i=0;i<pos.count;i++){
   let x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i);
   let radial=Math.hypot(x,z), ang=Math.atan2(z,x);
   let n=noise(x*2.5,z*2.5)+(Math.sin(ang*7+y*25)*.012);
   let factor=1+n/(Math.max(radial,.08));
   pos.setXYZ(i,x*factor,y+n*.6,z*factor);
 }
 geo.computeVertexNormals();
 const rock=new THREE.MeshStandardMaterial({color:0x211b18,roughness:.98,metalness:.02});
 const mountain=new THREE.Mesh(geo,rock); mountain.position.y=.26; g.add(mountain);
 // dark ground apron
 const apronGeo=new THREE.CircleGeometry(.72,96);
 const apron=new THREE.Mesh(apronGeo,new THREE.MeshStandardMaterial({color:0x171310,roughness:1}));
 apron.rotation.x=-Math.PI/2;apron.position.y=.002;g.add(apron);
 // crater rim
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.115,.035,12,64),new THREE.MeshStandardMaterial({color:0x100d0b,roughness:1}));
 rim.rotation.x=Math.PI/2;rim.position.y=.53;g.add(rim);
 // glowing crater
 const craterMat=new THREE.MeshBasicMaterial({color:0xff4a00});
 const crater=new THREE.Mesh(new THREE.CircleGeometry(.095,48),craterMat);crater.rotation.x=-Math.PI/2;crater.position.y=.526;g.add(crater);
 lavaPulse.push(crater);
 // lava rivers: emissive tubes down slopes
 for(let j=0;j<7;j++){
   let a=j/7*Math.PI*2+(j%2)*.21;
   let pts=[];
   for(let k=0;k<9;k++){
     let q=k/8, r=.09+q*.48, y=.52*(1-q)+.018;
     let wob=Math.sin(k*1.7+j)*.018;
     pts.push(new THREE.Vector3(Math.cos(a+wob)*r,y,Math.sin(a+wob)*r));
   }
   let curve=new THREE.CatmullRomCurve3(pts);
   let tube=new THREE.Mesh(new THREE.TubeGeometry(curve,50,.010+(j%3)*.003,8,false),
     new THREE.MeshStandardMaterial({color:0xff3100,emissive:0xff2200,emissiveIntensity:3,roughness:.35}));
   g.add(tube);lavaPulse.push(tube);
 }
 // local orange light
 let light=new THREE.PointLight(0xff4a10,4,2.2,2);light.position.set(0,.62,0);g.add(light);
 // smoke clouds
 for(let i=0;i<34;i++){
   const mat=new THREE.MeshLambertMaterial({color:i<8?0x3a302b:0x242424,transparent:true,opacity:.28,depthWrite:false});
   const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.07+Math.random()*.08,1),mat);
   m.userData={phase:Math.random(),angle:Math.random()*Math.PI*2,rad:.03+Math.random()*.13,speed:.10+Math.random()*.13};
   g.add(m);smoke.push(m);
 }
 // incandescent ejecta
 const sparkGeo=new THREE.SphereGeometry(.006,5,4);
 for(let i=0;i<70;i++){
   const m=new THREE.Mesh(sparkGeo,new THREE.MeshBasicMaterial({color:i%4?0xff6a00:0xffd05a}));
   m.userData={phase:Math.random(),angle:Math.random()*Math.PI*2,speed:.7+Math.random()*.8,rad:.08+Math.random()*.35};
   g.add(m);sparks.push(m);
 }
 return g;
}
function animateEffects(){
 const t=clock.getElapsedTime();
 lavaPulse.forEach((m,i)=>{if(m.material){if('emissiveIntensity'in m.material)m.material.emissiveIntensity=2.2+Math.sin(t*6+i)*1.3;}});
 smoke.forEach((m,i)=>{
   let u=(t*m.userData.speed+m.userData.phase)%1, spread=m.userData.rad*(.25+u);
   m.position.set(Math.cos(m.userData.angle+t*.18)*spread,.54+u*.85,Math.sin(m.userData.angle+t*.18)*spread);
   let s=.6+u*1.9;m.scale.setScalar(s);m.material.opacity=.34*(1-u);
 });
 sparks.forEach(m=>{
   let u=(t*m.userData.speed+m.userData.phase)%1;
   let r=m.userData.rad*u;
   m.position.set(Math.cos(m.userData.angle)*r,.55+Math.sin(u*Math.PI)*(.45+m.userData.rad),Math.sin(m.userData.angle)*r);
   m.visible=u<.9;
 });
}
async function startAR(){
 try{
  if(!navigator.xr||!await navigator.xr.isSessionSupported('immersive-ar'))throw Error('Immersive WebXR AR is niet beschikbaar.');
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera();
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.xr.enabled=true;renderer.setPixelRatio(Math.min(devicePixelRatio,2));document.body.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xddeeff,0x332211,2.2));
  volcano=buildVolcano();volcano.scale.setScalar(scale);scene.add(volcano);
  reticle=new THREE.Mesh(new THREE.RingGeometry(.07,.085,48).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff}));
  reticle.matrixAutoUpdate=false;reticle.visible=false;scene.add(reticle);
  session=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['hit-test'],optionalFeatures:['dom-overlay','light-estimation'],domOverlay:{root:document.body}});
  await renderer.xr.setSession(session);refSpace=await session.requestReferenceSpace('local');viewerSpace=await session.requestReferenceSpace('viewer');hitSource=await session.requestHitTestSource({space:viewerSpace});
  session.addEventListener('end',cleanup);start.hidden=true;hud.hidden=false;renderer.setAnimationLoop(render);
 }catch(e){$('status').textContent=e.message}
}
function render(t,frame){
 if(frame&&hitSource&&!placed){
   const hits=frame.getHitTestResults(hitSource);lastHit=hits[0]||null;
   if(lastHit){const p=lastHit.getPose(refSpace);reticle.visible=true;reticle.matrix.fromArray(p.transform.matrix);placeBtn.disabled=false;mode.textContent='Vlak gevonden';guide.textContent='Plaats de vulkaan op de witte ring.'}
   else{reticle.visible=false;placeBtn.disabled=true;mode.textContent='Zoek een vlak…'}
 }
 if(placed)animateEffects();
 renderer.render(scene,camera);
}
function placeVolcano(){
 if(!lastHit)return;const p=lastHit.getPose(refSpace);volcano.position.set(p.transform.position.x,p.transform.position.y,p.transform.position.z);
 volcano.quaternion.set(p.transform.orientation.x,p.transform.orientation.y,p.transform.orientation.z,p.transform.orientation.w);
 volcano.scale.setScalar(scale);volcano.visible=true;placed=true;reticle.visible=false;placeBtn.disabled=true;mode.textContent='Vulkaan geplaatst';guide.textContent='Beweeg rond de vulkaan — de uitbarsting blijft op zijn plaats.';
}
function resetVolcano(){placed=false;volcano.visible=false;reticle.visible=false;placeBtn.disabled=true;mode.textContent='Zoek een nieuw vlak…';guide.textContent='Beweeg langzaam over een tafel of vloer.'}
function cleanup(){renderer?.setAnimationLoop(null);hitSource?.cancel?.();hitSource=null;session=null;renderer?.domElement?.remove();hud.hidden=true;start.hidden=false;placed=false;smoke=[];sparks=[];lavaPulse=[];$('status').textContent='AR-sessie afgesloten.'}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&session)session.end()});
