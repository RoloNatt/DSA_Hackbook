import * as M from "../mlmath.js";
const ok=(n,c,e="")=>console.log(`${c?"PASS":"FAIL"}  ${n}${e?"  "+e:""}`);
const close=(a,b,t=1e-6)=>Math.abs(a-b)<t;

// Hand-computable case: hull A = triangle (0,0),(1,0),(0,1); hull B = (4,4),(5,4),(4,5).
// Closest points: (0.5,0.5) on A's edge and (4,4) in B. Distance = |(3.5,3.5)| = 4.94975.
// So max margin width = 4.94975, w ∝ (1,1), and SVs = {(1,0),(0,1),(4,4)}.
const X=[[0,0],[1,0],[0,1],[4,4],[5,4],[4,5]], y=[0,0,0,1,1,1];
const m = M.svmSMO(X,y,{C:1e6,kernel:"linear"});   // huge C ≈ hard margin
const trueWidth = Math.hypot(3.5,3.5);
ok("SMO margin width == hand-computed", close(m.marginWidth, trueWidth, 1e-3),
  `got ${m.marginWidth.toFixed(6)} expected ${trueWidth.toFixed(6)}`);
ok("SMO w direction ∝ (1,1)", close(m.w[0], m.w[1], 1e-4), `w=[${m.w.map(v=>v.toFixed(5)).join(", ")}]`);
ok("SMO all margins ≥ 1", Math.min(...m.margins) >= 1-1e-4, `min=${Math.min(...m.margins).toFixed(6)}`);
const svSet = new Set(m.supportVectors);
ok("SMO finds exactly the 3 true SVs", m.supportVectors.length===3 && svSet.has(1)&&svSet.has(2)&&svSet.has(3),
  `SV idx=[${m.supportVectors}] (expect 1,2,3) margins=${m.margins.map(v=>v.toFixed(4)).join(",")}`);
ok("SMO SV margins are exactly 1", m.supportVectors.every(i=>close(m.margins[i],1,1e-3)),
  m.supportVectors.map(i=>m.margins[i].toFixed(6)).join(","));
ok("SMO accuracy 1", M.accuracy(y, X.map(x=>m.decide(x)>=0?1:0))===1);

// Soft margin: smaller C must widen the margin and allow violators
const soft = M.svmSMO(X,y,{C:0.01,kernel:"linear"});
ok("smaller C → wider margin", soft.marginWidth > m.marginWidth,
  `C=1e6 → ${m.marginWidth.toFixed(3)}, C=0.01 → ${soft.marginWidth.toFixed(3)}`);
ok("small C produces margin violators", soft.violators.length>0,
  `onMargin=${soft.onMargin.length} violators=${soft.violators.length}`);

// Overlapping classes: soft margin must still train and misclassify some
const r=M.rng(5); const Xo=[],yo=[];
for(let i=0;i<40;i++){const c=i%2; Xo.push([c*1.2+M.gauss(r)*0.9, c*1.2+M.gauss(r)*0.9]); yo.push(c);}
const ov=M.svmSMO(Xo,yo,{C:1,kernel:"linear"});
const ovAcc=M.accuracy(yo,Xo.map(x=>ov.decide(x)>=0?1:0));
ok("overlapping: trains, acc in (0.6,1)", ovAcc>0.6 && ovAcc<=1, `acc=${ovAcc.toFixed(3)} #SV=${ov.supportVectors.length}/40`);
ok("dual objective positive", ov.objective>0, `obj=${ov.objective.toFixed(4)}`);

// XOR: linear must fail, RBF must succeed
const rq=M.rng(4); const Xr=[],yr=[];
for(let i=0;i<40;i++){const q=i%4; const cx=(q===0||q===3)?1:-1, cy=(q===0||q===1)?1:-1;
  Xr.push([cx+M.gauss(rq)*0.3, cy+M.gauss(rq)*0.3]); yr.push(cx*cy>0?1:0);}
const lin=M.svmSMO(Xr,yr,{C:1,kernel:"linear"});
const rbfm=M.svmSMO(Xr,yr,{C:5,kernel:"rbf",gamma:1.5});
const la=M.accuracy(yr,Xr.map(x=>lin.decide(x)>=0?1:0));
const ra=M.accuracy(yr,Xr.map(x=>rbfm.decide(x)>=0?1:0));
ok("RBF beats linear on XOR", ra>la, `linear=${la.toFixed(3)} rbf=${ra.toFixed(3)}`);
ok("RBF acc == 1 on XOR", ra===1, `acc=${ra}`);
const tiny=M.svmSMO(Xr,yr,{C:5,kernel:"rbf",gamma:0.01});
const huge=M.svmSMO(Xr,yr,{C:5,kernel:"rbf",gamma:100});
const ta=M.accuracy(yr,Xr.map(x=>tiny.decide(x)>=0?1:0));
const ha=M.accuracy(yr,Xr.map(x=>huge.decide(x)>=0?1:0));
ok("tiny gamma underfits", ta<ra, `γ=0.01 → ${ta.toFixed(3)}, γ=1.5 → ${ra.toFixed(3)}, γ=100 → ${ha.toFixed(3)}`);
ok("huge gamma memorizes (SVs ≈ all points)", huge.supportVectors.length > rbfm.supportVectors.length,
  `#SV γ=1.5: ${rbfm.supportVectors.length}, γ=100: ${huge.supportVectors.length}/40`);
ok("poly kernel trains", M.accuracy(yr,Xr.map(x=>M.svmSMO(Xr,yr,{C:5,kernel:"poly",degree:2}).decide(x)>=0?1:0))>0.8,
  `acc=${M.accuracy(yr,Xr.map(x=>M.svmSMO(Xr,yr,{C:5,kernel:"poly",degree:2}).decide(x)>=0?1:0)).toFixed(3)}`);
ok("determinism", JSON.stringify(M.svmSMO(Xr,yr,{C:5,kernel:"rbf",gamma:1.5}).alpha)===JSON.stringify(rbfm.alpha));
