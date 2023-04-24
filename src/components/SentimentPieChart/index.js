import { Box } from "@mui/joy";
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
    return <Box>Loading data...</Box>;
  }

  const chartData = [
    {
      title: "Positive",
      value: sentimentData.positive,
      color: "#4CAF50",
    },
    {
      title: "Negative",
      value: sentimentData.negative,
      color: "#F44336",
    },
    {
      title: "Neutral",
      value: sentimentData.neutral,
      color: "#9E9E9E",
    },
    {
      title: "Mixed",
      value: sentimentData.mixed,
      color: "#FF9800",
    },
  ];

  return (
    <div>
      <PieChart
        animate
        reveal={100}
        animationEasing="cubic-bezier(0.16, 1, 0.3, 1)"
        data={chartData}
        // lineWidth={60}
        label={({ dataEntry }) => `${Math.round(dataEntry.percentage)} %`}
        labelStyle={{
          fontSize: 5,
          fontWeight: "500",
        }}
        colo
        segmentsStyle={{ cursor: "pointer" }}
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
