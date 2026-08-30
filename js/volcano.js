import * as THREE from 'three';
import{createRockTextures,createSmokeTexture}from'./textures.js';

function fract(x){return x-Math.floor(x)}
function hash(x,z){return fract(Math.sin(x*127.1+z*311.7)*43758.5453)}
function noise2(x,z){
  const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz;
  const u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
  const a=hash(ix,iz),b=hash(ix+1,iz),c=hash(ix,iz+1),d=hash(ix+1,iz+1);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a,b,u),THREE.MathUtils.lerp(c,d,u),v);
}
function fbm(x,z){
  let n=0,a=.5,f=1;
  for(let i=0;i<5;i++){n+=noise2(x*f,z*f)*a;f*=2.05;a*=.52}
  return n;
}

export class Volcano extends THREE.Group{
  constructor(){
    super();
    this.clock=new THREE.Clock();
    this.eruption=0.8;
    this.smoke=[];
    this.sparks=[];
    this.lavaMaterials=[];
    this.visible=false;

    const {map,bump}=createRockTextures();
    this.rockMat=new THREE.MeshStandardMaterial({
      map,bumpMap:bump,bumpScale:.055,color:0x5a4739,roughness:.96,metalness:.02
    });

    this.buildTerrain();
    this.buildCrater();
    this.buildLava();
    this.buildRocks();
    this.buildSmoke();
    this.buildSparks();
    this.buildLight();
  }

  setEruption(v){this.eruption=v}

  buildTerrain(){
    const radial=92,rings=55;
    const verts=[],indices=[],uvs=[];
    for(let y=0;y<=rings;y++){
      const q=y/rings;
      const radius=q*.72;
      for(let i=0;i<=radial;i++){
        const a=i/radial*Math.PI*2;
        let base=.58*(1-Math.pow(q,.78));
        let ridge=(fbm(Math.cos(a)*3.4*q+5,Math.sin(a)*3.4*q+8)-.5)*(.16*q+.04);
        let radialRidges=Math.sin(a*11+q*10)*.022*q + Math.sin(a*5-q*18)*.014*q;
        let h=base+ridge+radialRidges;

        // crater depression
        if(q<.18){
          const c=q/.18;
          h=.50 + .08*c - .12*(1-c);
        }
        verts.push(Math.cos(a)*radius,h,Math.sin(a)*radius);
        uvs.push(i/radial,q);
      }
    }
    const row=radial+1;
    for(let y=0;y<rings;y++)for(let i=0;i<radial;i++){
      const a=y*row+i,b=a+1,c=a+row,d=c+1;
      indices.push(a,c,b,b,c,d);
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    geo.setIndex(indices);geo.computeVertexNormals();
    const mesh=new THREE.Mesh(geo,this.rockMat);
    mesh.castShadow=true;mesh.receiveShadow=true;this.add(mesh);

    // dark rough apron
    const apron=new THREE.Mesh(
      new THREE.CircleGeometry(.86,128),
      new THREE.MeshStandardMaterial({color:0x17120f,roughness:1})
    );
    apron.rotation.x=-Math.PI/2;apron.position.y=.002;apron.receiveShadow=true;this.add(apron);
  }

  buildCrater(){
    const rim=new THREE.Mesh(
      new THREE.TorusGeometry(.13,.045,18,96),
      new THREE.MeshStandardMaterial({color:0x17110e,roughness:1,bumpMap:this.rockMat.bumpMap,bumpScale:.04})
    );
    rim.rotation.x=Math.PI/2;rim.position.y=.55;this.add(rim);

    const lava=new THREE.Mesh(
      new THREE.CircleGeometry(.105,72),
      new THREE.MeshStandardMaterial({color:0xff3a00,emissive:0xff2400,emissiveIntensity:5,roughness:.18})
    );
    lava.rotation.x=-Math.PI/2;lava.position.y=.548;this.add(lava);this.lavaMaterials.push(lava.material);
  }

  buildLava(){
    const count=9;
    for(let j=0;j<count;j++){
      const a=j/count*Math.PI*2 + (j%3)*.17;
      const pts=[];
      const len=7+Math.floor(Math.random()*4);
      for(let k=0;k<len;k++){
        const q=k/(len-1);
        const r=.10+q*(.45+Math.random()*.12);
        const wob=Math.sin(k*1.7+j*2.1)*.025 + (Math.random()-.5)*.012;
        let y=.545*(1-Math.pow(q,.82))+.018;
        pts.push(new THREE.Vector3(Math.cos(a+wob)*r,y,Math.sin(a+wob)*r));
      }
      const curve=new THREE.CatmullRomCurve3(pts);
      const mat=new THREE.MeshStandardMaterial({
        color:0xff3100,emissive:0xff1d00,emissiveIntensity:4.5,roughness:.26,metalness:0
      });
      const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,80,.008+Math.random()*.009,10,false),mat);
      this.add(tube);this.lavaMaterials.push(mat);
    }
  }

  buildRocks(){
    const geo=new THREE.DodecahedronGeometry(.04,0);
    for(let i=0;i<85;i++){
      const m=new THREE.Mesh(geo,this.rockMat);
      const a=Math.random()*Math.PI*2,r=.52+Math.random()*.3;
      m.position.set(Math.cos(a)*r,.02+Math.random()*.04,Math.sin(a)*r);
      m.scale.setScalar(.45+Math.random()*1.8);
      m.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);
      m.castShadow=true;m.receiveShadow=true;this.add(m);
    }
  }

  buildSmoke(){
    const tex=createSmokeTexture();
    const geo=new THREE.PlaneGeometry(.26,.26);
    for(let i=0;i<42;i++){
      const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,opacity:.25,side:THREE.DoubleSide,color:i<8?0x5a4a40:0x34302e});
      const s=new THREE.Mesh(geo,mat);
      s.userData={phase:Math.random(),angle:Math.random()*Math.PI*2,rad:.03+Math.random()*.12,speed:.07+Math.random()*.09,spin:(Math.random()-.5)*.4};
      this.add(s);this.smoke.push(s);
    }
  }

  buildSparks(){
    const geo=new THREE.SphereGeometry(.006,5,4);
    for(let i=0;i<95;i++){
      const mat=new THREE.MeshBasicMaterial({color:i%5?0xff5a00:0xffc34f});
      const p=new THREE.Mesh(geo,mat);
      p.userData={phase:Math.random(),angle:Math.random()*Math.PI*2,speed:.7+Math.random()*1.2,rad:.08+Math.random()*.42};
      this.add(p);this.sparks.push(p);
    }
  }

  buildLight(){
    this.light=new THREE.PointLight(0xff5a1f,5.5,2.3,2.0);
    this.light.position.set(0,.63,0);this.add(this.light);
  }

  update(camera){
    const t=this.clock.getElapsedTime();
    const e=this.eruption;

    for(let i=0;i<this.lavaMaterials.length;i++){
      const m=this.lavaMaterials[i];
      m.emissiveIntensity=3.2 + e*2.4 + Math.sin(t*7+i*.8)*.8;
    }
    this.light.intensity=3.6+e*3+Math.sin(t*9)*.7;

    this.smoke.forEach((s,i)=>{
      const u=(t*s.userData.speed*e+s.userData.phase)%1;
      const spread=s.userData.rad*(.25+u*1.8);
      s.position.set(
        Math.cos(s.userData.angle+t*.12)*spread,
        .56+u*(.72+.35*e),
        Math.sin(s.userData.angle+t*.12)*spread
      );
      const sc=.45+u*2.2;
      s.scale.setScalar(sc);
      s.material.opacity=.33*(1-u)*(.7+.3*e);
      s.lookAt(camera.position);
      s.rotation.z+=s.userData.spin*.002;
    });

    this.sparks.forEach(p=>{
      const u=(t*p.userData.speed*e+p.userData.phase)%1;
      const r=p.userData.rad*u;
      p.position.set(
        Math.cos(p.userData.angle)*r,
        .57+Math.sin(u*Math.PI)*(.34+.48*e+p.userData.rad*.4),
        Math.sin(p.userData.angle)*r
      );
      p.visible=u<.88;
      p.scale.setScalar(.7+e*.45);
    });
  }
}
