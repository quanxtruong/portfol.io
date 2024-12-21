import csv
from bs4 import BeautifulSoup

# Load the HTML file
file_path = "C S - Computer Science _ The University of Texas at Austin.html"
with open(file_path, "r", encoding="utf-8") as file:
    html_content = file.read()

# Parse the HTML
soup = BeautifulSoup(html_content, "html.parser")

# Find all <h5> tags containing course titles
course_titles = [tag.get_text(strip=True) for tag in soup.find_all("h5")]

# Save the course titles to a CSV
csv_file = "course_titles.csv"
with open(csv_file, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["Course Title"])
    for title in course_titles:
        writer.writerow([title])

print(f"Extracted {len(course_titles)} course titles and saved them to {csv_file}.")
