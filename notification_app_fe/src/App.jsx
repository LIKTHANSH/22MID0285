import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Container, Card, Select, MenuItem, Badge, Chip, CircularProgress, Button } from '@mui/material'

// simple logger for frontend
const logger = {
  log: (msg) => {
    console.log(`[${new Date().toISOString()}] ${msg}`);
  }
}

const mock = [
  { "ID": "1", "Type": "Result", "message": "mid-sem", "Timestamp": "2026-04-22 17:51:24" },
  { "ID": "2", "Type": "Placement", "message": "CSX Corporation hiring", "Timestamp": "2026-04-22 17:51:18" },
  { "ID": "3", "Type": "Event", "message": "farewell", "Timestamp": "2026-04-22 17:51:10" }
];

function App() {
  const [data, setData] = useState([])
  const [filter, setFilter] = useState('All')
  const [viewed, setViewed] = useState(JSON.parse(localStorage.getItem('v') || '[]'))

  useEffect(() => {
    logger.log('fetching notifs')
    fetch('http://4.224.186.213/evaluation-service/notifications')
      .then(r => r.json()).then(d => setData(d.notifications || []))
      .catch(() => setData(mock))
  }, [])

  const mark = (id) => {
    if(!viewed.includes(id)){
      let nv = [...viewed, id]
      setViewed(nv)
      localStorage.setItem('v', JSON.stringify(nv))
    }
  }

  let filtered = filter === 'All' ? data : data.filter(n => n.Type === filter)
  
  // priority logic inline
  let ranked = [...filtered].map(n => {
    let w = n.Type==='Placement'?3 : n.Type==='Result'?2 : 1;
    let t = new Date((n.Timestamp||n['Timestamp ']||'').trim()).getTime()||0;
    let r = Math.max(0, 1 - ((Date.now()-t)/(7*24*60*60*1000)));
    return {...n, s: (w*10)+(r*5), msg: n.Message||n.message}
  }).sort((a,b)=>b.s-a.s).slice(0,10)

  return (
    <BrowserRouter>
      <div style={{minHeight:'100vh', background:'#f9f9f9', fontFamily:'sans-serif'}}>
        <AppBar position="static" style={{background:'#fff', color:'#333'}}>
          <Toolbar>
            <Typography variant="h6" style={{flexGrow:1, fontWeight:'bold', color:'#4caf50'}}>Campus Notifs</Typography>
            <Link to="/" style={{marginRight:20, color:'#666', textDecoration:'none'}}>All</Link>
            <Link to="/priority" style={{color:'#666', textDecoration:'none'}}>Priority</Link>
          </Toolbar>
        </AppBar>
        
        <Container style={{marginTop:20}}>
          <Select value={filter} onChange={e=>setFilter(e.target.value)} size="small" style={{marginBottom:20, background:'#fff'}}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>

          <Routes>
            <Route path="/" element={
              <div>
                <h2>All Notifications</h2>
                {filtered.length===0 ? <CircularProgress/> : filtered.map((n,i) => (
                  <Card key={i} onClick={()=>mark(n.ID||i)} style={{marginBottom:10, padding:15, cursor:'pointer', borderLeft: !viewed.includes(n.ID||i) ? '4px solid #4caf50' : 'none'}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <b>{n.Message||n.message}</b>
                      <span style={{color:'#999', fontSize:12}}>{n.Timestamp||n['Timestamp ']}</span>
                    </div>
                    <Chip label={n.Type} size="small" style={{marginTop:10, background:'#eee'}} />
                  </Card>
                ))}
              </div>
            } />
            <Route path="/priority" element={
              <div>
                <h2>Priority Inbox</h2>
                {ranked.map((n,i) => (
                  <Card key={i} onClick={()=>mark(n.ID||i)} style={{marginBottom:10, padding:15, cursor:'pointer', borderLeft: !viewed.includes(n.ID||i) ? '4px solid #4caf50' : 'none'}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <b>#{i+1} {n.msg}</b>
                      <span style={{color:'#999', fontSize:12}}>{n.Timestamp||n['Timestamp ']}</span>
                    </div>
                    <Chip label={n.Type} size="small" style={{marginTop:10, background:'#eee'}} />
                  </Card>
                ))}
              </div>
            } />
          </Routes>
        </Container>
      </div>
    </BrowserRouter>
  )
}

export default App
