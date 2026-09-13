// Geography is independent of the selected date. Overview reuses the city panels.
export function mapPanels(trip,regionId){
 const region=trip.regions.find(r=>r.id===regionId);
 if(!region)throw Error('未知地图区域');
 return region.panels?region.panels.map(id=>{const p=trip.regions.find(r=>r.id===id);if(!p||p.panels)throw Error('总览只能引用城市图');return p;}):[region];
}
export function mapPlaces(trip,regionId){return [...new Set(mapPanels(trip,regionId).flatMap(p=>[...p.nodes.map(n=>n.placeId),...(p.unlocated||[])]))];}
