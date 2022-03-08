const dom = {

  show (id) {
    document.getElementById(id).style.display = "block";
  },

  hide (id) {
    document.getElementById(id).style.display = "none";
  },

  get (id) {
    return document.getElementById(id);
  },

  clear (id) {
    document.getElementById(id).innerHTML = "";
  },

  clearValue (id) {
    document.getElementById(id).value = "";
  },


  makeId (n=12) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz'.split('');
    var id = '';
    for (var i = 0; i < n; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    };
    return id;
  },

  make (tag="div", info={}) {
    /*
    Make a DOM element.
    Inputs:
    type: string representation of element. e.g. "div", "a", "button"
    info: object containing the element info. Example:
    info = {
      'id': 'el_id',
      'classes': 'mt-2 bg-dark',
      'style': {'overflow': 'auto'},
      'parent': 'parent_id',
      'datasets': {"dataset1": "hello", "dataset2": [1,2,3]}
    }
    Output: element which was created.
    If created element is a table, output is [table, thead, tbody]
    */
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(info)) {
      if (k === "style") {
        Object.assign(el.style, v);
      } else if (k === "classes") {
        for (let c of v.split(" ")){
          el.classList.add(c);
        };
      } else if (k === "parent") {
        if (typeof v === "string") {
          document.getElementById(v).appendChild(el);
        } else {
          v.appendChild(el);
        };
      } else if (k === "datasets") {
        for (const [dname, dval] of Object.entries(v)){
          el.setAttribute(`data-${dname}`, dval);
        };
      } else if (k === "innerHTML") {
        el.innerHTML = v;
      } else if (['id', 'src', 'name', 'type', 'href', 'target', 'text', 'value', 'height', 'width'].includes(k)) {
        el.setAttribute(k, v);
      } else if (k === "children") {
        for (let c of v){
          const el_child = dom.make(c[0], c[1]);
          el.appendChild(el_child);
        };
      } else if (k !== "tableData") {
        console.log(`No action performed for new component with info key: ${k}`);
      };
    };
    if (tag === "table") {
      const thead = document.createElement('thead');
      const tbody = document.createElement('tbody');
      el.appendChild(thead);
      el.appendChild(tbody);

      // populate the table if data is provided
      if (info.hasOwnProperty('tableData')) {
        const headers = Object.keys(info.tableData[0]);
        const headrow = thead.insertRow();
        // populate table headers
        for (let h of headers) {
          const th = document.createElement('th');
          th.innerHTML = h;
          headrow.appendChild(th);
        };
        // populate table body
        for (let record of info.tableData){
          const row = tbody.insertRow();
          for (let h of headers){
            const cell = row.insertCell();
            if (typeof record[h] === "string"){
              cell.innerHTML = record[h];
            } else {
              cell.appendChild(record[h]);
            };
            
          };
        };
      };
      // return table
      return [el, thead, tbody];
    } else {
      return el;
    };
  },

};

// send POST request to retrieve data from the server
async function postData(url="", data={}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  return response.json();
};

// send GET request to retrieve data from the server
async function getData(url) {
  const response = await fetch(url, {method: 'GET'});
  return response.json();
};
