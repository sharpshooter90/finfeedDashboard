import { Box, Stack } from "@mui/joy";
import Alert from "@mui/joy/Alert";
import { Typography } from "@mui/material";
import React, { Fragment, useContext } from "react";
import { MultiSelect } from "react-multi-select-component";
import NewsFilterContext from "../../store/newsFilterStore";
import { getSentiment } from "../../utils";
import NewsItem from "../NewsItem";

const NewsWrapper = ({ data, loading }) => {
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
        <Box sx={{ width: "calc(50% - 16px/2)" }}>
          <Typography>Filter by Sentiment:</Typography>
          <MultiSelect
            options={sentimentOptions}
            value={filters.sentiment}
            style={{ flexShrink: 0, flexGrow: 0 }}
            onChange={(selected) => {
              setFilters((prevFilters) => ({
                ...prevFilters,
                sentiment: selected,
              }));
            }}
            // labelledBy="Select Sentiment"
            placeholder="Filter by Sentiment"
            isLoading={loading}
          />
        </Box>
        <Box sx={{ width: "calc(50% - (16px/2))" }}>
          <Typography>Filter by Entities:</Typography>
          <MultiSelect
            options={entityOptions}
            value={filters.entities}
            style={{ flexShrink: 0, flexGrow: 0 }}
            onChange={(selected) => {
              setFilters((prevFilters) => ({
                ...prevFilters,
                entities: selected,
              }));
            }}
            // labelledBy="Select Entities"
            placeholder="Filter by Entities"
            isLoading={loading}
          />
        </Box>
      </Stack>
      {loading && (
        <Fragment>
          {[...Array(10)].map((_, index) => (
            <NewsItem key={index} loading={loading} />
          ))}
        </Fragment>
      )}
      {data && (
        <Box mb={16}>
          {filteredNewsItems?.length === 0 && loading === false ? (
            <Box p={2}>
              <Alert variant="soft">
                Nothing found for sentiment {filters?.sentiment[0]?.value} and
                entity {filters?.entities[0]?.value}
              </Alert>
            </Box>
          ) : (
            filteredNewsItems?.map((newsItemData, index) => (
              <NewsItem newsItem={newsItemData} key={index} loading={loading} />
            ))
          )}
        </Box>
      )}
    </div>
  );
};

export default NewsWrapper;
