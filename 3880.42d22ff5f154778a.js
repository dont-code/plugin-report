(self.webpackChunkreport_tester=self.webpackChunkreport_tester||[]).push([[3880],{3880:(A,i,s)=>{function f(r){return r+.5|0}s.r(i),s.d(i,{default:()=>j});const g=(r,e,n)=>Math.max(Math.min(r,n),e);function y(r){return g(f(255*r),0,255)}function p(r,e,n){const o=(c,u=(c+r/60)%6)=>n-n*e*Math.max(Math.min(u,4-u,1),0);return[o(5),o(3),o(1)]}function h(r,e,n){return function M(r,e,n,o){return(Array.isArray(e)?r(e[0],e[1],e[2]):r(e,n,o)).map(y)}(p,r,e,n)}function a(r){return r&&(r.a<255?`rgba(${r.r}, ${r.g}, ${r.b}, ${function $(r){return g(f(r/2.55)/100,0,1)}(r.a)})`:`rgb(${r.r}, ${r.g}, ${r.b})`)}function x(r,e,n){r.backgroundColor=r.backgroundColor||e,r.borderColor=r.borderColor||n}function k(r,e,n){const o=r.next().value;return"function"==typeof e?e(Object.assign({colors:o},n)):o}var j={id:"autocolors",beforeUpdate(r,e,n){const{mode:o="dataset",enabled:c=!0,customize:u}=n;if(!c)return;const l=function*I(){const r=function*w(){for(yield 0;;)for(let r=1;r<10;r++){const e=1<<r;for(let n=1;n<=e;n+=2)yield n/e}}();let e=r.next();for(;!e.done;){let n=h(Math.round(360*e.value),.6,.8);yield{background:a({r:n[0],g:n[1],b:n[2],a:192}),border:a({r:n[0],g:n[1],b:n[2],a:144})},n=h(Math.round(360*e.value),.6,.5),yield{background:a({r:n[0],g:n[1],b:n[2],a:192}),border:a({r:n[0],g:n[1],b:n[2],a:144})},e=r.next()}}();if(n.offset)for(let t=0;t<n.offset;t++)l.next();for(const t of r.data.datasets)if(!t.backgroundColor||!t.borderColor)if("dataset"===o){const d=k(l,u,{chart:r,datasetIndex:t.index});x(t,d.background,d.border)}else{const d=[],C=[];for(let b=0;b<t.data.length;b++){const m=k(l,u,{chart:r,datasetIndex:t.index,dataIndex:b});d.push(m.background),C.push(m.border)}x(t,d,C)}}}}}]);