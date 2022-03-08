import json
import requests



def dict_to_json_file(d: dict, filepath: str):
    """Save a dict as a JSON file"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=4)


def json_file_to_dict(filepath: str):
    """Read a JSON file as a dict"""
    with open(filepath) as f:
        return json.load(f)


def get_opp_details(opp_id: str):
    """From a Grants.gov oppotunity ID, request its info"""
    r = requests.post(
        "https://www.grants.gov/grantsws/rest/opportunity/details",
        data={'oppId': str(opp_id)},
    )
    return r.json()




if __name__ == "__main__":
    d = {"a": 1, "b": [1,2,3]}
    dict_to_json_file(d, "test.json")