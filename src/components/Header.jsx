import { motion } from 'framer-motion'

const LOGO = 'https://static.tildacdn.com/tild6466-3831-4530-b138-336535386165/Group_213.png'

function formatDate() {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function Header({ loading, onRefresh, presentCount, totalCount, usingFallback, theme, onToggleTheme }) {
  const date = formatDate()
  const pct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

  return (
    <motion.header
      className="app-header"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="header-left">
        <img src={LOGO} alt="KidsVentors" className="header-logo" onError={e => { e.target.style.display='none' }} />
        <div className="header-titles">
          <h1 className="header-title">KidsVentors</h1>
          <p className="header-subtitle">Club de Tecnologías Creativas · {date}</p>
        </div>
      </div>

      <div className="header-center">
        <div className="attendance-pill">
          <span className="att-icon">✓</span>
          <span className="att-count">{presentCount}</span>
          <span className="att-sep">/</span>
          <span className="att-total">{totalCount}</span>
          <span className="att-label">presentes</span>
          {totalCount > 0 && (
            <span className="att-pct" style={{ color: pct >= 80 ? 'var(--green-400)' : pct >= 50 ? 'var(--yellow-300)' : 'var(--pink-400)' }}>
              {pct}%
            </span>
          )}
        </div>
      </div>

      <div className="header-right">
        {usingFallback && (
          <span className="fallback-badge">datos demo</span>
        )}
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}
        </button>
        <button
          className={`refresh-btn ${loading ? 'loading' : ''}`}
          onClick={onRefresh}
          disabled={loading}
          title="Actualizar datos"
        >
          <span className={loading ? 'spin' : ''}>↻</span>
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>
    </motion.header>
  )
}
