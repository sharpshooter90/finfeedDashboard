import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { Skeleton } from "@mui/material";
import React, { Fragment } from "react";
import Moment from "react-moment";
import { highlightOccurrence } from "../../utils";
import Sentiment from "../Sentiment";

const NewsItem = ({ newsItem, loading }) => {
  return (
    <Box sx={{ mb: 2, ml: 1 }}>
      <Card
        variant="outlined"
        sx={(theme) => ({
          // ...getSentimentStyle(
          //   getSentiment(
          //     newsItem.negative_sentiment_percentage,
          //     newsItem.positive_sentiment_percentage
          //   )
          // ),
          width: "100%",
          flexDirection: "column",
          cursor: "pointer",
          padding: "12px",
          transition: "transform 0.3s, border 0.3s",
          "&:hover": {
            borderColor: theme.vars.palette.primary.outlinedHoverBorder,
            transform: "translateY(-1px)",
          },
        })}
      >
        {loading ? (
          <Fragment>
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
            <Skeleton animation="wave" width="65%" sx={{ mb: 4 }} />
            <Skeleton animation="wave" width="20%" height={24} />
          </Fragment>
        ) : (
          <Fragment>
            <Typography sx={{ fontWeight: "600" }}>
              <div
                dangerouslySetInnerHTML={{
                  __html: highlightOccurrence(
                    newsItem.newsTitle,
                    newsItem.occurredKeys
                  ),
                }}
              />
            </Typography>
            <Typography level="body2" sx={{ mt: 1 }}>
              <Moment format="MMM Do YYYY h:mm a" date={newsItem?.timestamp} />
            </Typography>
            <Stack direction="row">
              <Sentiment
                pos={newsItem.positive_sentiment_percentage}
                neg={newsItem.negative_sentiment_percentage}
              />
            </Stack>
          </Fragment>
        )}
      </Card>
    </Box>
  );
};

export default NewsItem;
