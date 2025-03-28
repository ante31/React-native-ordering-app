import { coordinates } from "./bounderies";

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

function pointInPolygon(point: Point, polygon: Point[]) {
  const numVertices = polygon.length;
  const x = point.x;
  const y = point.y;
  let inside = false;

  let p1 = polygon[0];
  let p2;

  for (let i = 1; i <= numVertices; i++) {
    p2 = polygon[i % numVertices];

    if (y > Math.min(p1.y, p2.y) && y <= Math.max(p1.y, p2.y) && x <= Math.max(p1.x, p2.x)) {
      const xIntersection = ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x;
      if (p1.x === p2.x || x <= xIntersection) {
        inside = !inside;
      }
    }

    p1 = p2;
  }

  return inside;
}

export function checkPosition(latitude: number, longitude: number) {
  const point = new Point(longitude, latitude); //swap beacuase of polygon structure
  console.log("Point", point);
  const { Ispod, Iznad, Aerodrom } = coordinates;

  if (pointInPolygon(point, Ispod.map(p => new Point(p[0], p[1])))) return "below";
  if (pointInPolygon(point, Iznad.map(p => new Point(p[0], p[1])))) return "above";
  if (pointInPolygon(point, Iznad.map(p => new Point(p[0], p[1])))) return "aerodrom";
  return "outside";
}
