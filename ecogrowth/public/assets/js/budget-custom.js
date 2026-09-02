function viewBudget(id){
    $.ajax({
        type: "GET",
        url: "/budget/budget-details?id="+id,
        success: function(data) {
            var data  = JSON.parse(data);
            $('#d_budget_name').text(data.budget);
            $('#d_start_date').text(data.start_date);
            $('#d_end_date').text(data.end_date);
            $('#budget_head_details').empty();
            var html = "";
            $.each(data.budgetHeadAssoc, function(index, val) {
                html += `<tr><td>`+val.head_name+`</td><td>`+val.approved_amount+`</td><td>`+val.available_amount+`</td></tr>`;
            });
            $('#budget_head_details').html(html);
            $('#BudgetDetailsModel').modal('toggle');
        },
        error: function() {
            swal('Oops','Something Went Wrong','error');
        }
    });
}
function showEdit(id,value){
    var inputHtml = `<input type="text" class="form-control" id="type_name`+id+`" value="`+value+`">`;
    var actionHtml = `<a class="btn btn-primary" href="javascript::void()" onclick="updateType(`+id+`,'`+value+`')"><span class="fa fa-floppy-o"></a> <a class="btn btn-danger" href="javascript:void()" onclick="deleteType(`+id+`)"><span class="fa fa-trash"></a>`;
    $('#name_'+id).html(inputHtml);
    $('#action_'+id).html(actionHtml);
}
function showBudgetEdit(id,value,start_date,end_date){
    $('#update_budget_id').val(id);
    $('#update_budget_name').val(value);
    $('#update_start_date').val(start_date);
    $('#update_end_date').val(end_date);
    $('#editBudgetModel').modal('toggle');

}
function deleteType(id){
   if (confirm("Are you sure?")) {
      $.ajax({
        type: "GET",
        url: "/budget/delete-budget-head-type/id/"+id,
        success: function(data) {
            console.log(data);
            if(data){
                swal('Success','Budget Head Type Deleted Successfully','success');
                $('#type_'+id).remove();
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
function deleteBudget(id){
   if (confirm("Are you sure?")) {
      $.ajax({
        type: "GET",
        url: "/budget/delete-budget/id/"+id,
        success: function(data) {
            console.log(data);
            if(data){
                swal('Success','Budget Deleted Successfully','success');
                $('#budget_'+id).remove();
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

function viewHead(id,value,head_type_id){
    $('#head_id').val(id);
    $('#update_head_type_id').val(head_type_id);
    $('#update_name').val(value);
    $('#updateHeadModel').modal('toggle');
}
function viewIncomeHead(id,value,head_type_id){
    $('#head_id').val(id);
    $('#update_head_type_id').val(head_type_id);
    $('#update_name').val(value);
    $('#updateHeadModel').modal('toggle');
}

function viewSubHead(id,value,head_id){
    $('#sub_head_id').val(id);
    $('#update_head_id').val(head_id);
    $('#update_name').val(value);
    $('#updateSubHeadModel').modal('toggle');
}
function viewIncomeSubHead(id,value,head_id){
    $('#sub_head_id').val(id);
    $('#update_head_id').val(head_id);
    $('#update_name').val(value);
    $('#updateIncomeSubHeadModel').modal('toggle');
}
function deleteHead(id){

    if (confirm("Are you sure?")) {
        $.ajax({
            type: "GET",
            url: "/budget/delete-budget-head/id/"+id,
            success: function(data) {
                console.log(data);
                if(data){
                    swal('Success','Expense Head Deleted Successfully','success');
                    $('#head_'+id).remove();
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
function deleteIncomeHead(id){

    if (confirm("Are you sure?")) {
        $.ajax({
            type: "GET",
            url: "/budget/delete-income-head/id/"+id,
            success: function(data) {
                console.log(data);
                if(data){
                    swal('Success','Income Head Deleted Successfully','success');
                    $('#head_'+id).remove();
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

function deleteSubHead(id){

    if (confirm("Are you sure?")) {
        $.ajax({
            type: "GET",
            url: "/budget/delete-expense-sub-head/id/"+id,
            success: function(data) {
                console.log(data);
                if(data){
                    swal('Success','Expense Sub Head Deleted Successfully','success');
                    $('#sub_head_'+id).remove();
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

function deleteIncomeSubHead(id){

    if (confirm("Are you sure?")) {
        $.ajax({
            type: "GET",
            url: "/budget/delete-income-sub-head/id/"+id,
            success: function(data) {
                console.log(data);
                if(data){
                    swal('Success','Income Sub Head Deleted Successfully','success');
                    $('#sub_head_'+id).remove();
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

function updateType(id,value){
   var name = $('#type_name'+id).val();
   $.ajax({
    type: "POST",
    url: "/budget/update-budget-head-type/",
    data:{'id':id,'type':name},
    success: function(data) {
        console.log(data);
        if(data){
            swal('Success','Budget Head Type Updated Successfully','success');
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
function updateBudget(){
    if($('#update_budget_name').val() == ""){
        swal('Oops','Please Enter Budget Name','warning');
    }else if($('#update_start_date').val() == ""){
        swal('Oops','Please Enter Budget Start Date','warning');
    }else if($('#update_end_date').val() == ""){
        swal('Oops','Please Enter Budget End Date','warning');
    }else{
        var datastring = $("#updateBudgetForm").serialize();
        $.ajax({
            type: "POST",
            url: "/budget/update-budget/",
            data:datastring,
            success: function(data) {
                console.log(data);
                if(data){
                    swal('Success','Budget Updated Successfully','success');
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

    $('#head_type').on('change',function(e){
        var type_id = e.target.value;
        if(type_id == ""){
            $('#amount_div').hide();
            $('#expense_head').empty();
        }else{

            $.ajax({
                type: "GET",
                url: "/budget/heads-of-head-type?id="+type_id,
                success: function(data) {
                    var data  = JSON.parse(data);
                    if(data.length){
                        $('#expense_head').empty();
                        var html = `<option value="">-- Select Expense Head -- </option>`;
                        $.each(data, function(index, val) {
                            html += `
                            <option value="`+val.id+`">`+val.name+`</option>`;
                        });
                        $('#expense_head').html(html);
                    } else{
                     swal('Oops','No heads Found','error');
                     $('#expense_head').empty();
                 } 
             },
             error: function() {
                swal('Oops','Something Went Wrong','error');
            }
        });
        }
    }) 

    $('#expense_head').on('change',function(e){
        var type_id = e.target.value;
        if(type_id == ""){
            $('#amount_div').hide();
        }else{
            $('#amount_div').show();
        }

    }) 

    $('#budgetHeadTypeBtn').on('click',function(){
        if($('#type_name').val() == ""){
            swal('Oops','Please Enter Budget Head Type','warning');
        }else{

            var datastring = $("#budgetHeadTypeForm").serialize();
            $.ajax({
                type: "POST",
                url: "/budget/create-budget-head-type",
                data: datastring,
                success: function(data) {
                    if(data){
                        swal('Success','Budget Head Type Added Successfully','success');
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
    $('#budgetBtn').on('click',function(){
        if($('#budget_name').val() == ""){
            swal('Oops','Please Enter Budget Name','warning');
        }else if($('#start_date').val() == ""){
            swal('Oops','Please Enter Budget Start Date','warning');
        }else if($('#end_date').val() == ""){
            swal('Oops','Please Enter Budget End Date','warning');
        }else{

            var datastring = $("#budgetForm").serialize();
            $.ajax({
                type: "POST",
                url: "/budget/create-budget",
                data: datastring,
                success: function(data) {
                    if(data){
                        swal('Success','Budget Added Successfully','success');
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
    $('#budgetHeadMapBtn').on('click',function(){
        if($('#budget option:selected').val() == ""){
            swal('Oops','Please Select Budget','warning');
            return false;
        }else if($('#head_type option:selected').val() == ""){
            swal('Oops','Please Select Head Type','warning');
            return false;
        }else if($('#expense_head option:selected').val() == ""){
            swal('Oops','Please Select Expense Head','warning');
            return false;
        }else if($('#head_amount').val() == ""){
            swal('Oops','Please Enter Head amount','warning');
            return false;
        }else{
            return true;
        }
    })

    $('#budgetHeadBtn').on('click',function(){

        if($('#head_type_id option:selected').val() == ""){
            swal('Oops','Please Select Budget Head Type','warning');
        }else if($('#name').val() == ""){
            swal('Oops','Please Enter Expense Head','warning');
        }else{

            var datastring = $("#budgetHeadForm").serialize();
            $.ajax({
                type: "POST",
                url: "/budget/create-expense-head",
                data: datastring,
                success: function(data) {
                    var data = JSON.parse(data);
                    console.log(data);
                    if(!data.flag){
                        swal('Oops',data.message,'error');
                    }else{
                        swal('Success','Expense Head Added Successfully','success');
                        setTimeout(function(){
                         window.location.reload(1);
                     }, 2000);
                    }
                },
                error: function() {
                    swal('Oops','Something Went Wrong','error');
                }
            });
        }
    })

    $('#incomeHeadBtn').on('click',function(){

        if($('#head_type_id option:selected').val() == ""){
            swal('Oops','Please Select Budget Head Type','warning');
        }else if($('#name').val() == ""){
            swal('Oops','Please Enter Income Head','warning');
        }else{

            var datastring = $("#incomeHeadForm").serialize();
            $.ajax({
                type: "POST",
                url: "/budget/create-income-head",
                data: datastring,
                success: function(data) {
                    var data = JSON.parse(data);
                    console.log(data);
                    if(!data.flag){
                        swal('Oops',data.message,'error');
                    }else{
                        swal('Success','Income Head Added Successfully','success');
                        setTimeout(function(){
                         window.location.reload(1);
                     }, 2000);
                    }
                },
                error: function() {
                    swal('Oops','Something Went Wrong','error');
                }
            });
        }
    })
    $('#updateBudgetHeadBtn').on('click',function(){

        if($('#update_head_type_id option:selected').val() == ""){
            swal('Oops','Please Select Budget Head Type','warning');
        }else if($('#update_name').val() == ""){
            swal('Oops','Please Enter Expense Head','warning');
        }else{

            var datastring = $("#updateBudgetHeadForm").serialize();
            console.log(datastring);
            $.ajax({
                type: "POST",
                url: "/budget/update-expense-head",
                data: datastring,
                success: function(data) {
                    console.log(data);
                    if(data){
                        swal('Success','Expense Head updated Successfully','success');
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

    $('#updateIncomeHeadBtn').on('click',function(){

        if($('#update_head_type_id option:selected').val() == ""){
            swal('Oops','Please Select Budget Head Type','warning');
        }else if($('#update_name').val() == ""){
            swal('Oops','Please Enter Income Head','warning');
        }else{

            var datastring = $("#updateIncomeHeadForm").serialize();
            console.log(datastring);
            $.ajax({
                type: "POST",
                url: "/budget/update-income-head",
                data: datastring,
                success: function(data) {
                    console.log(data);
                    if(data){
                        swal('Success','Income Head updated Successfully','success');
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

    $('#budgetSubHeadBtn').on('click',function(){
        if($('#head_id option:selected').val() == ""){
            swal('Oops','Please Select Expense Head','warning');
        }else if($('#name').val() == ""){
            swal('Oops','Please Enter Expense Sub Head','warning');
        }else{

            var datastring = $("#budgetSubHeadForm").serialize();
            $.ajax({
                type: "POST",
                url: "/budget/create-expense-sub-head",
                data: datastring,
                success: function(data) {
                    if(data){
                        swal('Success','Expense Sub Head Added Successfully','success');
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

    $('#budgetIncomeSubHeadBtn').on('click',function(){
        if($('#head_id option:selected').val() == ""){
            swal('Oops','Please Select Income Head','warning');
        }else if($('#name').val() == ""){
            swal('Oops','Please Enter Income Sub Head','warning');
        }else{

            var datastring = $("#budgetIncomeSubHeadForm").serialize();
            $.ajax({
                type: "POST",
                url: "/budget/create-income-sub-head",
                data: datastring,
                success: function(data) {
                    if(data){
                        swal('Success','Income Sub Head Added Successfully','success');
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
    $('#updateBudgetSubHeadBtn').on('click',function(){
        if($('#update_head_id option:selected').val() == ""){
            swal('Oops','Please Select Expense Head','warning');
        }else if($('#update_name').val() == ""){
            swal('Oops','Please Enter Expense Sub Head','warning');
        }else{

            var datastring = $("#updateBudgetSubHeadForm").serialize();
            // console.log(datastring);
            $.ajax({
                type: "POST",
                url: "/budget/update-expense-sub-head",
                data: datastring,
                success: function(data) {
                    console.log(data);
                    if(data){
                        swal('Success','Expense Sub Head updated Successfully','success');
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

    $('#updateIncomeSubHeadBtn').on('click',function(){
        if($('#update_head_id option:selected').val() == ""){
            swal('Oops','Please Select Income Head','warning');
        }else if($('#update_name').val() == ""){
            swal('Oops','Please Enter Income Sub Head','warning');
        }else{

            var datastring = $("#updateBudgetIncomeSubHeadForm").serialize();
            // console.log(datastring);
            $.ajax({
                type: "POST",
                url: "/budget/update-income-sub-head",
                data: datastring,
                success: function(data) {
                    console.log(data);
                    if(data){
                        swal('Success','Income Sub Head updated Successfully','success');
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


});



