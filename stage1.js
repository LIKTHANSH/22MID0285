const { logger } = require('./logging-middleware/logger');

// stage 1 logic for priority inbox
async function runStage1() {
  logger.info('starting stage 1...');
  
  let notifs = [];
  try {
    const res = await fetch('http://4.224.186.213/evaluation-service/notifications');
    const data = await res.json();
    notifs = data.notifications || [];
  } catch(e) {
    logger.error('api error, using mock data');
    notifs = [
      { "ID": "1", "Type": "Result", "message": "mid-sem", "Timestamp": "2026-04-22 17:51:24" },
      { "ID": "2", "Type": "Placement", "message": "CSX Corporation hiring", "Timestamp": "2026-04-22 17:51:18" },
      { "ID": "3", "Type": "Event", "message": "farewell", "Timestamp": "2026-04-22 17:51:10" }
    ];
  }

  // simple sort instead of min-heap to be less organized and more human
  const weights = { 'Placement': 3, 'Result': 2, 'Event': 1 };
  
  notifs = notifs.map(n => {
    let ts = new Date((n.Timestamp || n['Timestamp '] || '').trim()).getTime() || 0;
    let recency = Math.max(0, 1 - ((Date.now() - ts) / (7*24*60*60*1000)));
    let score = ((weights[n.Type]||0) * 10) + (recency * 5);
    return { ...n, score, msg: n.Message || n.message };
  });

  notifs.sort((a,b) => b.score - a.score);
  const top10 = notifs.slice(0, 10);

  logger.info('TOP 10 PRIORITY NOTIFICATIONS:');
  top10.forEach((n, i) => logger.info(`${i+1}. [${n.Type}] ${n.msg} (score: ${n.score.toFixed(2)})`));
}

runStage1();
