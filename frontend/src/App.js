import React, { useState } from "react";
import AddCourseForm from "./components/AddCourseForm";
import CourseworkTable from "./components/CourseworkTable";

const App = () => {
  const [refreshTable, setRefreshTable] = useState(false);

  const handleCourseAdded = () => {
    console.log("Refreshing table...");
    setRefreshTable(!refreshTable); // Toggle refreshTable to trigger re-fetch
  };

  return (
    <div>
      <h1>GPA Calculator</h1>
      <AddCourseForm onCourseAdded={handleCourseAdded} />
      <CourseworkTable refreshTable={refreshTable} />
    </div>
  );
};

export default App;
