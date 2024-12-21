import requests
from bs4 import BeautifulSoup
import csv

# Base URL
base_url = "https://catalog.utexas.edu"

# Fetch the main page
response = requests.get(base_url)
soup = BeautifulSoup(response.content, "html.parser")

# Find all hyperlinks to course sections
links = soup.find_all("a", href=True)

# Filter out valid course links (e.g., "/ai/" for A I department)
course_links = [base_url + link["href"] for link in links if "/coursesatoz/" in link["href"] and link["href"] != "/general-information/coursesatoz/"]

# Data structure to store course data
course_data = []

# Visit each department's page and extract course information
for index, link in enumerate(course_links, start=1):
    print(f"Scraping department {index}/{len(course_links)}: {link}")
    department_response = requests.get(link)
    department_soup = BeautifulSoup(department_response.content, "html.parser")

    # Find all <h5> tags with course titles
    course_titles = department_soup.find_all("h5")

    for course in course_titles:
        # Extract and process the course title
        full_title = course.text.strip()

        try:
            # Split the title into course_id(s) and course_name
            # Typically: "B A 188T, 288T, 388T. Strategic Management."
            # Split on '. ' to separate course IDs from course name
            parts = full_title.split('. ', 1)
            if len(parts) != 2:
                # If this doesn't give us 2 parts, skip
                continue

            course_ids_part, course_name = parts
            # Remove trailing period if present in the course_name
            course_name = course_name.strip().rstrip('.').strip()

            # Check if multiple course IDs are listed (comma-separated)
            if ',' in course_ids_part:
                # e.g. "B A 188T, 288T, 388T"
                course_id_variants = [cid.strip() for cid in course_ids_part.split(',')]
            else:
                # Just one course ID
                course_id_variants = [course_ids_part.strip()]

            # The department prefix and format can be inferred from the first variant
            # The first variant should contain the department and the course number, e.g. "B A 188T"
            first_variant = course_id_variants[0]
            first_variant_parts = first_variant.split()
            # Department is all but the last part of the first variant
            # e.g. "B", "A", "188T" -> department = "B A"
            department = " ".join(first_variant_parts[:-1])

            # Process each variant
            for variant in course_id_variants:
                variant_parts = variant.split()
                # If the variant does not contain the department explicitly (like "288T"), prepend it
                if len(variant_parts) == 1:
                    # Only course number is present, attach department
                    full_course_id = department + " " + variant_parts[0]
                else:
                    # Department is already included
                    full_course_id = variant

                # Extract credit hours: assume first digit of the last part of the ID
                # e.g. "188T" -> credit_hours = 1
                last_part = full_course_id.split()[-1]
                credit_hours = int(last_part[0]) if last_part[0].isdigit() else None

                course_data.append({
                    "course_id": full_course_id,
                    "course_name": course_name,
                    "department": department,
                    "credit_hours": credit_hours,
                    "type": "In-Residence"
                })

                print(f"  Parsed course: {full_course_id} - {course_name}")

        except Exception as e:
            print(f"Error parsing title: {full_title} - {e}")

# Save data to CSV
with open("ut_courses.csv", "w", newline="", encoding="utf-8") as csvfile:
    fieldnames = ["course_id", "course_name", "department", "credit_hours", "type"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(course_data)

print("Course data saved to ut_courses.csv")
