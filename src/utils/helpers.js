/**
 * Get initials from a name string
 * @param {string} name - The full name
 * @returns {string} - The initials in uppercase
 */
export const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

/**
 * Format a date as time ago (e.g., "5m ago", "2h ago")
 * @param {Date} date - The date to format
 * 
 */

export const formatTimeAgo = (date, now = new Date()) => {
        if (!date) return "..."
    
        const diff = now - date
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)
        const weeks = Math.floor(days / 7)
        const months = Math.floor(days / 30)
    
        if (seconds < 60) return "Just now"
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        if (weeks < 5) return `${weeks}w ago`
        if (months < 12) return `${months}mo ago`
    
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }