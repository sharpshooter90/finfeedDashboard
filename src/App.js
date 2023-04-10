import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import FeedIcon from "@mui/icons-material/Feed";
import MoodIcon from "@mui/icons-material/Mood";
import MoodBadIcon from "@mui/icons-material/MoodBad";
import SentimentNeutralOutlinedIcon from "@mui/icons-material/SentimentNeutralOutlined";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Chip from "@mui/joy/Chip";
import Divider from "@mui/joy/Divider";
import Stack from "@mui/joy/Stack";
import Switch from "@mui/joy/Switch";
import Typography from "@mui/joy/Typography";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Moment from "react-moment";
import styled from "styled-components";

import BubbleChart from "./components/EntitiesBubbleChart";
import SentimentPieChart from "./components/SentimentPieChart";
import "./styles.css";

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

function highlightOccurrence(newsTitle, occurredKeys) {
  if (!occurredKeys.length) {
    // no occurred keys, return original newsTitle
    return newsTitle;
  }
  const regex = new RegExp(`(${occurredKeys.join("|")})`, "gi");
  return newsTitle.replace(
    regex,
    '<span class="text-occurrence-highlight">$1</span>'
  );
}

const NewsItem = ({ newsItem, index }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Card
        variant="outlined"
        sx={(theme) => ({
          width: "100%",
          flexDirection: "column",
          gap: "16px",
          padding: "16px",
          cursor: "pointer",
          transition: "transform 0.3s, border 0.3s",
          "&:hover": {
            borderColor: theme.vars.palette.primary.outlinedHoverBorder,
            transform: "translateY(-2px)",
          },
        })}
      >
        <Typography level="h2" sx={{ fontSize: "md" }} mb={0.5}>
          <div
            dangerouslySetInnerHTML={{
              __html: highlightOccurrence(
                newsItem.newsTitle,
                newsItem.occurredKeys
              ),
            }}
          />
        </Typography>
        <Typography level="body2">
          <Moment format="MMM Do YYYY h:mm a" date={newsItem?.timestamp} />
        </Typography>
        <Box sx={{ display: "flex" }}>
          {newsItem?.occurredKeys?.map((item) => {
            return (
              <Chip
                variant="outlined"
                color="primary"
                size="sm"
                sx={{ pointerEvents: "none" }}
              >
                <Typography
                  level="body3"
                  sx={{ fontWeight: "md", color: "text.secondary" }}
                >
                  {item}
                </Typography>
              </Chip>
            );
          })}
        </Box>

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

const toggleHighlight = (highlightTextChecked) => {
  if (highlightTextChecked) {
    document.body.classList.add("isTextOccuranceHighlightEnabled");
  } else {
    document.body.classList.remove("isTextOccuranceHighlightEnabled");
  }
};

function App() {
  const [data, setData] = useState(null);
  const [entities, setEntities] = useState(null);
  const [sentimentData, setsentimentData] = useState(null);
  const [bubbleChartData, setBubbleChartData] = useState(null);
  const [selectedSource, setSelectedSource] = useState("WSJ");
  const [highlightTextChecked, setHighlightTextChecked] = React.useState(false);
  const [tabValue, setTabValue] = useState(0);

  const isMobile = useMediaQuery("(max-width: 600px)");
  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const parseNewsData = async (data) => {
    // Add counters for positive, negative, and neutral sentiment
    let posCount = 0;
    let negCount = 0;
    let neuCount = 0;

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

        // Update sentiment counters
        if (pos > 0) {
          posCount++;
        } else if (neg > 0) {
          negCount++;
        } else {
          neuCount++;
        }

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

    // Calculate the percentages
    const totalNews = parsedData.length;
    const posPercentage = (posCount / totalNews) * 100;
    const negPercentage = (negCount / totalNews) * 100;
    const neuPercentage = (neuCount / totalNews) * 100;

    // Set the sentimentData state
    setsentimentData({
      positive: posPercentage,
      negative: negPercentage,
      neutral: neuPercentage,
    });

    // Call the createBubbleChartData function and set the bubbleChartData state
    const dataArray = createBubbleChartData(parsedData);
    setBubbleChartData(dataArray);

    return parsedData;
  };

  const handleSourceChange = (e) => {
    setSelectedSource(e.target.value);
    fetchData(e.target.value);
  };

  const fetchData = async (source = "WSJ") => {
    const apiUrl = `https://biz-api.text-miner.com/finfeed/${source.toLowerCase()}/all`;

    try {
      const response = await fetch(apiUrl);
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

  const createBubbleChartData = (parsedData) => {
    const sentimentCounts = {};

    parsedData.forEach((item) => {
      item.occurredKeys.forEach((key) => {
        if (!sentimentCounts[key]) {
          sentimentCounts[key] = {
            label: key,
            value: 0,
            positive_sentiment_percentage: 0,
            negative_sentiment_percentage: 0,
          };
        }
        sentimentCounts[key].value += 1;
        sentimentCounts[key].positive_sentiment_percentage +=
          item.positive_sentiment_percentage;
        sentimentCounts[key].negative_sentiment_percentage +=
          item.negative_sentiment_percentage;
      });
    });

    Object.values(sentimentCounts).forEach((item) => {
      item.positive_sentiment_percentage /= item.value;
      item.negative_sentiment_percentage /= item.value;
    });

    return Object.values(sentimentCounts);
  };

  const handleSwitchChange = (event) => {
    setHighlightTextChecked(event.target.checked);
    toggleHighlight(event.target.checked);
  };

  if (isMobile) {
    return (
      <div>
        <select value={selectedSource} onChange={handleSourceChange}>
          <option value="WSJ">WSJ</option>
          <option value="CNBC">CNBC</option>
          <option value="Polygon">Polygon</option>
        </select>
        <Typography
          component="label"
          endDecorator={
            <Switch
              checked={highlightTextChecked}
              onChange={handleSwitchChange}
              sx={{ ml: 1 }}
            />
          }
        >
          Highlight Word Occurances
        </Typography>
        {tabValue === 0 && (
          <div>
            {data ? (
              <div>
                {data?.map((newsItem, index) => {
                  return <NewsItem newsItem={newsItem} index={index} />;
                })}
              </div>
            ) : (
              <p>Loading data...</p>
            )}
          </div>
        )}
        {tabValue === 1 && (
          <div>
            {entities && (
              <div>
                <BubbleChart data={bubbleChartData} width={300} height={300} />
              </div>
            )}
          </div>
        )}
        {tabValue === 2 && (
          <Box m={1} p={2}>
            <SentimentPieChart sentimentData={sentimentData} />
          </Box>
        )}

        <Paper
          sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000 }}
          elevation={6}
        >
          <BottomNavigation showLabels value={tabValue} onChange={handleChange}>
            <BottomNavigationAction label="News Feeds" icon={<FeedIcon />} />
            <BottomNavigationAction
              label="Bubble Chart"
              icon={<BubbleChartIcon />}
            />
            <BottomNavigationAction
              label="Pie Chart"
              icon={<DonutLargeIcon />}
            />
          </BottomNavigation>
        </Paper>
      </div>
    );
  }

  return (
    <StyledFullHeightContainer className="App" style={{ display: "flex" }}>
      <StyledNewsContainer style={{ width: "460px" }}>
        <select value={selectedSource} onChange={handleSourceChange}>
          <option value="WSJ">WSJ</option>
          <option value="CNBC">CNBC</option>
          <option value="Polygon">Polygon</option>
        </select>
        <Typography
          component="label"
          endDecorator={
            <Switch
              checked={highlightTextChecked}
              onChange={handleSwitchChange}
              sx={{ ml: 1 }}
            />
          }
        >
          Highlight Word Occurances
        </Typography>

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
      {console.log("entities", bubbleChartData)}
      {entities && (
        <div>
          <BubbleChart data={bubbleChartData} width={800} height={600} />
        </div>
      )}
      <div>
        <SentimentPieChart sentimentData={sentimentData} />
      </div>
    </StyledFullHeightContainer>
  );
}

export default App;
