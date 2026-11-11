import {handleArenaRequest} from './handler.js';
import {initializeSql,dbAdapter} from './store.js';
import { DurableObject } from 'cloudflare:workers';
import {DEMO_ARENA_FIXTURE,runArena,validateFixture} from '../dist/arena-engine.js';

const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export class ArenaEvent extends DurableObject {
  constructor(ctx,env){
    super(ctx,env);this.ctx=ctx;const sql=ctx.storage.sql;
    this.fixture=validateFixture(env.ARENA_FIXTURE_JSON?JSON.parse(env.ARENA_FIXTURE_JSON):DEMO_ARENA_FIXTURE);
    initializeSql(sql);
    this.store=dbAdapter(sql);
  }
  async fetch(request){
    try{const body=await request.json();
      const result=this.ctx.storage.transactionSync(()=>runArena(this.store,body,this.fixture));
      return reply(result);
    }catch(err){return reply({error:err.status?err.message:'The arena could not load this request.'},err.status||500);}
  }
}
export default {fetch:handleArenaRequest};
