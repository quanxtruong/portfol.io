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
  const addCourse = async (course, isMajor) => {
    try {
      const response = await axios.post("/api/coursework", { course });
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

  const updateCourseSemester = async (courseId, newSemester) => {
    try {
      const response = await axios.post("/api/coursework/update-semester", {
        courseId,
        newSemester,
      });
      if (response.status === 200) {
        await fetchCoursework(); // Refresh coursework after successful update
      }
    } catch (error) {
      console.error("Error updating semester:", error);
    }
  };

  const removeCourse = async (courseId) => {
    try {
      const response = await axios.delete(`/api/coursework/${courseId}`);
      if (response.status === 200) {
        await fetchCoursework(); // Refresh coursework and GPA
      }
    } catch (error) {
      console.error("Error removing course:", error);
    }
  };

  const groupByAcademicYear = (coursework) => {
    return coursework.reduce((acc, course) => {
      // Skip courses with no semester or those in the Course Bank
      if (!course.Semester || course.Semester === "Course Bank") {
        return acc;
      }
  
      // Extract semester and year from the course
      const [semester, year] = course.Semester.split(" ");
      const numericYear = parseInt(year, 10);
  
      const academicYear =
        semester === "Fall" ? numericYear : numericYear - 1;
  
      if (!acc[academicYear]) {
        acc[academicYear] = {};
      }
  
      if (!acc[academicYear][semester]) {
        acc[academicYear][semester] = [];
      }
  
      acc[academicYear][semester].push(course);
      return acc;
    }, {});
  };
  
  const toggleMajor = async (courseId) => {
    try {
      const response = await axios.post("/api/coursework/toggle-major", { courseId });
      if (response.status === 200) {
        await fetchCoursework(); // Refresh coursework and GPA
      }
    } catch (error) {
      console.error("Error toggling major course:", error);
    }
  };

  const resetCourses = async () => {
    try {
      const response = await axios.post("/api/coursework/reset");
      if (response.status === 200) {
        await fetchCoursework(); // Refresh coursework after reset
      }
    } catch (error) {
      console.error("Error resetting courses:", error);
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
        removeCourse,
        toggleMajor, 
        resetCourses,
        groupByAcademicYear,
        updateCourseSemester
      }}
    >
      {children}
    </CourseworkContext.Provider>
  );
};
