
function load_content(){
  rows = document.getElementsByClassName("TblResultLines");
  for (i in rows){
    var row = rows[i];
    var parent = row.parentElement;
    if (!parent) continue;
    var m = parent.getAttribute('onClick').match(/\d+/);
    if (m){
      var row_id = m[0];
      parent.row_id = row_id;
      parent.addEventListener('mouseenter',function(){
        console.debug("Row ID: " + this.row_id);
        var row_element = this;

        //Don't invoke if full notam was already added to page
        if (this.getElementsByClassName('full_notam').length>0) return;

        get_notam_data(this.row_id, function(notam_text){
          add_results_to_row(row_element, notam_text)
        },
        function(){ ////This is the ERROR callback
          add_results_to_row(row_element, 'ERROR!!');
        });
      });
    }
  }
};

function get_notam_data(rowid, callback_success, callback_failed){

  var key = 'rowid'+rowid;
  var result_text = '';
  chrome.storage.local.get(key, function(result) {
    if (result[key]){
      notam_text = result[key];
      callback_success(notam_text);
    }else{
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "http://brin.iaa.gov.il/MobileAeroinfo/maiDetails.aspx?scrpos=0&mode=notam&rowID=" + rowid, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          // innerText does not let the attacker inject HTML elements.
          //document.getElementById("DivDetailsResults").innerText = xhr.responseText;
          d = document.createElement('div');
          d.innerHTML = xhr.responseText;
          if (d.getElementsByClassName('DivDetailsResults').length > 0){
            //We have results from AJAX
            var notam_text = d.getElementsByClassName('DivDetailsResults')[0].textContent.trim();
            console.debug('Got NOTAM text from ajax: ' + notam_text);
            var key='rowid'+rowid;
            chrome.storage.local.set({ [key] : notam_text }, function() {
                    console.debug('Storage added ' + key + ' ' + notam_text);
            });
            callback_success(notam_text);
          }else{
            callback_failed();
          }

        }
      }
      xhr.send();
    }
  });


}

function add_results_to_row(row, text){
  var td = document.createElement('td');
  td.setAttribute('class', 'full_notam');
  td.textContent = text;
  row.appendChild(td);
}

function get_from_storage(row_id){

}

load_content();
