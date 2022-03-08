import json
import requests
from flask import Flask, render_template, request
from utils import utils

app = Flask(__name__)


@app.route("/download_grantsgov")
def download_grantsgov():
    """Download the XML file of opportunities from Grants.gov"""



@app.route("/export_results", methods=["POST"])
def export_results():
    r = request.get_json()
    results = r["results"]
    print(results)
    utils.dict_to_json_file({"results": results}, "saved.json")
    return {}

@app.route("/request_opportunity_info", methods=["POST"])
def request_opportunity_info():
    r = request.get_json()
    opp_id = r["oppId"]
    result = utils.get_opp_details(opp_id)
    return result


@app.route("/get_saved_info")
def get_saved_info():
    """Get saved opportunity information from file"""
    info = utils.json_file_to_dict("saved.json")
    return info


@app.route("/")
def index():
    return render_template("index.html")



if __name__ == "__main__":
    app.run(debug=True)
