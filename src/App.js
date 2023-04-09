import React, { useState, useEffect } from "react";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://biz-api.text-miner.com/finfeed/polygon/all"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseText = await response.json();

      const parseNewsData = (data) => {
        const response = JSON.parse(data);
        const rawData = response.data;
        console.log("entities", response.entities);
        const parsedData = rawData.map((item) => {
          const [newsTitle, timestamp] = item.split("\t");
          return { newsTitle, timestamp };
        });
        return parsedData;
      };

      const parsedData = parseNewsData(responseText);
      setData(parsedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="App">
      {data ? (
        <div>
          {data?.map((newsItem, index) => {
            return (
              <div key={"newsItem_" + index}>
                <div>{newsItem.newsTitle}</div>
                <div>{newsItem.timestamp}</div>
                <br />
              </div>
            );
          })}
        </div>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}

export default App;
