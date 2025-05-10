// Utility function to conditionally join classNames together
export function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}
