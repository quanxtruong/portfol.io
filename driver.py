from parser import Parser
from gpa import GPA
from bs4 import BeautifulSoup
import pandas as pd

DEGREE_AUDIT_PATH = "Results - IDA.html"

def main():

    gpa = GPA(DEGREE_AUDIT_PATH)

    print(gpa.get_major_classes())


if __name__ == "__main__":
    main()
