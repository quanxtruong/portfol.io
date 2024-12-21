import pandas as pd
from parser import Parser

GRADE_POINTS = {
    "A": 4.0,
    "A-": 3.67,
    "B+": 3.33,
    "B": 3.0,
    "B-": 2.67,
    "C+": 2.33,
    "C": 2.0,
    "C-": 1.67,
    "D+": 1.33,
    "D": 1.0,
    "D-": 0.67,
    "F": 0.0
}


class GPA:

    def __init__(self, file_path):

        self.coursework_df = pd.read_csv(Parser.parseCoursework(file_path))
        self.major_courses = Parser.parseMajorCourses(file_path) # list

        credits = self.getPointsAndHours()
        self.cumulative_points, self.cumulative_hours = credits[0]

        self.major_points, self.major_hours = credits[1]

    
    def getPointsAndHours(self):
       
        past_courses = self.coursework_df[self.coursework_df["Type"] == "In-Residence"].dropna(subset=["Grade"])
        past_courses = past_courses[past_courses["Grade"] != "CR"]
        
        cpoints, chours = 0, 0
        mpoints, mhours = 0, 0

        for i, course in past_courses.iterrows():
        
            p, h = GRADE_POINTS[course["Grade"]], int(course["Credit Hours"])
            cpoints += p * h
            chours += h

            if course["Course Number"] in self.major_courses:
                mpoints += p * h
                mhours += h

        return [(cpoints, chours), (mpoints, mhours)]
    

    def calculate_cumulative_gpa(self) -> float:
        return int(self.cumulative_points / self.cumulative_hours * 10000) / 10000

    def calculate_major_gpa(self) -> float:
        if not self.major_hours:
            return 0.0000
        return int(self.major_points / self.major_hours * 10000) / 10000

    def get_all_classes(self):
        all_courses = self.coursework_df[self.coursework_df["Type"] == "In-Residence"]
        return all_courses.to_string(index=False)
    
    def get_major_classes(self):
        all_courses = self.coursework_df[self.coursework_df["Type"] == "In-Residence"]
        major_courses = all_courses[all_courses["Course Number"].isin(self.major_courses)]
        return major_courses.to_string(index=False)

                                    
        

    

