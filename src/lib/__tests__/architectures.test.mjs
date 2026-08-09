import * as M from "../mlmath.js";
import * as N from "../nn.js";
import * as D from "../datasets.js";
const ok=(n,c,e="")=>console.log(`${c?"PASS":"FAIL"}  ${n}${e?"  "+e:""}`);

// --- Kernel trick lab claims ---
const ds = D.CIRCLES;
const lifted = ds.X.map(p => [p[0], p[1], p[0]**2 + p[1]**2]);
const lin2 = M.svmSMO(ds.X, ds.y, {C:1, kernel:"linear"});
const lin3 = M.svmSMO(lifted, ds.y, {C:1, kernel:"linear"});
const rbf  = M.svmSMO(ds.X, ds.y, {C:5, kernel:"rbf", gamma:0.5});
const a2 = M.accuracy(ds.y, ds.X.map(p=>lin2.decide(p)>=0?1:0));
const a3 = M.accuracy(ds.y, lifted.map(p=>lin3.decide(p)>=0?1:0));
const ar = M.accuracy(ds.y, ds.X.map(p=>rbf.decide(p)>=0?1:0));
ok("linear 2D fails the ring", a2 < 0.8, `${(a2*100).toFixed(1)}%`);
ok("lifting to 3D makes it linearly separable", a3 > 0.97, `${(a3*100).toFixed(1)}%`);
ok("RBF in 2D matches the 3D lift", ar > 0.97, `${(ar*100).toFixed(1)}%`);
ok("the lift is genuinely separable by a flat plane at some height", (()=>{
  const z = lifted.map(p=>p[2]);
  const innerMax = Math.max(...z.filter((_,i)=>ds.y[i]===0));
  const outerMin = Math.min(...z.filter((_,i)=>ds.y[i]===1));
  return innerMax < outerMin;
})(), (()=>{const z=lifted.map(p=>p[2]);
  return `inner max z=${Math.max(...z.filter((_,i)=>ds.y[i]===0)).toFixed(2)} < outer min z=${Math.min(...z.filter((_,i)=>ds.y[i]===1)).toFixed(2)}`;})());

// --- CNN stack lab claims ---
const p1 = N.convShape({inSize:8,kernel:3,stride:1,padding:1,inCh:1,outCh:4});
const p2 = N.convShape({inSize:4,kernel:3,stride:1,padding:1,inCh:4,outCh:8});
ok("conv1 params = 3*3*1*4 + 4 = 40", p1.params === 40, `${p1.params}`);
ok("conv2 params = 3*3*4*8 + 8 = 296", p2.params === 296, `${p2.params}`);
ok("padding 1 preserves 8x8", p1.out === 8, `${p1.out}`);
ok("dense-on-8x8 first layer = 64*64+64 = 4160", 64*64+64 === 4160);
// receptive field growth claim 1,3,3,4,8,10,10
ok("stated receptive fields are consistent with 3x3 conv + 2x2 pool",
  (()=>{ // conv3 adds 2; pool2 doubles the stride so the next conv covers 2x more
    let rf=1, stride=1;
    const seq=[];
    seq.push(rf);                       // stage 0 input
    rf += 2*stride; seq.push(rf);       // conv1 3x3 -> 3
    seq.push(rf);                       // relu, unchanged -> 3
    rf += 1*stride; stride*=2; seq.push(rf); // pool 2x2 -> 4
    rf += 2*stride; seq.push(rf);       // conv2 3x3 at stride2 -> 8
    rf += 1*stride; stride*=2; seq.push(rf); // pool -> 10
    seq.push(rf);
    return JSON.stringify(seq)===JSON.stringify([1,3,3,4,8,10,10]);
  })(), "1,3,3,4,8,10,10");

// --- LSTM lab claims ---
const H=2, mk=v=>Array.from({length:H},()=>[v]), mkh=v=>Array.from({length:H},()=>Array(H).fill(v));
const mkP=(bf)=>({Wxf:mk(0),Whf:mkh(0),bf:Array(H).fill(bf),
  Wxi:mk(0),Whi:mkh(0),bi:Array(H).fill(0),Wxo:mk(0),Who:mkh(0),bo:Array(H).fill(2),
  Wxg:mk(2),Whg:mkh(0),bg:Array(H).fill(0)});
const inputs=[1,0,0,0,0,0,0,0];
const open = N.lstmRun(inputs, mkP(4)).trace;
const shut = N.lstmRun(inputs, mkP(-4)).trace;
const retOpen = open[7].c[0]/open[0].c[0], retShut = shut[7].c[0]/shut[0].c[0];
ok("forget gate open retains memory across 8 steps", retOpen > 0.8, `${(retOpen*100).toFixed(1)}%`);
ok("forget gate shut destroys it", retShut < 0.05, `${(retShut*100).toFixed(2)}%`);
const rnn = N.rnnRun(inputs, {Wxh:Array.from({length:H},()=>[2]), Whh:Array.from({length:H},(_,i)=>Array.from({length:H},(_,j)=>i===j?0.6:0)), bh:Array(H).fill(0)});
const retRnn = rnn.states[8][0]/rnn.states[1][0];
ok("LSTM beats vanilla RNN on the same input", retOpen > retRnn*5, `LSTM ${(retOpen*100).toFixed(0)}% vs RNN ${(retRnn*100).toFixed(2)}%`);
ok("sigmoid(2)=0.881 as shown in the lab", Math.abs(1/(1+Math.exp(-2)) - 0.8808) < 0.001, (1/(1+Math.exp(-2))).toFixed(4));

// --- Tree criteria lab claims ---
const loan = D.LOAN_DEFAULT;
const counts = rows => { const c=[0,0]; rows.forEach(i=>c[loan.y[i]]++); return c; };
const all = loan.X.map((_,i)=>i);
ok("gini max for 2 classes is 0.5", Math.abs(M.gini([50,50])-0.5)<1e-12);
ok("entropy max for 2 classes is 1 bit", Math.abs(M.entropy([50,50])-1)<1e-12);
const t0 = M.buildTree(loan.X, loan.y, {maxDepth:3,nClasses:2,criterion:"gini",minGain:0});
const tp = M.buildTree(loan.X, loan.y, {maxDepth:3,nClasses:2,criterion:"gini",minGain:0.15});
ok("minGain prunes the tree", M.countLeaves(tp) < M.countLeaves(t0), `${M.countLeaves(t0)} leaves -> ${M.countLeaves(tp)}`);
const accX = t => M.accuracy(D.XOR_QUADRANTS.y, D.XOR_QUADRANTS.X.map(p=>M.treePredict(t,p)));
// The Tree Criteria lab claims depth 4+ recovers the noisy XOR quadrants.
const noisyAcc = d => accX(M.buildTree(D.XOR_QUADRANTS.X, D.XOR_QUADRANTS.y, {maxDepth:d,nClasses:2,minGain:0}));
ok("noisy XOR: depth 2 is NOT enough (greedy root follows noise)", noisyAcc(2) < 0.8, `${noisyAcc(2).toFixed(3)}`);
ok("noisy XOR: depth 4 recovers the quadrants, as the lab states", noisyAcc(4) > 0.99,
  `depth2=${noisyAcc(2).toFixed(3)} depth3=${noisyAcc(3).toFixed(3)} depth4=${noisyAcc(4).toFixed(3)}`);

// The lab's stated fact about the CLEAN 4-point XOR and zero-gain splits.
const cX=[[0,0],[0,1],[1,0],[1,1]], cY=[0,1,1,0];
const accC = t => M.accuracy(cY, cX.map(p=>M.treePredict(t,p)));
ok("clean XOR: minGain=0 solves it at depth 2", accC(M.buildTree(cX,cY,{maxDepth:2,nClasses:2,minGain:0})) === 1);
ok("clean XOR: any minGain>0 collapses it to a stump at 0.50",
  accC(M.buildTree(cX,cY,{maxDepth:2,nClasses:2,minGain:0.01})) === 0.5,
  "exactly the claim made in the lab verdict");
