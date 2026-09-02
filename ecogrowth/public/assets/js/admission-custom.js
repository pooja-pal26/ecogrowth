function feeStructuresByProcedureId(id){
  $.ajax({
    type: "GET",
    url: "/admission/admission-procedure-details?id="+id,
    success: function(data) {
        var data  = JSON.parse(data);
        console.log(data);
        $('#fee_details').empty();
        var html = "";
        $.each(data, function(index, val) {
            html += `<tr><td>`+val.name+`</td><td>`+val.fee_option.charAt(0).toUpperCase() + val.fee_option.substr(1)+`</td><td>`+val.fee+`</td></tr>`;
        });
        $('#fee_details').html(html);
        $('#feeDetailsModel').modal('toggle');
    },
    error: function() {
        swal('Oops','Something Went Wrong','error');
    }
});
}

function showFeeStructureEdit(id,name,fee_option,fee){
    $('#update_fee_structure_id').val(id);   
    $(".edit-fee-option").each(function( index ) {
        var value = $(this).attr('value');
        if(value === fee_option){
            $(this).prop( "checked", true );
        }

    });
    $('#update_fee_structure_name').val(name);
    $('#update_fee_structure_fee').val(fee);
    $('#editFeeStructureModel').modal('toggle');

}

function deleteFeeStructure(id){
   if (confirm("Are you sure?")) {
      $.ajax({
        type: "GET",
        url: "/admission/delete-fee-structure/id/"+id,
        success: function(data) {
            console.log(data);
            if(data){
                swal('Success','Fee Structure Deleted Successfully','success');
                $('#fee_structure_'+id).remove();
            }else{
                swal('Oops','Something Went Wrong','error');
            }
        },
        error: function() {
            swal('Oops','Something Went Wrong','error');
        }
    });
  }
  return false;


}
function deleteAuthorizedPerson(id){
   if (confirm("Are you sure?")) {
      $.ajax({
        type: "GET",
        url: "/admission/delete-authorized-person/id/"+id,
        success: function(data) {
            console.log(data);
            if(data){
                swal('Success','Authority Deleted Successfully','success');
                $('#role_'+id).remove();
            }else{
                swal('Oops','Something Went Wrong','error');
            }
        },
        error: function() {
            swal('Oops','Something Went Wrong','error');
        }
    });
  }
  return false;


}


function updateFeeStructure(){
    if (($('#EditselectAnnual').is(":checked") && $('#update_fee_structure_fee').val() != "" && $('#update_fee_structure_name').val() != "")  || ($('#EditselectSemester').is(":checked") && $('#update_fee_structure_fee').val() != "" && $('#update_fee_structure_name').val() != "") || ($('#EditselectMonthly').is(":checked") && $('#update_fee_structure_fee').val() != "" && $('#update_fee_structure_name').val() != "")){
        var datastring = $("#updateFeeStructureForm").serialize();
        console.log(datastring);
        $.ajax({
            type: "POST",
            url: "/admission/update-fee-structure/",
            data:datastring,
            success: function(data) {
                console.log(data);
                if(data){
                    swal('Success','Fee Structure Updated Successfully','success');
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
    }else{
        swal('Oops','Fill All Fields','error');
    }
}

function showRoleEdit(id,role,description){
    $('#update_role_id').val(id);
    $('#update_role_role').val(role);
    $('#update_role_description').val(description);
    $('#editRoleModel').modal('toggle');

}

function showProcedureEdit(id,name_procedure,from,to){
    $("#update_procedure_id").val(id);
    $("#update_procedure_name").val(name_procedure);
    $("#update_form_from").val(from);
    $("#update_form_to").val(to);
    $('#editProcedureModel').modal('toggle');
}

function deleteAdmisionRole(id){
   if (confirm("Are you sure?")) {
      $.ajax({
        type: "GET",
        url: "/admission/delete-role/id/"+id,
        success: function(data) {
            console.log(data);
            if(data){
                swal('Success','Role Deleted Successfully','success');
                $('#role_'+id).remove();
            }else{
                swal('Oops','Something Went Wrong','error');
            }
        },
        error: function() {
            swal('Oops','Something Went Wrong','error');
        }
    });
  }
  return false;


}

function deleteAdmissionProcedure(id){
   if (confirm("Are you sure?")) {
      $.ajax({
        type: "GET",
        url: "/admission/delete-procedure/id/"+id,
        success: function(data) {
            console.log(data);
            if(data){
                swal('Success','Procedure Deleted Successfully','success');
                $('#role_'+id).remove();
            }else{
                swal('Oops','Something Went Wrong','error');
            }
        },
        error: function() {
            swal('Oops','Something Went Wrong','error');
        }
    });
  }
  return false;


}


function updateRole(){
    if($('#update_role_role option:selected').val() == ""){
        swal('Oops','Please Enter Role Name','warning');
    }else if($('#update_role_description').val() == ""){
        swal('Oops','Please Enter Fee','warning');
    }else{
        var datastring = $("#updateRoleForm").serialize();
        console.log(datastring);
        $.ajax({
            type: "POST",
            url: "/admission/update-role/",
            data:datastring,
            success: function(data) {
                console.log(data);
                if(data){
                    swal('Success','Role Updated Successfully','success');
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

function updateAdmissionProcedure(){
    if($('#update_procedure_name').val() == ""){
        swal('Oops','Please Enter Procedure Name','warning');
    }else if($('#update_form_from').val() == ""){
        swal('Oops','Please Enter Form Starting Number','warning');
    }else if($('#update_form_to').val() == ""){
        swal('Oops','Please Enter Form End Number','warning');
    }else{
        var datastring = $("#updateProcedureForm").serialize();
        console.log(datastring);
        $.ajax({
            type: "POST",
            url: "/admission/update-procedure/",
            data:datastring,
            success: function(data) {
                console.log(data);
                if(data){
                    swal('Success','Procedure Updated Successfully','success');
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

$(document).ready(function() {
    $('#feeStructureBtn').on('click',function(){
        if (($('#selectAnnual').is(":checked") && $('#fee').val() != "" && $('#name').val() != "")  || ($('#selectSemester').is(":checked") && $('#fee').val() != "" && $('#name').val() != "") || ($('#selectMonthly').is(":checked") && $('#fee').val() != "" && $('#name').val() != "")){
         var datastring = $("#feeStructureForm").serialize();
         $.ajax({
            type: "POST",
            url: "/admission/create-fee-structure",
            data: datastring,
            success: function(data) {
                if(data){
                    swal('Success','Fee Structure Added Successfully','success');
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



 })
    $('#roleBtn').on('click',function(){
        if($('#role').val() == ""){
            swal('Oops','Please Enter Role Name','warning');
        }else if($('#description').val() == ""){
            swal('Oops','Please Enter Description','warning');
        }else{

            var datastring = $("#roleForm").serialize();
            $.ajax({
                type: "POST",
                url: "/admission/create-role",
                data: datastring,
                success: function(data) {
                    if(data){
                        swal('Success','Role Added Successfully','success');
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
    })
    $('#procedureBtn').on('click',function(){
        if($('#name_procedure').val() == ""){
            swal('Oops','Please Enter Procedure Name','warning');
        }else if($('#form_from').val() == ""){
            swal('Oops','Please Enter Form Starting Number','warning');
        }else if($('#form_to').val() == ""){
            swal('Oops','Please Enter Form End Number','warning');
        }else{
            var datastring = $("#procedureForm").serialize();
            $.ajax({
                type: "POST",
                url: "/admission/add-procedure",
                data: datastring,
                success: function(data) {
                    if(data){
                        swal('Success','Procedure Added Successfully','success');
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
    })
    $('#assignAdmissionRoleBtn').on('click',function(){
        if($('#role_id option:selected').val() == ""){
            console.log($('#role_id option:selected').val());
            swal('Oops','Please Select Role','warning');
        }else if($('#employee_id option:selected').val() == ""){
            swal('Oops','Please Select Employee','warning');
        }else{
            var datastring = $("#assignAdmissionRoleForm").serialize();
            console.log(datastring);
            $.ajax({
                type: "POST",
                url: "/admission/assign-role",
                data: datastring,
                success: function(data) {
                    console.log(data);
                    if(data){
                        swal('Success','Role Assigned Successfully','success');
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
    })

    $('#selectSemester').on('change',function(){
        $("#divAnnual").hide();
        $("#divSemester").show();

    });
    $("#selectAnnual").on('change',function(){
        $("#divSemester").hide();
        $("#divAnnual").show();
    })

    $('#EditselectSemester').on('change',function(){
        $("#EditdivYear").hide();
        $("#EditdivSemester").show();

    });
    $("#EditselectAnnual").on('change',function(){
        $("#EditdivSemester").hide();
        $("#EditdivYear").show();
    })

    $("#selectAnnual").prop( "checked", true );
    $('.fee-option').click(function() {
        $(this).siblings('input:checkbox').prop('checked', false);
    });

});



