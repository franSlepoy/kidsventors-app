import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import SkillTreeView from './SkillTree/SkillTreeView'

const SEMAFORO = [
  null,
  { color: '#F87171', label: 'Iniciando',   emoji: '🔴', desc: 'Recién empezando'        },
  { color: '#FBBF24', label: 'En progreso', emoji: '🟡', desc: 'Desarrollando habilidades'},
  { color: '#FB923C', label: 'Avanzando',   emoji: '🟠', desc: 'Buen progreso'            },
  { color: '#34D399', label: 'Excelente',   emoji: '🟢', desc: '¡Domina los temas!'       },
]

const LEVEL_COLORS = {
  '101 Inicial': '#38BDF8',
  'Intermedia':  '#A78BFA',
  'Avanzada':    '#FBBF24',
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

function formatBirthdate(bd) {
  if (!bd) return null
  const [d, m, y] = bd.split('.')
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
                  'septiembre','octubre','noviembre','diciembre']
  return `${parseInt(d)} de ${months[parseInt(m) - 1]} de ${y}`
}

export default function StudentProfile({ student, attendanceStatus, onClose, onToggleAttendance }) {
  const [showTree, setShowTree] = useState(false)

  const semaforo   = SEMAFORO[student.semaforoScore] || null
  const age        = calcAge(student.birthdate)
  const isPresent  = attendanceStatus === 'present'
  const isAbsent   = attendanceStatus === 'absent'
  const levelColor = LEVEL_COLORS[student.level] || '#A78BFA'

  const handleMarkPresent = () => {
    if (!isPresent) {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#FBBF24', '#7C3AED', '#34D399', '#38BDF8', '#F472B6'],
      })
    }
    onToggleAttendance()
  }

  return (
    <>
      <motion.div
        className="profile-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="profile-modal"
          initial={{ scale: 0.85, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button className="profile-close" onClick={onClose}>✕</button>

          {/* Avatar section */}
          <div className="profile-top">
            <div className={`profile-avatar-ring ${isPresent ? 'ring-present' : isAbsent ? 'ring-absent' : ''}`}>
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="profile-avatar"
                onError={e => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=7C3AED&color=fff&size=200&bold=true&font-size=0.35`
                }}
              />
            </div>
            <div className="profile-name-block">
              <h2 className="profile-name">{student.name}</h2>
              {age && (
                <p className="profile-age">
                  🎂 {age} años {student.birthdayThisWeek ? '· 🎉 ¡Cumpleaños esta semana!' : ''}
                </p>
              )}
              {student.birthdate && <p className="profile-birth">{formatBirthdate(student.birthdate)}</p>}
            </div>
          </div>

          {/* Stats grid */}
          <div className="profile-stats">
            <div className="pstat-card">
              <span className="pstat-icon">📅</span>
              <span className="pstat-value">{student.totalVisits ?? '–'}</span>
              <span className="pstat-label">Clases</span>
            </div>

            <div className="pstat-card" style={{ borderColor: levelColor }}>
              <span className="pstat-icon">🎓</span>
              <span className="pstat-value" style={{ color: levelColor, fontSize: '1rem' }}>
                {student.level || '–'}
              </span>
              <span className="pstat-label">Nivel</span>
            </div>

            {semaforo && (
              <div className="pstat-card" style={{ borderColor: semaforo.color }}>
                <span className="pstat-icon">{semaforo.emoji}</span>
                <span className="pstat-value" style={{ color: semaforo.color, fontSize: '0.95rem' }}>
                  {semaforo.label}
                </span>
                <span className="pstat-label">Progreso</span>
              </div>
            )}

            {student.language && (
              <div className="pstat-card">
                <span className="pstat-icon">🧩</span>
                <span className="pstat-value" style={{ fontSize: '1rem' }}>{student.language}</span>
                <span className="pstat-label">Programa</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="profile-details">
            {student.experienceBefore && student.experienceBefore !== 'No' && (
              <div className="detail-row">
                <span className="detail-icon">💡</span>
                <span><strong>Experiencia previa:</strong> {student.experienceBefore}</span>
              </div>
            )}
            {student.specialNeeds && (
              <div className="detail-row detail-note">
                <span className="detail-icon">📌</span>
                <span><strong>Nota:</strong> {student.specialNeeds}</span>
              </div>
            )}
            {student.teachersComment && (
              <div className="detail-row detail-comment">
                <span className="detail-icon">💬</span>
                <span><strong>Comentario del profe:</strong> {student.teachersComment}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <button
              className={`attend-btn large ${isPresent ? 'btn-present' : isAbsent ? 'btn-absent' : 'btn-neutral'}`}
              onClick={handleMarkPresent}
            >
              {isPresent ? '✓ Presente hoy' : isAbsent ? '✗ Ausente hoy' : '○ Marcar asistencia'}
            </button>

            <button
              className="tree-open-btn"
              onClick={() => setShowTree(true)}
            >
              🌳 Ver árbol de progreso
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Skill Tree full-screen overlay */}
      <AnimatePresence>
        {showTree && (
          <SkillTreeView
            student={student}
            onClose={() => setShowTree(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
