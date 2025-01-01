import React, { useContext } from "react";
import { CourseworkContext } from "../context/CourseworkContext";
// import "../styles/ResetCoursesButton.css"

const ResetCoursesButton = () => {
  const { resetCourses } = useContext(CourseworkContext);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all courses?")) {
      resetCourses();
    }
  };

  return (
    <button
      onClick={handleReset}
    >
      Reset Courses
    </button>
  );
};

export default ResetCoursesButton;