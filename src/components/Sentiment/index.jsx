import React from "react";
import { getSentiment, getSentimentChip } from "../../utils";
const Sentiment = React.memo(({ neg, pos }) => {
  const sentiment = getSentiment(neg, pos);

  return (
    <div>
      <p>
        {getSentimentChip(sentiment)}
        {/* , neg: {neg} | pos: {pos} */}
      </p>
    </div>
  );
});

export default Sentiment;
