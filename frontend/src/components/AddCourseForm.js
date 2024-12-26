import React, { useState } from "react";
import axios from "axios";

const AddCourseForm = ({ onCourseAdded }) => {
  const [course, setCourse] = useState("");
  const [grade, setGrade] = useState("");
  const [isMajor, setIsMajor] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post("/api/coursework", {
      course: course.toUpperCase(),
      grade: grade.toUpperCase(),
      isMajor: isMajor,
    });

    console.log("Response from backend:", response); // Log backend response

    if (response.status === 200) {
      alert("Course added successfully!");
      onCourseAdded(); // Trigger table refresh
      setCourse("");
      setGrade("");
      setIsMajor(false);
    } else {
      alert(response.data.message || "Failed to add course.");
    }
  } catch (error) {
    console.error("Error adding course:", error);
    alert("An error occurred while adding the course.");
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Course:
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="Course (e.g., C S 311)"
            required
          />
        </label>
      </div>
      <div>
        <label>
          Grade:
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="Grade (e.g., A-)"
            required
          />
        </label>
      </div>
      <div>
        <label>
          Is Major Course:
          <input
            type="checkbox"
            checked={isMajor}
            onChange={(e) => setIsMajor(e.target.checked)}
          />
        </label>
      </div>
      <button type="submit">Add Course</button>
    </form>
  );
};

export default AddCourseForm;
