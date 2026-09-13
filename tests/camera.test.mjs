import test from 'node:test';import assert from 'node:assert/strict';
import {camera,zoomAt} from '../assets/src/map-camera.mjs';
test('zoom retains selected map anchor',()=>{const a=camera(),b=zoomAt(a,2,.25,.75);assert.equal(b.x+b.w*.25,a.x+a.w*.25);assert.equal(b.y+b.h*.75,a.y+a.h*.75);});
test('drag and zoom cannot expose space outside the map',()=>{const a=camera(-100,800,2);assert.equal(a.x,0);assert.equal(a.y,335);assert.equal(camera(800,800,99).zoom,4);assert.deepEqual(zoomAt(a,.1),camera());});
