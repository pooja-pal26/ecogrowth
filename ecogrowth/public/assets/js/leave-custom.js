
function checkLeaveGatepassCredentials(leave,count){
	if($('#'+leave+'_username').val() == ""){
		alert('Enter username');
		return false;
	}else if($('#'+leave+'_password').val() == ""){
		alert('Enter password');
		return false;
	}else{
		var jsonData  = {
			'username' : $('#'+leave+'_username').val(), 
			'password' : $('#'+leave+'_password').val()
		};
		$.ajax({
			url: "/index/employee-login/",
			type: 'POST',
			data: jsonData ,
			success: function(responseText) {
				console.log(responseText);
				var obj = JSON.parse(responseText);
				if(obj.flag){
					location.href = "/home";
				}else{
					alert(obj.message);
				}
			}
		});
	}
}

function checkLeaveTypes(leave_type_id,employee_id){
	var jsonData  = {
		'leave_type_id' : leave_type_id, 
		'employee_id' : employee_id
	};
	$.ajax({
		url: '/employee/check-leave-types/',
		type: 'POST',
		data: jsonData ,
		success:function(responseText){
			var obj = JSON.parse(responseText);
			$('#avail_leave').val(obj.remaining_leave);
			$('#doc_div').html('');
			var html = '';
			$.each(obj.required_documents, function(index, val) {
				html += `
				<div class="form-group col-sm-16" style="display:inline-block">
				<button type="button" class="btn btn-sm btn-primary" onclick="scanToJpg(`+index+`);">Scan `+val.document_name+`</button>
				<div id="images_`+index+`"></div> 
				<div id="documents_`+index+`"></div> 
				</div>
				`;
			});
			$('#doc_div').append(html);
		},
		error: function() {
			swal('Oops','Something Went Wrong','error');
		}
	});
	
}

function checkEmployeeLeaveTypes(leave_type_id){
	var employee_id = $('#employee option:selected').val();
	if(employee_id == ""){
		alert('Please Select Employee');
		$('#leave_type').val('');
		return false;
	}else{
		$.ajax({
			url: '/leave/check-employee-leave-types/leave_type_id/'+leave_type_id+'/employee_id/'+employee_id,
			type: 'GET',
			dataType: 'json',
			success:function(data){
				console.log(data);
				$('#avail_leave').val(data.remaining_leave);
				$('#doc_div').html('');
				var html = '';
				$.each(data.required_documents, function(index, val) {
					html += `
					<div class="form-group col-sm-16" style="display:inline-block">
					<button type="button" class="btn btn-sm btn-primary" onclick="scanToJpg(`+index+`);">Scan `+val.document_name+`</button>
					<div id="images_`+index+`"></div> 
					<div id="documents_`+index+`"></div> 
					</div>
					`;
				});
				$('#doc_div').append(html);
			},
			error: function() {
				swal('Oops','Something Went Wrong','error');
			}
		});
	}
}

$(document).ready(function() {
	
	$('#halfDayDiv').hide();

	$('#date_to').on('change',function(e){
		var employee_id = $('#employee option:selected').val();
		if($('#date_from').val() == ""){
			alert('Please select Start Date First');
			$('#date_to').val('');
			$('#date_from').focus();
		}
		else if(employee_id == ""){
			alert('Please Select Employee'+employee_id);
			$('#employee').focus();
			return false;
		}else{
			var date_from = moment($("#date_from").val(), 'DD/MM/YYYY');
			var date_to = moment($("#date_to").val(), 'DD/MM/YYYY');
			var days = date_to.diff(date_from, 'days');
			var avail_leave = $('#avail_leave').val();
			if(avail_leave < days){
				swal('Error','You do not have Sufficient Leave in Selected Leave Type. Remaining Leave :'+avail_leave,'error')
				$('#date_to').val('');
			}
		}
	}) 


	$('input[name="is_halfday_included"]').click(function(){
		if ($(this).is(':checked'))
		{
			if($(this).val() == "1"){
				$('#halfDayDiv').show();
			}else{
				$('#halfDayDiv').hide();
			}
		}
	});

});