"""
Builds the voter list catalogue from pages downloaded off https://setuk.org/voter-list-excel/.

  python3 -I scripts/voter-list/parse.py <download dir> lib/voter-list/data

<download dir> is what export.sh fills; the second argument is where catalogue.json and copy.json go.

The download holds index.html (the landing page) and raw/<state>/{state,all-districts,
all-assembly-constituencies,all-parliamentary-constituencies}.html, plus raw/<state>/<district>.district.html
for states with no assembly list (UTs whose one constituency is the Lok Sabha seat). Slugs and the state > district
> constituency hierarchy come from each state's "Related voter lists" block; counts, rolls and the
Lok Sabha links come from the cards' data-order JSON and markup; the state pages' own editorial
copy (hero, article, questions) is kept as written.
"""
import html
import json
import os
import re
import sys
from datetime import date

LIVE, OUT = sys.argv[1], sys.argv[2]
ROOT = "/voter-list-excel/"


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def text(fragment):
    """Visible text of an HTML fragment, whitespace collapsed"""
    fragment = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", fragment, flags=re.S)
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", fragment)).split()).replace(" ,", ",").replace(" .", ".").replace(" :", ":")


def num(s):
    return int(re.sub(r"\D", "", s)) if re.search(r"\d", s or "") else 0


def slugs_of(href):
    """'/voter-list-excel/bihar/patna/' -> ['bihar', 'patna']"""
    return [x for x in href[len(ROOT):].split("/") if x] if href.startswith(ROOT) else []


def cards(page):
    """Every card on a page: its data-order JSON, its heading and its links"""
    out = []
    for m in re.finditer(r'<article\b[^>]*data-order="([^"]*)"[^>]*>(.*?)</article>', page, flags=re.S):
        order = json.loads(html.unescape(m.group(1)))
        body = m.group(2)
        h3 = re.search(r"<h3\b[^>]*>(.*?)</h3>", body, flags=re.S)
        kind = re.search(r"<p\b[^>]*>\s*([A-Za-z ]+?)\s*</p>", body)
        links = [(a, text(t)) for a, t in re.findall(r'<a\b[^>]*href="(/voter-list-excel/[^"]*)"[^>]*>(.*?)</a>', body, flags=re.S)]
        wa = html.unescape(re.sub(r"%([0-9A-F]{2})", lambda x: chr(int(x.group(1), 16)), order.get("waHref", "")))
        rows = {r["label"]: num(r["count"]) for r in order.get("rows", [])}
        out.append({"order": order, "name": text(h3.group(1)) if h3 else "", "kind": kind.group(1) if kind else "", "links": links, "wa": wa, "rows": rows})
    return out


def related_block(page):
    """The 'Related voter lists' block: one entry per state, three lists of (slugs, label)"""
    m = re.search(r'<section\b[^>]*aria-label="Related voter lists"[^>]*>(.*?)</section>', page, flags=re.S)
    if not m:
        return {}
    out = {}
    for part in re.split(r"(?=<div class=\"mt-3 p-4 surface\">)", m.group(1)):
        head = re.search(r'<a\b[^>]*href="(/voter-list-excel/[a-z0-9-]+/)"[^>]*>', part)
        if not head:
            continue
        st = slugs_of(head.group(1))[0]
        lists = {"districts": [], "acs": [], "pcs": []}
        for p in re.findall(r"<p\b[^>]*>(.*?)</p>", part, flags=re.S):
            lead = re.search(r'href="/voter-list-excel/[^/]+/(all-[a-z-]+)/"', p)
            key = {"all-districts": "districts", "all-assembly-constituencies": "acs", "all-parliamentary-constituencies": "pcs"}.get(lead.group(1) if lead else "")
            if not key:
                continue
            for a, t in re.findall(r'<span>\s*,?\s*<a\b[^>]*href="(/voter-list-excel/[^"]*)"[^>]*>(.*?)</a>', p, flags=re.S):
                lists[key].append((slugs_of(a), text(t)))
        out[st] = lists
    return out


def copy(page):
    """A page's own words: hero title and lead, the editorial article, the questions"""
    main = page[page.find("<main"):page.find("</main>")]
    h1 = re.search(r"<h1\b[^>]*>(.*?)</h1>", main, flags=re.S)
    hero = re.search(r'<section class="vl-hero".*?</section>', main, flags=re.S)
    lead = ""
    if hero:
        ps = [text(p) for p in re.findall(r"<p\b[^>]*>(.*?)</p>", hero.group(0), flags=re.S)]
        lead = next((p for p in ps if len(p) > 40), "")
    article = []
    sections = re.findall(r'<section class="mt-12 surface[^"]*">(.*?)</section>', main, flags=re.S)
    for sec in sections:
        for m in re.finditer(r"<(h2|h3|p|ul|ol)\b[^>]*>(.*?)</\1>", sec, flags=re.S):
            tag, body = m.group(1), m.group(2)
            if tag in ("ul", "ol"):
                items = [text(li) for li in re.findall(r"<li\b[^>]*>(.*?)</li>", body, flags=re.S)]
                if items:
                    article.append({"type": "list", "ordered": tag == "ol", "items": items})
            elif text(body):
                article.append({"type": "heading" if tag in ("h2", "h3") else "paragraph", "text": text(body)})
    faqs = []
    fq = re.search(r"Frequently asked questions</h2>(.*?)</section>", main, flags=re.S)
    if fq:
        for q, a in re.findall(r"<h3\b[^>]*>(.*?)</h3>\s*<p\b[^>]*>(.*?)</p>", fq.group(1), flags=re.S):
            faqs.append({"q": text(q), "a": text(a)})
    return {"title": text(h1.group(1)) if h1 else "", "lead": lead, "article": article, "faqs": faqs}


landing = read(os.path.join(LIVE, "index.html"))
index = related_block(landing)
landing_cards = {re.search(r"State: (.+)", c["wa"]).group(1).strip(): c for c in cards(landing) if "State:" in c["wa"]}

states, districts, acs, pcs, pages = [], [], [], [], {}
rate = None
problems = []

for st in index:
    raw = os.path.join(LIVE, "raw", st)
    if not os.path.isdir(raw):
        problems.append(f"{st}: no downloaded pages")
        continue
    lists = index[st]
    page = read(os.path.join(raw, "state.html"))
    name = text(re.search(r'<a\b[^>]*href="/voter-list-excel/%s/"[^>]*>(.*?)</a>' % re.escape(st), page[page.find('aria-label="Related voter lists"'):], flags=re.S).group(1))
    lc = landing_cards.get(name)
    if not lc:
        problems.append(f"{st}: no landing card for {name!r}")
        continue
    rate = rate or lc["order"]["pricePerBooth"]
    pages[st] = {"state": copy(page)}
    for kind in ("all-districts", "all-assembly-constituencies", "all-parliamentary-constituencies"):
        f = os.path.join(raw, kind + ".html")
        if os.path.exists(f):
            pages[st][kind] = copy(read(f))

    # districts: the state page's cards, in order, matched to the block's links by name
    dcards = [c for c in cards(page) if c["kind"] == "District"]
    by_name = {c["name"].upper(): c for c in dcards}
    for slugs, label in lists["districts"]:
        c = by_name.get(label.upper())
        if not c:
            problems.append(f"{st}: district {label!r} has no card")
        districts.append({
            "state": st, "slug": slugs[1], "name": label,
            "roll": c["order"]["rollLabel"] if c else lc["order"]["rollLabel"],
            "acs": c["rows"].get("Assembly Constituencies", 0) if c else 0,
            "booths": c["rows"].get("Polling Booths/Parts", 0) if c else 0,
        })

    # assembly constituencies: the all-assembly page's cards, matched to the block's links by number
    acards = {}
    f = os.path.join(raw, "all-assembly-constituencies.html")
    if os.path.exists(f):
        for c in cards(read(f)):
            no = num(c["order"]["title"].split(" - ")[0])
            acards[no] = c
    for slugs, label in lists["acs"]:
        no_s, _, ac_name = label.partition(" - ")
        no = num(no_s)
        c = acards.get(no)
        pc_link = next(((a, t) for a, t in (c["links"] if c else []) if re.match(r"^\d+ - ", t)), None)
        acs.append({
            "state": st, "district": slugs[1], "no": no, "slug": slugs[2], "name": ac_name.strip(),
            "roll": c["order"]["rollLabel"] if c else lc["order"]["rollLabel"],
            "booths": c["rows"].get("Polling Booths/Parts", 0) if c else 0,
            "pc": num(pc_link[1].split(" - ")[0]) if pc_link else None,
        })
        if not c:
            problems.append(f"{st}: AC {label!r} has no card")

    # states without an assembly list (UTs whose one constituency is the Lok Sabha seat): read the
    # constituencies off each district's own page, pairing cards with their page links by number
    if not lists["acs"]:
        for di in [x for x in districts if x["state"] == st]:
            f = os.path.join(raw, di["slug"] + ".district.html")
            if not os.path.exists(f):
                problems.append(f"{st}: no district page for {di['slug']} to read its constituencies from")
                continue
            dpage = read(f)
            hrefs = sorted(set(re.findall(r'href="(/voter-list-excel/%s/%s/(\d+)-[a-z0-9-]+-excel-voter-list/)"' % (re.escape(st), re.escape(di["slug"])), dpage)), key=lambda x: int(x[1]))
            dcs = [c for c in cards(dpage) if c["kind"] == "Assembly"]
            for (href, no_s), c in zip(hrefs, dcs):
                pc_link = next(((a2, t) for a2, t in c["links"] if re.match(r"^\d+ - ", t)), None)
                acs.append({
                    "state": st, "district": di["slug"], "no": int(no_s), "slug": slugs_of(href)[2], "name": c["name"].strip(),
                    "roll": c["order"]["rollLabel"], "booths": c["rows"].get("Polling Booths/Parts", 0),
                    "pc": num(pc_link[1].split(" - ")[0]) if pc_link else None,
                })
            if len(hrefs) != len(dcs):
                problems.append(f"{st}/{di['slug']}: {len(dcs)} cards, {len(hrefs)} constituency links")

    # Lok Sabha constituencies: the all-parliamentary page's cards, matched by number
    pcards = {}
    f = os.path.join(raw, "all-parliamentary-constituencies.html")
    if os.path.exists(f):
        for c in cards(read(f)):
            pcards[num(c["order"]["title"].split(" - ")[0])] = c
    for slugs, label in lists["pcs"]:
        no_s, _, pc_name = label.partition(" - ")
        no = num(no_s)
        c = pcards.get(no)
        segs = [num(t.split(" - ")[0]) for a, t in (c["links"] if c else []) if re.match(r"^\d+ - ", t)]
        pcs.append({
            "state": st, "no": no, "slug": slugs[1], "name": pc_name.strip(),
            "roll": c["order"]["rollLabel"] if c else lc["order"]["rollLabel"],
            "booths": c["rows"].get("Polling Booths/Parts", 0) if c else 0,
            "acs": segs,
        })
        if not c:
            problems.append(f"{st}: PC {label!r} has no card")

    code = (dcards[0]["order"]["eyebrow"].split(" - ")[0] if dcards else lc["order"]["eyebrow"]).strip()
    states.append({
        "code": code, "slug": st, "name": name, "roll": lc["order"]["rollLabel"], "languages": lc["order"].get("languages") or "",
        "districts": len(lists["districts"]),
        "acs": lc["rows"].get("Assembly Constituencies", len(lists["acs"])),
        "pcs": lc["rows"].get("Parliamentary Constituencies", len(lists["pcs"])),
        "booths": lc["rows"].get("Polling Booths/Parts", 0),
    })

# fill each AC's Lok Sabha seat from the seat's own list where the AC card had none
for pc in pcs:
    for no in pc["acs"]:
        for ac in acs:
            if ac["state"] == pc["state"] and ac["no"] == no and ac["pc"] is None:
                ac["pc"] = pc["no"]

one = lambda x: json.dumps(x, ensure_ascii=False, separators=(",", ":"))


def write(path, obj):
    """JSON with one record per line, so a refresh shows as a readable diff"""
    with open(path, "w", encoding="utf-8") as f:
        f.write("{\n")
        keys = list(obj)
        for k, key in enumerate(keys):
            v = obj[key]
            end = ",\n" if k < len(keys) - 1 else "\n"
            if isinstance(v, list):
                f.write(f"  {one(key)}: [\n" + ",\n".join("    " + one(x) for x in v) + "\n  ]" + end)
            elif isinstance(v, dict):
                f.write(f"  {one(key)}: {{\n" + ",\n".join(f"    {one(k2)}: {one(v2)}" for k2, v2 in v.items()) + "\n  }" + end)
            else:
                f.write(f"  {one(key)}: {one(v)}" + end)
        f.write("}\n")


os.makedirs(OUT, exist_ok=True)
meta = {"source": "https://setuk.org/voter-list-excel/", "exportedAt": date.today().isoformat()}
write(os.path.join(OUT, "catalogue.json"), {**meta, "ratePerBooth": rate, "states": states, "districts": districts, "acs": acs, "pcs": pcs})
write(os.path.join(OUT, "copy.json"), {**meta, "landing": copy(landing), "states": pages})

print(f"states {len(states)}  districts {len(districts)}  acs {len(acs)}  pcs {len(pcs)}  rate {rate}")
print(f"acs without booths {sum(1 for a in acs if not a['booths'])}  acs without seat {sum(1 for a in acs if a['pc'] is None)}  pcs without booths {sum(1 for p in pcs if not p['booths'])}")
print(f"problems {len(problems)}")
for p in problems[:40]:
    print("  ", p)
