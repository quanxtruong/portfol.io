import React, { useContext, useEffect } from "react";
import { CourseworkContext } from "../context/CourseworkContext";

const CourseworkTable = () => {
  const { coursework, fetchCoursework } = useContext(CourseworkContext);

  useEffect(() => {
    fetchCoursework();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!coursework.length) return <p>No coursework available.</p>;

  return (
    <table border="1">
      <thead>
        <tr>
          <th>Course ID</th>
          <th>Course Name</th>
          <th>Grade</th>
          <th>Credit Hours</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {coursework.map((course, index) => (
          <tr key={index}>
            <td>{course["Course ID"]}</td>
            <td>{course["Course Name"]}</td>
            <td>{course.Grade}</td>
            <td>{course["Credit Hours"]}</td>
            <td>{course.Type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CourseworkTable;
