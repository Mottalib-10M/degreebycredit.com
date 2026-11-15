#!/usr/bin/env python3
"""Scorecard addresses of the online colleges, for the "Find your college" field (src/pages/data/college-search.json.ts).
Input: data/raw/scorecard-sitemap.xml (https://collegescorecard.ed.gov/sitemap.xml). Output: src/data/scorecard-slugs.json,
{"none": [UNITIDs without a Scorecard page], "renamed": {UNITID: slug}} for slugs that the name rule of
lib/college-search.ts (scorecardSlug) does not give. Manual rerun when colleges.json or Scorecard changes."""
import html, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sm = open(os.path.join(ROOT, 'data/raw/scorecard-sitemap.xml'), encoding='utf-8').read()
slugs = {int(u): html.unescape(s) for u, s in re.findall(r'collegescorecard\.ed\.gov/school/\?(\d+)-([^<]+)</loc>', sm)}
rule = lambda n: n.replace(' ', '_').replace(',', '').replace("'", '%27').replace('&', '%26')
online = [c for c in json.load(open(os.path.join(ROOT, 'src/data/colleges.json'))) if (c['exc'] or 0) >= 50]
out = {'read': '2026-11-15', 'none': sorted(c['u'] for c in online if c['u'] not in slugs),
       'renamed': {str(c['u']): slugs[c['u']] for c in online if c['u'] in slugs and slugs[c['u']] != rule(c['n'])}}
json.dump(out, open(os.path.join(ROOT, 'src/data/scorecard-slugs.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(online), 'online;', len(out['none']), 'without Scorecard page;', len(out['renamed']), 'renamed')
