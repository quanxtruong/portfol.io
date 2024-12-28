import React, { createContext, useState } from "react";
import axios from "axios";

// Create the context
export const CourseworkContext = createContext();

// Provide the context
export const CourseworkProvider = ({ children }) => {
  const [coursework, setCoursework] = useState([]);
  const [cumulativeGPA, setCumulativeGPA] = useState(0.0);
  const [majorGPA, setMajorGPA] = useState(0.0);

  // Fetch coursework from the backend
  const fetchCoursework = async () => {
    try {
      const response = await axios.get("/api/coursework");
      setCoursework(response.data);
      await fetchGPA();
    } catch (error) {
      console.error("Error fetching coursework:", error);
    }
  };

  // Fetch cumulative and major GPA
  const fetchGPA = async () => {
    try {
      const response = await axios.get("/api/gpa");
      setCumulativeGPA(response.data.cumulativeGPA);
      setMajorGPA(response.data.majorGPA);
    } catch (error) {
      console.error("Error fetching GPA:", error);
    }
  };

  // Add a new course
  const addCourse = async (course, grade, isMajor) => {
    try {
      const response = await axios.post("/api/coursework", { course, grade, isMajor });
      if (response.status === 200) {
        await fetchCoursework(); // Refresh coursework and GPA
      }
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  const updateGrade = async (courseId, grade) => {
    try {
      const response = await axios.post("/api/coursework/update-grade", { courseId, grade });
      if (response.status === 200) {
        await fetchCoursework(); // Refresh coursework and GPA
      }
    } catch (error) {
      console.error("Error updating grade:", error);
    }
  };
  

  return (
    <CourseworkContext.Provider
      value={{
        coursework,
        cumulativeGPA,
        majorGPA,
        fetchCoursework,
        addCourse,
        updateGrade,
      }}
    >
      {children}
    </CourseworkContext.Provider>
  );
};
