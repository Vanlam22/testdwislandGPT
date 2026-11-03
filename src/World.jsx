import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { islands } from './data';

const materials = new Map();
function material(color, extra = {}) {
  const key = color + JSON.stringify(extra);
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.88, ...extra }));
  return materials.get(key);
}
function mesh(geometry, color, parent, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material(color));
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m); return m;
}
const box = (p, color, w, h, d, x=0, y=0, z=0) => mesh(new THREE.BoxGeometry(w,h,d),color,p,x,y,z);
const sphere = (p,color,r,x=0,y=0,z=0,s=12) => mesh(new THREE.IcosahedronGeometry(r,s > 10 ? 1 : 0),color,p,x,y,z);
const cylinder = (p,color,rt,rb,h,x=0,y=0,z=0,n=12) => mesh(new THREE.CylinderGeometry(rt,rb,h,n),color,p,x,y,z);
function textPlane(parent, text, color, width, height, x, y, z, background = null) {
  const c = document.createElement('canvas'); c.width=768; c.height=192;
  const ctx=c.getContext('2d');
  if(background){ctx.fillStyle=background;ctx.fillRect(0,0,768,192);}
  ctx.fillStyle=color;ctx.font='500 86px Georgia, serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(text,384,104);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
  plane.position.set(x,y,z);parent.add(plane);return plane;
}
function tree(parent,x,z,color,scale=1) {
  const t=new THREE.Group();t.position.set(x,.25,z);t.scale.setScalar(scale);parent.add(t);
  cylinder(t,'#a88c6e',.065,.1,.75,0,.4,0,7);
  sphere(t,color,.44,0,1,0);sphere(t,color,.32,-.22,.88,.04);sphere(t,color,.35,.2,.86,.04);
}
function pine(parent,x,z,color,scale=1) {
  const t=new THREE.Group();t.position.set(x,.25,z);t.scale.setScalar(scale);parent.add(t);
  cylinder(t,'#a08a72',.065,.09,.7,0,.35,0,6);
  cylinder(t,color,0,.5,.9,0,.95,0,7);cylinder(t,color,0,.38,.8,0,1.35,0,7);
}
function roof(parent,color,w,h,d,x,y,z) {
  const g=new THREE.BufferGeometry();
  const a=[-w/2,0,-d/2,w/2,0,-d/2,0,h,-d/2,-w/2,0,d/2,0,h,d/2,w/2,0,d/2,
    -w/2,0,-d/2,0,h,-d/2,0,h,d/2,-w/2,0,-d/2,0,h,d/2,-w/2,0,d/2,
    w/2,0,-d/2,w/2,0,d/2,0,h,d/2,w/2,0,-d/2,0,h,d/2,0,h,-d/2];
  g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));g.computeVertexNormals();
  return mesh(g,color,parent,x,y,z);
}
function windowBox(parent,x,y,z,w=.28,h=.48) {
  box(parent,'#f5e4c7',w+.1,h+.1,.06,x,y,z);
  box(parent,'#72928d',w,h,.07,x,y,z+.03);
  box(parent,'#f5e4c7',.035,h,.08,x,y,z+.07);
}
function flag(parent,x,z,color) {
  cylinder(parent,'#b39a70',.025,.035,1.65,x,1,z,6);
  const f=box(parent,color,.5,.32,.025,x+.25,1.65,z);
  f.rotation.z=-.08;
  sphere(parent,'#d4b781',.055,x,1.85,z);
}
function building(parent,kind) {
  const p=new THREE.Group();p.rotation.y=-.2;parent.add(p);
  if(kind==='palace') {
    box(p,'#f6e9d2',3.8,1.5,1.8,0,1,-.4);
    box(p,'#e8d3b0',4.1,.16,2.1,0,1.85,-.4);
    box(p,'#995462',3.8,.2,1.8,0,1.98,-.4);
    box(p,'#f8eeda',1.65,1.9,2.05,0,1.2,-.25);
    roof(p,'#bc9b62',1.9,.55,2.15,0,2.15,-.25);
    box(p,'#693e45',.64,1.02,.12,0,.81,.84);
    cylinder(p,'#693e45',.33,.33,.12,0,1.32,.84,24).rotation.x=Math.PI/2;
    for(const x of [-1.45,-.97,.97,1.45])windowBox(p,x,1.13,.53);
    for(const x of [-.62,.62]) cylinder(p,'#fff4dc',.09,.12,1.25,x,.93,.95);
    textPlane(p,'DENWELL','#80404d',1.38,.34,0,1.85,.81);
    for(let i=0;i<3;i++)box(p,'#f2e5cb',1.5+i*.18,.12, .36,0,.32-i*.08,1.08+i*.27);
    flag(p,-2.05,1.1,'#873c50');flag(p,2.05,1.1,'#873c50');
    cylinder(p,'#e8ddbd',.7,.74,.16,0,.34,2.3,24);
    cylinder(p,'#91b9b7',.6,.6,.05,0,.44,2.3,24);
    cylinder(p,'#e5d6b2',.15,.2,.5,0,.67,2.3,12);
    sphere(p,'#f2e8cd',.24,0,.98,2.3);
  } else if(kind==='book'){
    box(p,'#b0616d',2.3,.2,1.55,0,.45,0);
    for(const side of [-1,1]){
      const half=new THREE.Group();half.position.set(0,.6,0);half.rotation.z=side*.14;p.add(half);
      box(half,'#fff2db',1.08,.25,1.42,side*.54,0,0);
      for(let i=0;i<4;i++)box(half,'#d9c7a6',.67,.012,.025,side*.57,.13,-.42+i*.24);
    }
    const spine=box(p,'#d4af76',.1,.12,1.58,0,.78,0);
    spine.rotation.z=.1;
    box(p,'#f7dfb9',.25,1.15,.25,-.9,.96,-.95);sphere(p,'#b57a83',.45,-.9,1.72,-.95);
    textPlane(p,'D','#f8e7cb',.45,.28,-.9,1.72,-.5);
  } else if(kind==='hospital'){
    box(p,'#f9f0db',2,1.25,1.5,0,.94,0);roof(p,'#729a89',2.25,.65,1.78,0,1.57,0);
    box(p,'#f0dfbf',.8,.72,.1,0,.61,.78);box(p,'#8da7a2',.55,.65,.12,0,.61,.84);
    for(const x of [-.67,.67])windowBox(p,x,1.04,.79,.25,.35);
    box(p,'#fbf1dc',.6,.6,.07,0,1.77,.64);box(p,'#a67066',.32,.1,.1,0,1.77,.69);box(p,'#a67066',.1,.32,.1,0,1.77,.69);
  } else if(kind==='gift'){
    const gift=(x,z,size,color,ribbon)=>{
      box(p,color,size,size,size,x,.3+size/2,z);
      box(p,color,size+.08,.17,size+.08,x,.3+size,z);
      box(p,ribbon,size*.2,size+.05,size+.1,x,.3+size/2,z);
      box(p,ribbon,size+.1,.04,size*.2,x,.4+size,z);
      for(const dir of [-1,1]){
        const ring=mesh(new THREE.TorusGeometry(size*.19,.05,6,14),ribbon,p,x+dir*size*.16,.48+size,z);ring.rotation.x=.3;ring.rotation.y=dir*.5;
      }
    };
    gift(-.3,-.2,1.45,'#d3ad68','#fff0d5');gift(.8,.8,.8,'#b67583','#f1d5c2');gift(-1,.8,.65,'#92aa9c','#f5e9ca');
  } else if(kind==='clock'){
    box(p,'#eedfc4',.95,2.15,.95,0,1.35,0);box(p,'#dbc6a4',1.15,.18,1.15,0,.42,0);
    roof(p,'#927b8d',1.4,.64,1.4,0,2.48,0);
    cylinder(p,'#c9a46d',.43,.43,.1,0,2,.52,32).rotation.x=Math.PI/2;
    cylinder(p,'#fff4da',.36,.36,.12,0,2,.58,32).rotation.x=Math.PI/2;
    box(p,'#665362',.035,.23,.02,0,2.08,.66);
    const hand=box(p,'#665362',.21,.035,.02,.07,2,.67);hand.rotation.z=-.35;
    box(p,'#937e87',.34,.67,.08,0,.75,.5);
    windowBox(p,0,1.35,.5,.2,.35);
  } else if(kind==='workshop'){
    box(p,'#eacfaa',1.8,1.25,1.5,0,.93,0);roof(p,'#b98563',2.15,.65,1.85,0,1.56,0);
    box(p,'#7d8174',.85,.8,.06,.15,.71,.77);
    for(let i=0;i<5;i++)box(p,'#a5a48e',.9,.025,.07,.15,.45+i*.13,.82);
    box(p,'#e5c7a2',.35,.65,.35,-.55,2,-.3);
    const gear=mesh(new THREE.TorusGeometry(.28,.09,6,12),'#e9d5ae',p,0,1.67,.7);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const tooth=box(p,'#e9d5ae',.12,.17,.13,Math.sin(a)*.31,1.67+Math.cos(a)*.31,.7);tooth.rotation.z=-a;}
    box(p,'#b28c6b',.55,.45,.5,-1,.48,.7);
  } else if(kind==='house'){
    box(p,'#f0ddc9',1.9,1.4,1.45,0,1,0);roof(p,'#b57e86',2.2,.74,1.75,0,1.7,0);
    box(p,'#9b6d71',.48,.95,.08,0,.78,.76);
    for(const x of [-.64,.64])windowBox(p,x,1.12,.76,.32,.42);
    box(p,'#e9d6bb',2.1,.12,.5,0,1.25,1);
    for(let i=0;i<7;i++)box(p,i%2?'#f8e8d0':'#b87e85',.3,.11,.55,-.9+i*.3,1.3,1);
    sphere(p,'#c29786',.19,.67,2.27,.35);
  } else if(kind==='library'){
    box(p,'#ebdfc8',2.3,.18,1.7,0,.43,0);box(p,'#ded1b6',2.05,1.3,1.2,0,1,-.2);
    for(const x of [-.8,-.27,.27,.8]){
      cylinder(p,'#fcf0d7',.09,.12,1.2,x,1,.57);
      box(p,'#f8ebd0',.25,.1,.25,x,1.58,.57);
    }
    box(p,'#e7d6b7',2.4,.15,1.65,0,1.7,0);roof(p,'#859b9e',2.55,.6,1.8,0,1.8,0);
    box(p,'#6f8884',.55,.9,.08,0,.92,.43);
    for(let i=0;i<3;i++)box(p,'#f3e5cc',1.6+i*.2,.11,.25,0,.35-i*.07,1+i*.18);
  } else if(kind==='mail'){
    cylinder(p,'#b19576',.12,.15,1.1,0,.8,0,10);
    box(p,'#aa697a',1.55,.85,.8,0,1.6,0);roof(p,'#91586a',1.65,.4,.92,0,2.03,0);
    box(p,'#65464e',.95,.09,.03,0,1.88,.42);
    box(p,'#f9ead2',.76,.45,.06,0,1.54,.44);
    const lineGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.38,1.75,.48),new THREE.Vector3(0,1.5,.48),new THREE.Vector3(.38,1.75,.48)]);
    p.add(new THREE.Line(lineGeo,new THREE.LineBasicMaterial({color:'#bf9b76'})));
    cylinder(p,'#c5a774',.03,.03,.8,.85,1.95,0,6);box(p,'#e6c17b',.35,.22,.04,1.02,2.26,0);
  }
  return p;
}
function makeIsland(scene, island, index) {
  const group=new THREE.Group();group.position.set(island.position[0],0,island.position[1]);group.userData.islandId=island.id;scene.add(group);
  const big=island.id==='home'; const r=big?4.1:2.65;
  const geo=new THREE.CylinderGeometry(r*.98,r*.48,2.5,9,2);
  const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){
    const yy=pos.getY(i);
    if(yy<0)pos.setY(i,yy-.2*Math.sin(pos.getX(i)*7+index));
  }geo.computeVertexNormals();
  mesh(geo,'#c7bca5',group,0,-1.25,0);
  cylinder(group,'#e5d6b5',r,r*.99,.28,0,.06,0,12);
  cylinder(group,island.ground,r*.97,r,.16,0,.24,0,12);
  cylinder(group,'#e9ddbd',big?2.8:1.8,big?2.8:1.8,.035,0,.33,0,16);
  building(group,island.kind);
  const colors=['#99b197','#c6b2b5','#a3bb9d','#c4b58d','#dcc0c0'];
  for(let i=0;i<(big?12:7);i++){
    const a=i/(big?12:7)*Math.PI*2+.21*index;
    const x=Math.cos(a)*(r-.45),z=Math.sin(a)*(r-.45);
    if(z>1.8 && Math.abs(x)<.8)continue;
    (i%3===0?pine:tree)(group,x,z,colors[(index+i)%colors.length],.7+(i%3)*.19);
  }
  for(let i=0;i<5;i++){
    const a=i*2.4+index;const rr=r*.78;
    sphere(group,'#ded2b8',.14,Math.cos(a)*rr,.4,Math.sin(a)*rr,6);
    sphere(group,index%2?'#eed9b7':'#d6a6ab',.08,Math.cos(a)*rr+.16,.42,Math.sin(a)*rr,6);
  }
  // A tiny welcome path on each island.
  for(let i=0;i<3;i++)box(group,'#f5e7cf',.35,.04,.23,.05*Math.sin(i),.35,1.5+i*.35);
  // Batch static scenery by material while retaining each island's hit target.
  group.updateMatrixWorld(true);
  const inverse=new THREE.Matrix4().copy(group.matrixWorld).invert();
  const batches=new Map(),originals=[];
  group.traverse(object=>{
    if(!object.isMesh||object.material.map)return;
    const geometry=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();
    geometry.deleteAttribute('uv');
    geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,object.matrixWorld));
    if(!batches.has(object.material))batches.set(object.material,[]);
    batches.get(object.material).push(geometry);originals.push(object);
  });
  originals.forEach(object=>{object.parent.remove(object);object.geometry.dispose();});
  batches.forEach((geometries,mat)=>{
    const merged=new THREE.Mesh(mergeGeometries(geometries),mat);
    merged.castShadow=true;merged.receiveShadow=true;group.add(merged);
    geometries.forEach(geometry=>geometry.dispose());
  });
  return group;
}
function makeAvatar(profile) {
  const g=new THREE.Group(), body=new THREE.Group();g.add(body);
  const shirt=box(body,profile.outfit,.34,.4,.23,0,.68,0);
  const head=sphere(body,profile.skin,.225,0,1.08,0);head.scale.set(1,1.06,.95);
  const hair=sphere(body,profile.hair,.235,0,1.18,-.025);hair.scale.set(1,.65,.93);
  if(profile.hairstyle==='long')box(body,profile.hair,.42,.38,.18,0,.99,-.14);
  if(profile.hairstyle==='bun')sphere(body,profile.hair,.13,0,1.39,-.08);
  const legs=[],arms=[];
  for(const side of [-1,1]){
    const leg=new THREE.Group();leg.position.set(side*.1,.49,0);body.add(leg);
    box(leg,'#5b5761',.13,.28,.15,0,-.14,0);box(leg,'#fff1d8',.15,.1,.24,0,-.31,.04);legs.push(leg);
    const arm=new THREE.Group();arm.position.set(side*.24,.84,0);body.add(arm);
    box(arm,profile.outfit,.12,.2,.15,0,-.1,0);sphere(arm,profile.skin,.075,0,-.25,0);arms.push(arm);
    sphere(body,'#483a33',.022,side*.078,1.09,.192,6);
  }
  // Small gold backpack.
  box(body,'#c6a16b',.26,.27,.15,0,.7,-.18);
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.28,24),new THREE.MeshBasicMaterial({color:'#756f61',transparent:true,opacity:.18,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;g.add(shadow);
  g.traverse(object=>{object.castShadow=false;});
  g.userData={legs,arms,body,shirt};g.scale.setScalar(1.18);return g;
}
export default function World({ profile, destination, travelKey, onSelect, completed, zoom, paused, onReady, onMoving }) {
  const container=useRef(null), api=useRef(null), callbacks=useRef({});
  callbacks.current={onSelect,onReady,onMoving,paused};
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const host=container.current;
    let renderer;
    try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'}); }
    catch {setFailed(true);onReady?.();return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000,0);host.prepend(renderer.domElement);
    renderer.domElement.setAttribute('aria-label','典華幸福島 3D 探索地圖');
    renderer.domElement.setAttribute('role','img');
    const scene=new THREE.Scene();
    const camera=new THREE.OrthographicCamera(-22,22,18,-18,.1,180);
    camera.position.set(0,32,42);camera.lookAt(0,0,1);
    scene.add(new THREE.HemisphereLight('#fff5e8','#bbc0d4',2.7));
    const sun=new THREE.DirectionalLight('#fff1d6',3.3);sun.position.set(-15,30,15);sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-23;sun.shadow.camera.right=23;sun.shadow.camera.top=24;sun.shadow.camera.bottom=-23;
    sun.shadow.normalBias=.04;sun.shadow.bias=-.0002;scene.add(sun);
    const home={id:'home',position:[0,2],kind:'palace',ground:'#b8c69f'};
    const groups=[makeIsland(scene,home,8),...islands.map((i,n)=>makeIsland(scene,i,n))];
    // A quiet dotted trail connects the islands without competing with the map.
    for(const i of islands){
      const from=new THREE.Vector3(0,-.55,2),to=new THREE.Vector3(i.position[0],-.55,i.position[1]);
      const len=from.distanceTo(to);
      for(let t=4.4/len;t<1-2.8/len;t+=.43/len){
        const point=from.clone().lerp(to,t);
        sphere(scene,'#e9e2d8',.045,point.x,point.y+.2*Math.sin(t*Math.PI),point.z,6);
      }
    }
    const clouds=[];
    [[-17,-6,1.3],[16,-9,1.1],[-16,11,.9],[4,-15,1.1],[15,17,1.3],[-4,20,.9]].forEach(([x,z,s],i)=>{
      const c=new THREE.Group();c.position.set(x,-1+(i%2)*1.8,z);c.scale.setScalar(s);scene.add(c);
      for(let j=0;j<5;j++){const m=sphere(c,'#faf7f3',.75+(j%3)*.22,(j-2)*.6,.2*Math.sin(j*2),0);m.scale.z=.65;m.castShadow=false;}
      clouds.push(c);
    });
    const balloon=new THREE.Group();balloon.position.set(15.8,6,-5);scene.add(balloon);
    const balloonTop=sphere(balloon,'#e6bea0',.9,0,1.6,0);balloonTop.scale.y=1.25;
    cylinder(balloon,'#ddae89',.45,.17,.6,0,.62,0);
    box(balloon,'#b08c69',.32,.27,.3,0,-.03,0);
    for(const x of [-.12,.12])cylinder(balloon,'#b69c79',.012,.012,.45,x,.29,0,5);
    let avatar=makeAvatar(profile);avatar.position.set(0,.36,4);scene.add(avatar);
    const keys=new Set();let current=home,flight=null,frame,prev=0,time=0,zoomValue=1,first=true;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clockStart=performance.now();
    const project=new THREE.Vector3();
    const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
    function resize(){
      const w=host.clientWidth,h=host.clientHeight;
      renderer.setSize(w,h);const aspect=w/h;
      const halfH=Math.max(16.7,21.5/aspect);
      camera.left=-halfH*aspect;camera.right=halfH*aspect;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();
    }
    const observer=new ResizeObserver(resize);observer.observe(host);resize();
    function select(id){callbacks.current.onSelect?.(id);}
    const click=e=>{
      if(callbacks.current.paused)return;
      const rect=renderer.domElement.getBoundingClientRect();
      pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
      raycaster.setFromCamera(pointer,camera);
      const hits=raycaster.intersectObjects(groups,true);
      if(hits.length){let obj=hits[0].object;while(obj&&!obj.userData.islandId)obj=obj.parent;if(obj)select(obj.userData.islandId);}
    };
    renderer.domElement.addEventListener('click',click);
    const movementCodes=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
    const keydown=e=>{
      if(callbacks.current.paused||e.target.closest?.('input,textarea,select,[contenteditable="true"],[role="dialog"]'))return;
      if(movementCodes.includes(e.code)){e.preventDefault();keys.add(e.code);}
      if(e.code==='KeyE'&&current.id!=='home')select(current.id);
    };
    const keyup=e=>keys.delete(e.code),blur=()=>keys.clear();
    window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);
    api.current={
      travel(id){
        const target=id==='home'?home:islands.find(i=>i.id===id);if(!target)return;
        keys.clear();current=target;
        flight={start:avatar.position.clone(),end:new THREE.Vector3(target.position[0],.36,target.position[1]+1.75),started:performance.now(),duration:reduced?1:1250};
      },
      setProfile(p){
        const old=avatar;avatar=makeAvatar(p);avatar.position.copy(old.position);avatar.rotation.copy(old.rotation);scene.remove(old);scene.add(avatar);
        old.traverse(o=>o.geometry?.dispose());
      },
      setZoom(z){zoomValue=z;},
      clearKeys(){keys.clear();},
      move(code,down){if(down&&!callbacks.current.paused)keys.add(code);else keys.delete(code);},
    };
    const labelNodes=[...host.querySelectorAll('[data-island]')];
    let movementReported=false;
    function render(now){
      const delta=Math.min((now-prev)/1000,.05);prev=now;time=(now-clockStart)/1000;
      camera.zoom=THREE.MathUtils.lerp(camera.zoom,zoomValue,.09);camera.updateProjectionMatrix();
      let walking=false;
      if(flight){
        const t=Math.min(1,(now-flight.started)/flight.duration),ease=t*t*(3-2*t);
        avatar.position.lerpVectors(flight.start,flight.end,ease);
        avatar.position.y+=Math.sin(Math.PI*t)*4;
        const dir=flight.end.clone().sub(flight.start);
        if(dir.length()>.01)avatar.rotation.y=Math.atan2(dir.x,dir.z);
        walking=true;
        if(t===1){flight=null;avatar.rotation.y=0;}
      }else if(!callbacks.current.paused){
        const x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
        const z=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
        if(x||z){
          const v=new THREE.Vector2(x,z).normalize().multiplyScalar(delta*2.4);
          const nx=avatar.position.x+v.x,nz=avatar.position.z+v.y;
          const radius=current.id==='home'?3.65:2.3;
          if(Math.hypot(nx-current.position[0],nz-current.position[1])<radius){avatar.position.x=nx;avatar.position.z=nz;}
          avatar.rotation.y=Math.atan2(x,z);walking=true;
          if(!movementReported){callbacks.current.onMoving?.();movementReported=true;}
        }
      }
      avatar.userData.legs.forEach((leg,i)=>leg.rotation.x=walking?Math.sin(time*12+i*Math.PI)*.55:0);
      avatar.userData.arms.forEach((arm,i)=>arm.rotation.x=walking?-Math.sin(time*12+i*Math.PI)*.45:0);
      avatar.userData.body.position.y=walking?Math.abs(Math.sin(time*12))*.04:reduced?0:Math.sin(time*2)*.018;
      if(!reduced){clouds.forEach((c,i)=>{c.position.x+=Math.sin(time*.16+i)*delta*.045;});balloon.position.y=6+Math.sin(time*.7)*.2;}
      for(const node of labelNodes){
        const id=node.dataset.island, island=id==='home'?home:islands.find(i=>i.id===id);
        project.set(island.position[0],-.6,island.position[1]+(id==='home'?3.35:2.45)).project(camera);
        node.style.left=(project.x*.5+.5)*host.clientWidth+'px';
        node.style.top=(-project.y*.5+.5)*host.clientHeight+'px';
      }
      const marker=host.querySelector('.player-marker');
      if(marker){project.copy(avatar.position).add(new THREE.Vector3(0,1.9,0)).project(camera);marker.style.left=(project.x*.5+.5)*host.clientWidth+'px';marker.style.top=(-project.y*.5+.5)*host.clientHeight+'px';}
      renderer.render(scene,camera);
      if(first){first=false;callbacks.current.onReady?.();}
      frame=requestAnimationFrame(render);
    }
    frame=requestAnimationFrame(render);
    return()=>{
      cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);
      renderer.domElement.removeEventListener('click',click);scene.traverse(o=>{o.geometry?.dispose();if(o.material?.map){o.material.map.dispose();o.material.dispose();}});
      renderer.dispose();renderer.domElement.remove();api.current=null;
    };
  },[]);
  useEffect(()=>{api.current?.setProfile(profile);},[profile]);
  useEffect(()=>{if(destination)api.current?.travel(destination);},[destination,travelKey]);
  useEffect(()=>{api.current?.setZoom(zoom);},[zoom]);
  useEffect(()=>{if(paused)api.current?.clearKeys();},[paused]);
  return <div className={'world '+(failed?'world-fallback':'')} ref={container}>
    {failed ? <div className="fallback-map"><p>此裝置無法顯示 3D 地圖，仍可選擇島嶼開始探索。</p>{islands.map(i=><button key={i.id} onClick={()=>onSelect(i.id)}>{i.number}　{i.name}<small>{i.topic}</small></button>)}</div> :
    <div className="map-labels">
      <button data-island="home" className="home-label" onClick={()=>onSelect('home')}><span>✧</span> 典華幸福廣場</button>
      {islands.map(i=><button key={i.id} data-island={i.id} className={'island-label '+(completed.includes(i.id)?'visited ':'')+(destination===i.id?'active':'')} onClick={()=>onSelect(i.id)} aria-label={'探索'+i.name+'：'+i.topic}>
        <span className="island-number" style={{'--island-color':i.color}}>{completed.includes(i.id)?'✓':i.number}</span>
        <span><strong>{i.name}</strong><small>{i.topic}</small></span><span className="label-arrow">↗</span>
      </button>)}
      <div className="player-marker"><span />你</div>
    </div>}
    {!failed&&<div className="touch-controls" aria-label="移動角色">
      {[['ArrowUp','↑','向前移動'],['ArrowLeft','←','向左移動'],['ArrowDown','↓','向後移動'],['ArrowRight','→','向右移動']].map(([code,symbol,label])=><button key={code} aria-label={label} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);api.current?.move(code,true);}} onPointerUp={()=>api.current?.move(code,false)} onPointerCancel={()=>api.current?.move(code,false)} onLostPointerCapture={()=>api.current?.move(code,false)}>{symbol}</button>)}
    </div>}
  </div>;
}
