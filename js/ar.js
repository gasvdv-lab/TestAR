import * as THREE from 'three';
import{Volcano}from'./volcano.js';

export class ARController{
  constructor(callbacks={}){
    this.cb=callbacks;
    this.session=null;this.hitSource=null;this.refSpace=null;this.viewerSpace=null;this.lastHit=null;
    this.placed=false;this.scale=.45;this.eruption=.8;
  }

  setScale(v){this.scale=v;if(this.volcano)this.volcano.scale.setScalar(v)}
  setEruption(v){this.eruption=v;if(this.volcano)this.volcano.setEruption(v)}

  async start(){
    if(!navigator.xr)throw new Error('WebXR niet beschikbaar.');
    if(!await navigator.xr.isSessionSupported('immersive-ar'))throw new Error('Immersive AR niet beschikbaar op dit toestel.');

    this.scene=new THREE.Scene();
    this.camera=new THREE.PerspectiveCamera();
    this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
    this.renderer.xr.enabled=true;
    this.renderer.shadowMap.enabled=true;
    this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
    document.body.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.HemisphereLight(0xcfe1ff,0x271a13,1.65));
    const fill=new THREE.DirectionalLight(0xffe4c7,.65);fill.position.set(1,2,.5);this.scene.add(fill);

    this.volcano=new Volcano();
    this.volcano.scale.setScalar(this.scale);
    this.volcano.setEruption(this.eruption);
    this.scene.add(this.volcano);

    this.reticle=new THREE.Mesh(
      new THREE.RingGeometry(.065,.082,64).rotateX(-Math.PI/2),
      new THREE.MeshBasicMaterial({color:0xffffff})
    );
    this.reticle.matrixAutoUpdate=false;this.reticle.visible=false;this.scene.add(this.reticle);

    this.session=await navigator.xr.requestSession('immersive-ar',{
      requiredFeatures:['hit-test'],
      optionalFeatures:['dom-overlay','light-estimation'],
      domOverlay:{root:document.body}
    });

    await this.renderer.xr.setSession(this.session);
    this.refSpace=await this.session.requestReferenceSpace('local');
    this.viewerSpace=await this.session.requestReferenceSpace('viewer');
    this.hitSource=await this.session.requestHitTestSource({space:this.viewerSpace});

    this.session.addEventListener('end',()=>this.cleanup());
    this.renderer.setAnimationLoop((t,frame)=>this.render(t,frame));
    this.cb.onStarted?.();
  }

  place(){
    if(!this.lastHit||this.placed)return false;
    const pose=this.lastHit.getPose(this.refSpace);
    if(!pose)return false;
    const p=pose.transform.position,q=pose.transform.orientation;
    this.volcano.position.set(p.x,p.y,p.z);
    this.volcano.quaternion.set(q.x,q.y,q.z,q.w);
    this.volcano.scale.setScalar(this.scale);
    this.volcano.visible=true;
    this.placed=true;this.reticle.visible=false;
    this.cb.onPlaced?.();
    return true;
  }

  reset(){
    this.placed=false;
    if(this.volcano)this.volcano.visible=false;
    if(this.reticle)this.reticle.visible=false;
    this.cb.onReset?.();
  }

  async end(){if(this.session)await this.session.end()}

  render(t,frame){
    if(frame&&this.hitSource&&!this.placed){
      const hits=frame.getHitTestResults(this.hitSource);
      this.lastHit=hits[0]||null;
      if(this.lastHit){
        const pose=this.lastHit.getPose(this.refSpace);
        this.reticle.visible=true;
        this.reticle.matrix.fromArray(pose.transform.matrix);
        this.cb.onCanPlace?.(true);
      }else{
        this.reticle.visible=false;
        this.cb.onCanPlace?.(false);
      }
    }
    if(this.placed)this.volcano.update(this.camera);
    this.renderer.render(this.scene,this.camera);
  }

  cleanup(){
    this.renderer?.setAnimationLoop(null);
    this.hitSource?.cancel?.();
    this.hitSource=null;this.session=null;this.refSpace=null;this.viewerSpace=null;this.lastHit=null;
    this.renderer?.domElement?.remove();
    this.renderer?.dispose?.();
    this.cb.onEnded?.();
  }
}
