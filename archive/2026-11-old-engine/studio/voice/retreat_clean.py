# Founder, Nov 19: plain clean voices on every skit. Re-treat each line of a skit's manifest from its raw take with
# the clean chain (mediums 'F'), keeping the take that was approved. usage: python retreat_clean.py <vo manifest> <skit>
import sys, json, glob, os, subprocess
man = json.load(open(sys.argv[1])); jobs = {}
for f in sorted(glob.glob('jobs_*.json'), key=os.path.getmtime):
    try:
        for j in json.load(open(f)): jobs[j['out'][4:-4]] = j
    except Exception: pass
todo = []
for k, v in man.items():
    j = dict(jobs.get(k) or {'who': v['who'], 'text': v['text'], 'out': f'raw_{k}.wav'}); j['sub'] = v['sub']
    assert os.path.exists(f"raw/{j['out']}"), k; todo.append(j)
json.dump(todo, open('/tmp/_retreat.json', 'w'))
subprocess.run(['/root/.pxi-voice/bin/python', 'treat_skit.py', '/tmp/_retreat.json', sys.argv[1], sys.argv[2]], check=True)
