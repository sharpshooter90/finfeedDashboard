import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import FeedIcon from "@mui/icons-material/Feed";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";

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
import AppBar from "@mui/material/AppBar";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import NativeSelect from "@mui/material/NativeSelect";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import Moment from "react-moment";
import styled from "styled-components";

import EmptyState from "./components/EmptyState";
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
          overflow: "hidden",
          "&:hover": {
            borderColor: theme.vars.palette.primary.outlinedHoverBorder,
            transform: "translateY(-2px)",
          },
        })}
      >
        <Typography
          level="h2"
          sx={{ fontSize: "md", overflowX: "scroll" }}
          mb={0.5}
        >
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

function App(props) {
  const [globalLoading, setGlobalLoading] = useState(true);
  const [data, setData] = useState(null);
  const [entities, setEntities] = useState(null);
  const [sentimentData, setsentimentData] = useState(null);
  const [bubbleChartData, setBubbleChartData] = useState(null);
  const [selectedSource, setSelectedSource] = useState("WSJ");
  const [highlightTextChecked, setHighlightTextChecked] = React.useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [newsKeywordSearchInput, setNewsKeywordSearchInput] = useState("all");
  const [noData, setNoData] = useState(true);

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
    fetchData(e.target.value, "all");
  };

  const handleKeywordChange = (event) => {
    setNewsKeywordSearchInput(event.target.value);
  };

  const handleFetchButtonClick = () => {
    fetchData(selectedSource, newsKeywordSearchInput);
  };

  const fetchData = async (source = "WSJ", keyword = "all") => {
    setGlobalLoading(true);
    console.log("Fetching", source, keyword);
    const apiUrl = `https://biz-api.text-miner.com/finfeed/${source.toLowerCase()}/${keyword.toLowerCase()}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseJSON = await response.json();
      const parsedData = await parseNewsData(responseJSON);
      setData(parsedData);
      console.log("parsed Data", parsedData);
      if (parsedData.length === 0) {
        setNoData(false);
      } else if (parsedData.length > 0) {
        setNoData(true);
      }
      setGlobalLoading(false);
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

  const drawerWidth = 240;
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    console.log("drawer toggle");
    setMobileOpen((prevState) => !prevState);
  };

  const container =
    window !== undefined ? () => window().document.body : undefined;
  const drawer = (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        FinFeeds
      </Typography>
      <Divider />
      <Box
        sx={{
          display: { xs: "flex", sm: "nome" },
          flexDirection: "column",
        }}
        gap={2}
        p={2}
      >
        <FormControl>
          <InputLabel variant="standard" htmlFor="uncontrolled-native">
            Source
          </InputLabel>
          <NativeSelect value={selectedSource} onChange={handleSourceChange}>
            <option value="WSJ">WSJ</option>
            <option value="CNBC">CNBC</option>
            <option value="Polygon">Polygon</option>
          </NativeSelect>
        </FormControl>
        <TextField
          id="outlined-basic"
          label="Search Keywords"
          variant="outlined"
          value={newsKeywordSearchInput}
          onChange={handleKeywordChange}
          placeholder="Enter keyword"
          size="small"
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleFetchButtonClick}
        >
          Fetch News
        </Button>
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
      </Box>
    </Box>
  );

  function renderNewsItems() {
    if (globalLoading) {
      return <LinearProgress />;
    } else if (noData === false) {
      return <EmptyState />;
    } else {
      return (
        <Stack direction="row" spacing={2} pt={2}>
          <StyledNewsContainer style={{ width: "460px" }}>
            {data && (
              <div>
                {data?.length === 0 ? (
                  <p>Nothing found</p>
                ) : (
                  data?.map((newsItem, index) => {
                    return <NewsItem newsItem={newsItem} index={index} />;
                  })
                )}
              </div>
            )}
          </StyledNewsContainer>{" "}
          {entities && (
            <div style={{ overflow: "scroll" }}>
              <BubbleChart data={bubbleChartData} width={800} height={600} />
            </div>
          )}
          <div>
            <SentimentPieChart sentimentData={sentimentData} />
          </div>
        </Stack>
      );
    }
  }

  if (isMobile) {
    return (
      <Fragment>
        <AppBar component="nav">
          <Toolbar sx={{ background: "#fff" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" }, fill: "black" }}
            >
              <MenuIcon sx={{ fill: "black" }} />
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, display: { sm: "block" } }}
            >
              FinFeeds
            </Typography>
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                justifyContent: "center",
              }}
              gap={2}
            >
              <FormControl>
                <InputLabel variant="standard" htmlFor="uncontrolled-native">
                  Source
                </InputLabel>
                <NativeSelect
                  value={selectedSource}
                  onChange={handleSourceChange}
                >
                  <option value="WSJ">WSJ</option>
                  <option value="CNBC">CNBC</option>
                  <option value="Polygon">Polygon</option>
                </NativeSelect>
              </FormControl>
              <TextField
                id="outlined-basic"
                label="Search Keywords"
                variant="outlined"
                value={newsKeywordSearchInput}
                onChange={handleKeywordChange}
                placeholder="Enter keyword"
                size="small"
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleFetchButtonClick}
              >
                Fetch News
              </Button>
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
            </Box>
          </Toolbar>
          <Box component="nav">
            <Drawer
              container={container}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
              sx={{
                display: { xs: "block", sm: "none" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                },
              }}
            >
              {drawer}
            </Drawer>
          </Box>
        </AppBar>
        <Box mt={8} p={2}>
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
                  <BubbleChart
                    data={bubbleChartData}
                    width={300}
                    height={300}
                  />
                </div>
              )}
            </div>
          )}
          {tabValue === 2 && (
            <Box m={1} p={2}>
              <SentimentPieChart sentimentData={sentimentData} />
            </Box>
          )}
        </Box>

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
      </Fragment>
    );
  }

  return (
    <StyledFullHeightContainer className="App">
      <AppBar component="nav">
        <Toolbar sx={{ background: "#fff" }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            FinFeeds
          </Typography>
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              justifyContent: "center",
            }}
            gap={2}
          >
            <FormControl>
              <InputLabel variant="standard" htmlFor="uncontrolled-native">
                Source
              </InputLabel>
              <NativeSelect
                value={selectedSource}
                onChange={handleSourceChange}
              >
                <option value="WSJ">WSJ</option>
                <option value="CNBC">CNBC</option>
                <option value="Polygon">Polygon</option>
              </NativeSelect>
            </FormControl>
            <TextField
              id="outlined-basic"
              label="Search Keywords"
              variant="outlined"
              value={newsKeywordSearchInput}
              onChange={handleKeywordChange}
              placeholder="Enter keyword"
              size="small"
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleFetchButtonClick}
            >
              Fetch News
            </Button>
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
          </Box>
        </Toolbar>
      </AppBar>
      <Box mt={8}>{renderNewsItems()}</Box>
    </StyledFullHeightContainer>
  );
}

export default App;
