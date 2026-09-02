function showPercentParams(){
	if($('#deduction_basis option:selected').val() == '2'){
		$('#percent_on_div').show();
		$('#amount_type').text('Percentage *');
	}else{
		$('#percent_on_div').hide();
		$('#amount_type').text('Amount *');
	}
}
function showAdditionPercentParams(){
	if($('#addition_basis option:selected').val() == '2'){
		$('#percent_on_div').show();
		$('#amount_type').text('Percentage *');
	}else{
		$('#percent_on_div').hide();
		$('#amount_type').text('Amount *');
	}
}

function showPrivilegeCategoryEdit(id,category){
	$("#category_id").val(id);
	$("#update_category").val(category);
	$('#editPrivilegeCategoryModel').modal('toggle');
}
function updatePrivilegeCategory(){
	if($('#update_category').val() == ""){
		swal('Oops','Please Enter Category Name','warning');
	}else{
		var datastring = $("#updatePrivilegeForm").serialize();
		console.log(datastring);
		$.ajax({
			type: "POST",
			url: "/master/update-privilege-category/",
			data:datastring,
			success: function(data) {
				console.log(data);
				if(data){
					swal('Success','Category Updated Successfully','success');
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
function deletePrivilegeCategory(id){
	if (confirm("Are you sure?")) {
		$.ajax({
			type: "GET",
			url: "/master/delete-privilege-category/id/"+id,
			success: function(data) {
				console.log(data);
				if(data){
					swal('Success','Procedure Deleted Successfully','success');
					$('#category_'+id).remove();
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

$(document).ready(function() {
	
	$('#request_id').on('change',function(e){
		var request_id = e.target.value;
		if(request_id == ""){
			$('#request_type_id').empty();
		}else{

			$.ajax({
				type: "GET",
				url: "/role/request-types-of-request?id="+request_id,
				success: function(data) {
					var data  = JSON.parse(data);
					console.log(data);
					if(data.length){
						$('#request_type_id').empty();
						var html = `<option value="">--Select Sub Request--</option>`;
						$.each(data, function(index, val) {
							html += `
							<option value="`+val.id+`">`+val.request_type+`</option>`;
						});
						$('#request_type_id').html(html);
					} else{
						swal('Oops','No Sub Requests Found','error');
						$('#request_type_id').empty();
					} 
				},
				error: function() {
					swal('Oops','Something Went Wrong','error');
				}
			});
		}
	}) 


	$('#assignRoleBtn').on('click',function(){
		if($('#employee_id option:selected').val() == ""){
			swal('Oops','Please Select Employee','warning');
		} else if($('#role_id option:selected').val() == ""){
			swal('Oops','Please Select Role','warning');
		}
		else if($('#request_id option:selected').val() == ""){
			swal('Oops','Please Select Request','warning');
		}
		else if($('#request_type_id option:selected').val() == ""){
			swal('Oops','Please Select Sub Request','warning');
		}else{

			var datastring = $("#assignRoleForm").serialize();
			$.ajax({
				type: "POST",
				url: "/role/assign-role",
				data: datastring,
				success: function(data) {
					console.log(data);
					if(data){
						swal('Success','Role assigned Successfully','success');
						setTimeout(function(){
							window.location.reload(1);
						}, 2000);
					}else{
						swal('Oops','This Role is already assigned to this employee','warning');
					}
				},
				error: function() {
					swal('Oops','Something Went Wrong','error');
				}
			});
		}
	})

	$('#privilegeCategoryBtn').on('click',function(){
		if($('#category').val() == ""){
			swal('Oops','Please Enter Category Name','warning');
		}else{
			var datastring = $("#privilegeForm").serialize();
			$.ajax({
				type: "POST",
				url: "/master/add-privilege-category",
				data: datastring,
				success: function(data) {
					if(data){
						swal('Success','Category Added Successfully','success');
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