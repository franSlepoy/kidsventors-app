import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import ClassGroup from './components/ClassGroup'
import StudentProfile from './components/StudentProfile'
import Stars from './components/Stars'
import { useGoogleSheets } from './hooks/useGoogleSheets'

export default function App() {
  const { students, loading, usingFallback, refetch } = useGoogleSheets()
  const [attendance, setAttendance] = useState({})
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('kv-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('kv-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const classTimes = useMemo(() => {
    const seen = new Set()
    return students
      .map(s => s.classDateTime)
      .filter(t => t && !seen.has(t) && seen.add(t))
  }, [students])

  const studentsByClass = useMemo(() => {
    const grouped = {}
    for (const time of classTimes) {
      grouped[time] = students.filter(s => s.classDateTime === time && s.status !== 'canceled')
    }
    return grouped
  }, [students, classTimes])

  const toggleAttendance = (studentId) => {
    setAttendance(prev => {
      const cur = prev[studentId]
      if (cur === 'present') return { ...prev, [studentId]: 'absent' }
      if (cur === 'absent') return { ...prev, [studentId]: null }
      return { ...prev, [studentId]: 'present' }
    })
  }

  const activeStudents = students.filter(s => s.status !== 'canceled')
  const presentCount = Object.values(attendance).filter(v => v === 'present').length
  const totalCount = activeStudents.length

  return (
    <div className="app-container">
      <Stars />

      <Header
        loading={loading}
        onRefresh={refetch}
        presentCount={presentCount}
        totalCount={totalCount}
        usingFallback={usingFallback}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="main-content">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Cargando datos de la planilla...</p>
          </div>
        )}

        {!loading && classTimes.map(classTime => (
          <ClassGroup
            key={classTime}
            classTime={classTime}
            students={studentsByClass[classTime] || []}
            attendance={attendance}
            onToggleAttendance={toggleAttendance}
            onSelectStudent={setSelectedStudent}
          />
        ))}

        {!loading && classTimes.length === 0 && (
          <div className="empty-state">
            <span style={{ fontSize: '4rem' }}>🚀</span>
            <p>No hay clases programadas para hoy.</p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedStudent && (
          <StudentProfile
            key="profile"
            student={selectedStudent}
            attendanceStatus={attendance[selectedStudent.id]}
            onClose={() => setSelectedStudent(null)}
            onToggleAttendance={() => toggleAttendance(selectedStudent.id)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
