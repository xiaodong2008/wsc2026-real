export const ROOM_COLOR = {
  room1: '#3D7AE8',
  room2: '#1FA887',
  room3: '#7C5EC7',
  room4: '#D45F84',
  hall: '#C48A2A',
  roadshow: '#2A9BB8',
  publicarea: '#6D84A8',
  neutral: '#8A99B0',
}

export function dotStyle(room) {
  const color = ROOM_COLOR[room]
  return color ? { background: color } : {}
}
