import {DUEL_CARD_COUNT} from './duel-decks.js';
// A link carries a friendly target, not a certified score or a person's identity.
export function opponent(url) {
  const q=new URL(url).searchParams,card=q.get('duelCard'),score=q.get('beat');
  if(!/^[1-9]\d{0,3}$/.test(card||'')||Number(card)>DUEL_CARD_COUNT||!/^(0|[1-6]00)$/.test(score||''))return null;
  return {card:Number(card),score:Number(score)};
}
export function challengeLink(url,game,round){
  const u=new URL(url);u.search='';u.hash=game;
  if(game==='duel'&&round?.cardId){u.searchParams.set('duelCard',round.cardId);u.searchParams.set('beat',round.score);}
  return u.href;
}
export function raceBanner(url,score,done){
  const rival=opponent(url);if(!rival)return '';
  const gap=score-rival.score;
  const label=done?(gap===0?'Photo finish. You tied.':gap>0?'You beat the challenge!':'Final horn. Rival holds the lead.'):gap>0?'You’ve cleared the target.':gap===0?'Level with the target.':(0-gap)+' points to draw level.';
  return `<aside class="seat-rival"><span>FRIEND CHALLENGE · SAME FIVE DUELS</span><strong>${label}</strong><p>You <b>${score}</b> <i>/</i> Target <b>${rival.score}</b></p></aside>`;
}
