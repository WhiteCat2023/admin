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
