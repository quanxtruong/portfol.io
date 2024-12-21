from bs4 import BeautifulSoup
import pandas as pd
import re


class Parser:

    @staticmethod
    def parseCoursework(file_path) -> str:

        # Load the HTML content from the uploaded file
        with open(file_path, "r", encoding="iso-8859-1") as file:
            html_content = file.read()

        # Parse the HTML content
        soup = BeautifulSoup(html_content, "html.parser")

        # Find all table rows, excluding those with the "alias" class
        coursework = soup.find("div", id="coursework")
        rows = coursework.find_all("tr", class_=lambda x: x != "alias")

        # Reassessing table rows for consistent data extraction
        data = []
        for row in rows:
            columns = row.find_all("td")
            if columns:
                row_data = [col.get_text(strip=True) for col in columns]
                if len(row_data) == 8:  # Only include rows with the expected number of columns
                    data.append(row_data)

        # Define the column headers based on the table structure in the HTML
        headers = ["Course Number", "Course Title", "Grade", "Unique", "Type", 
                "Credit Hours", "Curriculum Flags", "School(s) Enrolled"]

        # Create a DataFrame and save it to CSV
        df = pd.DataFrame(data, columns=headers)

        for i, course in df.iterrows():
            course["Course Number"] = re.sub(r'\s+', ' ', course["Course Number"])

        output_path = "coursework.csv"
        df.to_csv(output_path, index=False)
        return output_path

    @staticmethod
    def parseMajorCourses(file_path):
        with open(file_path, "r", encoding="iso-8859-1") as file:
            html_content = file.read()

        # Suppose you have the HTML as a string in `html_content`
        soup = BeautifulSoup(html_content, 'html.parser')

        major_courses = []
        # Find the 'Major' section by looking for a heading or a table section title 'Major'
        # One way is to locate the "Major" header:
        major_section = None
        all_section_titles = soup.select('table.results .section_title')
        for title in all_section_titles:
            if 'Major' in title.get_text():
                # The parent table of this title is your major requirements table
                major_section = title.find_parent('table', class_='results')
                break

        if major_section:
            # Now find all the "rule" rows
            rule_rows = major_section.select('tbody.section > tr.rule')
            for rule in rule_rows:
                # For each rule, find the details row that follows (if any)
                details_row = rule.find_next_sibling('tr', class_='details')
                if details_row:
                    # Inside details_row, there is a nested table of courses
                    course_table = details_row.find('table')
                    if course_table:
                        course_rows = course_table.find_all('tr')[1:]  # skip the header row
                        for c_row in course_rows:
                            cells = c_row.find_all('td')
                            # Extract course info, adjusting indices as needed based on observed structure
                            course_id = cells[0].get_text(strip=True)  # e.g. "C S 314"
                            course_id = re.sub(r'\s+', ' ', course_id)
                            # course_title = cells[1].get_text(strip=True)
                            # grade = cells[2].get_text(strip=True)
                            # semester = cells[3].get_text(strip=True)
                            # # ... extract other fields as needed
                            major_courses.append(course_id)
        return major_courses



