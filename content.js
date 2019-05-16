
var ajax_count = 0;
function load_content(){
  rows = document.getElementsByClassName("TblResultLines");
  for (i in rows){
    var row = rows[i];
    var parent = row.parentElement;
    if (!parent) continue;
    var m = parent.getAttribute('onClick').match(/\d+/);
    if (m){
      var notamid = row.getElementsByClassName('DivRecordID')[0].textContent.trim();
      var row_id = m[0];
      parent.row_id = row_id;
      parent.notamid = notamid;
      console.debug("Row ID: " + parent.row_id);


      //Don't invoke if full notam was already added to page
      if (parent.getElementsByClassName('full_notam').length>0) return;

      get_notam_data(parent.row_id, (function(notam_text){
        add_results_to_row(this, notam_text)
      }).bind(parent),
      (function(){ ////This is the ERROR callback
        add_results_to_row(this, 'ERROR!!');
      }).bind(parent));

      // parent.addEventListener('mouseenter',function(){
      //
      // });
    }

  }
};

function get_notam_data(rowid, callback_success, callback_failed){

  var key = 'rowid'+rowid;
  var result_text = '';
  chrome.storage.local.get(key, function(result) {
    if (result[key]){
      console.debug(key + ': Retrieved NOTAM from cache');
      notam_text = result[key];
      callback_success(notam_text);
    }else{
      if (ajax_count>10){
        console.debug(key + ': Could not retrive NOTAM...');
        callback_failed();
        return;
      }
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "http://brin.iaa.gov.il/MobileAeroinfo/maiDetails.aspx?scrpos=0&mode=notam&rowID=" + rowid, true);
      xhr.onreadystatechange = function() {
        var key='rowid'+rowid;
        if (xhr.readyState == 4) {
          // innerText does not let the attacker inject HTML elements.
          //document.getElementById("DivDetailsResults").innerText = xhr.responseText;
          d = document.createElement('div');
          d.innerHTML = xhr.responseText;
          if (d.getElementsByClassName('DivDetailsResults').length > 0){
            //We have results from AJAX
            var notam_text = d.getElementsByClassName('DivDetailsResults')[0].textContent.trim();
            console.debug('Got NOTAM text from ajax: ' + notam_text);

            chrome.storage.local.set({ [key] : notam_text }, function() {
                    console.debug('Storage added ' + key + ' ' + notam_text);
            });
            console.debug(key + ': Retrieved NOTAM from AJAX');
            callback_success(notam_text);
          }else{
            console.debug(key + ': Could not retrive NOTAM...');
            callback_failed();
          }

        }
      }
      xhr.send();
      ajax_count++;
    }
  });


}

function add_results_to_row(row, text){
  var td = document.createElement('td');
  td.setAttribute('class', 'full_notam');
  td.textContent = text;
  row.appendChild(td);
  row.getElementsByClassName("TblResultLines")[0].style.width = "30%";
}

function get_from_storage(row_id){

}

load_content();
