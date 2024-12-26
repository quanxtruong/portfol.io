import React, { useEffect, useState } from "react";
import axios from "axios";

const CourseworkTable = ({ refreshTable }) => {
  const [coursework, setCoursework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoursework = async () => {
      console.log("Fetching coursework...");
      try {
        const response = await axios.get("/api/coursework");
        console.log("Fetched coursework:", response.data);
        setCoursework(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching coursework:", err);
        setError("Failed to load coursework.");
        setLoading(false);
      }
    };
  
    fetchCoursework();
  }, [refreshTable]);
  

  if (loading) return <p>Loading coursework...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Coursework</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Course ID</th>
            <th>Course Name</th>
            <th>Grade</th>
            <th>Unique</th>
            <th>Type</th>
            <th>Credit Hours</th>
            <th>Curriculum Flags</th>
            <th>School(s) Enrolled</th>
          </tr>
        </thead>
        <tbody>
          {coursework.map((course, index) => (
            <tr key={index}>
              <td>{course["Course ID"]}</td>
              <td>{course["Course Name"]}</td>
              <td>{course.Grade}</td>
              <td>{course.Unique}</td>
              <td>{course.Type}</td>
              <td>{course["Credit Hours"]}</td>
              <td>{course["Curriculum Flags"]}</td>
              <td>{course["School(s) Enrolled"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseworkTable;
