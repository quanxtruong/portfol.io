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
  "F": 0.0
};

const CourseworkTable = () => {
  const { coursework, fetchCoursework, updateGrade } =
    useContext(CourseworkContext);
  // eslint-disable-next-line
  const [editingGrade, setEditingGrade] = useState({}); // Local state for grades being edited

  useEffect(() => {
    fetchCoursework();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGradeChange = (courseId, value) => {
    const formattedGrade = value.toUpperCase();
  
    if (formattedGrade === "") {
      // Handle empty grade
      updateGrade(courseId, null); // Pass `null` or a special value to indicate no grade
    } else if (GRADE_POINTS[formattedGrade] !== undefined) {
      // Handle valid grade
      updateGrade(courseId, formattedGrade);
    }
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
          </tr>
        </thead>
        <tbody>
          {coursework.map((course) => (
            <tr key={course["Course ID"]}>
              <td>{course["Course ID"]}</td>
              <td>{course["Course Name"]}</td>
              <td>
                <input
                  type="text"
                  value={editingGrade[course["Course ID"]] || course.Grade || ""}
                  onChange={(e) =>
                    handleGradeChange(course["Course ID"], e.target.value)
                  }
                  placeholder="Enter grade"
                />
              </td>
              <td>{course["Credit Hours"]}</td>
              <td>{course.Type}</td>
              <td>{course["Major Course"] ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseworkTable;
