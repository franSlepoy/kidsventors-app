import { useState, useEffect, useCallback } from 'react'
import { parseGVizResponse } from '../utils/parseSheets'

const SHEET_ID = '1Ct5P6bnTT0OuVa6KWS8EgwkBhMg49dek5KqjxsR9f-Q'
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`

// Fallback data in case the sheet isn't publicly accessible
const FALLBACK = [
  { id: 'Fausto Seijas_09.01.2019', name: 'Fausto Seijas', birthdate: '09.01.2019', classDateTime: 'martes 19/05 16:00', status: 'active', totalVisits: 32, semaforoScore: 3, level: '101 Inicial', language: 'Lego', experienceBefore: 'No' },
  { id: 'Lucía Violante_03.12.2013', name: 'Lucía Violante', birthdate: '03.12.2013', classDateTime: 'martes 19/05 16:00', status: 'active', totalVisits: 11, semaforoScore: null, level: '101 Inicial', language: 'Lego', experienceBefore: null },
  { id: 'Jazmin Langellotti_02.08.2014', name: 'Jazmin Langellotti', birthdate: '02.08.2014', classDateTime: 'martes 19/05 16:00', status: 'active', totalVisits: 35, semaforoScore: 1, level: 'Intermedia', language: 'Lego', experienceBefore: 'No' },
  { id: 'Sebastian Langellotti_22.09.2016', name: 'Sebastian Langellotti', birthdate: '22.09.2016', classDateTime: 'martes 19/05 16:00', status: 'active', totalVisits: 34, semaforoScore: 1, level: 'Intermedia', language: 'Lego', experienceBefore: 'No' },
  { id: 'Juana Montenegro_17.02.2017', name: 'Juana Montenegro', birthdate: '17.02.2017', classDateTime: 'martes 19/05 16:00', status: 'active', totalVisits: 27, semaforoScore: 2, level: 'Intermedia', language: 'Lego', experienceBefore: 'No' },
  { id: 'Miranda Singh_28.07.2016', name: 'Miranda Singh', birthdate: '28.07.2016', classDateTime: 'martes 19/05 16:00', status: 'active', totalVisits: 8, semaforoScore: 3, level: '101 Inicial', language: 'Lego', experienceBefore: 'No' },
  { id: 'Nicolas Barraza_27.01.2019', name: 'Nicolas Barraza', birthdate: '27.01.2019', classDateTime: 'martes 19/05 17:00', status: 'active', totalVisits: 36, semaforoScore: 4, level: 'Intermedia', language: 'Lego', specialNeeds: 'Es un poco inquieto' },
  { id: 'Benjamin Mencia_06.06.2015', name: 'Benjamin Mencia', birthdate: '06.06.2015', classDateTime: 'martes 19/05 17:00', status: 'active', totalVisits: 16, semaforoScore: 3, level: '101 Inicial', language: 'Lego', experienceBefore: 'No' },
  { id: 'Tomás Algieri_29.02.2016', name: 'Tomás Algieri', birthdate: '29.02.2016', classDateTime: 'martes 19/05 17:00', status: 'active', totalVisits: 5, semaforoScore: 3, level: '101 Inicial', language: 'Lego', experienceBefore: 'No' },
  { id: 'Inti Irrazabal_08.01.2020', name: 'Inti Irrazabal', birthdate: '08.01.2020', classDateTime: 'martes 19/05 17:00', status: 'active', totalVisits: 4, semaforoScore: 3, level: '101 Inicial', language: 'Lego', experienceBefore: 'No' },
  { id: 'Santiago Méndez_15.11.2018', name: 'Santiago Méndez', birthdate: '15.11.2018', classDateTime: 'martes 19/05 17:00', status: 'active', totalVisits: 10, semaforoScore: 3, level: '101 Inicial', language: 'Lego', experienceBefore: 'No' },
  { id: 'Harrison Escalada_16.07.2015', name: 'Harrison Escalada', birthdate: '16.07.2015', classDateTime: 'martes 19/05 18:00', status: 'active', totalVisits: 12, semaforoScore: 3, level: '101 Inicial', language: 'Lego' },
  { id: 'Dalmiro Aguero_05.08.2015', name: 'Dalmiro Aguero', birthdate: '05.08.2015', classDateTime: 'martes 19/05 18:00', status: 'active', totalVisits: 11, semaforoScore: 3, level: '101 Inicial', language: 'Lego' },
  { id: 'Matias Rivera_30.04.2016', name: 'Matias Rivera', birthdate: '30.04.2016', classDateTime: 'martes 19/05 18:00', status: 'active', totalVisits: 10, semaforoScore: 3, level: '101 Inicial', language: 'Lego' },
  { id: 'Ramiro Recalde_21.11.2014', name: 'Ramiro Recalde', birthdate: '21.11.2014', classDateTime: 'martes 19/05 18:00', status: 'active', totalVisits: 11, semaforoScore: 3, level: '101 Inicial', language: 'Lego' },
  { id: 'Simón Amenedo_27.07.2015', name: 'Simón Amenedo', birthdate: '27.07.2015', classDateTime: 'martes 19/05 18:00', status: 'active', totalVisits: 9, semaforoScore: 3, level: '101 Inicial', language: 'Lego' },
  { id: 'Facundo Santos_01.02.2016', name: 'Facundo Santos', birthdate: '01.02.2016', classDateTime: 'martes 19/05 18:00', status: 'active', totalVisits: 8, semaforoScore: 3, level: '101 Inicial', language: 'Lego' },
  { id: 'Martiniano Bustamante_01.09.2014', name: 'Martiniano Bustamante', birthdate: '01.09.2014', classDateTime: 'martes 19/05 18:00', status: 'active', totalVisits: 7, semaforoScore: 3, level: '101 Inicial', language: 'Lego' },
]

function enrichFallback(students) {
  return students.map(s => ({
    ...s,
    image: null,
    joined: null,
    birthdayThisWeek: null,
    diploma: null,
    teachersComment: null,
    teacherLastInteraction: null,
    avatarUrl: `${import.meta.env.BASE_URL}avatars/avatar${(Array.from(s.name).reduce((a,c)=>a+c.charCodeAt(0),0)%5)+1}.png`,
  }))
}

export function useGoogleSheets() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(URL)
      const text = await res.text()
      const parsed = parseGVizResponse(text)
      if (parsed.length === 0) throw new Error('Sin datos')
      setStudents(parsed)
      setUsingFallback(false)
    } catch (err) {
      console.warn('Sheet fetch failed, using fallback data:', err.message)
      setStudents(enrichFallback(FALLBACK))
      setUsingFallback(true)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchData])

  return { students, loading, error, usingFallback, refetch: fetchData }
}
