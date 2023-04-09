// TextOccurrenceChecker.jsx
import React from "react";
import { countOccurrences } from "../../utils";

const TextOccurrenceChecker = ({ searchText, content }) => {
  const occurrenceCount = countOccurrences(searchText, content);

  return (
    <div>
      <p>
        The text <strong>"{searchText}"</strong> occurs{" "}
        <strong>{occurrenceCount}</strong> time{occurrenceCount !== 1 && "s"} in
        the content.
      </p>
    </div>
  );
};

export default TextOccurrenceChecker;
