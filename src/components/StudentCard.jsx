import { useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

const LEVEL_COLORS = {
  '101 Inicial': { bg: '#1e3a5f', border: '#38BDF8', text: '#7DD3FC' },
  'Intermedia':  { bg: '#3b1f5e', border: '#A78BFA', text: '#C4B5FD' },
  'Avanzada':    { bg: '#3b2a00', border: '#FBBF24', text: '#FDE68A' },
}

const SEMAFORO = [
  null,
  { color: '#F87171', label: 'Iniciando', emoji: '🔴' },
  { color: '#FBBF24', label: 'En progreso', emoji: '🟡' },
  { color: '#FB923C', label: 'Avanzando', emoji: '🟠' },
  { color: '#34D399', label: 'Excelente', emoji: '🟢' },
]

function getFirstName(fullName) {
  return fullName.split(' ')[0]
}

function calcAge(birthdate) {
  if (!birthdate) return null
  const [d, m, y] = birthdate.split('.')
  if (!d || !m || !y) return null
  const birth = new Date(`${y}-${m}-${d}`)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const hasBdPassed = now >= new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
  if (!hasBdPassed) age--
  return age > 0 && age < 25 ? age : null
}

export default function StudentCard({ student, attendanceStatus, onToggle, onSelect }) {
  const btnRef = useRef(null)
  const lvlStyle = LEVEL_COLORS[student.level] || { bg: '#1a1545', border: '#6D28D9', text: '#A78BFA' }
  const semaforo = SEMAFORO[student.semaforoScore] || null
  const age = calcAge(student.birthdate)
  const isPresent = attendanceStatus === 'present'
  const isAbsent = attendanceStatus === 'absent'

  const handleToggle = (e) => {
    e.stopPropagation()
    if (!isPresent) {
      const rect = btnRef.current?.getBoundingClientRect()
      confetti({
        particleCount: 60,
        spread: 70,
        origin: {
          x: (rect ? rect.left + rect.width / 2 : window.innerWidth / 2) / window.innerWidth,
          y: (rect ? rect.top : window.innerHeight / 2) / window.innerHeight,
        },
        colors: ['#FBBF24', '#7C3AED', '#34D399', '#38BDF8', '#F472B6'],
        scalar: 0.9,
      })
    }
    onToggle()
  }

  return (
    <motion.div
      className={`student-card ${isPresent ? 'present' : ''} ${isAbsent ? 'absent' : ''}`}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect(student)}
    >
      {/* Avatar */}
      <div className="card-avatar-wrap">
        <div className={`card-avatar-ring ${isPresent ? 'ring-present' : isAbsent ? 'ring-absent' : ''}`}>
          <img
            src={student.avatarUrl}
            alt={student.name}
            className="card-avatar"
            onError={e => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=7C3AED&color=fff&size=120&bold=true&font-size=0.4`
            }}
          />
        </div>
        {isPresent && <span className="present-badge">✓</span>}
        {isAbsent && <span className="absent-badge">✗</span>}
      </div>

      {/* Info */}
      <div className="card-info">
        <h3 className="card-name" title={student.name}>{getFirstName(student.name)}</h3>
        <p className="card-surname">{student.name.split(' ').slice(1).join(' ')}</p>
        {age && <p className="card-age">{age} años</p>}
      </div>

      {/* Level + stats */}
      <div className="card-meta">
        {student.level && (
          <span
            className="level-badge"
            style={{ background: lvlStyle.bg, borderColor: lvlStyle.border, color: lvlStyle.text }}
          >
            {student.level}
          </span>
        )}
        <div className="card-stats">
          <span className="stat-item" title="Clases totales">
            <span className="stat-icon">📅</span>
            <span>{student.totalVisits ?? '–'}</span>
          </span>
          {semaforo && (
            <span className="stat-item" title={semaforo.label}>
              <span>{semaforo.emoji}</span>
            </span>
          )}
          {student.language && (
            <span className="stat-item" title="Programa">
              <span className="stat-icon">🧩</span>
              <span>{student.language}</span>
            </span>
          )}
        </div>
      </div>

      {/* Attendance button */}
      <button
        ref={btnRef}
        className={`attend-btn ${isPresent ? 'btn-present' : isAbsent ? 'btn-absent' : 'btn-neutral'}`}
        onClick={handleToggle}
      >
        {isPresent ? '✓ Presente' : isAbsent ? '✗ Ausente' : '○ Tomar asistencia'}
      </button>
    </motion.div>
  )
}
