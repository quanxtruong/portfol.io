import React from "react";
import AddCourseForm from "./components/AddCourseForm";
import CourseworkTable from "./components/CourseworkTable";
import GPA from "./components/GPADisplay";
import ResetCoursesButton from "./components/ResetCoursesButton";

const App = () => {
  return (
    <div>
      <h1>GPA Calculator</h1>
      <GPA />
      <AddCourseForm />
      <CourseworkTable />
      <ResetCoursesButton />
    </div>
  );
};

export default App;
