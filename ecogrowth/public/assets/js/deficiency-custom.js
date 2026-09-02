function escapeRegExp(string){
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function replaceAll(str, term, replacement) {
  return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
}
function showEditDeficiencyModal(deficiency_name,datacode,column_name){
    deficiency_name = capitalizeFirstLetter(replaceAll(deficiency_name, '_', ' '))
    $('#deficiency_name').text(deficiency_name);
    $('#datacode').val(datacode);
    $('#column_name').val(column_name);
    $('#editDeficidencyModal').modal('toggle');

}
function showTeacherEditDeficiencyModal(deficiency_name,datacode,column_name){
    if(deficiency_name == "address2"){
        deficiency_name = "Correspondence Address";
    }else{
        deficiency_name = capitalizeFirstLetter(replaceAll(deficiency_name, '_', ' '))
    }
    $('#deficiency_name').text(deficiency_name);
    $('#datacode').val(datacode);
    $('#column_name').val(column_name);
    $('#editDeficidencyModal').modal('toggle');

}
function showNonTeacherEditDeficiencyModal(deficiency_name,datacode,column_name){
    if(deficiency_name == "marital_status"){
        var html =  `
        <label for="" id="deficiency_name"></label>
        <select  class="form-control" id="column_value">
        <option value="Single">Single</option>
        <option value="Married">Married</option>
        <option value="Divorced">Divorced</option> 
        </select>
        `;
        $('#valueHtml').html(html);
    }

    if(deficiency_name == "address2"){
        deficiency_name = "Correspondence Address";
    }else{
        deficiency_name = capitalizeFirstLetter(replaceAll(deficiency_name, '_', ' '))
    }

    $('#deficiency_name').text(deficiency_name);
    $('#datacode').val(datacode);
    $('#column_name').val(column_name);
    $('#editDeficidencyModal').modal('toggle');

}

function saveStudentDeficiency(){
   var column_value = $('#column_value').val();
   if(column_value == ""){
    swal('Error','Please Enter Required Field','error');
    return false;
}else{
   var datacode = $('#datacode').val();
   var column_name = $('#column_name').val();
   $.ajax({
    type: "POST",
    url: "/deficiencies/update-student-deficiency/",
    data:{'datacode':datacode,'column_name':column_name,'column_value':column_value},
    success: function(data) {
        console.log(data);
        if(data){
            swal('Success','Student Details Updated Successfully','success');
            setTimeout(function(){
             window.location.reload(1);
         }, 2000);
        }else{
            swal('Oops','Something Went Wrong','error');
        }
    },
    error: function() {
        swal('Oops','Something Went Wrong','error');
    }
});
}
}
function saveTeacherDeficiency(){
   var column_value = $('#column_value').val();
   if(column_value == ""){
    swal('Error','Please Enter Required Field','error');
    return false;
}else{
   var datacode = $('#datacode').val();
   var column_name = $('#column_name').val();
   $.ajax({
    type: "POST",
    url: "/deficiencies/update-teacher-deficiency/",
    data:{'datacode':datacode,'column_name':column_name,'column_value':column_value},
    success: function(data) {
        console.log(data);
        if(data){
            swal('Success','Teacher Details Updated Successfully','success');
            setTimeout(function(){
             window.location.reload(1);
         }, 2000);
        }else{
            swal('Oops','Something Went Wrong','error');
        }
    },
    error: function() {
        swal('Oops','Something Went Wrong','error');
    }
});
}
}

function saveNonTeacherDeficiency(){
   var column_value = $('#column_value').val();
   if(column_value == ""){
    swal('Error','Please Enter Required Field','error');
    return false;
}else{
   var datacode = $('#datacode').val();
   var column_name = $('#column_name').val();
   $.ajax({
    type: "POST",
    url: "/deficiencies/update-teacher-deficiency/",
    data:{'datacode':datacode,'column_name':column_name,'column_value':column_value},
    success: function(data) {
        console.log(data);
        if(data){
            swal('Success','Details Updated Successfully','success');
            setTimeout(function(){
               window.location.reload(1);
           }, 2000);
        }else{
            swal('Oops','Something Went Wrong','error');
        }
    },
    error: function() {
        swal('Oops','Something Went Wrong','error');
    }
});
}
}




