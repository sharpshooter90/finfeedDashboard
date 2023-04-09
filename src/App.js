import React, { useEffect, useState } from "react";
import BubbleChart from "./components/EntitiesBubbleChart";
import { countOccurrences } from "./utils";
const NewsItem = ({ newsItem, index }) => {
  const [isOccurredWordsVisible, setIsOccurredWordsVisible] = useState(false);

  const toggleOccurredWordsVisibility = () => {
    setIsOccurredWordsVisible(!isOccurredWordsVisible);
  };

  return (
    <div key={"newsItem_" + index}>
      <div>{newsItem.newsTitle}</div>
      <div>{newsItem.timestamp}</div>
      <div onClick={toggleOccurredWordsVisibility}>
        Word occurrence: {newsItem.totalCount}
      </div>
      {isOccurredWordsVisible && (
        <div>Occurred words: {newsItem.occurredKeys.join(", ")}</div>
      )}
      <br />
      <hr />
    </div>
  );
};

function App() {
  const [data, setData] = useState(null);
  const [entities, setEntities] = useState(null);
  const [isOccurredWordsVisible, setIsOccurredWordsVisible] = useState(false);

  const toggleOccurredWordsVisibility = () => {
    setIsOccurredWordsVisible(!isOccurredWordsVisible);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const parseNewsData = (data) => {
    const response = JSON.parse(data);
    const rawData = response.data;
    setEntities(response.entities);
    // get entities and set only keys
    const rawEntities = response.entities;
    const keys = Object.keys(rawEntities);

    const parsedData = rawData.map((item) => {
      const [newsTitle, timestamp] = item.split("\t");
      const occurredKeys = keys.filter(
        (key) => countOccurrences(key, newsTitle) > 0
      );
      const totalCount = occurredKeys.reduce(
        (acc, key) => acc + countOccurrences(key, newsTitle),
        0
      );

      return {
        newsTitle,
        timestamp,
        occurredKeys,
        totalCount,
      };
    });

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
      const parsedData = parseNewsData(responseJSON);
      setData(parsedData);
      /* // Filter parsedDataResult to get only items with totalCount > 0
      const itemsWithCountGreaterThanZero = parsedDataResult.filter(
        (item) => item.totalCount > 0
      );

      // Log the overall count of items with totalCount > 0 in the browser console
      console.log(
        "Number of items with totalCount > 0:",
        itemsWithCountGreaterThanZero.length
      ); */
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
    <div className="App" style={{ display: "flex" }}>
      {/* <div>
        {Object.keys.categories?.map((key) => {
          return <div>{key}</div>;
        })}
      </div> */}

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
      {console.log("entities", entities)}
      {entities && (
        <div>
          <BubbleChart data={dataArray} width={800} height={600} />
        </div>
      )}
    </div>
  );
}

export default App;
