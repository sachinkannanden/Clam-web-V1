import * as THREE from "three";

type V2 = [number, number];

/** Outline of a relaxed, unisex tee seen from the front (y up, centred, roughly 2.6 x 2.6 units). */
function outline(): V2[] {
  const pts: V2[] = [];
  const quad = (a: V2, c: V2, b: V2, n: number) => {
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const u = 1 - t;
      pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
    }
  };
  const line = (b: V2, n: number) => {
    const a = pts[pts.length - 1];
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  };
  // start at left collar point, go through the front neckline dip to the right collar point
  pts.push([-0.31, 1.36]);
  quad([-0.31, 1.36], [0, 1.02], [0.31, 1.36], 22);
  // right shoulder, sleeve, cuff, underarm
  quad([0.31, 1.36], [0.55, 1.33], [0.86, 1.24], 8);
  quad([0.86, 1.24], [1.12, 1.1], [1.33, 0.82], 10);
  line([1.1, 0.55], 6);
  quad([1.1, 0.55], [0.86, 0.62], [0.72, 0.74], 8);
  // right side seam with a soft waist, down to the hem
  quad([0.72, 0.74], [0.69, -0.2], [0.76, -1.12], 16);
  // hem, slightly curved
  quad([0.76, -1.12], [0, -1.24], [-0.76, -1.12], 26);
  // mirror up the left side
  quad([-0.76, -1.12], [-0.69, -0.2], [-0.72, 0.74], 16);
  quad([-0.72, 0.74], [-0.86, 0.62], [-1.1, 0.55], 8);
  line([-1.33, 0.82], 6);
  quad([-1.33, 0.82], [-1.12, 1.1], [-0.86, 1.24], 10);
  quad([-0.86, 1.24], [-0.55, 1.33], [-0.31, 1.36], 8);
  pts.pop(); // closing duplicate
  return chaikin(pts, 2);
}

function chaikin(p: V2[], it: number): V2[] {
  let pts = p;
  for (let k = 0; k < it; k++) {
    const out: V2[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      out.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]]);
      out.push([0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
    }
    pts = out;
  }
  return pts;
}

function inside(poly: V2[], x: number, y: number) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function nearest(poly: V2[], x: number, y: number): { d: number; px: number; py: number } {
  let best = Infinity,
    bx = 0,
    by = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j];
    const [bx2, by2] = poly[i];
    const dx = bx2 - ax,
      dy = by2 - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    const qx = ax + dx * t,
      qy = ay + dy * t;
    const d = (x - qx) ** 2 + (y - qy) ** 2;
    if (d < best) {
      best = d;
      bx = qx;
      by = qy;
    }
  }
  return { d: Math.sqrt(best), px: bx, py: by };
}

// small deterministic value noise for soft folds
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number) {
  const ix = Math.floor(x),
    iy = Math.floor(y);
  const fx = x - ix,
    fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx),
    uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy),
    b = hash(ix + 1, iy),
    c = hash(ix, iy + 1),
    d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

/**
 * Builds the tee as an inflated "pillow": a dense grid clipped to the outline, lifted by a rounded
 * distance-to-edge profile, with soft folds. Front and back are separate shells that meet at the seam.
 */
export function buildTee(res = 150) {
  const poly = outline();
  const minX = -1.42,
    maxX = 1.42,
    minY = -1.3,
    maxY = 1.42;
  const nx = res,
    ny = Math.round((res * (maxY - minY)) / (maxX - minX));
  const T = 0.17; // half thickness
  const R = 0.26; // rounding distance

  const idx: number[] = new Array((nx + 1) * (ny + 1)).fill(-1);
  const isIn: boolean[] = new Array((nx + 1) * (ny + 1)).fill(false);
  const pos: number[] = [];
  const uv: number[] = [];
  const edge: number[] = [];
  const P = (i: number, j: number) => j * (nx + 1) + i;

  for (let j = 0; j <= ny; j++)
    for (let i = 0; i <= nx; i++) isIn[P(i, j)] = inside(poly, minX + ((maxX - minX) * i) / nx, minY + ((maxY - minY) * j) / ny);

  const used = new Set<number>();
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      if (isIn[P(i, j)] || isIn[P(i + 1, j)] || isIn[P(i, j + 1)] || isIn[P(i + 1, j + 1)]) {
        used.add(P(i, j));
        used.add(P(i + 1, j));
        used.add(P(i, j + 1));
        used.add(P(i + 1, j + 1));
      }
    }

  const front: number[] = [];
  for (const k of used) {
    const i = k % (nx + 1),
      j = Math.floor(k / (nx + 1));
    let x = minX + ((maxX - minX) * i) / nx;
    let y = minY + ((maxY - minY) * j) / ny;
    const n = nearest(poly, x, y);
    let d = n.d;
    if (!isIn[k]) {
      x = n.px;
      y = n.py;
      d = 0;
    }
    const t = Math.min(d / R, 1);
    let z = T * Math.sqrt(1 - (1 - t) * (1 - t));
    // folds: low-frequency drape plus a couple of diagonal creases near the sleeves and hem
    const fold =
      (vnoise(x * 2.2 + 3, y * 1.6) - 0.5) * 0.1 +
      Math.sin((x - y) * 6.5) * 0.008 * Math.max(0, 0.6 - y) +
      Math.sin(x * 9.0 + 1.3) * 0.006 * Math.max(0, -y - 0.4);
    z += fold * t;
    idx[k] = pos.length / 3;
    pos.push(x, y, z);
    uv.push((x - minX) / (maxX - minX), (y - minY) / (maxY - minY));
    edge.push(t);
    front.push(k);
  }

  const frontCount = pos.length / 3;
  // back shell: mirror z
  for (let v = 0; v < frontCount; v++) {
    pos.push(pos[v * 3], pos[v * 3 + 1], -pos[v * 3 + 2] * 0.92);
    uv.push(uv[v * 2], uv[v * 2 + 1]);
    edge.push(edge[v]);
  }

  const index: number[] = [];
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const a = P(i, j),
        b = P(i + 1, j),
        c = P(i, j + 1),
        d = P(i + 1, j + 1);
      if (!(isIn[a] || isIn[b] || isIn[c] || isIn[d])) continue;
      const A = idx[a],
        B = idx[b],
        C = idx[c],
        D = idx[d];
      index.push(A, B, D, A, D, C);
      index.push(A + frontCount, D + frontCount, B + frontCount, A + frontCount, C + frontCount, D + frontCount);
    }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("aEdge", new THREE.Float32BufferAttribute(edge, 1));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/** Ribbed collar following the front neckline. */
export function buildCollar() {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const u = 1 - t;
    const x = u * u * -0.31 + 2 * u * t * 0 + t * t * 0.31;
    const y = u * u * 1.36 + 2 * u * t * 1.02 + t * t * 1.36;
    pts.push(new THREE.Vector3(x * 0.985, y - 0.035, 0.05));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, 80, 0.042, 12, false);
}

/** The inside back of the neck, visible through the neckline. */
export function buildNeckInside() {
  const s = new THREE.Shape();
  s.moveTo(-0.31, 1.36);
  s.quadraticCurveTo(0, 1.02, 0.31, 1.36);
  s.quadraticCurveTo(0, 1.26, -0.31, 1.36);
  return new THREE.ShapeGeometry(s, 24);
}

/** A fine knit normal map drawn on a canvas, tiled across the fabric. */
export function knitNormalMap() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      // interlocking V stitches: two offset sine ridges
      const col = (x / size) * 32 * Math.PI;
      const row = (y / size) * 48 * Math.PI;
      const nx = Math.cos(col) * 0.5 + Math.sin(row + col * 0.5) * 0.25;
      const ny = Math.sin(row) * 0.35 + (hash(x, y) - 0.5) * 0.15;
      const o = (y * size + x) * 4;
      img.data[o] = 128 + nx * 90;
      img.data[o + 1] = 128 + ny * 90;
      img.data[o + 2] = 255;
      img.data[o + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(11, 11);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}
