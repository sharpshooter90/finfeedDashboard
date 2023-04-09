import MoodIcon from "@mui/icons-material/Mood";
import MoodBadIcon from "@mui/icons-material/MoodBad";
import SentimentNeutralOutlinedIcon from "@mui/icons-material/SentimentNeutralOutlined";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Chip from "@mui/joy/Chip";
import Divider from "@mui/joy/Divider";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import BubbleChart from "./components/EntitiesBubbleChart";

import { countOccurrences } from "./utils";

const StyledFullHeightContainer = styled.div`
  height: 100vh;
`;

const StyledNewsContainer = styled.div`
  height: 100vh;
  overflow-y: scroll;
  padding-right: 48px;
`;

function Sentiment({ pos, neg }) {
  let sentiment;
  if (pos > 0 || neg > 0) {
    sentiment = (
      <React.Fragment>
        <Chip
          variant="outlined"
          color="primary"
          size="sm"
          sx={{ pointerEvents: "none" }}
          startDecorator={
            <MoodIcon
              fontSize="small"
              sx={{ color: pos === 0 ? "lightgrey" : "green" }}
            />
          }
          disabled={pos === 0}
        >
          <Typography
            level="body3"
            sx={{ fontWeight: "md", color: "text.secondary" }}
          >
            &nbsp;Positive&nbsp;
            {pos}%
          </Typography>
        </Chip>

        <Divider orientation="vertical" />

        <Chip
          variant="outlined"
          color="primary"
          size="sm"
          sx={{ pointerEvents: "none" }}
          startDecorator={
            <MoodBadIcon
              fontSize="small"
              sx={{ color: neg === 0 ? "lightgrey" : "crimson" }}
            />
          }
          disabled={neg === 0}
        >
          <Typography
            level="body3"
            sx={{ fontWeight: "md", color: "text.secondary" }}
          >
            &nbsp;Negative&nbsp;{neg}%
          </Typography>
        </Chip>
      </React.Fragment>
    );
  } else {
    sentiment = (
      <Chip
        variant="outlined"
        color="primary"
        size="sm"
        sx={{ pointerEvents: "none" }}
        startDecorator={
          <SentimentNeutralOutlinedIcon
            fontSize="small"
            sx={{ color: "text.primary" }}
          />
        }
      >
        <Typography
          level="body3"
          sx={{ fontWeight: "md", color: "text.primary" }}
        >
          &nbsp;Neutral&nbsp;
        </Typography>
      </Chip>
    );
  }

  return <React.Fragment>{sentiment}</React.Fragment>;
}

const NewsItem = ({ newsItem, index }) => {
  const [isOccurredWordsVisible, setIsOccurredWordsVisible] = useState(false);

  const toggleOccurredWordsVisibility = () => {
    setIsOccurredWordsVisible(!isOccurredWordsVisible);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Card
        variant="outlined"
        sx={(theme) => ({
          width: "100%",
          flexDirection: "column",
          gap: "16px",
          padding: "16px",
          transition: "transform 0.3s, border 0.3s",
          "&:hover": {
            borderColor: theme.vars.palette.primary.outlinedHoverBorder,
            transform: "translateY(-2px)",
          },
        })}
      >
        <Typography level="h2" sx={{ fontSize: "md" }} mb={0.5}>
          {newsItem.newsTitle}
        </Typography>
        <Typography level="body2">{newsItem.timestamp}</Typography>
        <Box sx={{ display: "flex" }}>
          <Typography level="body2" onClick={toggleOccurredWordsVisibility}>
            Word occurrence: {newsItem.totalCount}
          </Typography>
        </Box>
        {isOccurredWordsVisible && (
          <Typography level="body2">
            Occurred words: {newsItem.occurredKeys.join(", ")}
          </Typography>
        )}

        <Stack direction="row" spacing={2}>
          <Sentiment
            pos={newsItem.positive_sentiment_percentage}
            neg={newsItem.negative_sentiment_percentage}
          />
        </Stack>
      </Card>
    </Box>
  );
};

function App() {
  const [data, setData] = useState(null);
  const [entities, setEntities] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const parseNewsData = async (data) => {
    const response = JSON.parse(data);
    const rawData = response.data;
    setEntities(response.entities);
    const rawEntities = response.entities;
    const keys = Object.keys(rawEntities);

    const parsedData = await Promise.all(
      rawData.map(async (item) => {
        const [newsTitle, timestamp] = item.split("\t");
        const occurredKeys = keys.filter(
          (key) => countOccurrences(key, newsTitle) > 0
        );
        const totalCount = occurredKeys.reduce(
          (acc, key) => acc + countOccurrences(key, newsTitle),
          0
        );

        const sentimentResponse = await axios.post(
          "https://api.text-miner.com/sentiment",
          `message=${newsTitle}`,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        const pos = sentimentResponse.data.positive_sentiment_percentage;
        const neg = sentimentResponse.data.negative_sentiment_percentage;

        return {
          newsTitle,
          timestamp,
          occurredKeys,
          totalCount,
          positive_sentiment_percentage: pos,
          negative_sentiment_percentage: neg,
        };
      })
    );

    return parsedData;
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://biz-api.text-miner.com/finfeed/polygon/all"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseJSON = await response.json();
      const parsedData = await parseNewsData(responseJSON);
      setData(parsedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const dataArray = [
    {
      label: "Dividend Income",
      value: 1,
      positive_sentiment_percentage: "100",
      negative_sentiment_percentage: "0",
    },
    {
      label: "Silicon Valley Bank's",
      value: 1,
      positive_sentiment_percentage: "100",
      negative_sentiment_percentage: "0",
    },
    {
      label: "Bank Stocks Worth Buying",
      value: 1,
      positive_sentiment_percentage: "100",
      negative_sentiment_percentage: "0",
    },
    {
      label: "Bank 'Could Be Next Shoe",
      value: 1,
      positive_sentiment_percentage: "100",
      negative_sentiment_percentage: "0",
    },
    {
      label: "Talking Banks and",
      value: 1,
      positive_sentiment_percentage: "100",
      negative_sentiment_percentage: "0",
    },
    {
      label: "First Republic Bank Stock",
      value: 1,
      positive_sentiment_percentage: "100",
      negative_sentiment_percentage: "0",
    },
    {
      label: "Liquid Media Group Ltd.",
      value: 4,
      positive_sentiment_percentage: "0",
      negative_sentiment_percentage: "100",
    },
    {
      label: "Millennium Group International Holdings Limited",
      value: 1,
      positive_sentiment_percentage: "100",
      negative_sentiment_percentage: "0",
    },
    {
      label: "Texas Capital Bancshares, Inc.",
      value: 1,
      positive_sentiment_percentage: "100",
      negative_sentiment_percentage: "0",
    },
    {
      label: "Kentucky First Federal Bancorp Announces Payment",
      value: 1,
      positive_sentiment_percentage: "100",
      negative_sentiment_percentage: "0",
    },
    {
      label: "Honeywell International Inc.",
      value: 1,
      positive_sentiment_percentage: "100",
      negative_sentiment_percentage: "0",
    },
  ];

  return (
    <StyledFullHeightContainer className="App" style={{ display: "flex" }}>
      <StyledNewsContainer style={{ width: "460px" }}>
        {data ? (
          <div>
            {data?.map((newsItem, index) => {
              return <NewsItem newsItem={newsItem} index={index} />;
            })}
          </div>
        ) : (
          <p>Loading data...</p>
        )}
      </StyledNewsContainer>
      {console.log("entities", data)}
      {entities && (
        <div>
          <BubbleChart data={dataArray} width={800} height={600} />
        </div>
      )}
      <div>Pie Chart</div>
    </StyledFullHeightContainer>
  );
}

export default App;
