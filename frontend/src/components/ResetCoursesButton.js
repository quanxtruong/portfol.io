import React, { useContext } from "react";
import { CourseworkContext } from "../context/CourseworkContext";

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
      style={{
        background: "red",
        color: "white",
        padding: "10px 20px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Reset Courses
    </button>
  );
};

export default ResetCoursesButton;