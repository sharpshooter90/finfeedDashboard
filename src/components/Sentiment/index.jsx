import React from "react";
import { getSentiment } from "../../utils";
const Sentiment = React.memo(({ neg, pos }) => {
  const sentiment = getSentiment(neg, pos);

  return (
    <div>
      <p>
        Sentiment: {sentiment}, neg: {neg} | pos: {pos}
      </p>
    </div>
  );
});

export default Sentiment;
