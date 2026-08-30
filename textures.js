import * as THREE from 'three';

function rand(seed){
  let s=seed>>>0;
  return ()=>((s=(s*1664525+1013904223)>>>0)/4294967296);
}

function canvasTexture(size,paint){
  const c=document.createElement('canvas'); c.width=c.height=size;
  const ctx=c.getContext('2d'); paint(ctx,size);
  const tex=new THREE.CanvasTexture(c); tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  tex.colorSpace=THREE.SRGBColorSpace; tex.needsUpdate=true;
  return tex;
}

export function createRockTextures(){
  const r=rand(42);
  const map=canvasTexture(512,(ctx,s)=>{
    const g=ctx.createLinearGradient(0,0,s,s);g.addColorStop(0,'#261f1b');g.addColorStop(.5,'#3a2d25');g.addColorStop(1,'#181411');
    ctx.fillStyle=g;ctx.fillRect(0,0,s,s);
    for(let i=0;i<5000;i++){
      const x=r()*s,y=r()*s,rad=1+r()*5,v=Math.floor(35+r()*55);
      ctx.fillStyle=`rgba(${v},${Math.floor(v*.78)},${Math.floor(v*.62)},${.08+r()*.18})`;
      ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
    }
  });
  map.repeat.set(3,3);

  const bump=canvasTexture(512,(ctx,s)=>{
    ctx.fillStyle='#777';ctx.fillRect(0,0,s,s);
    for(let i=0;i<3500;i++){
      const x=r()*s,y=r()*s,rad=1+r()*8,v=Math.floor(45+r()*180);
      ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
    }
  });
  bump.repeat.set(4,4);
  return{map,bump};
}

export function createSmokeTexture(){
  return canvasTexture(256,(ctx,s)=>{
    const g=ctx.createRadialGradient(s/2,s/2,5,s/2,s/2,s/2);
    g.addColorStop(0,'rgba(210,205,198,.85)');
    g.addColorStop(.22,'rgba(100,94,90,.55)');
    g.addColorStop(.62,'rgba(45,42,40,.3)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,s,s);
  });
}
