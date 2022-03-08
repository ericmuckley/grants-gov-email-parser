import os
import json
import time
import zipfile
import requests
import pandas as pd
from datetime import datetime, timedelta


def download_grants_xml():
    """
    Get the URL and filename of the most recent XML database file
    posted on grants.gov.
    """
    day_to_try = datetime.today()
    file_found = None
    while file_found is None:
        url = f"https://www.grants.gov/extract/GrantsDBExtract{day_to_try.strftime('%Y%m%d')}v2.zip"
        response = requests.get(url, stream=True)
        # look back in time if todays data is not posted yet
        if response.status_code == 200:
            file_found = url
        else:
            day_to_try = day_to_try - timedelta(days=1)
        filename = 'GrantsDBExtract{}v2.zip'.format(
            day_to_try.strftime('%Y%m%d'))
    print('Found database file {}'.format(filename))


    # remove all previously-downloaded zip files
    [os.remove(f) for f in os.listdir() if f.endswith(".zip")]

    # ping the dataset url
    response = requests.get(url, stream=True)
    # if file url is found
    if response.status_code == 200:
        # download zipped XML file
        handle = open(filename, "wb")
        for chunk in response.iter_content(chunk_size=512):
            if chunk:  # filter out keep-alive new chunks
                handle.write(chunk)
        handle.close()
        time.sleep(3)
        print('Database successfully downloaded')
    else:
        print('URL does not exist')
    return url, filename


def unzip(filename, unzipped_dirname):
    """Unzip a zip file and parse it using beautiful soup"""
    # if unzipped directory doesn't exist, create it
    if not os.path.exists(unzipped_dirname):
        os.makedirs(unzipped_dirname)
    # remove all previously-downloaded zip files
    for f in os.listdir(unzipped_dirname):
        os.remove(os.path.join(unzipped_dirname, f))
    # unzip raw file
    with zipfile.ZipFile(filename, "r") as z:
        z.extractall(unzipped_dirname)
    # get path of file in unzipped folder
    unzipped_filepath = os.path.join(
        unzipped_dirname,
        os.listdir(unzipped_dirname)[0])
    print('Database unzipped')


def to_date(date_str):
    """Convert date string from database into date object"""
    return datetime.strptime(date_str, '%m%d%Y').date()


def is_recent(date, days=14):
    """Check if date occured within n amount of days from today"""
    return (datetime.today().date() - to_date(date)).days <= days


def is_open(date):
    """Check if FOA is still open (closedate is in the past)"""
    if type(date) == float:
        return True
    elif type(date) == str:
        return (datetime.today().date() - to_date(date)).days <= 0


def reformat_date(s):
    """Reformat the date string with hyphens so its easier to read"""
    s = str(s)
    return s[4:]+'-'+s[:2]+'-'+s[2:4]


def sort_by_recent_updates(df):
    """Sort the dataframe by recently updated dates"""
    new_dates = [reformat_date(i) for i in df['lastupdateddate']]
    df.insert(1, 'updatedate', new_dates)
    df = df.sort_values(by=['updatedate'], ascending=False)
    print('Databae sorted and filtered by date')
    return df


def xml_to_filtered_df(xml_fp):
    """
    From unzippd XML filepath, convert to DataFrame and
    filter and relevant opportunities.
    """
    return ""



IGNORE_AGENCY_CODES = [
    "DOI-NPS",
    "GCERC",
    "DOL-ETA-VETS",
    "DOI-BIA",
    "DOD-NGIA",
]

IGNORE_AGENCY_CODE_GROUPS = [
    "USAID",
    "HHS",
    "DOS",
]




if __name__ == "__main__":

    
    #url, filename = download_grants_xml()

    #print(url, filename)


    #unzip(filename, unzipped_dirname=os.path.join("data", "unzipped"))


    unzipped_filenames = [f for f in os.listdir(os.path.join("data", "unzipped")) if f.endswith(".xml")]
    fp = os.path.join("data", "unzipped", unzipped_filenames[0])


    df_all = pd.read_xml(fp)

    records_all = df_all.to_dict("records")
    print(len(records_all))

    records = []

    for r in records_all:
        if not r["AgencyCode"] or r["AgencyCode"] in IGNORE_AGENCY_CODES:
            continue
        if any([x in r["AgencyCode"] for x in IGNORE_AGENCY_CODE_GROUPS]):
            continue

        if int(str(int(r["LastUpdatedDate"]))[-4:]) > 2021:
            records.append(r)

    df = pd.DataFrame(records)

    print(len(records))

    df.to_csv(os.path.join("data", "grantsgov_export.csv"))

    #df = pd.read_csv(os.path.join("data", "grantsgov_export.csv"))

    '''

    # include only FOAs which are not closed
    df = df[[is_open(i) for i in df['closedate']]]

    # sort by newest FOAs at the top
    df = sort_by_recent_updates(df)

    '''

