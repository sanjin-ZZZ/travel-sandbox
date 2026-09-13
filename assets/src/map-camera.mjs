export function camera(x=0,y=0,zoom=1){
 const z=Math.max(1,Math.min(4,zoom)),w=1000/z,h=670/z;
 return {x:Math.max(0,Math.min(1000-w,x)),y:Math.max(0,Math.min(670-h,y)),zoom:z,w,h};
}
export function zoomAt(v,z,u=.5,vv=.5){const next=Math.max(1,Math.min(4,z));return camera(v.x+v.w*u-1000/next*u,v.y+v.h*vv-670/next*vv,next);}
