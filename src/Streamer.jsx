import { useState, useEffect } from "react";

export default function StreamerDashboard({ supabase }) {
  const [streamer, setStreamer] = useState(null);
  const [ticker, setTicker] = useState("");
  const [direction, setDirection] = useState("LONG");
  const [thesis, setThesis] = useState("");
  const [hours, setHours] = useState("24");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", isError: false });
useEffect(() => {
  const checkStreamer = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("streamer_stats")
      .select("*")
      .eq("id", user.id)
      .single();

    // If there's an error or no data, it triggers your "Access Denied" logic
    if (error || !data) {
      console.error("Streamer fetch error:", error);
      setStreamer(null);
    } else {
      setStreamer(data);
    }
    setLoading(false);
  };
  checkStreamer();
}, [supabase]);

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    setMsg({ text: "", isError: false });

    if (!ticker || !thesis) {
      setMsg({ text: "Please fill out all fields.", isError: true });
      return;
    }

    const closesAt = new Date();
    closesAt.setHours(closesAt.getHours() + parseInt(hours));

    const { error } = await supabase.from("polls").insert({
      streamer_id: streamer.id,
      ticker: ticker.toUpperCase().trim(),
      direction,
      thesis: thesis.trim(),
      closes_at: closesAt.toISOString(),
      status: "active"
    });

    if (error) {
      setMsg({ text: error.message, isError: true });
    } else {
      setMsg({ text: "Prediction poll published successfully!", isError: false });
      setTicker("");
      setThesis("");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40, width: "100%", boxSizing: "border-box" }}>
        <div style={{
          width: 28, height: 28, border: "3px solid #1a1a2e",
          borderTop: "3px solid #00ff88", borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
      </div>
    );
  }

  if (!streamer) {
    return (
      <div style={{
        background: "#0e0e1c", border: "1px solid #2a2a3f", borderRadius: 14,
        padding: 24, textAlign: "center", color: "#666", fontSize: 14,
        width: "100%", boxSizing: "border-box", margin: 0
      }}>
        Access Denied. Your account is not configured with Streamer Permissions.
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    background: "#0e0e1c",
    border: "1px solid #2a2a3f",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box"
  };

  return (
    <div style={{ 
      width: "100%", 
      display: "block",
      boxSizing: "border-box", 
      color: "#ffffff",
      margin: 0,
      padding: 0
    }}>
      <div style={{ color: "#555", fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>
        Streamer Control Panel
      </div>

      {/* Streamer Stats Card */}
      <div style={{
        background: "linear-gradient(135deg, #0e0e1c, #0a0a14)",
        border: "1px solid #2a2a3f",
        borderRadius: 14,
        padding: 20,
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        boxSizing: "border-box"
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{streamer.display_name}</div>
          <div style={{ color: "#555", fontSize: 12, marginTop: 2 }}>{streamer.follower_count.toLocaleString()} followers</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#00ff88", fontSize: 20, fontWeight: 900 }}>{streamer.win_rate}%</div>
          <div style={{ color: "#555", fontSize: 10, textTransform: "uppercase" }}>Win Rate</div>
        </div>
      </div>

      {/* Create Prediction Form Card */}
      <div style={{
        background: "#0e0e1c",
        border: "1px solid #2a2a3f",
        borderRadius: 14,
        padding: 20,
        width: "100%",
        boxSizing: "border-box",
        display: "block"
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
          Launch New Community Prediction
        </div>

        <form onSubmit={handleCreatePoll} style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", boxSizing: "border-box" }}>
          
          {/* Ticker and Direction Inputs Row */}
          <div style={{ display: "flex", gap: 12, width: "100%", boxSizing: "border-box" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", color: "#666", fontSize: 11, marginBottom: 6, textTransform: "uppercase" }}>Asset Ticker</label>
              <input 
                style={inputStyle} 
                placeholder="e.g. BTC, TSLA" 
                value={ticker} 
                onChange={e => setTicker(e.target.value)} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", color: "#666", fontSize: 11, marginBottom: 6, textTransform: "uppercase" }}>Market Bias</label>
              <select 
                style={inputStyle} 
                value={direction} 
                onChange={e => setDirection(e.target.value)}
              >
                <option value="LONG">▲ LONG (Bullish)</option>
                <option value="SHORT">▼ SHORT (Bearish)</option>
              </select>
            </div>
          </div>

          {/* Time Window Input */}
          <div style={{ width: "100%", boxSizing: "border-box", display: "block" }}>
            <label style={{ display: "block", color: "#666", fontSize: 11, marginBottom: 6, textTransform: "uppercase" }}>Voting Window Duration</label>
            <select 
              style={inputStyle} 
              value={hours} 
              onChange={e => setHours(e.target.value)}
            >
              <option value="1">1 Hour</option>
              <option value="4">4 Hours</option>
              <option value="12">12 Hours</option>
              <option value="24">24 Hours (Standard)</option>
              <option value="48">48 Hours</option>
            </select>
          </div>

          {/* Thesis / Description Input */}
          <div style={{ width: "100%", boxSizing: "border-box", display: "block" }}>
            <label style={{ display: "block", color: "#666", fontSize: 11, marginBottom: 6, textTransform: "uppercase" }}>Trade Thesis / Reasoning</label>
            <textarea 
              style={{ ...inputStyle, height: 80, resize: "none" }} 
              placeholder="Provide context or technical validation for this setup..." 
              value={thesis} 
              onChange={e => setThesis(e.target.value)} 
            />
          </div>

          {msg.text && (
            <div style={{ 
              color: msg.isError ? "#ff5555" : "#00ff88", 
              fontSize: 13, 
              textAlign: "center",
              width: "100%",
              boxSizing: "border-box" 
            }}>
              {msg.text}
            </div>
          )}

          <button type="submit" style={{
            padding: "13px", 
            borderRadius: 8, 
            border: "none",
            background: "linear-gradient(90deg, #00ff88, #0088ff)",
            color: "#070710", 
            fontWeight: 800, 
            fontSize: 14,
            cursor: "pointer", 
            fontFamily: "inherit", 
            width: "100%", 
            boxSizing: "border-box",
            marginTop: 4
          }}>
            Publish Vote Window
          </button>
        </form>
      </div>
    </div>
  );
}
