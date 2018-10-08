
// Initialise the Zendesk JavaScript API client
// https://developer.zendesk.com/apps/docs/apps-v2
var client = ZAFClient.init();

//EVENT LISTENERS HERE:

document.getElementById("load_organization_fields_button").addEventListener("click", function(){
  loadOrganizationFields();
  var temp_button = document.getElementById("load_organization_fields_button");
  temp_button.value = "Pick fields to edit:";
  temp_button.disabled = "true";
  temp_button.style.backgroundColor = "transparent";
  temp_button.style.color = "#777777";
  temp_button.style.border = "none";
  document.getElementById("load_organizations_button").style.visibility = "visible";
  document.getElementById("step_two_tip_paragraph").style.visibility = "visible";
});

document.getElementById("load_organizations_button").addEventListener("click", function(){
  loadOrganizations();
  document.getElementById("previous_page_button").style.visibility = "visible";
  document.getElementById("next_page_button").style.visibility = "visible";
  document.getElementById("pick_all_orgs").style.visibility = "visible";
  document.getElementById("load_organizations_button").style.visibility = "hidden";
  document.getElementById("list_picked_organizations_title_paragraph").style.visibility = "visible";
  document.getElementById("confirm_picked_fields_and_organizations_button").style.visibility = "visible";

});

document.getElementById("next_page_button").addEventListener("click", function(){
  loadNextPage();
});

document.getElementById("previous_page_button").addEventListener("click", function(){
  loadPreviousPage();
});

document.getElementById("confirm_picked_fields_and_organizations_button").addEventListener("click", function(){
  if (my_g_chosen_organizations_array.length >= 1){
    if (my_g_fields_for_editing_by_name.length >= 1) {
      console.log(my_g_chosen_organizations_array.length + " ++ " + my_g_all_organizations + " ++ " + my_g_fields_for_editing_by_name.length);

      document.getElementById("confirm_picked_fields_and_organizations_button").disabled = "false";
      openInputValuesOverlay();
      getOrganizationFieldsChosenForEdit();
    }
    else {
      console.log(my_g_chosen_organizations_array.length + " ++ " + my_g_all_organizations + " ++ " + my_g_fields_for_editing_by_name.length);
      document.getElementById( "status_progress_p" ).textContent ="Both, organization fields and organizations, have to be selected";
      $( "#status_progress_p" ).dialog({
        closeOnEscape: false,
        draggable: false,
        modal: true,
        minWidth: 600,
        buttons: {
          Ok  : function() {
            $( this ).dialog( "close" );
          }
        }
      });
    }
  }
  else if (my_g_all_organizations == true) {
    if (my_g_fields_for_editing_by_name.length >= 1) {
      console.log(my_g_chosen_organizations_array.length + " ++ " + my_g_all_organizations + " ++ " + my_g_fields_for_editing_by_name.length);

      document.getElementById("confirm_picked_fields_and_organizations_button").disabled = "false";
      openInputValuesOverlay();
      getOrganizationFieldsChosenForEdit();
    }
    else {
      console.log(my_g_chosen_organizations_array.length + " ++ " + my_g_all_organizations + " ++ " + my_g_fields_for_editing_by_name.length);
      document.getElementById( "status_progress_p" ).textContent="Both, organization fields and organizations, have to be selected";
      $( "#status_progress_p" ).dialog({
        closeOnEscape: false,
        draggable: false,
        modal: true,
        minWidth: 600,
        buttons: {
          Ok  : function() {
            $( this ).dialog( "close" );
          }
        }
      });
    }
  }
  else {
    console.log(my_g_chosen_organizations_array.length + " ++ " + my_g_all_organizations + " ++ " + my_g_fields_for_editing_by_name.length);
    document.getElementById( "status_progress_p" ).textContent ="Both, organization fields and organizations, have to be selected";
    $( "#status_progress_p" ).dialog({
      closeOnEscape: false,
      draggable: false,
      modal: true,
      minWidth: 600,
      buttons: {
        Ok  : function() {
          $( this ).dialog( "close" );
        }
      }
    });
  }
});

document.getElementById("update_organizations_button").addEventListener("click", function(){

  document.getElementById("status_progress_p").textContent = "Updating... Do not close/reload the page";

  $( function() {
    $( "#status_progress_p" ).dialog({
      closeOnEscape: false,
      draggable: false,
      modal: true,
      minWidth: 600,
      buttons: {
      }

    })
  });

  if (my_g_all_organizations == true) {
    my_g_chosen_organizations_array = [];

    var requestURL = 'https://' + appData.config.contextVar.account.subdomain + '.zendesk.com/api/v2/organizations.json?per_page=1000';
    getAllOrganizations(requestURL);
  }else {
    var requestURL = 'https://' + appData.config.contextVar.account.subdomain + '.zendesk.com/api/v2/organizations.json?per_page=1000';
    startUpdate();
  }

});

document.getElementById("reload_application").addEventListener("click", function(){
  location.reload(true);
});

document.getElementById("pick_all_orgs").addEventListener("click", function(){
  document.getElementById("confirm_picked_fields_and_organizations_button").style.visibility = "visible";

  pickAllOrganizations();
});


//Load context
var appData = {
  config: {
    contextVar: client.context().then(function (context) {
      appData.config.contextVar = context;
    }),
    organization_fields_data: {
    }
  },

}

//Global variables

//Stores organizations for edit
var my_g_fields_for_editing_by_id = [];
var my_g_chosen_organizations_array = [];
var my_g_chosen_organizations_names_array = [];
var my_g_previous_page_URL = null;
var my_g_next_page_URL = null;
var my_g_current_page = 0;
var my_g_fields_for_editing_by_name = [];
var my_g_all_organizations = false;
var my_job_reports_urls = [];
var my_job_reports_details = [];


function setRequestParameters(requestURL, method, dataObj){
  document.getElementById("status_progress_p").textContent = "Loading...";
  $( function() {
    $( "#status_progress_p" ).dialog({
      closeOnEscape: false,
      draggable: false,
      modal: true,
      minWidth: 600,
      buttons: {}
    });
  });

  switch (method) {
    case 'GET':
    var requestParameters = {
      url: requestURL,
      type: 'GET',
      dataType: 'text',
    };
    break;

    case 'PUT':
    var requestParameters = {
      url: requestURL,
      type: 'PUT',
      contentType: 'application/json',
      data: dataObj
    };
    break;

  };
  return requestParameters;
};


//Load Organization fields
function loadOrganizationFields(){

  var requestURL = 'https://' + appData.config.contextVar.account.subdomain + '.zendesk.com/api/v2/organization_fields.json';
  var method = 'GET';

  var getRequestParameters = setRequestParameters(requestURL, method);

  var request_results;

  //Makes a request (Pass request parameters as requestParameters)
  client.request(getRequestParameters).then(
    function (data) {

      //Parse data
      request_results = JSON.parse(data);

      displayOrganizationFields(request_results);

      appData.config.organization_fields_data = request_results;
    }
  );
};

//Insert Organization fields to table
function displayOrganizationFields(organization_fields_data){

  for (var i = 0; i < organization_fields_data.count; i++) {
  /*  if (i % 10 == 0 && i > 0) {
      var row = document.getElementById("organization_fields_table_row");
      var line_break = document.createElement("BR");
      row.appendChild(line_break);
    };  */
    if (organization_fields_data.organization_fields[i].active == true) {
      var table = document.getElementById("organization_fields_table");
      var row = document.getElementById("organization_fields_table_row");
      var my_element = document.createElement("p");
      var cell1 = row.appendChild(my_element);
      cell1.textContent = organization_fields_data.organization_fields[i].title;
      cell1.setAttribute('data-c_zendesk_key', organization_fields_data.organization_fields[i].key);
      cell1.setAttribute('class', "displayed_organization_fields");
      cell1.setAttribute('onClick', "organizationFieldCellClick(this)");
      cell1.setAttribute('data-c_is_for_edit', 'false');
      cell1.setAttribute('data-c_zendesk_id', organization_fields_data.organization_fields[i].id);
    }
  };
  $( "#status_progress_p" ).dialog( "close" );
};

function organizationFieldCellClick(picked_organization_field){
  if(picked_organization_field.dataset.c_is_for_edit === "false"){
    picked_organization_field.style.backgroundColor = "#dddddd";
    picked_organization_field.dataset.c_is_for_edit = "true"
    my_g_fields_for_editing_by_id.push(picked_organization_field.dataset.c_zendesk_id);
    my_g_fields_for_editing_by_name.push(picked_organization_field.dataset.c_zendesk_key);
  }
  else {
    picked_organization_field.style.backgroundColor = "inherit";
    picked_organization_field.dataset.c_is_for_edit = "false"

    for (var i = 0; i < my_g_fields_for_editing_by_id.length; i++) {
      if (my_g_fields_for_editing_by_id[i] == picked_organization_field.dataset.c_zendesk_id){
        my_g_fields_for_editing_by_id.splice(i, 1);
        my_g_fields_for_editing_by_name.splice(i, 1);
      };
    }
  };
};

function loadOrganizations(){

  var requestURL = 'https://' + appData.config.contextVar.account.subdomain + '.zendesk.com/api/v2/organizations.json?per_page=15';
  var method = 'GET'

  var getRequestParameters = setRequestParameters(requestURL, method);

  var request_results;
  //Makes a request (Pass request parameters as requestParameters)
  client.request(getRequestParameters).then(
    function (data) {
      //Parse data
      request_results = JSON.parse(data);
      my_g_previous_page_URL = request_results.previous_page;
      my_g_next_page_URL = request_results.next_page;
      if (my_g_next_page_URL == null) {
        document.getElementById("next_page_button").disabled = true;
        document.getElementById("next_page_button").style.backgroundColor = "#dddddd";
      }
      else {
        document.getElementById("next_page_button").disabled = false;
        document.getElementById("next_page_button").style.backgroundColor = "transparent";

      }
      if (my_g_previous_page_URL == null) {
        document.getElementById("previous_page_button").disabled = true;
        document.getElementById("previous_page_button").style.backgroundColor = "#dddddd";

      }
      else {
        document.getElementById("next_page_button").disabled = false;
        document.getElementById("next_page_button").style.backgroundColor = "transparent";

      }
      my_g_current_page = 1;
      displayOrganizations(request_results);
    }
  );

};

function displayOrganizations(organizationsData){

  for (var i = 0; i < organizationsData.organizations.length; i++) {

    var table = document.getElementById("list_organizations_by_name_table");
    var row = document.getElementById("list_organizations_by_name_table_row");
    var cell1 = table.insertRow(0);

    cell1.textContent = organizationsData.organizations[i].name;
    cell1.setAttribute('class', "listed_organizations_by_name");
    cell1.setAttribute('id', organizationsData.organizations[i].id);
    cell1.setAttribute('onClick', "checkIfOrganizationIsAlreadyChosen(this)");

    if(i == 4 || i == 9){
      var line_break = document.createElement("BR");
      row.appendChild(line_break);
    };
  };

  $( "#status_progress_p" ).dialog( "close" );


};

function checkIfOrganizationIsAlreadyChosen(organization_by_name_data){
  var css = 'listed_organizations_by_name:hover {  background-color: #dddddd color: #000000}';

  var counter_for_push = 0;
  for (var i = 0; i < my_g_chosen_organizations_array.length; i++) {
    if (organization_by_name_data.id === my_g_chosen_organizations_array[i]) {
      counter_for_push = 1;
      organization_by_name_data.style = css;
      my_g_chosen_organizations_array.splice(i, 1);
      my_g_chosen_organizations_names_array.splice(i, 1);
    };
  };
  if (counter_for_push == 0){
    my_g_chosen_organizations_array.push(organization_by_name_data.id);
    my_g_chosen_organizations_names_array.push(organization_by_name_data.textContent);
    organization_by_name_data.style.backgroundColor = "#dddddd";
    document.getElementById("confirm_picked_fields_and_organizations_button").style.visibility = "visible";
  };
  document.getElementById("display_picked_organizations_paragraph").textContent = my_g_chosen_organizations_names_array;
};

function loadNextPage(){


  var row = document.getElementById("list_organizations_by_name_table_row");
  var rowLength = document.getElementById("list_organizations_by_name_table_row").cells.length;

  if(my_g_next_page_URL != null){

    document.getElementById("list_organizations_by_name_table").innerHTML  =" <tr id="+"list_organizations_by_name_table_row"+"></tr>";
    var method = 'GET';

    var getRequestParameters = setRequestParameters (my_g_next_page_URL, method);
    var request_results;

    //Makes a request (Pass request parameters as requestParameters)
    client.request(getRequestParameters).then(
      function (data) {

        //Parse data
        request_results = JSON.parse(data);


        my_g_previous_page_URL = request_results.previous_page;
        my_g_next_page_URL = request_results.next_page;
        if (my_g_next_page_URL == null) {
          document.getElementById("next_page_button").disabled = true;
          document.getElementById("next_page_button").style.backgroundColor = "#dddddd";
        }
        else {
          document.getElementById("next_page_button").disabled = false;
          document.getElementById("next_page_button").style.backgroundColor = "transparent";

        }
        if (my_g_previous_page_URL == null) {
          document.getElementById("previous_page_button").disabled = true;
          document.getElementById("previous_page_button").style.backgroundColor = "#dddddd";

        }
        else {
          document.getElementById("previous_page_button").disabled = false;
          document.getElementById("previous_page_button").style.backgroundColor = "transparent";

        }
        my_g_current_page += 1;

        displayOrganizations(request_results);
        highlightIfOrganizationChosen(request_results);
      }
    );
  };
};

function loadPreviousPage(){


  var row = document.getElementById("list_organizations_by_name_table_row");
  var rowLength = document.getElementById("list_organizations_by_name_table_row").cells.length;

  if(my_g_previous_page_URL != null){
    var method = 'GET';
    document.getElementById("list_organizations_by_name_table").innerHTML  =" <tr id="+"list_organizations_by_name_table_row"+"></tr>";
    var getRequestParameters = setRequestParameters (my_g_previous_page_URL, method);
    var request_results;


    //Makes a request (Pass request parameters as requestParameters)
    client.request(getRequestParameters).then(
      function (data) {

        //Parse data
        request_results = JSON.parse(data);


        my_g_previous_page_URL = request_results.previous_page;
        my_g_next_page_URL = request_results.next_page;
        if (my_g_next_page_URL == null) {
          document.getElementById("next_page_button").disabled = true;
          document.getElementById("next_page_button").style.backgroundColor = "#dddddd";
        }
        else {
          document.getElementById("next_page_button").disabled = false;
          document.getElementById("next_page_button").style.backgroundColor = "transparent";

        }
        if (my_g_previous_page_URL == null) {
          document.getElementById("previous_page_button").disabled = true;
          document.getElementById("previous_page_button").style.backgroundColor = "#dddddd";

        }
        else {
          document.getElementById("previous_page_button").disabled = false;
          document.getElementById("previous_page_button").style.backgroundColor = "transparent";

        }
        my_g_current_page -= 1;

        displayOrganizations(request_results);
        highlightIfOrganizationChosen(request_results);
      }
    );
  };
};

//Highlight clicked organization
function highlightIfOrganizationChosen(displayed_organizations){
  for (var x = 0; x < my_g_chosen_organizations_array.length; x++){
    for (var i = 0; i < displayed_organizations.organizations.length; i++) {
      if (my_g_chosen_organizations_array[x] == displayed_organizations.organizations[i].id) {
        document.getElementById(displayed_organizations.organizations[i].id).style.backgroundColor = "#dddddd";
      }
    };
  };
};


//Open PopUp page for value input
function openInputValuesOverlay(){
  document.getElementById("input_field_values_popup_div").style.visibility = "visible";
  document.getElementById("page_one_separator").textContent = ".";
};


//Add elements to PopUp page
function getOrganizationFieldsChosenForEdit(){
  var counter = 0;
  var get_popup_div = document.getElementById("input_field_values_popup_div");
  for (var i = 0; i < my_g_fields_for_editing_by_id.length; i++) {
    var type_of_current_element = "not defined";
    for (var y = 0; y < appData.config.organization_fields_data.organization_fields.length; y++) {
      if(my_g_fields_for_editing_by_id[i] == appData.config.organization_fields_data.organization_fields[y].id){
        var createInputField = document.createElement("input");
        var createTextAreaField = document.createElement("textarea");
        var fieldInputTitle = document.createElement("p");
        var createDropDownSelect = document.createElement("select");
        var fieldSet = document.createElement("fieldset");
        type_of_current_element = appData.config.organization_fields_data.organization_fields[y].type;
        var currentFieldTitle = appData.config.organization_fields_data.organization_fields[y].title;
        switch (type_of_current_element) {
          case "textarea":
          get_popup_div.appendChild(fieldInputTitle);
          var t = document.createTextNode(currentFieldTitle + ": ");
          fieldInputTitle.setAttribute('id', 'field_is_for_edit_title');
          fieldInputTitle.setAttribute('class', 'u-gamma');
          fieldInputTitle.appendChild(t);
          fieldInputTitle.appendChild(createTextAreaField);
          createTextAreaField.setAttribute('class', 'textAreaInput');
          createTextAreaField.setAttribute('id', appData.config.organization_fields_data.organization_fields[y].key);
          counter++;
          break;

          case "checkbox":
          get_popup_div.appendChild(fieldInputTitle);
          var t = document.createTextNode(currentFieldTitle + ": ");
          fieldInputTitle.setAttribute('id', 'field_is_for_edit_title');
          fieldInputTitle.setAttribute('class', 'u-gamma');
          fieldInputTitle.appendChild(t);
          fieldInputTitle.appendChild(createInputField);
          createInputField.setAttribute('type', 'checkbox');
          createInputField.setAttribute('class', 'checkboxInput');
          createInputField.setAttribute('data-zendeskType', 'checkbox');
          createInputField.setAttribute('id', appData.config.organization_fields_data.organization_fields[y].key);
          counter++;
          break;

          case "date":
          get_popup_div.appendChild(fieldInputTitle);
          var t = document.createTextNode(currentFieldTitle + ": ");
          fieldInputTitle.setAttribute('id', 'field_is_for_edit_title');
          fieldInputTitle.setAttribute('class', 'u-gamma');
          fieldInputTitle.appendChild(t);
          fieldInputTitle.appendChild(createInputField);
          createInputField.setAttribute('type', 'date');
          createInputField.setAttribute('class', 'dateInput');
          createInputField.setAttribute('data-zendeskType', 'date');
          $( function() {
            $( ".dateInput" ).datepicker({
              dateFormat: "yy-mm-dd"
            });
          } );
          createInputField.setAttribute('id', appData.config.organization_fields_data.organization_fields[y].key);
          counter++;
          break;

          case "integer":
          get_popup_div.appendChild(fieldInputTitle);
          var t = document.createTextNode(currentFieldTitle + ": ");
          fieldInputTitle.setAttribute('id', 'field_is_for_edit_title');
          fieldInputTitle.setAttribute('class', 'u-gamma');
          fieldInputTitle.appendChild(t);
          fieldInputTitle.appendChild(createInputField);
          createInputField.setAttribute('type', 'number');
          createInputField.setAttribute('class', 'numberInput');
          createInputField.setAttribute('data-zendeskType', 'number');
          createInputField.setAttribute('id', appData.config.organization_fields_data.organization_fields[y].key);
          counter++;
          break;

          case "decimal":
          get_popup_div.appendChild(fieldInputTitle);
          var t = document.createTextNode(currentFieldTitle + ": ");
          fieldInputTitle.setAttribute('id', 'field_is_for_edit_title');
          fieldInputTitle.setAttribute('class', 'u-gamma');
          fieldInputTitle.appendChild(t);
          fieldInputTitle.appendChild(createInputField);
          createInputField.setAttribute('class', 'decimalNumberInput');
          createInputField.setAttribute('type', 'number');
          createInputField.setAttribute('data-zendeskType', 'number');
          createInputField.setAttribute('step', 'any');
          createInputField.setAttribute('id', appData.config.organization_fields_data.organization_fields[y].key);
          counter++;
          break;

          case "regexp":
          get_popup_div.appendChild(fieldInputTitle);
          var t = document.createTextNode(currentFieldTitle + ": ");
          fieldInputTitle.setAttribute('id', 'field_is_for_edit_title');
          fieldInputTitle.setAttribute('class', 'u-gamma');
          fieldInputTitle.appendChild(t);
          fieldInputTitle.appendChild(createInputField);
          createInputField.setAttribute('class', 'regexpInput');
          createInputField.setAttribute('data-zendeskType', 'regexp');
          createInputField.setAttribute('id', appData.config.organization_fields_data.organization_fields[y].key);
          counter++;
          break;

          //  (custom dropdown)
          case "dropdown":
          get_popup_div.appendChild(fieldInputTitle);
          var t = document.createTextNode(currentFieldTitle + ": ");
          fieldInputTitle.setAttribute('id', 'field_is_for_edit_title');
          fieldInputTitle.setAttribute('class', 'u-gamma');
          fieldInputTitle.appendChild(t);
          lengthOfCurrentElement = appData.config.organization_fields_data.organization_fields[y].custom_field_options.length;
          fieldInputTitle.appendChild(createDropDownSelect);
          createDropDownSelect.setAttribute('id', 'newDropDownTitle');
          createDropDownSelect.setAttribute('class', 'c-txt__input c-txt__input--select');
          for (var k = 0; k < lengthOfCurrentElement; k++) {
            var createDropDownOptions = document.createElement("option");
            createDropDownOptions.setAttribute('id', appData.config.organization_fields_data.organization_fields[y].custom_field_options[k].value);
            createDropDownOptions.setAttribute('class', 'c-menu__item');
            createDropDownOptions.setAttribute('value', appData.config.organization_fields_data.organization_fields[y].custom_field_options[k].value);
            createDropDownOptions.textContent = appData.config.organization_fields_data.organization_fields[y].custom_field_options[k].name;
            createDropDownSelect.append(createDropDownOptions);
          };
          createDropDownSelect.setAttribute('id', appData.config.organization_fields_data.organization_fields[y].key);
          createDropDownSelect.setAttribute('data-zendeskType', 'dropdown');
          counter++;
          break;

          //(default when no "type" is specified)
          case "text":
          get_popup_div.appendChild(fieldInputTitle);
          var t = document.createTextNode(currentFieldTitle + ": ");
          fieldInputTitle.setAttribute('id', 'field_is_for_edit_title');
          fieldInputTitle.setAttribute('class', 'u-gamma');
          fieldInputTitle.appendChild(t);
          fieldInputTitle.appendChild(createInputField);
          createInputField.setAttribute('type', 'text');
          createInputField.setAttribute('class', 'textInput');
          createInputField.setAttribute('data-zendeskType', 'text');
          createInputField.setAttribute('id', appData.config.organization_fields_data.organization_fields[y].key);
          counter++;
          break;

          default:
          get_popup_div.appendChild(fieldInputTitle);
          var t = document.createTextNode(currentFieldTitle + ": ");
          fieldInputTitle.setAttribute('id', 'field_is_for_edit_title');
          fieldInputTitle.setAttribute('class', 'u-gamma');
          fieldInputTitle.appendChild(t);
          fieldInputTitle.appendChild(createInputField);
          createInputField.setAttribute('type', 'text');
          createInputField.setAttribute('class', 'textInput');
          createInputField.setAttribute('data-zendeskType', 'text');
          createInputField.setAttribute('id', appData.config.organization_fields_data.organization_fields[y].key);
          counter++;
          break;
        }
      };
    };
  };
};


function startUpdate(url_temp){



  var jsonArrTemp = {organization: {organization_fields: { }}};

  for (var i = 0; i < my_g_fields_for_editing_by_name.length; i++) {
    var temp = document.getElementById(my_g_fields_for_editing_by_name[i]);
    var keyname = temp.id;
    var keyvalue = null;
    if (temp.dataset.zendesktype == "dropdown") {
      keyvalue = temp.value;
    }
    else if (temp.type == "checkbox") {
      if (temp.checked) {
        keyvalue = "true";
      }
      else {
        keyvalue = "false";
      }
    }
    else {
      var keyvalue = temp.value;
    }


    jsonArrTemp.organization.organization_fields[keyname] =  keyvalue;
  };

  jsonArrTemp = JSON.stringify(jsonArrTemp);


  performUpdate(jsonArrTemp);


};

function performUpdate(jsonArrTemp){

  setTimeout(function(){

    document.getElementById("status_progress_p").textContent = "Updating organizations... Batches remaining: " + Math.ceil(my_g_chosen_organizations_array.length/100 + "\n Error logs: ") ;
    $( function() {
      $( "#status_progress_p" ).dialog({
        closeOnEscape: false,
        draggable: false,
        closeOnEscape: false,
        modal: true,
        minWidth: 600,
      });
    });

    var temp = my_g_chosen_organizations_array.splice(0, 99);

    var requestURL = 'https://' + appData.config.contextVar.account.subdomain + '.zendesk.com/api/v2/organizations/update_many.json?ids=' + temp;
    var method = 'PUT';
    var getRequestParameters = setRequestParameters(requestURL, method, jsonArrTemp);


    client.request(getRequestParameters).then(
      function (data) {

        var requestResultURL = data.job_status.url;
        var result_method = 'GET';
        var getResultRequestParameters= setRequestParameters(requestResultURL, result_method);
        client.request(getResultRequestParameters).then(
          function(data2){

            var p_data = JSON.parse(data2);
            if ( p_data.job_status.results != null && p_data.job_status.results.length > 0) {
              document.getElementById("status_progress_p").textContent = " ";
              for (var i = 0; i < p_data.job_status.results.length; i++) {
                var node = document.createElement("LI");                 // Create a <li> node
                var textnode = document.createTextNode("Error [" + p_data.job_status.results[i].id + "]: " + p_data.job_status.results[i].error + " - " + p_data.job_status.results[i].details);         // Create a text node
                node.appendChild(textnode);                              // Append the text to <li>
                document.getElementById("status_progress_p").appendChild(node);     // Append <li> to <ul> with id="myList"
              };
            };


            if (my_g_chosen_organizations_array.length > 0) {
              performUpdate(jsonArrTemp);
            }
            else {
              $( function() {
                var node = document.createElement("LI");                 // Create a <li> node
                var textnode = document.createTextNode("Done");         // Create a text node
                node.appendChild(textnode);                              // Append the text to <li>
                document.getElementById("status_progress_p").appendChild(node);
                $( "#status_progress_p" ).dialog({
                  closeOnEscape: false,
                  draggable: false,
                  modal: true,
                  minWidth: 600,
                  buttons: {
                    Done: function() {
                      location.reload(true);
                    }
                  }
                });
              });

            };
          });
        });
      }, 1000);
    };

    function processJobReports(){
      var method = 'GET';
      while (my_job_reports_urls.length) {
        var temp = my_job_reports_urls.splice(0,1);
        var request_url = 'https://' + appData.config.contextVar.account.subdomain + "/api/v2/job_statuses/" + temp +".json"

        var getRequestParameters = setRequestParameters(request_url, method);

        client.request(getRequestParameters).then(
          function(data){
            for (var i = 0; i < data.job_status.results.length; i++) {

              my_job_reports_details[data.job_status.results[i].error] = data.job_status.results[i].details;

            };
          }
        );
      };

      document.getElementById("status_progress_p").textContent = my_job_reports_details;
      $( function() {
        $( "#status_progress_p" ).dialog({
          closeOnEscape: false,
          draggable: false,
          modal: true,
          minWidth: 600,
          buttons: {
            Cancel: function() {
              $( this ).dialog( "close" );
            }
          }
        });
      });
    }

    function pickAllOrganizations(){
      if (my_g_all_organizations == false) {
        my_g_all_organizations = true;
        document.getElementById("display_picked_organizations_paragraph").textContent = "All organizations";
        document.getElementById("pick_all_orgs").style.backgroundColor = "#dddddd";

      }
      else {
        if (my_g_chosen_organizations_names_array.length > 0) {
          document.getElementById("display_picked_organizations_paragraph").textContent = my_g_chosen_organizations_names_array;
          my_g_all_organizations = false;
          document.getElementById("pick_all_orgs").style.backgroundColor = "transparent";

        }
        else {
          document.getElementById("display_picked_organizations_paragraph").textContent = "";
          my_g_all_organizations = false;
          document.getElementById("pick_all_orgs").style.backgroundColor = "transparent";
        }
      }

    };

    function getAllOrganizations(temp_url){
      setTimeout(function(){
        var method = 'GET';
        var x = temp_url;
        var temp_storage;
        var getRequestParameters = setRequestParameters(x, method);
        client.request(getRequestParameters).then(

          function (data){

            temp_storage = JSON.parse(data);
            pushOrganizationIds(temp_storage);

            if (temp_storage.next_page != null) {
              my_g_all_organizations = false;
              checkIfReady(temp_storage.next_page);
            }
            else {
              startUpdate();
            }
          });
        }, 1000);
      };

      function checkIfReady(x) {
        getAllOrganizations(x);
      };

      function pushOrganizationIds(data) {
        var temp_new = data;
        for (var i = 0; i < temp_new.organizations.length; i++) {
          my_g_chosen_organizations_array.push(temp_new.organizations[i].id);
        };
      };
