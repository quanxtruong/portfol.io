import React, { useContext, useEffect, useState } from "react";
import { CourseworkContext } from "../context/CourseworkContext";

const GRADE_POINTS = {
  "A": 4.0,
  "A-": 3.67,
  "B+": 3.33,
  "B": 3.0,
  "B-": 2.67,
  "C+": 2.33,
  "C": 2.0,
  "C-": 1.67,
  "D+": 1.33,
  "D": 1.0,
  "D-": 0.67,
  "F": 0.0,
};

const CourseworkTable = () => {
  const { coursework, fetchCoursework, updateGrade, removeCourse, toggleMajor } =
    useContext(CourseworkContext);
  const [hoveredRow, setHoveredRow] = useState(null); // State to track hovered row

  useEffect(() => {
    fetchCoursework();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGradeChange = (courseId, value) => {
    const formattedGrade = value.toUpperCase();

    if (formattedGrade === "") {
      updateGrade(courseId, null); // Handle empty grade
    } else if (GRADE_POINTS[formattedGrade] !== undefined) {
      updateGrade(courseId, formattedGrade); // Handle valid grade
    }
  };

  const handleToggleMajor = (courseId) => {
    toggleMajor(courseId); // Toggle the major course status
  };

  const handleRemoveCourse = (courseId) => {
    removeCourse(courseId);
  };

  if (!coursework.length) return <p>No coursework available.</p>;

  return (
    <div>
      <h2>Coursework</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Course ID</th>
            <th>Course Name</th>
            <th>Grade</th>
            <th>Credit Hours</th>
            <th>Type</th>
            <th>Major Course</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coursework.map((course) => (
            <tr
              key={course["Course ID"]}
              onMouseEnter={() => setHoveredRow(course["Course ID"])}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td>{course["Course ID"]}</td>
              <td>{course["Course Name"]}</td>
              <td>
                <input
                  type="text"
                  value={course.Grade || ""}
                  onChange={(e) =>
                    handleGradeChange(course["Course ID"], e.target.value)
                  }
                  placeholder="Enter grade"
                />
              </td>
              <td>{course["Credit Hours"]}</td>
              <td>{course.Type}</td>
              <td>
                <input
                  type="checkbox"
                  checked={course["Major Course"] === "Yes"}
                  onChange={() => handleToggleMajor(course["Course ID"])}
                />
              </td>
              <td>
                {hoveredRow === course["Course ID"] && (
                  <button
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleRemoveCourse(course["Course ID"])}
                  >
                    X
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseworkTable;
