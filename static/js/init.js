

/*
dom.get("export-btn").addEventListener("click", () => {
  const tableData = [];
  const hrow = dom.get('results-table').getElementsByTagName('thead')[0].children[0];
  const headers = Array.from(hrow.children).map(x => x.innerHTML);
  const trows = dom.get('results-table').getElementsByTagName('tbody')[0].children;
  // iterate over each row
  Array.from(trows).forEach(function(row, rowi) {
    const record = {};
    // iterate over each column
    Array.from(row.children).forEach(function(cell, celli) {
      const h = headers[celli];
      if (h === 'Synopsis'){
        record[h] = cell.children[0].innerHTML;
      } else if (h === "Remove") {
        record[h] = "";
      } else {
        record[h] = cell.innerHTML;
      };
    });
    tableData.push(record);
  });
  postData("/export_results", data={"results": tableData});
});



dom.get("import-btn").addEventListener("click", () => {
  getData("/get_saved_info").then(r => {
    const records = r["results"];
    console.log(records);
  })
});
*/

dom.get("paste-zone").addEventListener("input", () => {
  // get pasted lines and extract URLs and IDs
  const lines = dom.get("paste-zone").value.split(/\r?\n/);
  const urls = lines.filter(x => x.includes("https://www.grants.gov/web/grants/view-opportunity.html?oppId="));
  const oppIds = urls.map(x => x.split("?oppId=")[1]);
  // clear results
  dom.clearValue("paste-zone");
  
  // build the table
  buildResultsTable(oppIds);

});


function buildResultsTable(oppIds) {

  dom.clear('results-table-div');

  // make the table
  const [table, thead, tbody] = dom.make("table", {
    classes:"table table-sm table-hover",
    parent: "results-table-div",
    id: "results-table",
  });

  // set table headers
  const headers = ["#", "ID", "Agency", "Due", "Title", "Synopsis", "Remove"];


  // add table row for each opportunity
  oppIds.forEach(function (oppId, oppi) {


    // add headers to table
    if (oppi === 0) {
      const hrow = thead.insertRow();
      for (let h of headers) {
        const th = dom.make("th", {innerHTML: h, parent: hrow});
      };
    };
    // create the table row data
    const removeBtn = dom.make("btn", {type: "button", classes: "btn btn-sm btn-danger", innerHTML: "&#x2715;"});
    const rowData = [
      `<b>${oppi + 1}</b>`, // index
      `<a target="_blank" href="https://www.grants.gov/web/grants/view-opportunity.html?oppId=${oppId}">${oppId}</a>`, // ID
      "", // agency
      "", // due date
      "", // opportunity title
      "", // synopsis
      removeBtn, // delete row button
    ];
    // add table row
    const row = tbody.insertRow();

    rowData.forEach(function(col, coli) {


      const cell = row.insertCell();
      if (headers[coli] === "Agency") {
        cell.id = `cell-agency-${oppId}`;
      } else if (headers[coli] === "Due") {
        cell.id = `cell-duedate-${oppId}`;
      } else if (headers[coli] === "Title") {
        cell.id = `cell-title-${oppId}`;
      } else if (headers[coli] === "Synopsis") {

        const div = dom.make("div", {
          id: `cell-synopsis-${oppId}`,
          parent: cell,
          style: {"font-size": "0.8rem", "max-height": "300px", "overflow": "auto"},
        });
        //cell.appendChild(div);

      } else if (typeof col === "string") {
        cell.innerHTML = col;
      } else {
        cell.appendChild(col);
      };
    });

    // after button is addeed to row, add its logic
    removeBtn.addEventListener('click', () => {removeTableRow(removeBtn)});

    // get additional data from grants.gov
    postData("/request_opportunity_info", data={"oppId": oppId})
    .then(r => {
      console.log(r);

      const synopsis = r.synopsis.synopsisDesc;
      const agency = r.agencyDetails.agencyCode;
      dom.get(`cell-synopsis-${oppId}`).innerHTML = synopsis;
      dom.get(`cell-agency-${oppId}`).innerHTML = agency;
      dom.get(`cell-duedate-${oppId}`).innerHTML = r.originalDueDate;
      dom.get(`cell-title-${oppId}`).innerHTML = r.opportunityTitle;
      //console.log(synopsis);
    });

  });
};







function removeTableRow(btn) {
  var row = btn.parentNode.parentNode;
  row.parentNode.removeChild(row);
};