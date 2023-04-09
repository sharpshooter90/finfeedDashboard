import { PieChart } from "react-minimal-pie-chart";

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
      color: "#F39C12",
    },
  ];

  return (
    <div>
      <PieChart
        data={chartData}
        lineWidth={60}
        label={({ dataEntry }) => `${Math.round(dataEntry.percentage)} %`}
        labelStyle={{
          fontSize: "5px",
          fontFamily: "sans-serif",
        }}
        labelPosition={50}
      />
      <Legend data={chartData} />
    </div>
  );
};

export default SentimentPieChart;
