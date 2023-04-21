import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import FeedIcon from "@mui/icons-material/Feed";
import MenuIcon from "@mui/icons-material/Menu";
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
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
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
import Sentiment from "./components/Sentiment";
import SentimentPieChart from "./components/SentimentPieChart";
import "./styles.css";
import {
  getSentiment,
  getSentimentStyle,
  getSentimentWithPercentage,
} from "./utils";

import { countOccurrences } from "./utils";

const StyledFullHeightContainer = styled.div`
  height: 100vh;
`;

const StyledNewsContainer = styled.div`
  height: 100vh;
  overflow-y: scroll;
  padding-right: 48px;
`;

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

const NewsItem = ({ newsItem }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Card
        variant="outlined"
        sx={(theme) => ({
          ...getSentimentStyle(
            getSentiment(
              newsItem.negative_sentiment_percentage,
              newsItem.positive_sentiment_percentage
            )
          ),
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
    document.body.classList.add("isTextOccurrenceHighlightEnabled");
  } else {
    document.body.classList.remove("isTextOccurrenceHighlightEnabled");
  }
};

function App(props) {
  const [globalLoading, setGlobalLoading] = useState(true);
  const [data, setData] = useState(null);
  const [entities, setEntities] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [selectedSource, setSelectedSource] = useState("WSJ");
  const [highlightTextChecked, setHighlightTextChecked] = React.useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [newsKeywordSearchInput, setNewsKeywordSearchInput] = useState("all");
  const [noData, setNoData] = useState(true);
  const [bubbleChartData, setBubbleChartData] = useState();

  const isMobile = useMediaQuery("(max-width: 1080px)");
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
    console.log("data", rawData);
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

    console.log("parsed data", parsedData);

    // Set the sentimentData state
    setSentimentData(getSentimentWithPercentage(parsedData));

    setBubbleChartData(generateBubbleChartDataSets(rawEntities, parsedData));

    return parsedData;
  };

  function generateBubbleChartDataSets(entities, data) {
    const sentimentData = {
      mixed: [],
      positive: [],
      negative: [],
      neutral: [],
    };

    for (const entity in entities) {
      const entityData = {
        totalOccurrence: 0,
        positive_sentiment_percentage: 0,
        negative_sentiment_percentage: 0,
      };

      for (const item of data) {
        if (item.newsTitle.includes(entity)) {
          entityData.totalOccurrence += 1;
          entityData.positive_sentiment_percentage += parseInt(
            item.positive_sentiment_percentage
          );
          entityData.negative_sentiment_percentage += parseInt(
            item.negative_sentiment_percentage
          );
        }
      }

      if (entityData.totalOccurrence > 0) {
        const avgPositive =
          entityData.positive_sentiment_percentage / entityData.totalOccurrence;
        const avgNegative =
          entityData.negative_sentiment_percentage / entityData.totalOccurrence;

        if (avgPositive > 50 && avgNegative > 50) {
          sentimentData.mixed.push({
            label: entity,
            totalOccurrence: entityData.totalOccurrence,
          });
        } else if (avgPositive >= 50) {
          sentimentData.positive.push({
            label: entity,
            totalOccurrence: entityData.totalOccurrence,
          });
        } else if (avgNegative >= 50) {
          sentimentData.negative.push({
            label: entity,
            totalOccurrence: entityData.totalOccurrence,
          });
        } else {
          sentimentData.neutral.push({
            label: entity,
            totalOccurrence: entityData.totalOccurrence,
          });
        }
      }
    }

    const bubbleChartDataSets = [
      {
        label: "Mixed sentiment",
        type: "mixed",
        data: sentimentData.mixed,
        backgroundColor: "orange",
      },
      {
        label: "Positive",
        type: "positive",
        data: sentimentData.positive,
        backgroundColor: "green",
      },
      {
        label: "Negative",
        type: "negative",
        data: sentimentData.negative,
        backgroundColor: "red",
      },
      {
        label: "Neutral",
        type: "neutral",
        data: sentimentData.neutral,
        backgroundColor: "gray",
      },
    ];

    return bubbleChartDataSets;
  }

  // const bubbleChartDataSets = [
  //   {
  //     label: "Mixed sentiment",
  //     type: "mixed",
  //     data: [
  //       { label: "Entity name1", totalOccurrence: 12 },
  //       { label: "Entity name2", totalOccurrence: 6 },
  //     ],
  //     backgroundColor: "orange",
  //   },
  //   {
  //     label: "Positive",
  //     type: "positive",
  //     data: [
  //       { label: "Entity name1", totalOccurrence: 18 },
  //       { label: "Entity name2", totalOccurrence: 3 },
  //     ],
  //     backgroundColor: "green",
  //   },
  //   {
  //     label: "Negative",
  //     type: "negative",
  //     data: [
  //       { label: "Entity name1", totalOccurrence: 5 },
  //       { label: "Entity name2", totalOccurrence: 16 },
  //     ],
  //     backgroundColor: "red",
  //   },
  //   {
  //     label: "Neutral",
  //     type: "netural",
  //     data: [
  //       { label: "Entity name1", totalOccurrence: 18 },
  //       { label: "Entity name2", totalOccurrence: 3 },
  //     ],
  //     backgroundColor: "gray",
  //   },
  // ];

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
      console.log("entities", entities);
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
          Highlight Word occurrence
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
                  data?.map((newsItemData, index) => {
                    return <NewsItem newsItem={newsItemData} key={index} />;
                  })
                )}
              </div>
            )}
          </StyledNewsContainer>{" "}
          {bubbleChartData && (
            <div style={{ overflow: "scroll" }}>
              <BubbleChart data={bubbleChartData} />
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
                Highlight Word occurrence
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
              {bubbleChartData && (
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
              Highlight Word occurrence
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Box mt={8}>{renderNewsItems()}</Box>
    </StyledFullHeightContainer>
  );
}

export default App;
