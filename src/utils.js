// textUtils.js
export const countOccurrences = (searchText, content) => {
  if (!searchText || !content) return 0;
  const regex = new RegExp(searchText, "gi");
  const matches = content.match(regex);
  return matches ? matches.length : 0;
};

// sentimentUtils.js
export const getSentiment = (neg, pos) => {
  const negNumber = Number(neg);
  const posNumber = Number(pos);

  if (negNumber === 0 && posNumber === 0) {
    return "neutral";
  } else if (negNumber > 80) {
    return "negative";
  } else if (posNumber > 80) {
    return "positive";
  } else if (posNumber > 0 && negNumber > 0) {
    return "mixed";
  }
};

// generate style based on sentiment use sx={}
export const getSentimentStyle = (sentiment) => {
  switch (sentiment) {
    case "neutral":
      return { borderRight: "3px solid gray" };
    case "negative":
      return { borderRight: "3px solid red" };
    case "positive":
      return { borderRight: "3px solid green" };
    case "mixed":
      return { borderRight: "3px solid orange" };
    default:
      return {};
  }
};
