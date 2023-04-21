import React, { useContext } from "react";
import { PieChart } from "react-minimal-pie-chart";
import NewsFilterContext from "../../store/newsFilterStore";

const Legend = ({ data }) => {
  return (
    <div>
      {data.map((item, index) => (
        <div
          key={index}
          style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: item.color,
              marginRight: "5px",
            }}
          ></div>
          <span>{item.title}</span>
        </div>
      ))}
    </div>
  );
};

export const SentimentPieChart = ({ sentimentData }) => {
  const { setFilters } = useContext(NewsFilterContext);
  if (!sentimentData) {
    return <p>Loading sentiment data...</p>;
  }

  const chartData = [
    {
      title: "Positive",
      value: sentimentData.positive,
      color: "#27AE60",
    },
    {
      title: "Negative",
      value: sentimentData.negative,
      color: "#E74C3C",
    },
    {
      title: "Neutral",
      value: sentimentData.neutral,
      color: "gray",
    },
    {
      title: "Mixed",
      value: sentimentData.mixed,
      color: "#F39C12",
    },
  ];

  return (
    <div>
      <PieChart
        data={chartData}
        // lineWidth={60}
        label={({ dataEntry }) => `${Math.round(dataEntry.percentage)} %`}
        labelStyle={{
          fontSize: 5,
          fontWeight: "500",
        }}
        labelPosition={50}
        onClick={(_, index) => {
          const clickedSentiment = chartData[index].title.toLowerCase();
          setFilters((prevFilters) => ({
            ...prevFilters,
            sentiment: [{ label: clickedSentiment, value: clickedSentiment }],
          }));
        }}
      />
      <Legend data={chartData} />
    </div>
  );
};

export default SentimentPieChart;
