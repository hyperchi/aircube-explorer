"""Extract source coordinates and connectivity from KiCad 9 S-expressions."""
import json,re,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
tokens=re.findall(r'"(?:\\.|[^"\\])*"|[()]|[^\s()]+',(root/'public/source/AirCube.kicad_pcb').read_text())
stack=[]
for t in tokens:
 if t=='(': stack.append([])
 elif t==')':
  v=stack.pop()
  if stack: stack[-1].append(v)
  else: board=v
 else: stack[-1].append(json.loads(t) if t.startswith('"') else t)
def children(n,k): return [v for v in n if isinstance(v,list) and v and v[0]==k]
def get(n,k,default=[]): return next(iter(children(n,k)),[k]+default)[1:]
def xy(n,k): return [float(v) for v in get(n,k)[:2]]
def shape(n):
 d={'type':n[0].replace('fp_','').replace('gr_',''),'layer':get(n,'layer',[''])[0]}
 for k in ['start','end','mid','center','at','size']:
  if get(n,k): d[k]=xy(n,k)
 d['width']=float(get(n,'width',get(get(n,'stroke'),'width',['0.15']))[0])
 return d
out={'commit':'bd857275c1f02efbec6942a96e433bde9d4d417e','nets':{n[1]:n[2] for n in children(board,'net')},'components':[],'tracks':[],'edges':[],'vias':[],'zones':[]}
for f in children(board,'footprint'):
 props={p[1]:p[2] for p in children(f,'property')}
 c={'ref':props.get('Reference','?'),'value':props.get('Value',''),'footprint':f[1],'at':[float(v) for v in get(f,'at')],'layer':get(f,'layer')[0],'pads':[],'shapes':[]}
 for p in children(f,'pad'):
  c['pads'].append({'number':p[1],'shape':p[3],'at':[float(v) for v in get(p,'at')],'size':xy(p,'size'),'net':get(p,'net',['0'])[0],'layers':get(p,'layers'),'drill':float(next((v for v in get(p,'drill',['0']) if v!='oval'),'0'))})
 for kind in ['fp_line','fp_rect','fp_circle','fp_arc']:
  c['shapes'] += [shape(s) for s in children(f,kind) if get(s,'layer',[''])[0].endswith(('SilkS','CrtYd','Fab'))]
 out['components'].append(c)
for s in children(board,'segment')+children(board,'arc'):
 d=shape(s);d['net']=get(s,'net',['0'])[0];out['tracks'].append(d)
for s in children(board,'via'): out['vias'].append({'at':xy(s,'at'),'size':float(get(s,'size')[0]),'drill':float(get(s,'drill')[0]),'net':get(s,'net',['0'])[0]})
for kind in ['gr_line','gr_arc','gr_rect','gr_circle']:
 out['edges'] += [shape(s) for s in children(board,kind) if get(s,'layer',[''])[0]=='Edge.Cuts']
for z in children(board,'zone'):
 for p in children(z,'filled_polygon'):
  out['zones'].append({'net':get(z,'net',['0'])[0],'layer':get(p,'layer',[''])[0],'points':[list(map(float,v[1:])) for v in get(p,'pts') if isinstance(v,list)]})
(root/'public/board.json').write_text(json.dumps(out,separators=(',',':')))
print({k:len(v) for k,v in out.items()})
