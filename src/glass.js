/* A small, offline edge-refraction layer for the floating navigation control.
   The signed-distance map follows the four-layer technique described by the
   MIT-licensed Zettersten liquid-glass skill; the implementation here is local. */
let navGlassDisplacement=null,navGlassImage=null,navGlassObserver=null;
function glassMap(width,height,radius){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const context=canvas.getContext('2d',{willReadFrequently:false});if(!context)return null;
 const image=context.createImageData(width,height),data=image.data,centerX=width/2,centerY=height/2;
 const bezel=Math.min(17,height/3),r=Math.min(radius,height/2,width/2);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const qx=Math.abs(x+.5-centerX)-(centerX-r),qy=Math.abs(y+.5-centerY)-(centerY-r);
  const distance=Math.min(Math.max(qx,qy),0)+Math.hypot(Math.max(qx,0),Math.max(qy,0))-r;
  const t=Math.max(0,Math.min(1,(distance+bezel)/bezel)),edge=distance>0?0:t*t*(3-2*t);
  const dx=centerX-x-.5,dy=centerY-y-.5,len=Math.hypot(dx,dy)||1,i=(y*width+x)*4;
  data[i]=Math.round(128+127*edge*dx/len);data[i+1]=Math.round(128+127*edge*dy/len);data[i+2]=128;data[i+3]=255;
 }
 context.putImageData(image,0,0);return canvas.toDataURL('image/png');
}
function updateNavGlassMap(){
 const nav=$('#nav');if(!nav||!navGlassImage)return;
 const box=nav.getBoundingClientRect(),width=Math.max(1,Math.round(box.width)),height=Math.max(1,Math.round(box.height));
 if(navGlassImage.dataset.size===`${width}x${height}`)return;
 const uri=glassMap(width,height,Math.min(27,height/2));if(!uri)return;
 navGlassImage.dataset.size=`${width}x${height}`;navGlassImage.setAttribute('width',width);navGlassImage.setAttribute('height',height);navGlassImage.setAttribute('href',uri);
}
function applyGlassLevel(raw){
 const level=Math.max(0,Math.min(100,Number.isFinite(+raw)?Math.round(+raw):65));store.glassLevel=level;
 const root=document.documentElement.style;
 root.setProperty('--liquid-tint',(0.39+level*.0017).toFixed(3));
 root.setProperty('--liquid-rim',(0.45+level*.0045).toFixed(3));
 root.setProperty('--liquid-shadow',(0.07+level*.0009).toFixed(3));
 if(navGlassDisplacement)navGlassDisplacement.setAttribute('scale',String(-(7+level*.29)));
 const range=$('#glass-range'),value=$('#glass-value');if(range)range.value=level;if(value)value.textContent=level+'%';
}
function initLiquidGlass(){
 const svgNS='http://www.w3.org/2000/svg',node=name=>document.createElementNS(svgNS,name);
 const svg=node('svg'),defs=node('defs'),filter=node('filter'),image=node('feImage'),displacement=node('feDisplacementMap');
 svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
 filter.id='voicelog-nav-refraction';filter.setAttribute('x','0%');filter.setAttribute('y','0%');filter.setAttribute('width','100%');filter.setAttribute('height','100%');filter.setAttribute('color-interpolation-filters','sRGB');
 image.setAttribute('x','0');image.setAttribute('y','0');image.setAttribute('preserveAspectRatio','none');image.setAttribute('result','navMap');
 displacement.setAttribute('in','SourceGraphic');displacement.setAttribute('in2','navMap');displacement.setAttribute('xChannelSelector','R');displacement.setAttribute('yChannelSelector','G');
 filter.append(image,displacement);defs.append(filter);svg.append(defs);document.body.append(svg);
 navGlassImage=image;navGlassDisplacement=displacement;applyGlassLevel(store.glassLevel);updateNavGlassMap();
 if(/(?:Chrome|Chromium|Edg)\//.test(navigator.userAgent))document.documentElement.classList.add('glass-refraction-ready');
 navGlassObserver=new ResizeObserver(updateNavGlassMap);navGlassObserver.observe($('#nav'));
}
