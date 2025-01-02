import React, { useState, useContext } from "react";
import { CourseworkContext } from "../context/CourseworkContext";

const AddCourseForm = () => {
  const [course, setCourse] = useState("");
  const { addCourse } = useContext(CourseworkContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addCourse(course);
    setCourse("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Course:
        <input
          type="text"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          required
        />
      </label>
      <button type="submit">Add Course</button>
    </form>
  );
};

export default AddCourseForm;
