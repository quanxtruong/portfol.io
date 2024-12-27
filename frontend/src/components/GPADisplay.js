import React, { useContext } from "react";
import { CourseworkContext } from "../context/CourseworkContext";

const GPADisplay = () => {
  const { cumulativeGPA, majorGPA } = useContext(CourseworkContext);

  return (
    <div>
      <p><strong>Cumulative GPA:</strong> {cumulativeGPA}</p>
      <p><strong>Major GPA:</strong> {majorGPA}</p>
    </div>
  );
};

export default GPADisplay;
