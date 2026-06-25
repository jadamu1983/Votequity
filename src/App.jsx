import StreamerDashboard from "./Streamer";
import { useState, useEffect, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://kvnxtmqxiygmrxqtxtem.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bnh0bXF4aXlnbXJ4cXR4dGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NDY5ODcsImV4cCI6MjA5NzIyMjk4N30.Kos54IlfZ1DDdp8Alqu2VASxmCeHkNm6vGMjPHsbtAc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const weightColor = (w) => w >= 1.5 ? "#00ff88" : w >= 1.0 ? "#f0c040" : "#ff5555";
const pct = (a, b) => (a + b) === 0 ? 50 : Math.round((a / (a + b)) * 100);
const timeLeft = (closesAt) => {
  const diff = new Date(closesAt) - new Date();
  if (diff <= 0) return "Closed";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
};

function Avatar({ initials = "VQ", size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #00ff88, #0088ff)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: "#0a0a14", flexShrink: 0
    }}>{initials}</div>
  );
}

function WeightBadge({ weight }) {
  const c = weightColor(weight);
  return (
    <span style={{
      background: `${c}22`, border: `1px solid ${c}`,
      color: c, borderRadius: 4, padding: "2px 7px", fontSize: 11, fontWeight: 700
    }}>⚖ {Number(weight).toFixed(2)}x</span>
  );
}

function TokenBadge({ tokens }) {
  return (
    <span style={{
      background: "#f0c04022", border: "1px solid #f0c040",
      color: "#f0c040", borderRadius: 4, padding: "2px 7px", fontSize: 11, fontWeight: 700
    }}>◈ {Number(tokens).toLocaleString()}</span>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40, width: "100%", boxSizing: "border-box" }}>
      <div style={{
        width: 28, height: 28, border: "3px solid #1a1a2e",
        borderTop: "3px solid #00ff88", borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function VoteBar({ bullW = 0, bearW = 0, bullVotes = 0, bearVotes = 0 }) {
  const yesPct = pct(bullW, bearW);
  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "#00ff88", fontSize: 12, fontWeight: 700 }}>▲ BULL {bullVotes} ({yesPct}%)</span>
        <span style={{ color: "#ff5555", fontSize: 12, fontWeight: 700 }}>{100 - yesPct}% {bearVotes} BEAR ▼</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "#2a2a3f", overflow: "hidden", width: "100%" }}>
        <div style={{
          height: "100%", width: `${yesPct}%`,
          background: "linear-gradient(90deg, #00ff88, #00cc66)",
          borderRadius: 4, transition: "width 0.5s ease"
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ color: "#444", fontSize: 10 }}>Weighted: {Number(bullW).toFixed(1)}</span>
        <span style={{ color: "#444", fontSize: 10 }}>{Number(bearW).toFixed(1)} :Weighted</span>
      </div>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputStyle = {
    width: "100%", padding: "12px 14px", background: "#0e0e1c",
    border: "1px solid #2a2a3f", borderRadius: 8, color: "#fff",
    fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box"
  };

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { data: { username } }
        });
        if (error) throw error;
        onAuth(data.user);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#070710", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "'Inter', -apple-system, sans-serif", width: "100%", boxSizing: "border-box"
    }}>
      <div style={{
        fontSize: 32, fontWeight: 900, letterSpacing: "-1px",
        background: "linear-gradient(90deg, #00ff88, #0088ff)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4
      }}>VOTEQUITY</div>
      <div style={{ color: "#444", fontSize: 11, letterSpacing: "2px", marginBottom: 40 }}>DEMOCRATIC TRADING</div>
      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 12, boxSizing: "border-box" }}>
        {mode === "signup" && <input style={inputStyle} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />}
        <input style={inputStyle} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={inputStyle} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div style={{ color: "#ff5555", fontSize: 12, textAlign: "center" }}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{
          padding: "13px", borderRadius: 8, border: "none",
          background: "linear-gradient(90deg, #00ff88, #0088ff)",
          color: "#070710", fontWeight: 800, fontSize: 15, cursor: "pointer", width: "100%", boxSizing: "border-box"
        }}>{loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}</button>
        <div style={{ textAlign: "center", color: "#555", fontSize: 13 }}>
          {mode === "login" ? "No account? " : "Have an account? "}
          <span onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ color: "#00ff88", cursor: "pointer" }}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </span>
        </div>
      </div>
    </div>
  );
}

function PollCard({ poll, myVote, profile, onVote }) {
  const [showInfluence, setShowInfluence] = useState(false);
  const isActive = poll.status === "active" && new Date(poll.closes_at) > new Date();

  return (
    <div style={{
      background: "#0e0e1c",
      border: `1px solid ${poll.status === "closed" ? (poll.outcome === "WIN" ? "#00ff8844" : "#ff555544") : "#2a2a3f"}`,
      borderRadius: 14, padding: 20, marginBottom: 16, position: "relative", width: "100%", boxSizing: "border-box"
    }}>
      {poll.outcome && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: poll.outcome === "WIN" ? "#00ff8822" : "#ff555522",
          border: `1px solid ${poll.outcome === "WIN" ? "#00ff88" : "#ff5555"}`,
          color: poll.outcome === "WIN" ? "#00ff88" : "#ff5555",
          borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 800
        }}>{poll.outcome === "WIN" ? "✓ WIN" : "✗ LOSS"}</div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14, width: "100%", boxSizing: "border-box" }}>
        <div style={{ background: "#1a1a2e", border: "1px solid #2a2a3f", borderRadius: 8, padding: "6px 12px", textAlign: "center", minWidth: 64 }}>
          <div style={{ color: "#00ff88", fontSize: 18, fontWeight: 900 }}>{poll.ticker}</div>
          <div style={{ color: poll.direction === "LONG" ? "#00ff88" : "#ff5555", fontSize: 9, fontWeight: 700 }}>{poll.direction}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>
            by <span style={{ color: "#00ff88" }}>{poll.streamer_name}</span> · {timeLeft(poll.closes_at)}
          </div>
          <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.5 }}>{poll.thesis}</div>
        </div>
      </div>

      <VoteBar bullW={poll.bull_weight} bearW={poll.bear_weight} bullVotes={poll.bull_votes} bearVotes={poll.bear_votes} />

      {isActive && (
        <div style={{ marginTop: 16, width: "100%", boxSizing: "border-box" }}>
          {!myVote ? (
            <div style={{ display: "flex", gap: 10, width: "100%", boxSizing: "border-box" }}>
              <button onClick={() => { onVote(poll.id, "bull"); setShowInfluence(true); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, background: "#00ff8822", border: "1px solid #00ff88", color: "#00ff88", fontWeight: 700, cursor: "pointer" }}>▲ BULL</button>
              <button onClick={() => { onVote(poll.id, "bear"); setShowInfluence(true); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, background: "#ff555522", border: "1px solid #ff5555", color: "#ff5555", fontWeight: 700, cursor: "pointer" }}>▼ BEAR</button>
            </div>
          ) : (
            <div style={{
              background: myVote.direction === "bull" ? "#00ff8811" : "#ff555511",
              border: `1px solid ${myVote.direction === "bull" ? "#00ff8844" : "#ff555544"}`,
              borderRadius: 8, padding: "10px 14px", color: myVote.direction === "bull" ? "#00ff88" : "#ff5555", fontSize: 13, fontWeight: 600
            }}>Voted {myVote.direction === "bull" ? "▲ BULL" : "▼ BEAR"} · {Number(profile?.vote_weight || 1).toFixed(2)}x weight applied</div>
          )}
        </div>
      )}
    </div>
  );
}

function Leaderboard({ currentUserId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("leaderboard").select("*").limit(50).then(({ data }) => {
      setRows(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;
  return (
    <div style={{ width: "100%", display: "block", boxSizing: "border-box", margin: 0, padding: 0 }}>
      <div style={{ color: "#555", fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Global Rankings · Vote Weight</div>
      <div style={{ background: "#0e0e1c", border: "1px solid #2a2a3f", borderRadius: 12, padding: "10px 12px", marginBottom: 16, fontSize: 12, color: "#666", width: "100%", boxSizing: "border-box" }}>
        <span style={{ color: "#00ff88" }}>Weight</span> = accuracy over time. Win more, matter more.
      </div>
      {rows.length === 0 && <div style={{ color: "#444", textAlign: "center", padding: 40, fontSize: 13 }}>Need 5+ votes to appear on rankings</div>}
      {rows.map((entry, i) => {
        const isMe = entry.id === currentUserId;
        return (
          <div key={entry.id} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
            background: isMe ? "#00ff8808" : i % 2 === 0 ? "#0e0e1c" : "#0a0a14",
            borderRadius: 14, marginBottom: 12, border: isMe ? "1px solid #00ff8833" : "1px solid #2a2a3f", width: "100%", boxSizing: "border-box"
          }}>
            <div style={{ width: 28, textAlign: "center", fontWeight: 800, color: i < 3 ? "#f0c040" : "#555" }}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : entry.rank}</div>
            <Avatar initials={entry.avatar_initials} size={32} />
            <div style={{ flex: 1 }}>
              <div style={{ color: isMe ? "#00ff88" : "#ddd", fontWeight: isMe ? 700 : 400, fontSize: 13 }}>{entry.username}</div>
              <div style={{ color: "#555", fontSize: 11 }}>{entry.total_votes} predictions</div>
            </div>
            <WeightBadge weight={entry.vote_weight} />
            <div style={{ textAlign: "right" }}>
              <div style={{ color: weightColor(entry.vote_weight), fontWeight: 700, fontSize: 14 }}>{entry.win_rate}%</div>
              <TokenBadge tokens={entry.tokens} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Profile({ profile, onSignOut }) {
  const stats = [
    { label: "Win Rate", value: `${profile.win_rate}%`, sub: `${profile.correct_votes}/${profile.total_votes} correct`, accent: "#00ff88" },
    { label: "Weight", value: `${Number(profile.vote_weight).toFixed(2)}x`, sub: "multiplier", accent: "#0088ff" },
    { label: "Tokens", value: `◈ ${profile.tokens}`, sub: "earned", accent: "#f0c040" },
  ];
  const tiers = [
    { range: "80%+", label: "Elite", weight: "2.0x+", color: "#00ff88" },
    { range: "65–79%", label: "Sharp", weight: "1.5–2.0x", color: "#00cc66" },
    { range: "55–64%", label: "Solid", weight: "1.0–1.5x", color: "#f0c040" },
    { range: "45–54%", label: "Average", weight: "0.7–1.0x", color: "#ff8844" },
    { range: "<45%", label: "Noise", weight: "<0.7x", color: "#ff5555" },
  ];
  return (
    <div style={{ width: "100%", display: "block", boxSizing: "border-box", margin: 0, padding: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, padding: 16, background: "#0e0e1c", borderRadius: 14, border: "1px solid #2a2a3f", width: "100%", boxSizing: "border-box" }}>
        <Avatar initials={profile.avatar_initials} size={56} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{profile.username}</div>
          <WeightBadge weight={profile.vote_weight} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: 20, width: "100%", boxSizing: "border-box" }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#12121f", border: "1px solid #2a2a3f", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ color: "#666", fontSize: 10, textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ color: s.accent, fontSize: 18, fontWeight: 800 }}>{s.value}</div>
            <div style={{ color: "#555", fontSize: 11, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ color: "#555", fontSize: 11, textTransform: "uppercase", marginBottom: 12 }}>Weight Tiers</div>
      <div style={{ background: "#0e0e1c", border: "1px solid #2a2a3f", borderRadius: 12, padding: 16, marginBottom: 24, width: "100%", boxSizing: "border-box" }}>
        {tiers.map(tier => (
          <div key={tier.range} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #1a1a2e" }}>
            <div style={{ width: 60, color: tier.color, fontWeight: 700, fontSize: 12 }}>{tier.range}</div>
            <div style={{ flex: 1, color: "#888", fontSize: 12 }}>{tier.label}</div>
            <div style={{ color: tier.color, fontWeight: 700, fontSize: 12 }}>{tier.weight}</div>
          </div>
        ))}
      </div>
      <button onClick={onSignOut} style={{ width: "100%", padding: 12, borderRadius: 8, background: "none", border: "1px solid #2a2a3f", color: "#555", cursor: "pointer" }}>Sign Out</button>
    </div>
  );
}

function Feed({ profile }) {
  const [streamers, setStreamers] = useState([]);
  const [polls, setPolls] = useState([]);
  const [myVotes, setMyVotes] = useState({});
  const [selectedStreamer, setSelectedStreamer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const notify = (msg, color = "#00ff88") => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = useCallback(async () => {
    const [{ data: sData }, { data: pData }, { data: vData = [] }] = await Promise.all([
      supabase.from("streamers").select("*, profiles(username, avatar_initials)").order("follower_count", { ascending: false }),
      supabase.from("polls").select("*, streamers(profiles(username))").order("created_at", { ascending: false }),
      supabase.from("votes").select("*").eq("user_id", profile.id),
    ]);
    setStreamers(sData || []);
    setPolls((pData || []).map(p => ({ ...p, streamer_name: p.streamers?.profiles?.username || "Unknown" })));
    const vMap = {};
    (vData || []).forEach(v => { vMap[v.poll_id] = v; });
    setMyVotes(vMap);
    setLoading(false);
  }, [profile.id]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const channel = supabase.channel("polls_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "polls" }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, loadData).subscribe();
    return () => supabase.removeChannel(channel);
  }, [loadData]);

  const handleVote = async (pollId, direction) => {
    const { error } = await supabase.from("votes").insert({ poll_id: pollId, user_id: profile.id, direction, weight_at_time: profile.vote_weight });
    if (error) { notify(error.message, "#ff5555"); return; }
    notify(`Vote cast with ${Number(profile.vote_weight).toFixed(2)}x weight`);
    loadData();
  };

  const activePolls = polls.filter(p => p.status === "active" && new Date(p.closes_at) > new Date() && (!selectedStreamer || p.streamer_id === selectedStreamer));
  const closedPolls = polls.filter(p => p.status === "closed" || new Date(p.closes_at) <= new Date());

  if (loading) return <Spinner />;

  return (
    <div style={{ width: "100%", display: "block", boxSizing: "border-box", margin: 0, padding: 0 }}>
      {notification && <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: "#0e0e1c", border: `1px solid ${notification.color}`, color: notification.color, padding: "10px 20px", borderRadius: 30, fontSize: 13, zIndex: 1000 }}>{notification.msg}</div>}
      {streamers.length > 0 && (
        <div style={{ marginBottom: 20, width: "100%", boxSizing: "border-box" }}>
          <div style={{ color: "#555", fontSize: 11, textTransform: "uppercase", marginBottom: 10 }}>Streamers</div>
          {streamers.map(s => (
            <div key={s.id} onClick={() => setSelectedStreamer(selectedStreamer === s.id ? null : s.id)} style={{
              background: selectedStreamer === s.id ? "#00ff8811" : "#0e0e1c", border: `1px solid ${selectedStreamer === s.id ? "#00ff88" : "#2a2a3f"}`,
              borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 10, width: "100%", boxSizing: "border-box"
            }}>
              <Avatar initials={s.profiles?.avatar_initials || "VQ"} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "#ddd", fontWeight: 700, fontSize: 14 }}>{s.display_name}</div>
                <div style={{ color: "#555", fontSize: 11 }}>{s.follower_count.toLocaleString()} followers</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#00ff88", fontWeight: 700 }}>{s.win_rate}%</div>
                <div style={{ color: "#555", fontSize: 10 }}>win rate</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ color: "#555", fontSize: 11, textTransform: "uppercase", marginBottom: 10 }}>Active Votes</div>
      {activePolls.length === 0 && <div style={{ color: "#444", textAlign: "center", padding: 40, fontSize: 13 }}>No active votes right now</div>}
      {activePolls.map(p => <PollCard key={p.id} poll={p} myVote={myVotes[p.id]} profile={profile} onVote={handleVote} />)}
      {closedPolls.length > 0 && (
        <div style={{ width: "100%", boxSizing: "border-box" }}>
          <div style={{ color: "#555", fontSize: 11, textTransform: "uppercase", margin: "20px 0 10px" }}>Recent Results</div>
          {closedPolls.slice(0, 5).map(p => <PollCard key={p.id} poll={p} myVote={myVotes[p.id]} profile={profile} onVote={handleVote} />)}
        </div>
      )}
    </div>
  );
}

export default function Votequity() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("feed");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => setProfile(data));
  }, [user]);

  if (!authChecked || (user && !profile)) return <div style={{ background: "#070710", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>;
  if (!user) return <AuthScreen onAuth={setUser} />;

  return (
    <div style={{ background: "#070710", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: 480, margin: "0 auto", position: "relative", overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
      <style>{`* { box-sizing: border-box !important; } html, body { margin: 0; padding: 0; overflow-x: hidden; }`}</style>
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#070710", zIndex: 100, width: "100%", boxSizing: "border-box" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, background: "linear-gradient(90deg, #00ff88, #0088ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VOTEQUITY</div>
          <div style={{ color: "#444", fontSize: 10, letterSpacing: "2px", marginTop: -2 }}>DEMOCRATIC TRADING</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><TokenBadge tokens={profile.tokens} /><Avatar initials={profile.avatar_initials} size={34} /></div>
      </div>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "16px 16px 80px", boxSizing: "border-box", display: "block" }}>
        {tab === "feed" && <Feed profile={profile} />}
        {tab === "leaderboard" && <Leaderboard currentUserId={user.id} />}
        {tab === "streamer" && <StreamerDashboard supabase={supabase} />}
        {tab === "profile" && <Profile profile={profile} onSignOut={() => supabase.auth.signOut().then(() => { setUser(null); setProfile(null); setTab("feed"); })} />}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#0a0a14", borderTop: "1px solid #1a1a2e", display: "flex", padding: "10px 0 20px", boxSizing: "border-box" }}>
        {[
          { id: "feed", label: "Feed" }, { id: "leaderboard", label: "Ranks" }, { id: "streamer", label: "Stream" }, { id: "profile", label: "Profile" }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", color: tab === t.id ? "#00ff88" : "#444", fontSize: 12, fontWeight: tab === t.id ? 700 : 400, padding: "6px 0", borderTop: `2px solid ${tab === t.id ? "#00ff88" : "transparent"}` }}>{t.label}</button>
        ))}
      </div>
    </div>
  );
}
