var current_page = 1;
var records_per_page = 100;

var objJson = [
]; // Can be obtained from another source, such as your objJson variable

function prevPage()
{
    if (current_page > 1) {
        current_page--;
        changePage(current_page);
    }
}

function nextPage()
{
    if (current_page < numPages()) {
        current_page++;
        changePage(current_page);
    }
}
    
function changePage(page)
{
    var btn_next = document.getElementById("btn_next");
    var btn_prev = document.getElementById("btn_prev");
    var listing_table = document.getElementById("listingTable");
    var page_span = document.getElementById("page");
 
    // Validate page
    if (page < 1) page = 1;
    if (page > numPages()) page = numPages();

    listing_table.innerHTML = "";

    for (var i = (page-1) * records_per_page; i < (page * records_per_page); i++) {
        listing_table.innerHTML += objJson[i].name + "<br>";
    }
    page_span.innerHTML = page;

    if (page == 1) {
        btn_prev.style.visibility = "hidden";
    } else {
        btn_prev.style.visibility = "visible";
    }

    if (page == numPages()) {
        btn_next.style.visibility = "hidden";
    } else {
        btn_next.style.visibility = "visible";
    }
}

function numPages()
{
    return Math.ceil(objJson.length / records_per_page);
}

function init() {
  // reset page
  document.getElementById('error-msg').style.display = "none";
  document.getElementById('details').style.display = "none";

  var url = window.location.href;
  if (url.indexOf('http://localhost:8080/ticket_details.html') !== -1) {
    if (url.indexOf('access_token=') !== -1) {
      var access_token = readUrlParam(url, 'access_token');
      localStorage.setItem('zauth', access_token);
      var url = localStorage.getItem('url');
      document.getElementById('url').value = url;
      window.location.hash = "";
      makeRequest(access_token, url);
    }

    if (url.indexOf('error=') !== -1) {
      var error_desc = readUrlParam(url, 'error_description');
      var msg = 'Authorization error: ' + error_desc;
      showError(msg);
    }
  }
}

function getUserData(event) {
  localStorage.clear();
  event.preventDefault();
  document.getElementById('error-msg').style.display = "none";  // clear error messages
  var url = document.getElementById('url').value;
  if ((!url)) {
    showError('Oops, the field value is required to have a url.');
    return;
  }
  if (localStorage.getItem('zauth')) {
    var access_token = localStorage.getItem('zauth');
    makeRequest(access_token, url);
  } else {
    localStorage.setItem('url', url);
    startAuthFlow();
  }
}

function startAuthFlow() {
  var url = document.getElementById('url').value;
  var client_id = document.getElementById('client_id').value;
  var domain = url.split('/')[2];
  var endpoint = 'https://'+domain+'/oauth/authorizations/new';
  var url_params = '?' +
    'response_type=token' + '&' +
    'redirect_uri=http://localhost:8080/ticket_details.html' + '&' +
    'client_id='+client_id + '&' +
    'scope=' + encodeURIComponent('read write');
  window.location = endpoint + url_params;
}
function JSON2CSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = Object.keys(array[0]).join()+ '\r\n';
  var line = '';
  for (var i = 0; i < array.length; i++) {
      line = '';           
        for (var index in array[i]) {
            if(typeof array[i][index] == 'object'){
              line += JSON.stringify(array[i][index]).replace(/,/g, '|')+ ',';
            } else {
              line += array[i][index] + ',';
            }
          }

      line = line.slice(0, -1);
      str += line + '\r\n';
  }
  return str;
}

function makeRequest(token, url) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      if (request.status === 200) {
        var data = JSON.parse(request.responseText);
        var users = data.users;
        // var details_html = '<p style="color: #fff"> Users in your App are: <br><ol style="color: #fff">';
        // users.map(user => {
        //   details_html += '<li>' + user.name + '</li>';
        // })
        // details_html += '</ol></p>';
        objJson = users;
        changePage(1);
        var csv = JSON2CSV(users);
        var downloadLink = document.createElement("a");
        var blob = new Blob(["\ufeff", csv]);
        var url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = "data.csv";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        document.getElementById('details').innerHTML = details_html;
        document.getElementById('details').style.display = "inherit";
      } else {
        document.getElementById('details').style.display = "none";
        if (request.status === 0) {
          showError('There was a problem with the request. Make sure you\'re an agent or admin in Zendesk Support.');
        } else {
          showError('Oops, the request returned \"' + request.status + ' ' + request.statusText + '\".');
        }
      }
    }
  };
  var url = document.getElementById('url').value;//'https://trends.zendesk.com/api/v2/users.json';
  request.open('GET', url, true);
  request.setRequestHeader("Authorization", "Bearer " + token);
  request.send();
}

function showError(msg) {
  document.getElementById('error-msg').innerHTML = '<p> ' + msg + '</p>';
  document.getElementById('error-msg').style.display = "inherit";
}

function readUrlParam(url, param) {
  param += '=';
  if (url.indexOf(param) !== -1) {
    var start = url.indexOf(param) + param.length;
    var value = url.substr(start);
    if (value.indexOf('&') !== -1) {
      var end = value.indexOf('&');
      value = value.substring(0, end);
    }
    return value;
  } else {
    return false;
  }
}

window.addEventListener('load', init, false);
document.getElementById('get-btn').addEventListener('click', getUserData, false);