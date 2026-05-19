import { motion } from 'framer-motion'
import StudentCard from './StudentCard'

function formatTime(dt) {
  if (!dt) return ''
  // e.g. "martes 19/05 16:00"  →  "16:00 hs"
  const parts = dt.trim().split(' ')
  const time = parts[parts.length - 1]
  const datePart = parts.slice(0, -1).join(' ')
  return { time, datePart }
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
}

export default function ClassGroup({ classTime, students, attendance, onToggleAttendance, onSelectStudent }) {
  const { time, datePart } = formatTime(classTime)
  const presentCount = students.filter(s => attendance[s.id] === 'present').length

  return (
    <section className="class-group">
      <motion.div
        className="group-header"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="group-header-left">
          <span className="group-time">{time}</span>
          <span className="group-date">{datePart}</span>
        </div>
        <div className="group-header-right">
          <span className="group-count">
            <span className="gc-present">{presentCount}</span>
            <span className="gc-sep"> / </span>
            <span className="gc-total">{students.length}</span>
            <span className="gc-label"> alumnos</span>
          </span>
        </div>
      </motion.div>

      <motion.div
        className="students-grid"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {students.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            attendanceStatus={attendance[student.id]}
            onToggle={() => onToggleAttendance(student.id)}
            onSelect={onSelectStudent}
          />
        ))}
      </motion.div>
    </section>
  )
}
