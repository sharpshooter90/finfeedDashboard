import React from "react";
import { getSentiment, getSentimentChip } from "../../utils";
const Sentiment = React.memo(({ neg, pos }) => {
  const sentiment = getSentiment(neg, pos);

  return (
    <div>
      <div>
        {getSentimentChip(sentiment)}
        {/* , neg: {neg} | pos: {pos} */}
      </div>
    </div>
  );
});

export default Sentiment;
