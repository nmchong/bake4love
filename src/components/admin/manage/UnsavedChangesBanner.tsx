interface UnsavedChangesBannerProps {
  message: string
  visible: boolean
}

export default function UnsavedChangesBanner({ message, visible }: UnsavedChangesBannerProps) {
  if (!visible) return null
  return (
    <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded mb-4 text-center text-sm font-medium">
      {message}
    </div>
  )
}