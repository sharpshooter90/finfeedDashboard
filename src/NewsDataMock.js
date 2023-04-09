// src/App.js
import React, { useState, useEffect } from "react";

const NewsDataMock = () => {
  const [newsData, setNewsData] = useState(null);

  useEffect(() => {
    const fetchNewsData = async () => {
      const response = await fetch(
        "https://biz-api.text-miner.com/finfeed/polygon/all"
      );
      const data = await response.json();
      const parsedData = data?.data?.map((item) => {
        const [newsTitle, timestamp] = item.split("\t");
        return { newsTitle, timestamp };
      });
      setNewsData(parsedData);
    };

    fetchNewsData();
  }, []);

  return (
    <div>
      {newsData &&
        newsData.map((news, index) => (
          <div key={index}>
            <h3>{news.newsTitle}</h3>
            <p>{news.timestamp}</p>
          </div>
        ))}
    </div>
  );
};

export default NewsDataMock;
