import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import FeedIcon from "@mui/icons-material/Feed";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/joy/Box";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Divider from "@mui/joy/Divider";
import LinearProgress from "@mui/joy/LinearProgress";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import AppBar from "@mui/material/AppBar";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import NativeSelect from "@mui/material/NativeSelect";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";

import styled from "styled-components";

import EmptyState from "./components/EmptyState";
import BubbleChart from "./components/EntitiesBubbleChart";
import NewsWrapper from "./components/NewsWrapper";
import NewsFilterContext from "./store/newsFilterStore";

import SentimentPieChart from "./components/SentimentPieChart";
import "./styles.css";
import { getSentiment, getSentimentWithPercentage } from "./utils";

import Tab from "@mui/joy/Tab";
import TabList from "@mui/joy/TabList";
import TabPanel from "@mui/joy/TabPanel";
import Tabs from "@mui/joy/Tabs";
import { countOccurrences } from "./utils";

const StyledFullHeightContainer = styled.div`
  height: 100vh;
`;

const StyledNewsContainer = styled.div`
  height: 100vh;
  overflow-y: scroll;
  padding-right: 48px;
`;

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
  const [filters, setFilters] = useState({
    sentiment: [],
    entities: [],
  });

  const isMobile = useMediaQuery("(max-width: 1080px)");
  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const showToast = () => {
    toast("📰 Sentiment change in every 3 mins", {
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 180000);

    return () => clearInterval(intervalId);
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
    // iterate over entities
    let entityData = [];
    for (const entity in entities) {
      for (const item of data) {
        if (item.newsTitle.includes(entity)) {
          entityData.push({
            // totalOccurrence: ,
            sentimentType: getSentiment(
              item.negative_sentiment_percentage,
              item.positive_sentiment_percentage
            ),
            entity: entity,
          });
        }
      }
    }

    // combine repeated entities
    const combineData = (data) => {
      const combined = {};

      data.forEach((item) => {
        const { entity, sentimentType } = item;
        if (!combined[entity]) {
          combined[entity] = {
            sentimentType: sentimentType,
            entity: entity,
            totalOccurrence: 0,
          };
        }
        if (combined[entity].sentimentType === sentimentType) {
          combined[entity].totalOccurrence++;
        }
      });

      return Object.values(combined);
    };

    const combinedData = combineData(entityData);

    for (const item of combinedData) {
      switch (item.sentimentType) {
        case "positive":
          sentimentData.positive.push({
            label: item.entity,
            totalOccurrence: item.totalOccurrence,
          });
          break;
        case "negative":
          sentimentData.negative.push({
            label: item.entity,
            totalOccurrence: item.totalOccurrence,
          });
          break;
        case "mixed":
          sentimentData.mixed.push({
            label: item.entity,
            totalOccurrence: item.totalOccurrence,
          });
          break;
        case "neutral":
          sentimentData.neutral.push({
            label: item.entity,
            totalOccurrence: item.totalOccurrence,
          });
          break;
        default:
          break;
      }
    }
    const bubbleChartDataSets = [
      {
        label: "Mixed sentiment",
        type: "mixed",
        data: sentimentData.mixed,
        backgroundColor: "#FF9800",
      },
      {
        label: "Positive",
        type: "positive",
        data: sentimentData.positive,
        backgroundColor: "#4CAF50",
      },
      {
        label: "Negative",
        type: "negative",
        data: sentimentData.negative,
        backgroundColor: "#F44336",
      },
      {
        label: "Neutral",
        type: "neutral",
        data: sentimentData.neutral,
        backgroundColor: "#9E9E9E",
      },
    ];

    return bubbleChartDataSets;
  }

  const handleSourceChange = (e) => {
    setSelectedSource(e.target.value);
    fetchData(e.target.value, "all");
  };

  const handleBubbleClick = (bubble) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      entities: [{ label: bubble.label, value: bubble.label }],
    }));
  };

  const handleKeywordChange = (event) => {
    setNewsKeywordSearchInput(event.target.value);
  };

  const handleFetchButtonClick = () => {
    fetchData(selectedSource, newsKeywordSearchInput);
  };

  const fetchData = async (source = "WSJ", keyword = "all") => {
    setGlobalLoading(true);
    showToast();
    if (keyword.length === 0) {
      keyword = "all";
    }
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
        {/* <Typography
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
        </Typography> */}
      </Box>
    </Box>
  );

  function renderDesktopView() {
    if (noData === false) {
      return <EmptyState />;
    } else {
      return (
        <Fragment>
          {globalLoading && (
            <LinearProgress
              thickness={3}
              sx={{ position: "absolute", top: "64px", width: "100%" }}
            />
          )}
          <Stack direction="row" spacing={2} p={2}>
            <StyledNewsContainer style={{ width: "560px" }}>
              {<NewsWrapper data={data} loading={globalLoading} />}
            </StyledNewsContainer>
            <Tabs
              aria-label="tabs"
              defaultValue={0}
              sx={{ borderRadius: "lg", flexGrow: 1 }}
            >
              <TabList>
                <Tab>Sentiment split for entities</Tab>
                <Tab>Sentiment split</Tab>
              </TabList>
              <TabPanel value={0}>
                {bubbleChartData ? (
                  <Box
                    style={{ overflow: "scroll" }}
                    height="100vh"
                    justifyContent="center"
                    alignItems="center"
                    display="flex"
                    flexDirection="column"
                  >
                    <BubbleChart
                      data={bubbleChartData}
                      width={700}
                      height={400}
                      onBubbleClick={handleBubbleClick}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{ p: 2 }}
                    width={"560px"}
                    alignItems="center"
                    justifyContent="center"
                    display="flex"
                    height="100vh"
                  >
                    Loading data...
                  </Box>
                )}
              </TabPanel>
              <TabPanel value={1}>
                <Box
                  justifyContent="center"
                  alignItems="center"
                  display="flex"
                  height="100vh"
                >
                  <SentimentPieChart sentimentData={sentimentData} />
                </Box>
              </TabPanel>
            </Tabs>
          </Stack>
        </Fragment>
      );
    }
  }

  return (
    <NewsFilterContext.Provider value={{ filters, setFilters }}>
      {isMobile ? (
        <Fragment>
          <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
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
                {/* <Typography
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
              </Typography> */}
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
          {globalLoading && (
            <LinearProgress
              thickness={3}
              sx={{ position: "absolute", top: "58px", width: "100%" }}
            />
          )}
          <Box mt={8} p={2}>
            {tabValue === 0 && (
              <div>
                <NewsWrapper data={data} loading={globalLoading} />
              </div>
            )}
            {tabValue === 1 && (
              <Box mb={8}>
                {bubbleChartData && (
                  <div>
                    <BubbleChart
                      data={bubbleChartData}
                      width={480}
                      height={500}
                      onBubbleClick={handleBubbleClick}
                    />
                  </div>
                )}
              </Box>
            )}
            {tabValue === 2 && (
              <Box m={1} p={2}>
                <SentimentPieChart sentimentData={sentimentData} />
              </Box>
            )}
          </Box>

          <Paper
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
            }}
            elevation={6}
          >
            <BottomNavigation
              showLabels
              value={tabValue}
              onChange={handleChange}
            >
              <BottomNavigationAction label="News Feeds" icon={<FeedIcon />} />
              <BottomNavigationAction
                label="Sentiment split for entities"
                icon={<BubbleChartIcon />}
              />
              <BottomNavigationAction
                label="Sentiment split"
                icon={<DonutLargeIcon />}
              />
            </BottomNavigation>
          </Paper>
        </Fragment>
      ) : (
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
                {/* <Typography
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
            </Typography> */}
              </Box>
            </Toolbar>
          </AppBar>
          <Box mt={8}>{renderDesktopView()}</Box>
          <ToastContainer
            position="bottom-center"
            autoClose={5000}
            style={{ width: "auto" }}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </StyledFullHeightContainer>
      )}
    </NewsFilterContext.Provider>
  );
}

export default App;
