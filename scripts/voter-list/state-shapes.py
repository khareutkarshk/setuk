"""
Draws the voter list cards' maps: each state's outline, and inside it each assembly constituency
(AC), so a card can light up its own area (an AC, a district, a Lok Sabha seat) on its state. One
small SVG path per shape, every state fitted to its own box. From datta07/INDIAN-SHAPEFILES (MIT):
INDIA/INDIA_STATES.geojson, whose boundaries follow India's official map (Ladakh and Jammu and
Kashmir as the Survey of India draws them), and STATES/<state>/<state>_ASSEMBLY.geojson.

  python3 -I scripts/voter-list/state-shapes.py <INDIA_STATES.geojson> lib/voter-list/data/state-shapes.json \
      [<folder of *_ASSEMBLY.geojson> lib/voter-list/data/catalogue.json]

  (the constituencies need shapely: pip install shapely, in a virtual environment)

  curl -L -o INDIA_STATES.geojson https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/INDIA/INDIA_STATES.geojson
  (and each state's STATES/<STATE>/<STATE>_ASSEMBLY.geojson from the same repository)

Each state is projected on its own (longitude scaled by the cosine of its middle latitude), fitted
so its longer side is SIZE units, simplified, and written with one decimal; its ACs share that
projection. Islands too small to see at card size are dropped, except where islands are the state
(Andaman & Nicobar, Lakshadweep); the UTs made of scattered pieces (Puducherry, Lakshadweep, Dadra &
Nagar Haveli and Daman & Diu) also get `marks`, the centre of each cluster, for a ring round it.
Dadra & Nagar Haveli and Daman & Diu are drawn together, as the one UT they have been since 2020.

An AC is drawn only when the boundary file names it as the catalogue does (number and name, or the
name alone where the file has no numbers). A state whose file mostly disagrees, because its seats
were redrawn after the file was made (Assam in 2023, Jammu and Kashmir in 2022), gets no ACs: a
wrong highlight is worse than none. Each state also lists, from the catalogue, the ACs of each
district and of each Lok Sabha seat, so a card can light up a whole district or seat; one with an
AC missing is left out.

A card lights one area, so each area has to fill its own part of the outline: every AC is clipped to
the state, and the land the boundary file leaves out of every AC goes to the nearest ACs (pieces
the file numbers 0, such as the Rann of Kutch, to the nearest ACs of the district it names; slivers
along the edge to the nearest AC of any). A district or Lok Sabha seat is drawn as one shape, its
ACs merged, so no seams show between them.
"""
import json
import math
import sys

import difflib
import os
import re

SRC, OUT = sys.argv[1], sys.argv[2]
ASSEMBLY, CATALOGUE = (sys.argv[3], sys.argv[4]) if len(sys.argv) > 4 else (None, None)
AC_TOLERANCE = 0.3  # simplification for constituencies, districts and seats: a card's map is about one pixel to the unit
AC_DECIMALS = 1
AC_KEEP = 0.03  # an area's island is kept if at least this share of its largest piece
GRID = 0.001  # the grid the constituencies are worked on, in output units
STEP = 0.5  # spacing of the points along each AC's edge that share out the land no AC covers
MATCH = 0.8  # below this share of name-checked matches a state's boundary file is taken as outdated
SIZE = 100.0
TOLERANCE = 0.45  # simplification, in output units
KEEP = 0.012  # an island is kept if it is at least this share of the state's largest piece

# the dataset's names -> the catalogue's state slugs (lib/voter-list/data/catalogue.json)
SLUGS = {
    "ANDAMAN & NICOBAR": "andaman-and-nicobar-islands", "ANDHRA PRADESH": "andhra-pradesh", "ARUNACHAL PRADESH": "arunachal-pradesh",
    "ASSAM": "assam", "BIHAR": "bihar", "CHANDIGARH": "chandigarh", "CHHATTISGARH": "chattisgarh",
    "DADRA & NAGAR HAVELI": "dadra-and-nagar-haveli-and-daman-and-diu", "DAMAN & DIU": "dadra-and-nagar-haveli-and-daman-and-diu",
    "DELHI": "nct-of-delhi", "GOA": "goa", "GUJARAT": "gujarat", "HARYANA": "haryana", "HIMACHAL PRADESH": "himachal-pradesh",
    "JAMMU & KASHMIR": "jammu-and-kashmir", "JHARKHAND": "jharkhand", "KARNATAKA": "karnataka", "KERALA": "kerala", "LADAKH": "ladakh",
    "LAKSHADWEEP": "lakshadweep", "MADHYA PRADESH": "madhya-pradesh", "MAHARASHTRA": "maharashtra", "MANIPUR": "manipur",
    "MEGHALAYA": "meghalaya", "MIZORAM": "mizoram", "NAGALAND": "nagaland", "ODISHA": "odisha", "PUDUCHERRY": "puducherry",
    "PUNJAB": "punjab", "RAJASTHAN": "rajasthan", "SIKKIM": "sikkim", "TAMIL NADU": "tamil-nadu", "TELANGANA": "telangana",
    "TRIPURA": "tripura", "UTTAR PRADESH": "uttar-pradesh", "UTTARAKHAND": "uttarakhand", "WEST BENGAL": "west-bengal",
}
ISLANDS = {"andaman-and-nicobar-islands", "lakshadweep"}
# states of scattered pieces, too small to read at card size: each cluster gets a ring round it
SCATTERED = {"puducherry", "lakshadweep", "dadra-and-nagar-haveli-and-daman-and-diu"}
CLUSTER = 12.0  # pieces whose centres are this close share one ring, in output units


def polygons(geom):
    """Every polygon of a geometry, as lists of rings of (lon, lat)"""
    if geom["type"] == "Polygon":
        return [geom["coordinates"]]
    if geom["type"] == "MultiPolygon":
        return geom["coordinates"]
    raise ValueError(geom["type"])


def area(ring):
    return abs(sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(ring, ring[1:] + ring[:1]))) / 2


def simplify(pts, tol):
    """Douglas-Peucker, iterative"""
    if len(pts) < 4:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        (ax, ay), (bx, by) = pts[a], pts[b]
        dx, dy = bx - ax, by - ay
        norm = math.hypot(dx, dy) or 1e-12
        far, at = 0.0, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            d = abs(dy * (px - ax) - dx * (py - ay)) / norm
            if d > far:
                far, at = d, i
        if far > tol and at > 0:
            keep[at] = True
            stack += [(a, at), (at, b)]
    return [p for p, k in zip(pts, keep) if k]


def simplify_ring(ring, tol):
    """A closed ring, split at the point farthest from its start so neither half is a loop"""
    x0, y0 = ring[0]
    m = max(range(len(ring)), key=lambda i: (ring[i][0] - x0) ** 2 + (ring[i][1] - y0) ** 2)
    return simplify(ring[: m + 1], tol)[:-1] + simplify(ring[m:] + ring[:1], tol)[:-1]


# the UTs with no assembly file: which source piece is which constituency
WHOLE = {
    "andaman-and-nicobar-islands": {1: "ANDAMAN & NICOBAR"}, "chandigarh": {1: "CHANDIGARH"}, "lakshadweep": {1: "LAKSHADWEEP"},
    "ladakh": {1: "LADAKH"}, "dadra-and-nagar-haveli-and-daman-and-diu": {1: "DAMAN & DIU", 2: "DADRA & NAGAR HAVELI"},
}
# assembly file names that differ from the state file's
FILE_STATE = {"ORISSA": "ODISHA", "UTTARKHAND": "UTTARAKHAND"}


def path(rings, tol, keep, islands=False, decimals=1):
    """Projected rings -> one SVG path, dropping pieces too small to see"""
    if not rings:
        return ""
    biggest = max(area(r) for r in rings)
    out = []
    for r in rings:
        a = area(r)
        if a < biggest * keep and not (islands and a > 0.02):
            continue
        pts = simplify_ring(r, tol)
        if len(pts) < 3:
            pts = simplify_ring(r, tol / 4)
        if len(pts) >= 3:
            out.append("M" + "L".join(f"{x:.{decimals}f} {y:.{decimals}f}" for x, y in pts) + "Z")
    return "".join(out)


def parts(g):
    """The polygons of any geometry"""
    if g.is_empty:
        return []
    if g.geom_type == "Polygon":
        return [g]
    return [p for x in getattr(g, "geoms", []) for p in parts(x)]


def lit(g, islands=False):
    """A constituency, district or seat -> [path, x0, y0, x1, y1], its pieces too small to see dropped"""
    from shapely import Polygon, make_valid
    from shapely.geometry.polygon import orient

    simple = make_valid(g.simplify(AC_TOLERANCE, preserve_topology=True))
    ps = parts(simple) or parts(g)
    biggest = max(p.area for p in ps)
    out = []
    for p in ps:
        if p.area < biggest * AC_KEEP and not (islands and p.area > 0.02):
            continue
        p = orient(p, 1.0)
        # the pinholes the merging leaves are dropped; a real enclave is kept
        for ring in (p.exterior, *(r for r in p.interiors if Polygon(r).area >= biggest * AC_KEEP)):
            pts = [f"{x:.{AC_DECIMALS}f} {y:.{AC_DECIMALS}f}" for x, y in ring.coords[:-1]]
            pts = [q for i, q in enumerate(pts) if q != pts[i - 1]]
            if len(set(pts)) >= 3:
                out.append("M" + "L".join(pts) + "Z")
    x0, y0, x1, y1 = g.bounds
    return ["".join(out), round(x0, 1), round(y0, 1), round(x1, 1), round(y1, 1)]


def share_out(region, owners):
    """Splits `region` among `owners` ([(key, geometry)]) by which is nearest -> {key: its share}"""
    from shapely import MultiPoint, STRtree, get_coordinates, intersection, make_valid, segmentize, union_all, voronoi_polygons

    from shapely.errors import GEOSException

    if region.is_empty or not owners:
        return {}
    # the points are snapped to a grid, as GEOS fails on points all but on top of each other
    for decimals in (2, 1):
        pts, keys, seen = [], [], set()
        for key, g in owners:
            for x, y in get_coordinates(segmentize(g.boundary, STEP)):
                p = (round(x, decimals), round(y, decimals))
                if p not in seen:
                    seen.add(p)
                    pts.append(p)
                    keys.append(key)
        try:
            cells = list(voronoi_polygons(MultiPoint(pts), extend_to=region.envelope.buffer(10), ordered=True).geoms)
            break
        except GEOSException:
            if decimals == 1:
                raise
    region, got = make_valid(region), {}
    for i in STRtree(cells).query(region, predicate="intersects"):
        # GEOS can still trip on a sliver of a cell: try a coarser grid, and failing that leave it out
        for grid in (GRID, GRID * 10):
            try:
                got.setdefault(keys[i], []).append(intersection(cells[i], region, grid_size=grid))
                break
            except GEOSException:
                pass
    return {k: union_all(v) for k, v in got.items()}


norm = lambda name: re.sub(r"\(.*?\)|[^a-z]", "", str(name).lower())
similar = lambda a, b: difflib.SequenceMatcher(None, norm(a), norm(b)).ratio()

groups, pieces = {}, {}
for f in json.load(open(SRC, encoding="utf-8"))["features"]:
    name = f["properties"]["STNAME"].strip().upper()
    slug = SLUGS[name]
    groups.setdefault(slug, []).extend(polygons(f["geometry"]))
    pieces[name] = polygons(f["geometry"])

catalogue = json.load(open(CATALOGUE, encoding="utf-8")) if CATALOGUE else None
assembly = {}
if ASSEMBLY:
    for fn in os.listdir(ASSEMBLY):
        if fn.endswith("_ASSEMBLY.geojson"):
            st = fn[: -len("_ASSEMBLY.geojson")].upper()
            assembly[SLUGS[FILE_STATE.get(st, st)]] = os.path.join(ASSEMBLY, fn)
report = []

shapes = {}
for slug, polys in sorted(groups.items()):
    lats = [lat for poly in polys for ring in poly for _, lat in ring]
    lons = [lon for poly in polys for ring in poly for lon, _ in ring]
    k = math.cos(math.radians((min(lats) + max(lats)) / 2))
    w, h = (max(lons) - min(lons)) * k, max(lats) - min(lats)
    s = SIZE / max(w, h)
    project = lambda lon, lat: ((lon - min(lons)) * k * s, (max(lats) - lat) * s)
    rings = [[project(*p) for p in ring[:-1]] for poly in polys for ring in poly]
    shape = {"viewBox": f"0 0 {w * s:.1f} {h * s:.1f}", "d": path(rings, TOLERANCE, KEEP, slug in ISLANDS)}
    biggest = max(area(r) for r in rings)
    centres = [(sum(x for x, _ in r) / len(r), sum(y for _, y in r) / len(r)) for r in rings
               if area(r) >= biggest * KEEP or (slug in ISLANDS and area(r) > 0.02)]
    if slug in SCATTERED:
        clusters = []
        for c in centres:
            near = next((k for k in clusters if math.dist(k[0], c) < CLUSTER), None)
            if near:
                near[1].append(c)
                near[0] = (sum(x for x, _ in near[1]) / len(near[1]), sum(y for _, y in near[1]) / len(near[1]))
            else:
                clusters.append([c, [c]])
        shape["marks"] = [[round(x, 1), round(y, 1)] for (x, y), _ in clusters]

    if catalogue:
        import numpy as np
        import shapely
        from shapely import make_valid, set_precision, union_all
        from shapely.geometry import shape as geometry

        # the same projection, for shapely's geometries, on a grid fine enough not to show: overlays
        # of geometries on a grid stay on it, and don't fail on points all but on top of each other
        flat = lambda g: set_precision(make_valid(shapely.transform(geometry(g), lambda c: np.column_stack(((c[:, 0] - min(lons)) * k * s, (max(lats) - c[:, 1]) * s)))), GRID)
        state = make_valid(union_all([flat({"type": "Polygon", "coordinates": poly}) for poly in polys]))
        listed = [a for a in catalogue["acs"] if a["state"] == slug]
        found, home = {}, {}  # AC number -> its geometry, and the district the boundary file puts it in
        others, spare = [], []  # the file's ACs the catalogue doesn't name, and its land in no AC ([district, geometry])
        if slug in WHOLE:
            for no, src in WHOLE[slug].items():
                found[no] = flat({"type": "MultiPolygon", "coordinates": pieces[src]})
        elif slug in assembly:
            by_no, by_name = {}, {}
            for f in json.load(open(assembly[slug], encoding="utf-8"))["features"]:
                pr = f["properties"]
                name = (pr.get("AC_NAME") or pr.get("assem_name") or "").strip()
                g, dist = flat(f["geometry"]), norm(pr.get("DIST_NAME") or "")
                no = pr.get("AC_NO")
                numbered = isinstance(no, (int, float)) or (isinstance(no, str) and no.strip().isdigit())
                if not name and (not numbered or int(no) == 0):
                    spare.append([dist, g])
                    continue
                if numbered:
                    by_no.setdefault(int(no), [name, [], dist])[1].append(g)
                by_name.setdefault(norm(name), [[], dist])[0].append(g)
            used = set()
            for a in listed:
                if by_no:
                    hit = by_no.get(a["no"])
                    if hit and similar(hit[0], a["name"]) >= 0.6:
                        found[a["no"]], home[a["no"]] = union_all(hit[1]), hit[2]
                        used.add(a["no"])
                else:
                    key = norm(a["name"])
                    best = key if key in by_name else max(by_name, key=lambda k: difflib.SequenceMatcher(None, k, key).ratio(), default=None)
                    if best and difflib.SequenceMatcher(None, best, key).ratio() >= 0.8:
                        found[a["no"]], home[a["no"]] = union_all(by_name[best][0]), by_name[best][1]
                        used.add(best)
            others = [union_all(v[1]) for n, v in by_no.items() if n not in used] if by_no else [union_all(v[0]) for n, v in by_name.items() if n not in used]
            # a file whose shapes sit outside the state is in another projection: skip it
            vw, vh = w * s, h * s
            inside = [g for g in found.values() if -5 <= g.centroid.x <= vw + 5 and -5 <= g.centroid.y <= vh + 5]
            if found and len(inside) < len(found) * 0.9:
                report.append(f"{slug}: boundary file not in degrees, skipped")
                found = {}
        share = len(found) / len(listed) if listed else 0
        if listed and share < MATCH:
            report.append(f"{slug}: only {len(found)} of {len(listed)} constituencies match ({share:.0%}), likely redrawn since; no constituency shapes")
            found = {}
        elif listed and share < 1:
            report.append(f"{slug}: {len(found)} of {len(listed)} constituencies")
        if found:
            # each AC within the state, then the land no AC has, to the nearest: first the pieces the
            # file leaves in a district but in no AC, among that district's ACs, then the slivers
            # left along the edge, among every AC (the file's unnamed ones too, so they keep theirs)
            found = {no: g.intersection(state) for no, g in found.items()}
            others = [g.intersection(state) for g in others]
            for dist in sorted({d for d, _ in spare}):
                taken = union_all([*found.values(), *others])
                region = union_all([g for d, g in spare if d == dist]).intersection(state).difference(taken)
                near = [(no, g) for no, g in found.items() if home.get(no) == dist] or list(found.items())
                for no, extra in share_out(region, near).items():
                    found[no] = found[no].union(extra)
            gap = state.difference(union_all([*found.values(), *others, *(g for _, g in spare)]))
            for no, extra in share_out(gap, [*found.items(), *((None, g) for g in others)]).items():
                if no is not None:
                    found[no] = found[no].union(extra)
            islands = slug in ISLANDS
            shape["acs"] = {str(no): lit(g, islands) for no, g in sorted(found.items())}
            have = set(found)
            districts = {}
            for a in listed:
                districts.setdefault(a["district"], []).append(a["no"])
            shape["districts"] = {d: lit(union_all([found[no] for no in v]), islands) for d, v in districts.items() if set(v) <= have}
            shape["pcs"] = {str(p["no"]): lit(union_all([found[no] for no in p["acs"]]), islands)
                            for p in catalogue["pcs"] if p["state"] == slug and p["acs"] and set(p["acs"]) <= have}
    shapes[slug] = shape

missing = sorted(set(SLUGS.values()) - set(shapes))
with open(OUT, "w", encoding="utf-8") as f:
    f.write("{\n")
    f.write('  "source": "datta07/INDIAN-SHAPEFILES: INDIA/INDIA_STATES.geojson and STATES/*/*_ASSEMBLY.geojson (MIT, see state-shapes.LICENSE)",\n')
    f.write('  "shapes": {\n')
    f.write(",\n".join(f"    {json.dumps(k)}: {json.dumps(v, separators=(',', ':'))}" for k, v in shapes.items()))
    f.write("\n  }\n}\n")
total = sum(len(v["d"]) + sum(len(x[0]) for x in v.get("acs", {}).values()) for v in shapes.values())
print(f"{len(shapes)} states, {sum(len(v.get('acs', {})) for v in shapes.values())} constituencies, {total // 1024} KB of path data, missing {missing}")
for line in report:
    print("  " + line)
