export function formatSessionTitle(content: string) {
  if (!content) {
    return 'New Session';
  }
  return content.length > 30 ? `${content.slice(0, 30)}...` : content;
}
