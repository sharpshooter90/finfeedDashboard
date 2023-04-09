import React, { useEffect, useState } from "react";
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
    console.log("entities", response.entities);

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

  return (
    <div className="App">
      {/* <div>
        {Object.keys.categories?.map((key) => {
          return <div>{key}</div>;
        })}
      </div> */}

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
  );
}

export default App;
