import React from "react";
import AddCourseForm from "./components/AddCourseForm";
import CourseworkTable from "./components/CourseworkTable";
import GPA from "./components/GPADisplay";

const App = () => {
  return (
    <div>
      <h1>GPA Calculator</h1>
      <GPA />
      <AddCourseForm />
      <CourseworkTable />
    </div>
  );
};

export default App;
