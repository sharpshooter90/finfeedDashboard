// textUtils.js
export const countOccurrences = (searchText, content) => {
  if (!searchText || !content) return 0;
  const regex = new RegExp(searchText, "gi");
  const matches = content.match(regex);
  return matches ? matches.length : 0;
};
