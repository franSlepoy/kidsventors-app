// Avatar photos saved locally from the KidsVentors Google Drive folder (removebg PNGs)
const AVATAR_FILES = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
  '/avatars/avatar5.png',
]

export function getAvatarUrl(name) {
  const hash = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_FILES[hash % AVATAR_FILES.length]
}

function isStudentRow(row) {
  const v = row.c?.[0]?.v
  return typeof v === 'string' && /^(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/i.test(v)
}

function cellValue(row, i) {
  const c = row.c?.[i]
  return c?.v ?? c?.f ?? null
}

export function parseGVizResponse(rawText) {
  const jsonStr = rawText
    .replace(/^[^(]+\(/, '')   // strip everything up to first (
    .replace(/\);\s*$/, '')    // strip trailing );
  const data = JSON.parse(jsonStr)
  const rows = data.table?.rows ?? []

  return rows
    .filter(isStudentRow)
    .map((row) => {
      const rawId = cellValue(row, 2) ?? ''
      const underscoreIdx = rawId.lastIndexOf('_')
      const name = underscoreIdx > -1 ? rawId.slice(0, underscoreIdx).trim() : rawId.trim()
      const birthdate = underscoreIdx > -1 ? rawId.slice(underscoreIdx + 1) : ''

      return {
        id: rawId,
        name,
        birthdate,
        classDateTime: cellValue(row, 0),
        image: cellValue(row, 1),
        joined: cellValue(row, 3),
        status: cellValue(row, 4),
        birthdayThisWeek: cellValue(row, 5),
        diploma: cellValue(row, 6),
        totalVisits: cellValue(row, 7),
        semaforoScore: cellValue(row, 8),
        experienceBefore: cellValue(row, 9),
        level: cellValue(row, 10),
        language: cellValue(row, 11),
        specialNeeds: cellValue(row, 12),
        teachersComment: cellValue(row, 13),
        teacherLastInteraction: cellValue(row, 14),
        avatarUrl: getAvatarUrl(name),
      }
    })
    .filter((s) => s.name.length > 0)
}
