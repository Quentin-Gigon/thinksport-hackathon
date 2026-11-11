import {totals} from '../dist/arena-engine.js';
export function initializeSql(sql){
    sql.exec('CREATE TABLE IF NOT EXISTS event(id INTEGER PRIMARY KEY,value TEXT NOT NULL)');
    sql.exec('INSERT OR IGNORE INTO event VALUES (1,?)',JSON.stringify({stage:'lobby',draw:null}));
    sql.exec('CREATE TABLE IF NOT EXISTS fans(token TEXT PRIMARY KEY,alias TEXT NOT NULL UNIQUE,body TEXT NOT NULL,s1 INTEGER NOT NULL,total INTEGER NOT NULL,n1 INTEGER NOT NULL,n2 INTEGER NOT NULL)');
    sql.exec('CREATE INDEX IF NOT EXISTS by_s1 ON fans(s1 DESC,alias)');
    sql.exec('CREATE INDEX IF NOT EXISTS by_total ON fans(total DESC,alias)');
    sql.exec('CREATE INDEX IF NOT EXISTS by_finish ON fans(n1,n2,total DESC,alias)');
}
export function dbAdapter(sql) {
  const one=(query,...args)=>sql.exec(query,...args).toArray()[0];
  const field=(q,...args)=>one(q,...args).n;
  const cond=(n,final)=>final?'n1=5 AND n2=5':n===1?'n1>0':'(n1>0 OR n2>0)';
  const pts=n=>n===1?'s1':'total';
  const winners='n1=5 AND n2=5 AND total=(SELECT MAX(total) FROM fans WHERE n1=5 AND n2=5)';
  return {
    getMeta:()=>JSON.parse(one('SELECT value FROM event WHERE id=1').value),
    setMeta:v=>sql.exec('UPDATE event SET value=? WHERE id=1',JSON.stringify(v)),
    count:()=>field('SELECT COUNT(*) AS n FROM fans'),
    completed:n=>n?field('SELECT COUNT(*) AS n FROM fans WHERE '+(n===1?'n1':'n2')+'=5'):0,
    finishers:()=>field('SELECT COUNT(*) AS n FROM fans WHERE n1=5 AND n2=5'),
    get:t=>{const r=one('SELECT body FROM fans WHERE token=?',t);return r?JSON.parse(r.body):null;},
    save(t,p){const [a,b,x,y]=totals(p);sql.exec('INSERT INTO fans (token,alias,body,s1,total,n1,n2) VALUES (?,?,?,?,?,?,?) ON CONFLICT(token) DO UPDATE SET body=excluded.body,s1=excluded.s1,total=excluded.total,n1=excluded.n1,n2=excluded.n2',t,p.alias,JSON.stringify(p),a,a+b,x,y);},
    leaders:(n,final)=>sql.exec('SELECT alias,'+pts(n)+' AS score,(n1=5)'+(n===2?'+(n2=5)':'')+' AS completed FROM fans WHERE '+cond(n,final)+' ORDER BY '+pts(n)+' DESC,alias LIMIT 10').toArray(),
    higher:(n,score,final)=>field('SELECT COUNT(*) AS n FROM fans WHERE '+cond(n,final)+' AND '+pts(n)+'>?',score),
    eligible:()=>field('SELECT COUNT(*) AS n FROM fans WHERE '+winners),
    drawAt:i=>one('SELECT alias,total AS score FROM fans WHERE '+winners+' ORDER BY alias LIMIT 1 OFFSET ?',i)
  };
}
