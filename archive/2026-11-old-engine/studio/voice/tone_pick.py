# After tone_check: copy each line's best take to raw/raw_<key>.wav and treat the chosen takes into a manifest.
# usage: python tone_pick.py takes.json tone_report.txt jobs.json manifest_out.json <skit>
import sys, json, shutil, subprocess
takes = {t['key']: t for t in json.load(open(sys.argv[1]))}; jobs = {j['out']: j for j in json.load(open(sys.argv[3]))}
pick = [l.split()[1:] for l in open(sys.argv[2]) if l.startswith('BEST ')]; out = []
for key, f in pick:
    shutil.copy(f, f'raw/raw_{key}.wav'); j = dict(jobs[f.split('/')[-1]]); j['out'] = f'raw_{key}.wav'; out.append(j)
json.dump(out, open('/tmp/_picked.json', 'w'))
subprocess.run(['/root/.pxi-voice/bin/python', 'treat_skit.py', '/tmp/_picked.json', sys.argv[4], sys.argv[5]], check=True)
