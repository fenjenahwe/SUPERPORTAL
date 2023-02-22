function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

function lerp(a, b, f) {
  return a * (1 - f) + b * f;
}

function isIntersect(click, exit) {
  if (typeof exit == "undefined") return;
  // console.log(click, exit);
  if (Math.abs(click[0] - exit[0]) <= 30 && Math.abs(click[1] - exit[1]) <= 30)
    return true;
}

function isClose(pos, target) {
  //console.log(pos,target);
  if (Math.abs(pos - target) <= 15) return true;
}

function isInteract(click, obj) {
  centroid = obj.centroid;
  if (obj.size == "big") threshold = 50;
  else if (obj.size == "medium") threshold = 25;
  else if (obj.size == "small") threshold = 10;
  if (euclDist(click[0], click[1], centroid[0], centroid[1]) <= threshold)
    return true;
}

function euclDist(x, y, a, b) {
  return Math.sqrt((x - a) ** 2 + (y - b) ** 2);
}

function findKey(obj, value) {
  list = [];
  for (val in obj) {
    if (obj[val] == value) list.push(val);
  }
  return list;
}

module.exports = { clamp, lerp, isIntersect, isClose, isInteract, findKey };
