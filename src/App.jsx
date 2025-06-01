import { useState } from 'react';

async function getDistance(sourceZip, destZip) {
  const res = await fetch(`https://distancefindapi.onrender.com/api/distance?origins=${sourceZip}&destinations=${destZip}`);
  const data = await res.json();


  if (data.status !== "OK" || data.rows[0].elements[0].status !== "OK") {
    throw new Error(`No route found from ${sourceZip} to ${destZip}`);
  }

  const element = data.rows[0].elements[0];
  const distanceKm = element.distance.value / 1000;
  const distanceMiles = distanceKm * 0.621371;
  const durationMins = element.duration.value / 60;

  return {
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    distanceMiles: parseFloat(distanceMiles.toFixed(2)),
    durationMins: parseFloat(durationMins.toFixed(2)),
  };
}

export default function App() {
  const [sourceZip1, setSourceZip1] = useState('95131');
  const [sourceZip2, setSourceZip2] = useState('32220');
  const [sourceZip3, setSourceZip3] = useState('07305');
  const [sourceZip4, setSourceZip4] = useState('75050');
  const [destZip, setDestZip] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);
    setLoading(true);

    const sourceZips = [sourceZip1, sourceZip2, sourceZip3, sourceZip4];
    const newResults = [];

    for (let zip of sourceZips) {
      try {
        const res = await getDistance(zip.trim(), destZip.trim());
        newResults.push({ source: zip, ...res });
      } catch (err) {
        newResults.push({ source: zip, error: err.message });
      }
    }

    const validDistances = newResults.filter(r => !r.error).map(r => r.distanceKm);
    const minDistance = Math.min(...validDistances);

    const finalResults = newResults.map(r => ({
      ...r,
      isMin: !r.error && r.distanceKm === minDistance
    }));

    setResults(finalResults);
    setLoading(false);
  };

  const themeStyles = darkMode ? styles.dark : styles.light;

  return (
    <div style={{ ...styles.app, ...themeStyles.app }}>
      <div style={styles.topBar}>
        <h1 style={themeStyles.title}>🚗 ZIP Code Distance Calculator</h1>
        <button onClick={() => setDarkMode(!darkMode)} style={styles.toggleBtn}>
          {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputRow}>
          <input type="text" value={sourceZip1} onChange={e => setSourceZip1(e.target.value)} required placeholder="Source ZIP 1" style={styles.input} disabled={loading} />
          <input type="text" value={sourceZip2} onChange={e => setSourceZip2(e.target.value)} required placeholder="Source ZIP 2" style={styles.input} disabled={loading} />
          <input type="text" value={sourceZip3} onChange={e => setSourceZip3(e.target.value)} required placeholder="Source ZIP 3" style={styles.input} disabled={loading} />
          <input type="text" value={sourceZip4} onChange={e => setSourceZip4(e.target.value)} required placeholder="Source ZIP 4" style={styles.input} disabled={loading} />
        </div>

        <input type="text" value={destZip} onChange={e => setDestZip(e.target.value)} required placeholder="Destination ZIP" style={{ ...styles.input, textAlign: 'center', maxWidth: '60%', margin: '20px auto' }} disabled={loading} />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Distance'}
        </button>
      </form>

      {results.length > 0 && (
        <div style={styles.grid}>
          {results.map((r, index) => {
            const cardStyle = {
              ...styles.resultCard,
              backgroundColor: r.error
                ? '#f8d7da'
                : r.isMin
                ? '#d4edda'
                : '#eaf2f8',
              color: darkMode ? '#000' : '#000',
            };

            return (
              <div key={index} style={cardStyle}>
                <h3>From ZIP: {r.source}</h3>
                {r.error ? (
                  <p style={styles.error}>{r.error}</p>
                ) : (
                  <>
                    <div style={styles.resultRow}>
                      <span style={styles.label}>Distance:</span>
                      <span>{r.distanceKm} km / {r.distanceMiles} miles</span>
                    </div>
                    <div style={styles.resultRow}>
                      <span style={styles.label}>Duration:</span>
                      <span>{r.durationMins} minutes</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <footer style={{ ...styles.footer, color: themeStyles.footer.color }}>
        Powered by Bespoke Systems
      </footer>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    transition: 'background 0.3s ease',
  },
  light: {
    app: { backgroundColor: '#fff', color: '#000' },
    title: { color: '#2c3e50' },
    footer: { color: '#555' },
  },
  dark: {
    app: { backgroundColor: '#1e1e1e', color: '#f5f5f5' },
    title: { color: '#f5f5f5' },
    footer: { color: '#aaa' },
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  toggleBtn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    backgroundColor: '#3498db',
    color: '#fff',
    fontSize: 14,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  inputRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 15,
  },
  input: {
    padding: '12px 16px',
    fontSize: 16,
    borderRadius: 8,
    border: '1.5px solid #ccc',
    minWidth: '100px',
  },
  button: {
    padding: '14px 30px',
    fontSize: 16,
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: '600',
  },
  resultCard: {
    flex: '1 1 45%',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    margin: 10,
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 16,
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
  },
  error: {
    color: '#a94442',
    fontWeight: '600',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 30,
  },
  footer: {
    marginTop: 40,
    fontSize: 14,
    textAlign: 'center',
  },
};
