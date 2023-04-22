import { Box, Stack } from "@mui/joy";
import { Typography } from "@mui/material";
import React, { useContext } from "react";
import { MultiSelect } from "react-multi-select-component";
import NewsFilterContext from "../../store/newsFilterStore";
import { getSentiment } from "../../utils";
import NewsItem from "../NewsItem";

const NewsWrapper = ({ data }) => {
  const { filters, setFilters } = useContext(NewsFilterContext);

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
      <Stack direction="row" gap={2} mb={1} padding={1}>
        <Box width="100%">
          <Typography>Filter by Sentiment:</Typography>
          <MultiSelect
            options={sentimentOptions}
            value={filters.sentiment}
            onChange={(selected) => {
              setFilters((prevFilters) => ({
                ...prevFilters,
                sentiment: selected,
              }));
            }}
            // labelledBy="Select Sentiment"
            placeholder="Filter by Sentiment"
          />
        </Box>
        <Box width="100%">
          <Typography>Filter by Entities:</Typography>
          <MultiSelect
            options={entityOptions}
            value={filters.entities}
            onChange={(selected) => {
              setFilters((prevFilters) => ({
                ...prevFilters,
                entities: selected,
              }));
            }}
            // labelledBy="Select Entities"
            placeholder="Filter by Entities"
          />
        </Box>
      </Stack>
      {data && (
        <div>
          {filteredNewsItems?.length === 0 ? (
            <p>
              Nothing found for sentiment {filters?.sentiment[0].value} and
              entity {filters?.entities[0].value}
            </p>
          ) : (
            filteredNewsItems?.map((newsItemData, index) => (
              <NewsItem newsItem={newsItemData} key={index} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NewsWrapper;
