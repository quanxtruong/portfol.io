import React, { useState, useContext } from "react";
import { CourseworkContext } from "../context/CourseworkContext";

const AddCourseForm = () => {
  const [course, setCourse] = useState("");
  const [isMajor, setIsMajor] = useState(false);
  const { addCourse } = useContext(CourseworkContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addCourse(course, isMajor);
    setCourse("");
    setIsMajor(false);
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
      <label>
        Major Course:
        <input
          type="checkbox"
          checked={isMajor}
          onChange={(e) => setIsMajor(e.target.checked)}
        />
      </label>
      <button type="submit">Add Course</button>
    </form>
  );
};

export default AddCourseForm;
