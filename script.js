document.addEventListener('DOMContentLoaded', ()=>{
      const KEY_MOODS='bp_moods_v3',
            KEY_BADGES='bp_badges_v3',
            KEY_JOURNAL='bp_journal_v1',
            KEY_STREAK='bp_streak_v1',
            KEY_POS='bp_positive_streak_v1',
            KEY_LAST='bp_last_selected',
            KEY_DAILY='bp_daily_time',
            KEY_USERNAME='bp_username',
            KEY_AVATAR='bp_avatar',
            KEY_THEME='bp_theme',
            KEY_SETTINGS='bp_settings_v1',
            KEY_MEDITATION='bp_meditation_voice',
            KEY_HABITS='bp_habits_v1',
            KEY_POINTS='bp_points',
            KEY_LEVEL='bp_level',
            KEY_COMMUNITY='bp_community_v1',
            KEY_CHALLENGE='bp_challenge_v1';

      const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : 'https://your-production-backend.com'; // CHANGE THIS BEFORE DEPLOYMENT


      function load(k,f){try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}}
      function save(k,v){
        localStorage.setItem(k,JSON.stringify(v));
        syncToBackend(k, v);
      }

      let syncQueue = {};
      let syncTimeout = null;
      function syncToBackend(key, value) {
        const map = {
          'bp_moods_v3': 'moods', 'bp_journal_v1': 'journal', 'bp_habits_v1': 'habits',
          'bp_streak_v1': 'streak', 'bp_positive_streak_v1': 'posStreak', 'bp_points': 'points',
          'bp_level': 'level', 'bp_badges_v3': 'badges', 'bp_community_v1': 'community'
        };
        if(!map[key]) return;
        syncQueue[map[key]] = value;
        clearTimeout(syncTimeout);
        syncTimeout = setTimeout(async () => {
          const token = localStorage.getItem('bp_token');
          if(!token) return;
          try {
            await fetch(`${API_BASE}/api/data`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
              body: JSON.stringify(syncQueue)
            });
            syncQueue = {};
          } catch(e) { console.warn('Sync failed', e); }
        }, 2000);
      }

      // Backend Sync Initial Fetch
      (async function initializeApp() {
        const token = localStorage.getItem('bp_token');
        if(token && !sessionStorage.getItem('bp_synced')) {
          try {
            const res = await fetch(`${API_BASE}/api/data`, { headers: { 'x-auth-token': token } });
            if(res.ok) {
              const data = await res.json();
              const map = { moods:'bp_moods_v3', journal:'bp_journal_v1', habits:'bp_habits_v1', streak:'bp_streak_v1', posStreak:'bp_positive_streak_v1', points:'bp_points', level:'bp_level', badges:'bp_badges_v3', community:'bp_community_v1' };
              Object.keys(map).forEach(k => { if(data[k]) localStorage.setItem(map[k], JSON.stringify(data[k])); });
              sessionStorage.setItem('bp_synced', '1');
              location.reload();
            }
          } catch(e){ console.warn(e); }
        }
      })();
      
      const modalOverlay = document.getElementById('modalOverlay');
      const modalTitle   = document.getElementById('modalTitle');
      const modalBody    = document.getElementById('modalBody');
      const modalActions = document.getElementById('modalActions');

      function openModal(){ modalOverlay.style.display='flex'; }
      function closeModal(){ modalOverlay.style.display='none'; modalActions.innerHTML=''; }

      function infoModal(t,h){
        modalTitle.innerText=t;
        modalBody.innerHTML=h;
        modalActions.innerHTML='<button class="btn" id="mClose">Close</button>';
        openModal();
        document.getElementById('mClose').addEventListener('click', closeModal);
      }
      function confirmModal(t,h,yes,no){
        modalTitle.innerText=t;
        modalBody.innerHTML=h;
        modalActions.innerHTML='<button class="btn" id="mNo">Cancel</button><button class="btn" id="mYes">Yes</button>';
        openModal();
        document.getElementById('mYes').addEventListener('click', ()=>{ closeModal(); if(yes) yes(); });
        document.getElementById('mNo').addEventListener('click', ()=>{ closeModal(); if(no) no(); });
      }
      function successModal(t,h){
        modalTitle.innerText=t;
        modalBody.innerHTML=h;
        modalActions.innerHTML='<button class="btn" id="mOk">OK</button>';
        openModal();
        document.getElementById('mOk').addEventListener('click', closeModal);
      }

      const badgeDefs = {
        'streak_3':{emoji:'🥉',title:'Bronze Streak'},
        'streak_7':{emoji:'🥈',title:'Silver Streak'},
        'streak_14':{emoji:'🥇',title:'Gold Streak'},
        'streak_30':{emoji:'🏆',title:'Trophy Streak'},
        'positive_5':{emoji:'⭐',title:'Positive Mindset'},
        'total_10':{emoji:'🎯',title:'Consistency'},
        'total_25':{emoji:'🌟',title:'Commitment'},
        'total_50':{emoji:'🔱',title:'Elite'},
        'total_100':{emoji:'🏅',title:'Century Club'},
        'resilience_5neg':{emoji:'💪',title:'Resilient'},
        'meditation_5':{emoji:'🧘',title:'Meditation Master'},
        'meditation_1':{emoji:'✨',title:'First Meditation'}
      };

      // Points / Level system
      function addPoints(amount, reason){
        let pts = load(KEY_POINTS, 0) || 0;
        pts += amount;
        save(KEY_POINTS, pts);
        updatePointsDisplay();
        showToast(`+${amount} points: ${reason}`);
        checkLevelUp();
      }

      function updatePointsDisplay(){
        const pts = load(KEY_POINTS, 0) || 0;
        const level = load(KEY_LEVEL, 1) || 1;
        const ptsEl = document.getElementById('userPoints');
        const lvlEl = document.getElementById('userLevel');
        const barEl = document.getElementById('levelBar');
        
        if(ptsEl) ptsEl.innerText = pts + ' pts';
        if(lvlEl) lvlEl.innerText = 'Level ' + level;
        
        const ptsForNext = level * 100;
        const ptsInLevel = pts % ptsForNext;
        const progress = (ptsInLevel / ptsForNext) * 100;
        if(barEl) barEl.style.width = progress + '%';
      }

      function checkLevelUp(){
        const pts = load(KEY_POINTS, 0) || 0;
        let level = load(KEY_LEVEL, 1) || 1;
        const ptsForNext = level * 100;
        
        if(pts >= ptsForNext){
          level++;
          save(KEY_LEVEL, level);
          showConfettiOnce();
          successModal('Level Up!', `Congratulations! You reached Level ${level}!`);
          speak(`Level up! You are now level ${level}`);
          updatePointsDisplay();
        }
      }

      // Voice & speech
      const synth = window.speechSynthesis || null;
      let voices = [];
      let allVoices = [];
      function refreshVoices(){
        if(!synth) return;
        allVoices = synth.getVoices();
        
        // Filter out massive list, keep only ~5 high-quality English voices
        voices = allVoices.filter(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Samantha') || v.name.includes('Siri') || v.localService)).slice(0, 6);
        if(voices.length === 0) voices = allVoices.slice(0, 5); // fallback
        
        const sel=document.getElementById('voiceSelect');
        if(!sel) return;
        sel.innerHTML='';
        voices.forEach((v,i)=>{
          const opt=document.createElement('option');
          opt.value=i;
          opt.innerText = v.name.replace('Microsoft ', '').replace(' Desktop', '').trim();
          sel.appendChild(opt);
        });
      }
      if('speechSynthesis' in window){
        window.speechSynthesis.onvoiceschanged = refreshVoices;
        setTimeout(refreshVoices,500);
      }

      function speak(text,opts={}){
        try{
          if(!('speechSynthesis' in window)) return;
          const u = new SpeechSynthesisUtterance(text);
          if(opts.voiceIndex!==undefined && voices[opts.voiceIndex]) u.voice = voices[opts.voiceIndex];
          if(opts.pitch) u.pitch = opts.pitch;
          if(opts.rate)  u.rate  = opts.rate;
          u.volume = opts.volume||1;
          synth.speak(u);
        }catch(e){console.warn('speak err',e)}
      }

      
      // GAMIFICATION
      window.playPop = function() {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine'; osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
        } catch(e){}
      }

      window.shootConfetti = function() {
        const canvas = document.getElementById('confettiCanvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let particles = [];
        const colors = ['#c77dff', '#6be4ff', '#ffb74d', '#ff6b6b', '#81f783'];
        for(let i=0; i<80; i++){
          particles.push({
            x: window.innerWidth/2, y: window.innerHeight/2,
            r: Math.random()*6+3,
            dx: Math.random()*12-6, dy: Math.random()*-15-5,
            color: colors[Math.floor(Math.random()*colors.length)]
          });
        }
        function animate(){
          ctx.clearRect(0,0,canvas.width,canvas.height);
          let active = false;
          particles.forEach(p => {
            p.x += p.dx; p.y += p.dy; p.dy += 0.4;
            if(p.y < canvas.height) {
              ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); 
              ctx.fillStyle=p.color; ctx.fill();
              active = true;
            }
          });
          if(active) requestAnimationFrame(animate);
          else ctx.clearRect(0,0,canvas.width,canvas.height);
        }
        animate();
      }

      // Utils
      function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }
      function showToast(txt){
        const el=document.createElement('div');
        el.className='bp-toast';
        el.innerText=txt;
        document.body.appendChild(el);
        setTimeout(()=>{
          el.style.transition='all .3s';
          el.style.opacity=0;
          el.style.transform='translateY(8px)';
          setTimeout(()=>el.remove(),300);
        },1600);
      }

      // Confetti
      const confCanvas = document.getElementById('confettiCanvas');
      if(confCanvas){ confCanvas.width=window.innerWidth; confCanvas.height=window.innerHeight; }
      let confTimer=null;
      function showConfettiOnce(){
        if(!confCanvas) return;
        if(confTimer) return;
        const ctx=confCanvas.getContext('2d');
        let parts=[];
        for(let i=0;i<60;i++){
          parts.push({x:confCanvas.width/2,y:confCanvas.height/2,vx:(Math.random()-0.5)*8,vy:(Math.random()-0.8)*8,size:4+Math.random()*6,color:['#ff6b6b','#ffd93d','#6be4ff','#9b59b6','#81f783'][Math.floor(Math.random()*5)]});
        }
        let t=0;
        confTimer=setInterval(()=>{
          ctx.clearRect(0,0,confCanvas.width,confCanvas.height);
          parts.forEach(p=>{
            p.x+=p.vx; p.y+=p.vy; p.vy+=0.2;
            ctx.fillStyle=p.color;
            ctx.fillRect(p.x,p.y,p.size,p.size);
          });
          t++;
          if(t>80){
            clearInterval(confTimer);
            confTimer=null;
            ctx.clearRect(0,0,confCanvas.width,confCanvas.height);
          }
        },16);
      }

      // Render dashboard & achievements
      function renderAchievements(){
        const c=document.getElementById('achieveGrid');
        if(!c) return;
        c.innerHTML='';
        const arr=load(KEY_BADGES,[]);
        arr.forEach(id=>{
          const info=badgeDefs[id]||{emoji:'🏅',title:id};
          const d=document.createElement('div');
          d.style.display='flex';
          d.style.flexDirection='column';
          d.style.alignItems='center';
          d.style.width='100px';
          d.innerHTML='<div style="font-size:28px">'+info.emoji+'</div><div style="margin-top:6px;font-weight:700">'+info.title+'</div>';
          c.appendChild(d);
        });
      }

      function renderDashboard(){
        const moods=load(KEY_MOODS,[]);
        const badges=load(KEY_BADGES,[]);
        const dash=document.getElementById('dashBadges');
        if(dash) dash.innerHTML='';
        (badges||[]).forEach(id=>{
          const info=badgeDefs[id]||{emoji:'🏅',title:id};
          const el=document.createElement('div');
          el.style.background='rgba(255,255,255,0.08)';
          el.style.padding='6px 8px';
          el.style.borderRadius='999px';
          el.innerText=info.emoji+' '+info.title;
          dash.appendChild(el);
        });
        const today=document.getElementById('todayMoodLarge');
        if(today) today.innerText = moods.length?moods[moods.length-1].mood:'—';
        const sc=document.getElementById('streakCount');
        if(sc) sc.innerText = (load(KEY_STREAK,{streak:0}).streak||0);
        const ps=document.getElementById('posStreak');
        if(ps) ps.innerText = load(KEY_POS,0)||0;
        updatePointsDisplay();
      }

      // Quick mood setup (with more emojis)
      const quickEmoji = document.getElementById('quickEmoji');
      const lastSelected = load(KEY_LAST,null);
      if(lastSelected) setTimeout(()=>{ setSelectedByEmoji(lastSelected); },200);

      function setSelectedByEmoji(emo){
        document.querySelectorAll('.qm').forEach(el=>el.classList.remove('selected'));
        const el=document.querySelector('.qm[data-emo="'+emo+'"]');
        if(el) el.classList.add('selected');
      }

      function playClickTone(){
        try{
          const ctx = new (window.AudioContext||window.webkitAudioContext)();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type='sine';
          o.frequency.value = 880;
          g.gain.value = 0.02;
          o.connect(g); g.connect(ctx.destination);
          o.start();
          setTimeout(()=>{ o.stop(); ctx.close(); },80);
        }catch(e){}
      }
      function doVibrate(){ if(navigator.vibrate) navigator.vibrate(30); }

      if(quickEmoji){
        quickEmoji.addEventListener('click', (e)=>{
          const t=e.target;
          if(!t || !t.classList || !t.classList.contains('qm')) return;
          const mood = t.getAttribute('data-emo')||t.innerText.trim();
          if(!mood) return;
          setSelectedByEmoji(mood);
          save(KEY_LAST,mood);
          playClickTone();
          doVibrate();
          const settings = load(KEY_SETTINGS,{});
          if(settings.voiceOnSave) speak('Mood saved');
          saveMood(mood);
        });
      }

      function saveMood(mood){
        const arr = load(KEY_MOODS,[]);
        const entry = {mood,ts:Date.now()};
        arr.push(entry);
        save(KEY_MOODS,arr);
        renderDashboard();
        checkAndUnlockBadges(entry);
        const settings = load(KEY_SETTINGS,{});
        if(settings.voiceAssistant) aiResponse(entry);
        showToast('Mood saved');
        addPoints(2, 'Mood check-in');
      }

      // Journal
      function renderJournal(){
        const wrap=document.getElementById('entriesWrap');
        if(!wrap) return;
        wrap.innerHTML='';
        const arr=load(KEY_JOURNAL,[]);
        arr.slice().reverse().forEach((en,i)=>{
          const d=document.createElement('div');
          d.className='entry';
          d.innerHTML =
            '<div style="font-size:12px;opacity:0.9">'+new Date(en.ts).toLocaleString()+'</div>'+
            '<div style="margin-top:6px">'+escapeHtml(en.text)+'</div>'+
            '<div style="margin-top:8px;text-align:right"><button class="btn del" data-i="'+(arr.length-1-i)+'">Delete</button></div>';
          wrap.appendChild(d);
        });
        wrap.querySelectorAll('button.del').forEach(b=>b.addEventListener('click',(ev)=>{
          const idx=Number(ev.target.dataset.i);
          confirmModal('Delete Entry','Delete this journal entry?', ()=>{
            const a=load(KEY_JOURNAL,[]);
            a.splice(idx,1);
            save(KEY_JOURNAL,a);
            renderJournal();
          }, ()=>{});
        }));
      }

      document.getElementById('saveEntry').addEventListener('click', ()=>{
        const el=document.getElementById('journalInput');
        const txt=el?el.value.trim():'';
        if(!txt) return infoModal('Empty','Write something before saving');
        const arr=load(KEY_JOURNAL,[]);
        arr.push({text:txt,ts:Date.now()});
        save(KEY_JOURNAL,arr);
        if(el) el.value='';
        renderJournal();
        showToast('Journal saved');
        addPoints(5,'Journal entry');
      });

      document.getElementById('clearJournal').addEventListener('click', ()=>{
        confirmModal('Clear Journal','Remove all entries?', ()=>{
          save(KEY_JOURNAL,[]);
          renderJournal();
          showToast('Journal cleared');
        }, ()=>{});
      });

      // Charts & Stats
      let lineChart=null;
      function initCharts(){
        try{
          const ctx=document.getElementById('lineChart').getContext('2d');
          if(lineChart) lineChart.destroy();
          lineChart = new Chart(ctx,{
            type:'line',
            data:{labels:[],datasets:[{label:'Mood',data:[],tension:0.4,backgroundColor:'rgba(199,125,255,0.12)',borderColor:'rgba(199,125,255,1)',pointRadius:4}]},
            options:{scales:{y:{min:0,max:4,ticks:{stepSize:1}}},plugins:{legend:{display:false}}}
          });
        }catch(e){console.warn('Chart init',e);}
      }

      function drawAnalytics(){
        const moods=load(KEY_MOODS,[]);
        initCharts();
        
        const statsContainer = document.getElementById('interactiveMoodStats');
        if(statsContainer) statsContainer.innerHTML = '';
        
        if(moods.length===0){
          if(lineChart){
            lineChart.data.labels=['No data'];
            lineChart.data.datasets[0].data=[0];
            lineChart.update();
          }
          const wEl=document.getElementById('weeklyText');
          if(wEl) wEl.innerText='No data';
          if(statsContainer) statsContainer.innerHTML = '<div style="opacity:0.5">No moods logged yet</div>';
          return;
        }
        const mapVal=m=> (m==='🤩'||m==='😊'||m==='🙂'||m==='😇')?4:(m==='😐')?2:(m==='😔'||m==='😣')?1:0;
        const last30=moods.slice(-30);
        if(lineChart){
          lineChart.data.labels = last30.map(x=>new Date(x.ts).toLocaleDateString());
          lineChart.data.datasets[0].data = last30.map(x=>mapVal(x.mood));
          lineChart.update();
        }

        const counts={'🤩':0,'😊':0,'🙂':0,'😐':0,'😔':0,'😣':0,'😡':0,'😴':0,'😇':0,'🤯':0};
        moods.forEach(m=>{ if(counts[m.mood]!==undefined) counts[m.mood]++; });
        
        if(statsContainer){
          Object.keys(counts).forEach(m => {
            if(counts[m] > 0){
              const el = document.createElement('div');
              el.style.background = 'var(--glass-bg)';
              el.style.border = '1px solid var(--glass-border)';
              el.style.borderRadius = '20px';
              el.style.padding = '18px 12px';
              el.style.textAlign = 'center';
              el.style.cursor = 'pointer';
              el.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
              el.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
              el.innerHTML = `<div style="font-size:36px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.15))">${m}</div><div style="font-size:20px;font-weight:800;margin-top:10px">${counts[m]}</div>`;
              el.onmouseover = () => { el.style.transform = 'translateY(-6px) scale(1.05)'; el.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'; el.style.background = 'rgba(255,255,255,0.3)'; };
              el.onmouseout = () => { el.style.transform = 'translateY(0) scale(1)'; el.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; el.style.background = 'var(--glass-bg)'; };
              statsContainer.appendChild(el);
            }
          });
        }

        const last7=moods.slice(-7);
        const avg=last7.reduce((s,i)=>s+mapVal(i.mood),0)/(last7.length||1);
        const txt=(avg>=3.5)?'Excellent':(avg>=2.5)?'Good':(avg>=1.5)?'Average':'Low';
        const wEl=document.getElementById('weeklyText');
        const wsEl=document.getElementById('wellnessScore');
        if(wEl) wEl.innerText=txt;
        if(wsEl) wsEl.innerText=txt;
      }

      // Breathing code
      let breathTimer = null; let breathPhase = 0;
      function startBreathing(){ if(breathTimer) return;
        const seq=[4,7,8]; const shortText=['Breathe in','Hold','Breathe out'];
        const medText=[ 'Slowly breathe in... let your lungs fill completely...', 'Hold your breath gently... stay relaxed...', 'Now slowly breathe out... release all tension from your body...' ];
        const circle=document.getElementById('breathCircle'); const text=document.getElementById('breathText'); const settings = load(KEY_SETTINGS,{}); const medMode = load(KEY_MEDITATION,false); const voiceGuide = settings.voiceGuide || false;

        function playPhaseTone(phase){ try{ const ctx = new (window.AudioContext||window.webkitAudioContext)(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); if(phase===0){ o.frequency.value = 520; g.gain.value = 0.02; } else if(phase===1){ o.frequency.value = 440; g.gain.value = 0.01; } else { o.frequency.value = 320; g.gain.value = 0.02; } o.start(); setTimeout(()=>{ o.stop(); ctx.close(); },130); }catch(e){} }

        function step(){ const dur = seq[breathPhase]*1000; if(circle) circle.style.transition='transform '+dur+'ms ease-in-out'; if(breathPhase===0 && circle) circle.style.transform='scale(1.24)'; else if(breathPhase===1 && circle) circle.style.transform='scale(1.12)'; else if(circle) circle.style.transform='scale(0.86)'; if(text) text.innerText = medMode ? medText[breathPhase] : shortText[breathPhase]; playPhaseTone(breathPhase);
          if(voiceGuide && ('speechSynthesis' in window)){ try{ speechSynthesis.cancel(); }catch(e){} const toSpeak = medMode ? medText[breathPhase] : shortText[breathPhase]; setTimeout(()=>{ speak(toSpeak); },80); }
          breathPhase = (breathPhase+1)%3; breathTimer = setTimeout(step, dur); }
        breathPhase = 0; step();
      }
      function stopBreathing(){ document.getElementById('breathCircle').className='breath-orb'; if(breathTimer) clearTimeout(breathTimer); breathTimer=null; const circle=document.getElementById('breathCircle'); const text=document.getElementById('breathText'); if(circle) circle.style.transform='scale(1)'; if(text) text.innerText='Press Start'; }
      document.getElementById('startBreath').addEventListener('click', startBreathing);
      document.getElementById('stopBreath').addEventListener('click', stopBreathing);

      // Badges & streaks
      function dateKey(ts){ const d=new Date(ts); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
      function checkAndUnlockBadges(newEntry){
        const streakData=load(KEY_STREAK,{lastDate:null,streak:0});
        const lastKey=streakData.lastDate;
        const todayKey=dateKey(newEntry.ts);
        if(!lastKey){ streakData.lastDate=todayKey; streakData.streak=1; }else{
          const lp=lastKey.split('-');
          const lastDate=new Date(Number(lp[0]),Number(lp[1])-1,Number(lp[2]));
          const tDate=new Date(new Date(newEntry.ts).getFullYear(),new Date(newEntry.ts).getMonth(),new Date(newEntry.ts).getDate());
          const diff=Math.round((tDate-lastDate)/(24*3600*1000));
          if(diff===1){ streakData.streak+=1; streakData.lastDate=todayKey; } else if(diff>1){ streakData.streak=1; streakData.lastDate=todayKey; }
        }
        save(KEY_STREAK,streakData);
        let pos=load(KEY_POS,0);
        if(newEntry.mood==='😊'||newEntry.mood==='🤩'||newEntry.mood==='🙂'||newEntry.mood==='😇') pos+=1; else pos=0;
        save(KEY_POS,pos);
        const moods=load(KEY_MOODS,[]); const total=moods.length;
        const badges=load(KEY_BADGES,[]);
        const addBadge = id=>{ if(!badges.includes(id)){ badges.push(id); save(KEY_BADGES,badges); renderAchievements(); showConfettiOnce(); successModal('Achievement','You unlocked: '+(badgeDefs[id]?badgeDefs[id].emoji+' '+badgeDefs[id].title:id)); } };
        if(streakData.streak>=3)  addBadge('streak_3');
        if(streakData.streak>=7)  addBadge('streak_7');
        if(streakData.streak>=14) addBadge('streak_14');
        if(streakData.streak>=30) addBadge('streak_30');
        if(pos>=5)                addBadge('positive_5');
        if(total>=10)             addBadge('total_10');
        if(total>=25)             addBadge('total_25');
        if(total>=50)             addBadge('total_50');
        if(total>=100)            addBadge('total_100');
        const negCount = moods.slice().reverse().slice(0,10).filter(x=>x.mood==='😔'||x.mood==='😣').length;
        if(negCount>=5)           addBadge('resilience_5neg');
        renderDashboard();
      }

      // AI response
      async function aiResponse(entry){
        const m = entry.mood;
        const settings = load(KEY_SETTINGS, {});
        
        try {
          const btnData = load(KEY_JOURNAL, []);
          const res = await fetch(`${API_BASE}/api/ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mood: m, journal: btnData })
          });
          const data = await res.json();
          
          if(settings.voiceAssistant) speak(data.response);
          infoModal('AI Support', data.response);
        } catch(e) {
          // Fallback if backend is unavailable
          let fb = "I'm here for you. Take a deep breath.";
          if(settings.voiceAssistant) speak(fb);
          infoModal('Support', fb);
        }
      }

      // ---------------- DAILY CHALLENENGES ----------------
      const CHALLENGES = [
        "Drink at least 3 glasses of water before noon.",
        "Take a 5-minute walk outside.",
        "Write down 3 things you are grateful for today.",
        "Do a 2-minute breathing exercise.",
        "Give someone a genuine compliment today.",
        "Stretch for 5 minutes right now.",
        "Read 10 pages of a book."
      ];
      
      function renderChallenge() {
        const cEl = document.getElementById('currentChallenge');
        if(!cEl) return;
        
        const todayKey = new Date().toISOString().slice(0,10);
        let challengeData = load(KEY_CHALLENGE, { date: '', idx: 0, done: false });
        
        if(challengeData.date !== todayKey) {
          challengeData = {
            date: todayKey,
            idx: Math.floor(Math.random() * CHALLENGES.length),
            done: false
          };
          save(KEY_CHALLENGE, challengeData);
        }
        
        const text = CHALLENGES[challengeData.idx];
        
        if(challengeData.done) {
          cEl.innerHTML = `<div style="padding: 12px; background: rgba(129, 247, 131, 0.2); border: 1px solid #81f783; border-radius: 12px; color: #81f783; font-weight: 700;">
            <i class="ph ph-check-circle"></i> Completed: ${text}
          </div>`;
        } else {
          cEl.innerHTML = `<div style="padding: 12px; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px;">
            <div style="font-size: 16px; margin-bottom: 8px;">${text}</div>
            <button class="btn" id="completeChallengeBtn" style="width: 100%; background: #ffb74d; color: #020617;">Mark as Done (+10 pts)</button>
          </div>`;
          
          document.getElementById('completeChallengeBtn').addEventListener('click', () => {
            challengeData.done = true;
            save(KEY_CHALLENGE, challengeData);
            addPoints(10, 'Daily Challenge Completed');
            showConfettiOnce();
            renderChallenge();
          });
        }
      }

      // Export / import
      const exportPdfBtn = document.getElementById('exportPdfBtn');
      if(exportPdfBtn){
        exportPdfBtn.addEventListener('click', () => {
          showToast('Generating PDF Report...');
          const moods = load(KEY_MOODS, []);
          const level = load(KEY_LEVEL, 1);
          const pts = load(KEY_POINTS, 0);
          const streak = load(KEY_STREAK, {streak:0}).streak || 0;
          const uname = load(KEY_USERNAME, 'Friend');
          
          const div = document.createElement('div');
          div.style.padding = '40px';
          div.style.fontFamily = 'Outfit, sans-serif';
          div.style.color = '#102027';
          div.style.background = '#ffffff';
          div.innerHTML = `
            <h2>BrightPath Wellness Report</h2>
            <p><strong>Name:</strong> ${uname}</p>
            <p><strong>Level:</strong> ${level} (${pts} pts)</p>
            <p><strong>Current Streak:</strong> ${streak} days</p>
            <hr style="opacity:0.2;margin:20px 0;">
            <h3>Recent Moods</h3>
            <ul style="list-style:none;padding:0;">
              ${moods.slice(-10).reverse().map(m => `<li style="margin-bottom:8px;">${new Date(m.ts).toLocaleDateString()} - <strong>${m.mood}</strong></li>`).join('')}
            </ul>
            ${moods.length === 0 ? '<p>No moods logged yet.</p>' : ''}
            <hr style="opacity:0.2;margin:20px 0;">
            <p style="font-size:12px;opacity:0.6;text-align:center;">Generated by BrightPath Tracker</p>
          `;
          
          const opt = {
            margin: 10,
            filename: `brightpath-report-${new Date().toISOString().slice(0,10)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          
          html2pdf().set(opt).from(div).save();
        });
      }

      document.getElementById('exportBtn').addEventListener('click', ()=>{
        const data={
          moods:load(KEY_MOODS,[]),
          journal:load(KEY_JOURNAL,[]),
          badges:load(KEY_BADGES,[]),
          streak:load(KEY_STREAK,{}),
          pos:load(KEY_POS,0),
          username:load(KEY_USERNAME,''),
          avatar:load(KEY_AVATAR,'😊'),
          points:load(KEY_POINTS,0),
          level:load(KEY_LEVEL,1)
        };
        const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a'); a.href=url; a.download='brightpath-backup-'+Date.now()+'.json';
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); showToast('Export started');
      });

      document.getElementById('importFile').addEventListener('change', (e)=>{
        const f=e.target.files[0]; if(!f) return;
        const r=new FileReader();
        r.onload=()=>{
          try{
            const obj=JSON.parse(r.result);
            if(obj.moods)    save(KEY_MOODS,obj.moods);
            if(obj.journal)  save(KEY_JOURNAL,obj.journal);
            if(obj.badges)   save(KEY_BADGES,obj.badges);
            if(obj.streak)   save(KEY_STREAK,obj.streak);
            if(obj.pos!==undefined) save(KEY_POS,obj.pos);
            if(obj.username) save(KEY_USERNAME,obj.username);
            if(obj.avatar)   save(KEY_AVATAR,obj.avatar);
            if(obj.points!==undefined) save(KEY_POINTS,obj.points);
            if(obj.level!==undefined) save(KEY_LEVEL,obj.level);
            renderJournal(); renderAchievements(); renderDashboard(); drawAnalytics();
            showToast('Import complete');
          }catch(err){
            infoModal('Import failed','Invalid file');
          }
        };
        r.readAsText(f);
      });

      // Emoji avatar
      const emojiSelect = document.getElementById('emojiAvatar');
      const saveEmojiBtn = document.getElementById('saveEmojiAvatar');
      const avatarPreview = document.getElementById('avatarPreview');
      const savedEmoji = load(KEY_AVATAR,'😊');
      if(avatarPreview) avatarPreview.innerText = savedEmoji;
      if(emojiSelect)   emojiSelect.value = savedEmoji;
      if(saveEmojiBtn){
        saveEmojiBtn.addEventListener('click', ()=>{
          const emo = emojiSelect.value || '😊';
          save(KEY_AVATAR, emo);
          if(avatarPreview) avatarPreview.innerText = emo;
          showToast('Emoji avatar saved');
        });
      }

      // Voice controls
      const voiceSelect=document.getElementById('voiceSelect');
      const testVoiceBtn=document.getElementById('testVoice');
      const saveNameBtn=document.getElementById('saveName');
      const nameInput=document.getElementById('userNameInput');
      const settingsAll = load(KEY_SETTINGS,{});
      if(testVoiceBtn){
        testVoiceBtn.addEventListener('click', ()=>{
          const v = (nameInput.value||'friend').trim();
          const idx = Number(voiceSelect.value)||0;
          speak(`Hello ${v}, welcome to BrightPath`,{voiceIndex:idx});
        });
      }
      if(saveNameBtn){
        saveNameBtn.addEventListener('click', ()=>{
          const v=(nameInput.value||'').trim();
          save(KEY_USERNAME,v);
          document.getElementById('welcomeSmall').innerText = v?('Welcome, '+v):'Local & private';
          showToast('Name saved');
          speak('Nice to meet you, '+(v||'friend'));
        });
      }
      const savedName=load(KEY_USERNAME,'');
      if(nameInput) nameInput.value = savedName;
      if(savedName) document.getElementById('welcomeSmall').innerText = 'Welcome, '+savedName;

     // ===== THEME SYSTEM FIX =====
const themeOptions = document.querySelectorAll('.theme-option');

// Load saved theme
const savedTheme = localStorage.getItem(KEY_THEME) || 'light';
document.body.setAttribute('data-theme', savedTheme);

// Highlight active theme
themeOptions.forEach(opt => {
  if (opt.dataset.theme === savedTheme) {
    opt.classList.add('active');
  }
});

// Click handling
themeOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    const theme = opt.dataset.theme;

    // Apply theme
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(KEY_THEME, theme);

    // Update UI
    themeOptions.forEach(o => o.classList.remove('active'));
    opt.classList.add('active');

    showToast(`Theme changed to ${theme}`);
  });
});

      if(voiceAssistantToggle){
        voiceAssistantToggle.checked = settingsAll.voiceAssistant||false;
        voiceAssistantToggle.addEventListener('change', ()=>{
          const s = load(KEY_SETTINGS,{});
          s.voiceAssistant = voiceAssistantToggle.checked;
          save(KEY_SETTINGS,s);
        });
      }
      if(voiceOnSave){
        voiceOnSave.checked = settingsAll.voiceOnSave||false;
        voiceOnSave.addEventListener('change', ()=>{
          const s = load(KEY_SETTINGS,{});
          s.voiceOnSave = voiceOnSave.checked;
          save(KEY_SETTINGS,s);
        });
      }
      if(meditationToggle){
        meditationToggle.checked = load(KEY_MEDITATION,false);
        meditationToggle.addEventListener('change', (e)=>{
          save(KEY_MEDITATION, e.target.checked);
          showToast('Meditation voice mode updated');
        });
      }

      // Voice-guided breathing checkbox wiring
      const voiceGuideChk = document.getElementById('voiceGuide');
      if(voiceGuideChk){
        const s = load(KEY_SETTINGS,{});
        voiceGuideChk.checked = !!s.voiceGuide;
        voiceGuideChk.addEventListener('change', (e)=>{
          const st = load(KEY_SETTINGS,{});
          st.voiceGuide = !!e.target.checked;
          save(KEY_SETTINGS,st);
          showToast('Voice-guided breathing preference saved');
        });
      }

      // Daily reminder
      const dailyInput = document.getElementById('dailyTime');
      const saveDaily=document.getElementById('saveDaily');
      const savedDaily = load(KEY_DAILY,null);
      if(savedDaily && dailyInput) dailyInput.value = savedDaily;
      if(saveDaily) saveDaily.addEventListener('click', ()=>{
        const v=dailyInput.value;
        if(!v) return showToast('Pick a time');
        save(KEY_DAILY,v);
        showToast('Daily reminder saved');
      });

      function checkDailyReminder(){
        const v = load(KEY_DAILY,null);
        if(!v) return;
        const moods = load(KEY_MOODS,[]);
        const last = moods.length?moods[moods.length-1].ts:0;
        const now = Date.now();
        const [hh,mm] = v.split(':').map(Number);
        const todayCheck = new Date();
        todayCheck.setHours(hh,mm,0,0);
        if(now>todayCheck.getTime() && (!last || (now - last) > 24*3600*1000)) {
          infoModal('Daily Check-In',"You haven't logged a mood in 24h. Quick check-in?");
          if(load(KEY_SETTINGS,{}).voiceAssistant) speak('You have not logged a mood today. Quick check-in?');
        }
      }
      setTimeout(checkDailyReminder,1500);

      // Navigation
      const nav=document.getElementById('nav');
      nav.addEventListener('click',(e)=>{
        const btn=e.target.closest('button');
        if(!btn) return;
        nav.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const t=btn.dataset.page;
        document.querySelectorAll('.page').forEach(p=>{ if(p.id===t) p.classList.add('active'); else p.classList.remove('active'); });
        if(t==='analytics') setTimeout(drawAnalytics,350);
      });

      const analyticsBtn = document.querySelector('[data-page="analytics"]');
      if(analyticsBtn) analyticsBtn.addEventListener('click', ()=>{ setTimeout(drawAnalytics,350); });

      // Habits (basic)
      function renderHabits(){
        const container = document.getElementById('habitsContainer');
        if(!container) return;
        const habits = load(KEY_HABITS,[]);
        container.innerHTML = '';
        habits.forEach((h,i)=>{
          const div = document.createElement('div');
          div.className = 'habit-item';
          div.innerHTML = `<div>
            <div style="font-weight:700">${escapeHtml(h.name)}</div>
            <div class="habit-days">${createHabitDaysHTML(h.days)}</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="btn habit-toggle" data-i="${i}">Toggle</button>
            <button class="btn habit-del" data-i="${i}">Delete</button>
          </div>`;
          container.appendChild(div);
        });
        container.querySelectorAll('.habit-del').forEach(b=>{
          b.addEventListener('click', e=>{
            const idx = Number(e.target.dataset.i);
            const arr = load(KEY_HABITS,[]);
            arr.splice(idx,1); save(KEY_HABITS,arr); renderHabits();
          });
        });
        container.querySelectorAll('.habit-toggle').forEach(b=>{
          b.addEventListener('click', e=>{
            const idx = Number(e.target.dataset.i);
            const arr = load(KEY_HABITS,[]);
            arr[idx].doneToday = !arr[idx].doneToday;
            save(KEY_HABITS,arr);
            if(arr[idx].doneToday) addPoints(3,'Habit progress');
            renderHabits();
          });
        });
      }

      function createHabitDaysHTML(days){
        // days is array of booleans for 7 days or empty
        if(!days || !days.length) return '';
        return days.map((d,idx)=>`<div class="habit-day ${d?'done':''}">${idx+1}</div>`).join('');
      }

      document.getElementById('addHabitBtn').addEventListener('click', ()=>{
        const name = document.getElementById('newHabitInput').value.trim();
        if(!name) return showToast('Type a habit name');
        const arr = load(KEY_HABITS,[]);
        arr.push({name,days:[false,false,false,false,false,false,false],doneToday:false});
        save(KEY_HABITS,arr);
        document.getElementById('newHabitInput').value='';
        renderHabits();
        showToast('Habit added');
      });

      // Community basic
      async function renderCommunity(){
        const feedEl = document.getElementById('communityFeed');
        if(!feedEl) return;
        feedEl.innerHTML = '<div style="opacity:0.6; padding:12px; text-align:center;">Loading community...</div>';
        try {
          const res = await fetch(`${API_BASE}/api/community`);
          if(!res.ok) throw new Error('Fetch failed');
          const posts = await res.json();
          feedEl.innerHTML = '';
          if(posts.length === 0) {
            feedEl.innerHTML = '<div style="opacity:0.6; padding:12px; text-align:center;">Be the first to share a win!</div>';
            return;
          }
          posts.forEach(p=>{
            const d = document.createElement('div'); d.className='community-post';
            d.innerHTML = `<div style="font-size:12px;opacity:0.8">${new Date(p.ts || p.timestamp).toLocaleString()}</div><div style="margin-top:6px">${escapeHtml(p.text)}</div>`;
            feedEl.appendChild(d);
          });
        } catch(e) {
          // fallback to local if backend fails
          feedEl.innerHTML = '';
          const posts = load(KEY_COMMUNITY,[]);
          posts.slice().reverse().forEach(p=>{
            const d = document.createElement('div'); d.className='community-post';
            d.innerHTML = `<div style="font-size:12px;opacity:0.8">${new Date(p.ts).toLocaleString()}</div><div style="margin-top:6px">${escapeHtml(p.text)}</div>`;
            feedEl.appendChild(d);
          });
        }
      }
      document.getElementById('sharePostBtn').addEventListener('click', ()=>{
        const t = document.getElementById('communityPost').value.trim();
        if(!t) return showToast('Write something first');
        const arr = load(KEY_COMMUNITY,[]);
        arr.push({text:t,ts:Date.now()});
        save(KEY_COMMUNITY,arr);
        document.getElementById('communityPost').value='';
        renderCommunity();
        addPoints(4,'Community share');
        showToast('Shared anonymously');
      });

      // DAILY QUOTE (simple)
      const QUOTES = [
        "Small steps are still progress.",
        "You are more capable than you think.",
        "Breathe. Focus. Move forward.",
        "Consistency builds momentum.",
        "You belong. You matter."
      ];
      (function loadDailyQuote(){
        try{
          const todayKey = new Date().toISOString().slice(0,10);
          const stored = load('bp_daily_quote',{date:'',quote:''});
          let quote = stored.quote || QUOTES[Math.floor(Math.random()*QUOTES.length)];
          if(stored.date !== todayKey){
            quote = QUOTES[Math.floor(Math.random()*QUOTES.length)];
            save('bp_daily_quote', {date: todayKey, quote});
          }
          const el = document.getElementById('dailyQuote');
          if(el) el.innerText = quote;
        }catch(e){}
      })();

      // Meditation Library (voice-guided) - your selected meditations 1,2,3,5,6,8
      const MEDITATIONS = [
        { id:'med_2min_reset', title:'2-Minute Calm Reset', duration:120, script:[
            "Close your eyes if you feel comfortable. Take a slow, deep breath in... and out.",
            "Bring your attention to the rhythm of the breath. Inhale... and exhale.",
            "Release tension from your shoulders. Allow the breath to soften your face.",
            "Notice a single positive thing — even a small one — and hold it gently.",
            "When you're ready, open your eyes. Carry this calm forward."
          ]},
        { id:'med_5min_ground', title:'5-Minute Grounding', duration:300, script:[
            "Sit comfortably. Let your feet connect to the floor. Take a deep breath in... and out.",
            "Scan your body from head to toe — relax the jaw, shoulders, chest, belly, legs.",
            "Feel the support beneath you. Breathe and feel grounded in the present moment.",
            "If your mind wanders, gently bring it back to the breath. No judgement.",
            "Take three slower breaths now, and honour this moment of rest."
          ]},
        { id:'med_10min_focus', title:'10-Minute Focus', duration:600, script:[
            "Settle into a comfortable posture. Soft gaze or closed eyes. Breathe slowly.",
            "Focus on the natural breath. Follow the inhale and follow the exhale.",
            "If thoughts arise, notice them and let them pass like clouds in the sky.",
            "Return your attention to the breath, each time with patience and kindness.",
            "Gently widen your awareness and prepare to return, feeling clearer and more present."
          ]},
        { id:'med_stress_release', title:'Stress Release (5 min)', duration:300, script:[
            "Take a deep breath in... and out. Let the shoulders drop.",
            "Imagine breathing in calm, and breathing out tension. Inhale calm — exhale stress.",
            "Scan for tightness and invite each area to soften as you breathe.",
            "Remind yourself that you can handle small steps. Release what you don't need.",
            "Finish with a slow deep breath. You did well to pause and care for yourself."
          ]},
        { id:'med_confidence_boost', title:'Self-Confidence Booster (4 min)', duration:240, script:[
            "Sit tall and breathe in confidence. Breath out any doubt.",
            "Recall a moment you did well — feel how your body was then.",
            "Repeat these short affirmations in your mind: I can. I learn. I grow.",
            "Let these words sink in with each breath — steady and kind.",
            "Carry this calm confidence forward into your day."
          ]},
        { id:'med_sleep_ease', title:'Sleep-Ease (8 min)', duration:480, script:[
            "Find a comfortable position, ideally lying down.",
            "Breathe slowly and imagine each exhale softening your body.",
            "Relax your forehead, jaw, neck, shoulders, chest, belly, legs and feet.",
            "With every breath release the day's tension. Let thoughts float away.",
            "Drift gently. If you fall asleep, the voice will stop automatically."
          ]}
      ];

      let meditationState = { running:false, currentMeditationId:null, remaining:0, intervalTimer:null, speakQueueTimers:[] };

      function renderMeditationLibrary(){
        const lib = document.getElementById('meditationLibrary');
        if(!lib) return;
        lib.innerHTML = '';
        MEDITATIONS.forEach(m => {
          const card = document.createElement('div');
          card.className = 'meditation-card';
          card.style.display = 'flex';
          card.style.flexDirection = 'column';
          card.style.gap = '8px';
          card.style.padding = '14px';
          card.style.borderRadius = '12px';
          card.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))';
          card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-size:16px;font-weight:700">${m.title}</div>
                <div class="small" style="margin-top:4px">${Math.round(m.duration/60)} min · Voice-guided</div>
              </div>
              <div style="text-align:right">
                <div class="small">Reward</div>
                <div style="font-weight:700;margin-top:6px">+${Math.max(5,Math.round(m.duration/60*5))} pts</div>
              </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
              <button class="btn start-med" data-id="${m.id}">Start</button>
              <button class="btn stop-med" data-id="${m.id}" style="display:none">Stop</button>
              <div style="flex:1">
                <div style="font-size:12px" class="med-timer" data-id="${m.id}">Ready</div>
                <div class="level-progress" style="margin-top:6px">
                  <div class="level-bar" data-bar="${m.id}" style="width:0%"></div>
                </div>
              </div>
            </div>
          `;
          lib.appendChild(card);
        });

        lib.querySelectorAll('.start-med').forEach(btn=>{
          btn.addEventListener('click', ()=> startMeditation(btn.dataset.id));
        });
        lib.querySelectorAll('.stop-med').forEach(btn=>{
          btn.addEventListener('click', ()=> stopMeditation(btn.dataset.id));
        });
      }

      function secondsToMMSS(s){ const mm = Math.floor(s/60).toString().padStart(2,'0'); const ss = Math.floor(s%60).toString().padStart(2,'0'); return `${mm}:${ss}`; }
      function clearMeditationTimers(){ meditationState.intervalTimer && clearInterval(meditationState.intervalTimer); meditationState.speakQueueTimers.forEach(t => clearTimeout(t)); meditationState.speakQueueTimers = []; try{ speechSynthesis.cancel(); }catch(e){} }

      function updateMeditationUI(id, remaining, total){
        const timerEl = document.querySelector(`.med-timer[data-id="${id}"]`);
        const barEl = document.querySelector(`.level-bar[data-bar="${id}"]`);
        const startBtn = document.querySelector(`.start-med[data-id="${id}"]`);
        const stopBtn = document.querySelector(`.stop-med[data-id="${id}"]`);
        if(timerEl) timerEl.innerText = remaining>0 ? secondsToMMSS(remaining) : 'Done';
        if(barEl) { const pct = total ? Math.max(0, Math.min(100, (1 - (remaining/total)) * 100)) : 0; barEl.style.width = pct + '%'; }
        if(startBtn) startBtn.style.display = meditationState.running && meditationState.currentMeditationId===id ? 'none' : '';
        if(stopBtn)  stopBtn.style.display  = meditationState.running && meditationState.currentMeditationId===id ? '' : 'none';
      }

      function startMeditation(id){
        if(meditationState.running) stopMeditation(meditationState.currentMeditationId);
        const m = MEDITATIONS.find(x => x.id === id); if(!m) return;
        meditationState.running = true; meditationState.currentMeditationId = id; meditationState.remaining = m.duration;
        const medMode = load(KEY_MEDITATION, false);
        const settings = load(KEY_SETTINGS, {});
        const voiceGuideEnabled = settings.voiceGuide || false;
        const intro = `Starting ${m.title}. Duration ${Math.round(m.duration/60)} minutes. Find a comfortable position.`;
        speak(intro);
        const lines = m.script;
        const partDur = Math.max(2, Math.floor(m.duration / Math.max(1, lines.length)));
        let offset = 1200;
        meditationState.speakQueueTimers.push(setTimeout(()=>{ if(voiceGuideEnabled) speak(lines[0]); }, offset));
        for(let i=0;i<lines.length;i++){
          const line = lines[i];
          const t = offset + i * partDur * 1000;
          const timerId = setTimeout(()=>{ if(voiceGuideEnabled) speak(line); }, t);
          meditationState.speakQueueTimers.push(timerId);
        }
        updateMeditationUI(id, meditationState.remaining, m.duration);
        meditationState.intervalTimer = setInterval(()=>{
          meditationState.remaining -= 1;
          updateMeditationUI(id, meditationState.remaining, m.duration);
          if(meditationState.remaining <= 0){
            clearMeditationTimers();
            meditationState.running = false; meditationState.currentMeditationId = null; meditationState.remaining = 0;
            updateMeditationUI(id, 0, m.duration);
            const reward = Math.max(5, Math.round(m.duration/60*5));
            addPoints(reward, `Meditation: ${m.title}`);
            const medCounts = load('bp_med_counts', {});
            medCounts[id] = (medCounts[id]||0) + 1; save('bp_med_counts', medCounts);
            const totalSessions = Object.values(medCounts).reduce((s,v)=>s+v,0);
            if(totalSessions >= 5){
              const badges = load(KEY_BADGES, []);
              if(!badges.includes('meditation_5')) { badges.push('meditation_5'); save(KEY_BADGES, badges); renderAchievements(); showConfettiOnce(); successModal('Achievement Unlocked','🧘 Meditation Master — logged 5 meditations'); }
            }
            const badges = load(KEY_BADGES, []);
            if(!badges.includes('meditation_1')){ badges.push('meditation_1'); save(KEY_BADGES,badges); renderAchievements(); }
            showToast(`Meditation complete — +${reward} pts`);
          }
        }, 1000);
        updateMeditationUI(id, meditationState.remaining, m.duration);
      }

      function stopMeditation(id){
        if(!meditationState.running) return;
        clearMeditationTimers();
        meditationState.running = false;
        const prevId = meditationState.currentMeditationId;
        meditationState.currentMeditationId = null;
        meditationState.remaining = 0;
        if(prevId) updateMeditationUI(prevId, 0, 1);
        showToast('Meditation stopped');
      }

      document.getElementById('nav').addEventListener('click', (e)=>{
        const btn = e.target.closest('button');
        if(!btn) return;
        const target = btn.dataset.page;
        if(meditationState.running && target !== 'meditation'){ stopMeditation(meditationState.currentMeditationId); }
      });
      window.addEventListener('beforeunload', ()=>{ if(meditationState.running) stopMeditation(meditationState.currentMeditationId); });

      // Initial render calls and wiring
      renderMeditationLibrary();
      renderJournal();
      renderAchievements();
      renderDashboard();
      drawAnalytics();
      renderHabits();
      renderCommunity();
      renderChallenge();
      updatePointsDisplay();

      // Small UI wiring for quick nav buttons on dashboard
      const dash=document.getElementById('dashboard');
      if(dash){
        const gotoJournalBtn=dash.querySelector('#gotoJournal');
        if(gotoJournalBtn) gotoJournalBtn.addEventListener('click', ()=>{ document.querySelector('[data-page="journal"]').click(); });
        const gotoBreathBtn=dash.querySelector('#gotoBreath');
        if(gotoBreathBtn) gotoBreathBtn.addEventListener('click', ()=>{ document.querySelector('[data-page="breathing"]').click(); });
        const gotoAnalyticsBtn=dash.querySelector('#gotoAnalytics');
        if(gotoAnalyticsBtn) gotoAnalyticsBtn.addEventListener('click', ()=>{ document.querySelector('[data-page="analytics"]').click(); });
      }

      // small responsive confetti resize
      window.addEventListener('resize', ()=>{ if(confCanvas){ confCanvas.width=window.innerWidth; confCanvas.height=window.innerHeight; } });

      // self-tests
      console.group('BrightPath Tests');
      try{
        console.assert(Array.isArray(load(KEY_MOODS,[])),'moods exists');
        console.assert(Array.isArray(load(KEY_BADGES,[])),'badges exists');
        console.assert(Array.isArray(load(KEY_JOURNAL,[])),'journal exists');
        console.log('Self-tests OK');
      }catch(e){ console.error(e); }
      


      console.groupEnd();

      const logoutBtn = document.getElementById('logoutBtn');
      if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          localStorage.removeItem('bp_token');
          localStorage.removeItem('bp_username');
          window.location.href = 'index.html';
        });
      }
    });
