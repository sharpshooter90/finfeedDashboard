import React, { useState } from "react";
import { MultiSelect } from "react-multi-select-component";

import { getSentiment } from "../../utils";
import NewsItem from "../NewsItem";

const NewsWrapper = ({ data }) => {
  const [filters, setFilters] = useState({ sentiment: [], entities: [] });

  const sentimentOptions = [
    { label: "Positive", value: "positive" },
    { label: "Negative", value: "negative" },
    { label: "Neutral", value: "neutral" },
    { label: "Mixed", value: "mixed" },
  ];

  const entityOptions = data
    ? data
        .flatMap((item) => item.occurredKeys)
        .filter((value, index, self) => self.indexOf(value) === index)
        .map((entity) => ({ label: entity, value: entity }))
    : [];

  const filteredNewsItems = data
    ? data.filter((newsItem) => {
        const sentiment = getSentiment(
          newsItem.negative_sentiment_percentage,
          newsItem.positive_sentiment_percentage
        );

        const sentimentMatches =
          filters.sentiment.length === 0 ||
          filters.sentiment.some((filter) => filter.value === sentiment);

        const entitiesMatches =
          filters.entities.length === 0 ||
          filters.entities.some((filter) =>
            newsItem.occurredKeys.includes(filter.value)
          );

        return sentimentMatches && entitiesMatches;
      })
    : [];

  return (
    <div>
      <div>
        <h3>Filter by Sentiment:</h3>
        <MultiSelect
          options={sentimentOptions}
          value={filters.sentiment}
          onChange={(selected) =>
            setFilters((prevFilters) => ({
              ...prevFilters,
              sentiment: selected,
            }))
          }
          labelledBy="Select Sentiment"
        />
      </div>
      <div>
        <h3>Filter by Entities:</h3>
        <MultiSelect
          options={entityOptions}
          value={filters.entities}
          onChange={(selected) =>
            setFilters((prevFilters) => ({
              ...prevFilters,
              entities: selected,
            }))
          }
          labelledBy="Select Entities"
        />
      </div>
      {data && (
        <div>
          {filteredNewsItems.length === 0 ? (
            <p>Nothing found</p>
          ) : (
            filteredNewsItems.map((newsItemData, index) => (
              <NewsItem newsItem={newsItemData} key={index} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NewsWrapper;
