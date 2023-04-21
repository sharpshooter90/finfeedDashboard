import React from "react";
import "./style.css";
const Legend = ({ data }) => {
  const uniqueData = data.reduce((acc, item) => {
    if (!acc.some((i) => i.type === item.type)) {
      acc.push(item);
    }
    return acc;
  }, []);

  return (
    <div className="legend">
      {uniqueData.map((item) => (
        <div key={item.type} className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: item.backgroundColor }}
          ></span>
          <span className="legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
