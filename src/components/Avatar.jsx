const Avatar = ({ name = '', size = 'md', online = false }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('')

  // Generate a consistent hue from the name
  const hue = name
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold select-none`}
        style={{
          background: `hsl(${hue}, 55%, 28%)`,
          color: `hsl(${hue}, 80%, 78%)`,
          border: `1.5px solid hsl(${hue}, 45%, 22%)`,
        }}
      >
        {initials || '?'}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent rounded-full border-2 border-surface-2" />
      )}
    </div>
  )
}

export default Avatar
