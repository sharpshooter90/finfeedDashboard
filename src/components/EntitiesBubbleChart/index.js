// components/BubbleChart.js
import React, { useRef } from "react";
import Legend from "../Legend";
import useBubbleChart from "./useBubbleChart";
const BubbleChart = ({ data, width, height, onBubbleClick }) => {
  const chartRef = useRef();
  useBubbleChart(chartRef, data, width, height, onBubbleClick);

  return (
    <React.Fragment>
      <div
        ref={chartRef}
        style={{
          overflow: "scroll",
          width: width,
          height: height,
        }}
      ></div>
      <Legend data={data} />
    </React.Fragment>
  );
};

export default BubbleChart;
