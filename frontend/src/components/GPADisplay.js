import React, { useContext } from "react";
import { CourseworkContext } from "../context/CourseworkContext";
// import "../styles/GPADisplay.css"

const GPADisplay = () => {
  const { cumulativeGPA, majorGPA } = useContext(CourseworkContext);

  return (
    <div>
      <p><strong></strong>Cumulative GPA: {cumulativeGPA || "0.0"}</p>
      <p><strong></strong>Major GPA: {majorGPA || "0.0"}</p>
    </div>
  );
};

export default GPADisplay;
